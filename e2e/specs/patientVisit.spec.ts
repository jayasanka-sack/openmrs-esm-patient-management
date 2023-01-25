import { test } from '../core';
import { deletePatient, generateRandomPatient, Patient } from '../commands';
import { PatientSummaryPage } from '../pages/PatientSummaryPage';

let patient: Patient;

test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
});

test('should be able to start and end a visit', async ({ page, api }) => {
  const patientSummaryPage = new PatientSummaryPage(page);
  await patientSummaryPage.goto(patient.uuid);
  await patientSummaryPage.startVisit();
});

test.afterEach(async ({ api }) => {
  await deletePatient(api, patient.uuid);
});
