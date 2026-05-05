import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ContentSwitcher, SkeletonText, Switch } from '@carbon/react';
import { useField } from 'formik';
import { useConfig } from '@openmrs/esm-framework';
import { type RegistrationConfig } from '../../../config-schema';
import { useResourcesContext } from '../../../resources-context';
import { Input } from '../../input/basic-input/input/input.component';
import { usePatientRegistrationContext } from '../../patient-registration-context';
import { type NameProperties, type NameTemplate } from '../../patient-registration.types';
import { PhotoComponent } from '../photo/photo-field.component';
import styles from '../field.scss';

export const unidentifiedPatientAttributeTypeUuid = '8b56eac7-5c76-4b9c-8c6f-1deab8d3fc47';

const containsNoNumbers = /^([^0-9]*)$/;

function checkNoNumbers(value: string) {
  if (!containsNoNumbers.test(value)) {
    return 'numberInNameDubious';
  }
  return undefined;
}

function getLayoutFields(nameTemplate: NameTemplate, reverseFieldOrder = false) {
  const allFields = nameTemplate?.lines?.flat() ?? [];
  const fields = allFields.filter(({ isToken }) => isToken === 'IS_NAME_TOKEN');
  return reverseFieldOrder ? [...fields].reverse() : fields;
}

function getRequiredFields(nameTemplate: NameTemplate, ...alwaysRequired: NameProperties[]) {
  const templateRequired = nameTemplate?.requiredElements ?? [];
  return new Set<NameProperties>([...alwaysRequired, ...templateRequired]);
}

export const NameFieldWithTemplate: React.FC = () => {
  const { t } = useTranslation();
  const { setFieldValue, setFieldTouched } = usePatientRegistrationContext();
  const {
    fieldConfigurations: {
      name: {
        displayCapturePhoto,
        allowUnidentifiedPatients,
        defaultUnknownGivenName,
        defaultUnknownFamilyName,
        displayReverseFieldOrder,
      },
    },
  } = useConfig<RegistrationConfig>();

  const { nameTemplate } = useResourcesContext();

  const defaultNameLayout = useMemo(() => {
    const fields = [
      { id: 'givenName', name: 'givenName', label: t('givenNameLabelText', 'First Name'), required: true },
      { id: 'middleName', name: 'middleName', label: t('middleNameLabelText', 'Middle Name'), required: false },
      { id: 'familyName', name: 'familyName', label: t('familyNameLabelText', 'Family Name'), required: true },
    ];
    return displayReverseFieldOrder ? [...fields].reverse() : fields;
  }, [t, displayReverseFieldOrder]);

  const nameLayout = useMemo(() => {
    if (!nameTemplate?.lines) {
      return defaultNameLayout;
    }
    const fields = getLayoutFields(nameTemplate, displayReverseFieldOrder);
    // givenName and familyName are always required by the patient API, independent of the template.
    const requiredFields = getRequiredFields(nameTemplate, 'givenName', 'familyName');
    return fields.map(({ displayText, codeName }) => ({
      id: codeName,
      name: codeName,
      label: displayText,
      required: requiredFields.has(codeName),
    }));
  }, [nameTemplate, defaultNameLayout, displayReverseFieldOrder]);

  const clearNameFieldValues = useCallback(() => {
    nameLayout.forEach((field) => {
      setFieldValue(field.name, '');
    });
  }, [nameLayout, setFieldValue]);

  const setDefaultNameFieldValues = useCallback(() => {
    if (nameTemplate?.elementDefaults) {
      Object.entries(nameTemplate.elementDefaults).forEach(([name, defaultValue]) => {
        setFieldValue(name, defaultValue);
      });
    }
  }, [nameTemplate, setFieldValue]);

  const setUnknownNameFieldValues = useCallback(() => {
    setFieldValue('givenName', defaultUnknownGivenName);
    setFieldValue('familyName', defaultUnknownFamilyName);
  }, [setFieldValue, defaultUnknownGivenName, defaultUnknownFamilyName]);

  const touchNameFields = useCallback(() => {
    nameLayout.forEach((field) => {
      setFieldTouched(field.name, true);
    });
  }, [nameLayout, setFieldTouched]);

  useEffect(() => {
    setDefaultNameFieldValues();
  }, [setDefaultNameFieldValues]);

  const [{ value: isPatientUnknownValue }, , { setValue: setUnknownPatient }] = useField<string>(
    `attributes.${unidentifiedPatientAttributeTypeUuid}`,
  );

  const isPatientUnknown = isPatientUnknownValue === 'true';

  const toggleNameKnown = (e) => {
    clearNameFieldValues();
    setDefaultNameFieldValues();
    if (e.name === 'known') {
      setUnknownPatient('false');
    } else {
      setUnknownNameFieldValues();
      setUnknownPatient('true');
    }
    touchNameFields();
    setFieldTouched(`attributes.${unidentifiedPatientAttributeTypeUuid}`, true, false);
  };

  if (nameTemplate && !Object.keys(nameTemplate).length) {
    return (
      <NameComponentContainer>
        <div role="progressbar" aria-label={t('loading', 'Loading')}>
          <SkeletonText />
        </div>
      </NameComponentContainer>
    );
  }

  return (
    <NameComponentContainer>
      {displayCapturePhoto && <PhotoComponent />}
      <div className={styles.nameField}>
        {(allowUnidentifiedPatients || isPatientUnknown) && (
          <>
            <div className={styles.dobContentSwitcherLabel}>
              <span className={styles.label01}>{t('patientNameKnown', "Patient's Name is Known?")}</span>
            </div>
            <ContentSwitcher
              className={styles.contentSwitcher}
              size="md"
              selectedIndex={isPatientUnknown ? 1 : 0}
              onChange={toggleNameKnown}>
              <Switch name="known">{t('yes', 'Yes')}</Switch>
              <Switch name="unknown">{t('no', 'No')}</Switch>
            </ContentSwitcher>
          </>
        )}
        {!isPatientUnknown &&
          nameLayout.map((field, index) => (
            <Input
              key={`name_input_${field.name ?? index}`}
              id={`name.${field.name}`}
              name={field.name}
              labelText={field.label}
              checkWarning={checkNoNumbers}
              required={field.required}
            />
          ))}
      </div>
    </NameComponentContainer>
  );
};

const NameComponentContainer = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation();
  return (
    <div>
      <h4 className={styles.productiveHeading02Light}>{t('fullNameLabelText', 'Full Name')}</h4>
      <div className={styles.grid}>{children}</div>
    </div>
  );
};
