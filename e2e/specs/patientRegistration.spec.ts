import { test } from '../core';
import { PatientRegistrationFormValues, PatientRegistrationPage } from '../pages/patientRegistrationPage';

test('should be able to register a patient', async ({ page, api }) => {
  const patientRegistrationPAge = new PatientRegistrationPage(page);

  await patientRegistrationPAge.goto();

  const formValues: PatientRegistrationFormValues = {
    givenName: 'Johnny',
    middleName: 'Donny',
    familyName: 'Ronny',
    sex: 'male',
    birthdate: '1/1/2000',
  };

  await patientRegistrationPAge.fillPatientRegistrationForm(formValues);
});

test.afterEach(async ({ api }) => {
  // await deletePatient(api, patient.uuid);
});
