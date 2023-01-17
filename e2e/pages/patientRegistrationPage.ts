import { expect, Locator, Page } from '@playwright/test';

export type PatientRegistrationSex = 'male' | 'female' | 'other' | 'unknown';

export interface PatientRegistrationFormValues {
  givenName?: string;
  middleName?: string;
  familyName?: string;
  sex?: PatientRegistrationSex;
  birthdate?: string;
  postalCode?: string;
  address1?: string;
  address2?: string;
  country?: string;
  stateProvince?: string;
  cityVillage?: string;
  phone?: string;
  email?: string;
}

export class PatientRegistrationPage {
  constructor(readonly page: Page) {}

  readonly givenNameInput = () => this.page.locator('#givenName');
  readonly middleNameInput = () => this.page.locator('#middleName');
  readonly familyNameInput = () => this.page.locator('#familyName');
  // TODO: add other fields
  readonly createPatientButton = () => this.page.locator('button[type=submit]');

  async goto(editPatientUuid?: string) {
    await this.page.goto(editPatientUuid ? `patient/${editPatientUuid}/edit` : 'patient-registration');
  }

  async fillPatientRegistrationForm(formValues: PatientRegistrationFormValues) {
    const tryFill = (locator: Locator, value?: string) => value && locator.fill(value);

    await tryFill(this.givenNameInput(), formValues.givenName);
    await tryFill(this.middleNameInput(), formValues.middleName);
    await tryFill(this.familyNameInput(), formValues.familyName);
    // TODO: fill other fields
    await this.createPatientButton().click();
  }
}
