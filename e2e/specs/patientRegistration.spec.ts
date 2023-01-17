import { test } from '../core';
import { PatientRegistrationFormValues, PatientRegistrationPage } from '../pages/patientRegistrationPage';

test('should be able to register a patient', async ({ page, api }) => {
  const patientRegistrationPAge = new PatientRegistrationPage(page);

  await patientRegistrationPAge.goto();

  const formValues: PatientRegistrationFormValues = {
    givenName: 'Johnny',
    middleName: 'Donny',
    familyName: 'Ronny',
  };

  await patientRegistrationPAge.fillPatientRegistrationForm(formValues);
});
