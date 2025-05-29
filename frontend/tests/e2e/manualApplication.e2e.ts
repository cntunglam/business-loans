import "dotenv/config";

import { expect, test } from "@playwright/test";
import { TEST_IDS } from "./../../src/utils/testUtils";

// Load environment variables from .env file
const TEST_DATA = {
  amount: 50000,
  minAmount: 1000,
  maxAmount: 200000,
  terms: 12,
  minTerms: 3,
  maxTerms: 72,
  purpose: "Credit card debt",
  nric: "S1234567A",
  residencyStatus: "Singaporean",
  minAge: 21,
  maxAge: 65,
  age: 30,
  monthlyIncome: "3000",
  expectedMonthlyIncome: "3,000",
  occupationalStatus: "Employed",
  employmentType: "Software Engineer",
  currentEmploymentTime: "3 months to 1 year",
  previousEmploymentTime: "1 year to 3 years",
  propertyOwnership: "Private Property",
  postalCode: "700000",
  hasExistingLoan: "No",
  fullName: `Test User ${Date.now()}`,
  phoneNumber: `9${Math.floor(Math.random() * 9000000) + 1000000}`,
  email: `test${Date.now()}@example.com`,
};

const getTestId = (testId: string) => `[data-testid="${testId}"]`;

test("Set MUI Slider to specific value", async ({ page }) => {
  const { MAILHOG_URL = "http://localhost:8025/" } = process.env;
  if (!MAILHOG_URL) {
    throw new Error("Environment variables MAILHOG_URL must be set");
  }

  // INIT MODAL
  await page.goto("/apply?step=0");
  await page.waitForSelector(getTestId(TEST_IDS.manualApplicationButton));
  await page.click(getTestId(TEST_IDS.manualApplicationButton));

  // STEP 0: ApplicationStepsEnum.borrowAmount
  const amountSliderTrack = page.locator(getTestId(TEST_IDS.borrowAmountSlider));
  await expect(amountSliderTrack).toBeVisible();
  const amountBox = await amountSliderTrack.boundingBox();
  if (!amountBox) throw new Error("Slider not found!");

  const percentage = (TEST_DATA.amount - TEST_DATA.minAmount) / (TEST_DATA.maxAmount - TEST_DATA.minAmount);
  const amountTargetX = amountBox.x + percentage * amountBox.width;
  await page.mouse.move(amountBox.x, amountBox.y + amountBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(amountTargetX, amountBox.y + amountBox.height / 2);
  await page.mouse.up();

  const amountValue = await page.locator(getTestId(`${TEST_IDS.borrowAmountSlider}_input`)).getAttribute("value");
  expect(amountValue).toBe(`${TEST_DATA.amount}`);
  await page.click(getTestId(TEST_IDS.nextStepButton));

  // STEP 1: ApplicationStepsEnum.borrowPeriod
  const termsSliderTrack = page.locator(getTestId(TEST_IDS.borrowTermSlider));
  await expect(termsSliderTrack).toBeVisible();
  const termsBox = await termsSliderTrack.boundingBox();
  if (!termsBox) throw new Error("Slider not found!");

  const termsPercentage = (TEST_DATA.terms - TEST_DATA.minTerms) / (TEST_DATA.maxTerms - TEST_DATA.minTerms);
  const termsTargetX = termsBox.x + termsPercentage * termsBox.width;
  await page.mouse.move(termsBox.x, termsBox.y + termsBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(termsTargetX, termsBox.y + termsBox.height / 2);
  await page.mouse.up();

  const termsValue = await page.locator(getTestId(`${TEST_IDS.borrowTermSlider}_input`)).getAttribute("value");
  expect(termsValue).toBe(`${TEST_DATA.terms}`);
  await page.click(getTestId(TEST_IDS.nextStepButton));

  // STEP 2: ApplicationStepsEnum.borrowPurpose
  const purposeDropdown = page.locator(getTestId(TEST_IDS.borrowPurposeSelect));
  await expect(purposeDropdown).toBeVisible();
  await purposeDropdown.click();
  await page
    .locator(`${getTestId(`${TEST_IDS.borrowPurposeSelect}_listbox`)} > li[role="option"]`, {
      hasText: TEST_DATA.purpose,
    })
    .click();
  await expect(purposeDropdown).toHaveText(TEST_DATA.purpose);
  await page.click(getTestId(TEST_IDS.nextStepButton));

  // STEP 3: ApplicationStepsEnum.nricNumber
  const nricInput = page.locator(`${getTestId(TEST_IDS.nricInput)} > input`);
  await expect(nricInput).toBeVisible();
  await nricInput.fill(TEST_DATA.nric);
  await expect(nricInput).toHaveValue(TEST_DATA.nric);
  await page.click(getTestId(TEST_IDS.nextStepButton));

  // STEP 4: ApplicationStepsEnum.residencyStatus
  const residencyStatusButton = page.locator(
    `${getTestId(TEST_IDS.residencyStatusBox)} > button:has-text("${TEST_DATA.residencyStatus}")`
  );
  await expect(residencyStatusButton).toBeVisible();
  await residencyStatusButton.click();
  await page.click(getTestId(TEST_IDS.nextStepButton));

  // STEP 5: ApplicationStepsEnum.age
  const ageSliderTrack = page.locator(getTestId(TEST_IDS.borrowAgeSlider));
  await expect(ageSliderTrack).toBeVisible();
  const ageBox = await ageSliderTrack.boundingBox();
  if (!ageBox) throw new Error("Slider not found!");
  const agePercentage = (TEST_DATA.age - TEST_DATA.minAge) / (TEST_DATA.maxAge - TEST_DATA.minAge);
  const ageTargetX = ageBox.x + agePercentage * ageBox.width;
  await page.mouse.move(ageBox.x, ageBox.y + ageBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(ageTargetX, ageBox.y + ageBox.height / 2);
  await page.mouse.up();
  const ageValue = await page.locator(getTestId(`${TEST_IDS.borrowAgeSlider}_input`)).getAttribute("value");
  expect(ageValue).toBe(`${TEST_DATA.age}`);
  await page.click(getTestId(TEST_IDS.nextStepButton));

  // STEP 6: ApplicationStepsEnum.monthlyIncome
  const incomeInput = page.locator(`${getTestId(TEST_IDS.monthlyIncomeInput)} > input`);
  await expect(incomeInput).toBeVisible();
  await incomeInput.fill(TEST_DATA.monthlyIncome);
  await expect(incomeInput).toHaveValue(TEST_DATA.expectedMonthlyIncome);
  await page.click(getTestId(TEST_IDS.nextStepButton));

  // STEP 7: ApplicationStepsEnum.occupation
  const occupationalStatusDropdown = page.locator(getTestId(TEST_IDS.occupationalStatusSelect));
  await expect(occupationalStatusDropdown).toBeVisible();
  await occupationalStatusDropdown.click();
  const options = await page
    .locator(`${getTestId(`${TEST_IDS.occupationalStatusSelect}_listbox`)} > li[role="option"]`)
    .all();
  // many options include "Employed" text, so we need to find the correct one
  for (const option of options) {
    const text = await option.textContent();
    if (text?.trim() === TEST_DATA.occupationalStatus) {
      await option.click();
      break;
    }
  }
  await expect(occupationalStatusDropdown).toHaveText(TEST_DATA.occupationalStatus);
  const jobTitleInput = page.locator(`${getTestId(TEST_IDS.jobTitleInput)} > input`);
  await expect(jobTitleInput).toBeVisible();
  await jobTitleInput.fill(TEST_DATA.employmentType);
  await expect(jobTitleInput).toHaveValue(TEST_DATA.employmentType);
  await page.click(getTestId(TEST_IDS.nextStepButton));

  // STEP 8: ApplicationStepsEnum.occupationTime
  const currentEmploymentTimeDropdown = page.locator(getTestId(TEST_IDS.currentEmploymentTimeSelect));
  await expect(currentEmploymentTimeDropdown).toBeVisible();
  await currentEmploymentTimeDropdown.click();
  await page
    .locator(`${getTestId(`${TEST_IDS.currentEmploymentTimeSelect}_listbox`)} > li[role="option"]`, {
      hasText: TEST_DATA.currentEmploymentTime,
    })
    .nth(0)
    .click();
  await expect(currentEmploymentTimeDropdown).toHaveText(TEST_DATA.currentEmploymentTime);

  const previousEmploymentTimeDropdown = page.locator(getTestId(TEST_IDS.previousEmploymentTimeSelect));
  await expect(previousEmploymentTimeDropdown).toBeVisible();
  await previousEmploymentTimeDropdown.click();
  await page
    .locator(`${getTestId(`${TEST_IDS.previousEmploymentTimeSelect}_listbox`)} > li[role="option"]`, {
      hasText: TEST_DATA.previousEmploymentTime,
    })
    .nth(0)
    .click();
  await expect(previousEmploymentTimeDropdown).toHaveText(TEST_DATA.previousEmploymentTime);

  await page.click(getTestId(TEST_IDS.nextStepButton));

  // STEP 9: ApplicationStepsEnum.propertyOwnership
  const propertyOwnershipDropdown = page.locator(getTestId(TEST_IDS.propertyOwnershipSelect));
  await expect(propertyOwnershipDropdown).toBeVisible();
  await propertyOwnershipDropdown.click();
  await page
    .locator(`${getTestId(`${TEST_IDS.propertyOwnershipSelect}_listbox`)} > li[role="option"]`, {
      hasText: TEST_DATA.propertyOwnership,
    })
    .click();
  await expect(propertyOwnershipDropdown).toHaveText(TEST_DATA.propertyOwnership);
  const postalCodeInput = page.locator(`${getTestId(TEST_IDS.postalCodeInput)} > input`);
  await expect(postalCodeInput).toBeVisible();
  await postalCodeInput.fill(TEST_DATA.postalCode);
  await expect(postalCodeInput).toHaveValue(TEST_DATA.postalCode);
  await page.click(getTestId(TEST_IDS.nextStepButton));

  // STEP 10: ApplicationStepsEnum.existingLoans
  const hasExistingLoanButton = page.locator(
    `${getTestId(TEST_IDS.existingLoanBox)} > button:has-text("${TEST_DATA.hasExistingLoan}")`
  );
  await expect(hasExistingLoanButton).toBeVisible();
  await hasExistingLoanButton.click();
  await page.click(getTestId(TEST_IDS.nextStepButton));

  // STEP 11: ApplicationStepsEnum.fullName
  const fullNameInput = page.locator(`${getTestId(TEST_IDS.fullNameInput)} > input`);
  await expect(fullNameInput).toBeVisible();
  await fullNameInput.fill(TEST_DATA.fullName);
  await expect(fullNameInput).toHaveValue(TEST_DATA.fullName);
  await page.click(getTestId(TEST_IDS.nextStepButton));

  // STEP 12: Phone number
  const phoneNumberInput = page.locator(`${getTestId(TEST_IDS.phoneNumberInput)} > input`);
  await expect(phoneNumberInput).toBeVisible();
  await phoneNumberInput.fill(TEST_DATA.phoneNumber);
  await expect(phoneNumberInput).toHaveValue(TEST_DATA.phoneNumber);
  await page.click(getTestId(TEST_IDS.nextStepButton));

  // Final Step: Email address
  const emailInput = page.locator(`${getTestId(TEST_IDS.emailAddressInput)} > input`);
  await expect(emailInput).toBeVisible();
  await emailInput.fill(TEST_DATA.email);
  await page.click(getTestId(TEST_IDS.nextStepButton));

  // Popup for verification
  // Work on localhost but fail on github action
  const otpInput = page.locator(`${getTestId(TEST_IDS.otpInput)} > input`);
  await expect(otpInput).toBeVisible();

  // Get otp from email using mailhog
  const mailhogUrl = `${MAILHOG_URL}/api/v2/messages`;
  const response = await page.request.get(mailhogUrl);
  const emails = await response.json();
  if (emails.items.length === 0) {
    throw new Error("No emails found in MailHog");
  }
  const latestEmail = emails.items[0];
  const otpRegex = /\b\d{6}\b/;
  const match = latestEmail.Content.Body.match(otpRegex);
  if (!match) {
    throw new Error("OTP not found in email");
  }
  const otp = match[0];
  await otpInput.fill(otp);
  await page.locator(getTestId(TEST_IDS.submitOtpButton)).click();

  // Verify if user is redirected to dashboard
  await expect(page).toHaveURL("/user/dashboard");
  await expect(page.getByText(TEST_DATA.email)).toBeVisible();
});
