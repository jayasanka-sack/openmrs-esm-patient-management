import { useMemo } from 'react';
import { openmrsFetch, restBaseUrl, useOpenmrsFetchAll } from '@openmrs/esm-framework';
import { type EncounterPayload } from '../../types';
import { type ObsPreviousVersion, type PatientNote, type RESTPatientNote, type UsePatientNotes } from './types';

export function createPatientNote(payload: EncounterPayload, abortController: AbortController = new AbortController()) {
  return openmrsFetch(`${restBaseUrl}/encounter`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: payload,
    signal: abortController.signal,
  });
}

export function editPatientNote(obsUuid: string, note: string) {
  return openmrsFetch(`${restBaseUrl}/obs/${obsUuid}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: { value: note },
  });
}

const PREVIOUS_VERSION_FIELDS = 'uuid,value,dateCreated,creator';

// Walk the `previousVersion` (singular) chain up to five levels deep. Covers the vast
// majority of edit histories while staying off the unreleased `previousVersions` plural
// property in webservices.rest master.
function buildPreviousVersionRep(depth: number): string {
  if (depth <= 0) return '';
  return `,previousVersion:(${PREVIOUS_VERSION_FIELDS}${buildPreviousVersionRep(depth - 1)})`;
}

function collectEditHistory(obs: { previousVersion?: ObsPreviousVersion }): PatientNote['editHistory'] {
  const history: PatientNote['editHistory'] = [];
  let current: ObsPreviousVersion | undefined = obs.previousVersion;
  while (current) {
    history.push({
      note: current.value as string,
      recordedAt: current.dateCreated,
      recordedBy: current.creator?.person?.display ?? current.creator?.display ?? '',
    });
    current = current.previousVersion;
  }
  return history;
}

export function usePatientNotes(patientUuid: string, visitUuid: string, conceptUuids: Array<string>): UsePatientNotes {
  const customRepresentation =
    `custom:(uuid,encounterDatetime,patient:(uuid),obs:(uuid,concept:(uuid),dateCreated,value${buildPreviousVersionRep(5)},creator),encounterType,` +
    'encounterProviders:(uuid,provider:(uuid,person:(uuid,display)))';
  const encountersApiUrl = `${restBaseUrl}/encounter?patient=${patientUuid}&visit=${visitUuid}&v=${customRepresentation}`;

  const { data, error, isLoading, isValidating, mutate } = useOpenmrsFetchAll<RESTPatientNote>(
    patientUuid ? encountersApiUrl : null,
  );

  const patientNotes: Array<PatientNote> | null = useMemo(
    () =>
      data
        ? data
            .flatMap((encounter) => {
              return encounter.obs?.reduce((acc, obs) => {
                if (conceptUuids.includes(obs.concept.uuid)) {
                  acc.push({
                    encounterUuid: encounter.uuid,
                    obsUuid: obs.uuid,
                    encounterNote: obs ? obs.value : '',
                    encounterNoteRecordedAt: encounter.encounterDatetime,
                    encounterProvider: encounter.encounterProviders.map((ep) => ep.provider.person.display).join(', '),
                    conceptUuid: obs.concept.uuid,
                    encounterTypeUuid: encounter.encounterType.uuid,
                    isEdited: !!obs.previousVersion?.uuid,
                    lastEditedBy: obs.creator?.person?.display ?? obs.creator?.display ?? '',
                    lastEditedAt: obs.dateCreated,
                    editHistory: collectEditHistory(obs),
                  });
                }
                return acc;
              }, [] as Array<PatientNote>);
            })
            .sort(
              (a, b) => new Date(b.encounterNoteRecordedAt).getTime() - new Date(a.encounterNoteRecordedAt).getTime(),
            )
        : [],
    [data, conceptUuids],
  );

  return useMemo(
    () => ({
      patientNotes,
      errorFetchingPatientNotes: error,
      isLoadingPatientNotes: isLoading,
      isValidatingPatientNotes: isValidating,
      mutatePatientNotes: mutate,
    }),
    [patientNotes, isLoading, isValidating, mutate, error],
  );
}
