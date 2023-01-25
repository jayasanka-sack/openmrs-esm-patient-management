import { Page } from '@playwright/test';

export class PatientSummaryPage {
  constructor(readonly page: Page) {}

  readonly startVisitButton = () => this.page.locator('text=Start Visit');
  readonly actionsButton = () => this.page.locator('text=Actions');
  readonly abc = () => this.page.locator('text=Actionsssss');

  async goto(patientUuid: string) {
    await this.page.goto(`patient/${patientUuid}/chart/Patient%20Summary`);
  }

  async startVisit() {
    await this.actionsButton().click();
    await this.startVisitButton().click();
    await this.abc().click();
  }
}
