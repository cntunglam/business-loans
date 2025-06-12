import { expect, test } from '@playwright/test';
import { TEST_IDS } from '../../src/utils/testUtils';

const TEST_DATA = {
  amount: 51_000_000,
  minAmount: 1_000_000,
  maxAmount: 1_000_000_000,

  terms: 12,
  minTerms: 3,
  maxTerms: 72,

  purpose: 'Nợ thẻ tín dụng',

  cccdNumber: '001234567890',

  // Date of Birth

  monthlyIncome: 20_800_000,
  monthlyIncomeMin: 1_000_000,
  monthlyIncomeMax: 100_000_000,

  hasLaborContract: 'Yes',

  employmentType: 'Công nhân nhà máy',

  city: 'Thành phố Hà Nội',
  district: 'Quận Ba Đình',
  address: '123 Đường ABC',

  fullName: `Nguyễn Văn A`,

  phoneNumber: `9${Math.floor(Math.random() * 90000000) + 10000000}`,
  email: `test${Date.now()}@example.com`
};

const getTestId = (testId: string) => `[data-testid="${testId}"]`;

test('Complete manual application flow', async ({ page }) => {
  const { MAILHOG_URL = 'http://localhost:8025/' } = process.env;
  if (!MAILHOG_URL) {
    throw new Error('Environment variables MAILHOG_URL must be set');
  }

  // Start application
  await page.goto('/apply?step=0');

  // STEP 0: ApplicationStepsEnum.borrowAmount
  const amountSliderTrack = page.locator(getTestId(TEST_IDS.borrowAmountSlider));
  await expect(amountSliderTrack).toBeVisible();
  const amountBox = await amountSliderTrack.boundingBox();
  if (!amountBox) throw new Error('Borrow amount slider not found!');
  const percentage = (TEST_DATA.amount - TEST_DATA.minAmount) / (TEST_DATA.maxAmount - TEST_DATA.minAmount);
  const amountTargetX = amountBox.x + percentage * amountBox.width;
  await page.mouse.move(amountBox.x, amountBox.y + amountBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(amountTargetX, amountBox.y + amountBox.height / 2);
  await page.mouse.up();
  const amountValue = await page.locator(getTestId(`${TEST_IDS.borrowAmountSlider}_input`)).getAttribute('value');
  expect(amountValue).toBe(`${TEST_DATA.amount}`);
  await page.click(getTestId(TEST_IDS.nextStepButton));

  // STEP 1: ApplicationStepsEnum.borrowPeriod
  const termsSliderTrack = page.locator(getTestId(TEST_IDS.borrowTermSlider));
  await expect(termsSliderTrack).toBeVisible();
  const termsBox = await termsSliderTrack.boundingBox();
  if (!termsBox) throw new Error('Borrow term slider not found!');
  const termsPercentage = (TEST_DATA.terms - TEST_DATA.minTerms) / (TEST_DATA.maxTerms - TEST_DATA.minTerms);
  const termsTargetX = termsBox.x + termsPercentage * termsBox.width;
  await page.mouse.move(termsBox.x, termsBox.y + termsBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(termsTargetX, termsBox.y + termsBox.height / 2);
  await page.mouse.up();

  const termsValue = await page.locator(getTestId(`${TEST_IDS.borrowTermSlider}_input`)).getAttribute('value');
  expect(termsValue).toBe(`${TEST_DATA.terms}`);
  await page.click(getTestId(TEST_IDS.nextStepButton));

  // STEP 2: ApplicationStepsEnum.borrowPurpose
  const purposeDropdown = page.locator(getTestId(TEST_IDS.borrowPurposeSelect));
  await expect(purposeDropdown).toBeVisible();
  await purposeDropdown.click();
  await page
    .locator(`${getTestId(`${TEST_IDS.borrowPurposeSelect}_listbox`)} > li[role="option"]`, {
      hasText: TEST_DATA.purpose
    })
    .first()
    .click();
  await expect(purposeDropdown).toHaveText(TEST_DATA.purpose);
  await page.click(getTestId(TEST_IDS.nextStepButton));

  // STEP 3: ApplicationStepsEnum.cccdNumber
  const cccdInput = page.locator(`${getTestId(TEST_IDS.cccdInput)} > input`);
  await expect(cccdInput).toBeVisible();
  await cccdInput.fill(TEST_DATA.cccdNumber);
  await expect(cccdInput).toHaveValue(TEST_DATA.cccdNumber);
  await page.click(getTestId(TEST_IDS.nextStepButton));

  // STEP 4: ApplicationStepsEnum.employmentType
  const employmentTypeSelect = page.locator(getTestId(TEST_IDS.employmentTypeSelect));
  await employmentTypeSelect.click();
  await page
    .locator(`[data-testid="${TEST_IDS.employmentTypeSelect}_listbox"] >> li[role="option"]`, {
      hasText: TEST_DATA.employmentType
    })
    .click();
  await expect(employmentTypeSelect).toHaveText(TEST_DATA.employmentType);
  await page.click(getTestId(TEST_IDS.nextStepButton));

  // STEP 5: ApplicationStepsEnum.dateOfBirth
  const dobPicker = page.locator(getTestId(TEST_IDS.dobInput));
  await expect(dobPicker).toBeVisible();
  // todo: fill test values
  await page.click(getTestId(TEST_IDS.nextStepButton));

  // STEP 6: ApplicationStepsEnum.monthlyIncome
  const monthlyIncomeSliderTrack = page.locator(getTestId(TEST_IDS.monthlyIncomeInput));
  await expect(monthlyIncomeSliderTrack).toBeVisible();
  const monthlyIncomeBox = await monthlyIncomeSliderTrack.boundingBox();
  if (!monthlyIncomeBox) throw new Error('Monthly income slider not found!');
  const monthlyIncomePercentage =
    (TEST_DATA.monthlyIncome - TEST_DATA.monthlyIncomeMin) / (TEST_DATA.monthlyIncomeMax - TEST_DATA.monthlyIncomeMin);
  const monthlyIncomeTargetX = monthlyIncomeBox.x + monthlyIncomePercentage * monthlyIncomeBox.width;
  await page.mouse.move(monthlyIncomeBox.x, monthlyIncomeBox.y + monthlyIncomeBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(monthlyIncomeTargetX, monthlyIncomeBox.y + monthlyIncomeBox.height / 2);
  await page.mouse.up();
  const monthlyIncomeValue = await page.locator(getTestId(`${TEST_IDS.monthlyIncomeInput}_input`)).getAttribute('value');
  expect(monthlyIncomeValue).toBe(`${TEST_DATA.monthlyIncome}`);
  await page.click(getTestId(TEST_IDS.nextStepButton));

  // STEP 7: ApplicationStepsEnum.hasLaborContract
  const laborContractOption = page.locator(
    getTestId(TEST_DATA.hasLaborContract === 'Yes' ? TEST_IDS.hasLaborContractYes : TEST_IDS.hasLaborContractNo)
  );
  await expect(laborContractOption).toBeVisible();
  await laborContractOption.click();
  await page.click(getTestId(TEST_IDS.nextStepButton));

  // STEP 8: ApplicationStepsEnum.currentAddress
  // Select city
  const cityDropdown = page.locator(getTestId(TEST_IDS.citySelect));
  await expect(cityDropdown).toBeVisible();
  await cityDropdown.click();
  await page
    .locator(`${getTestId(`${TEST_IDS.citySelect}_listbox`)} > li[role="option"]`, {
      hasText: TEST_DATA.city
    })
    .first()
    .click();
  await expect(cityDropdown).toHaveText(TEST_DATA.city);

  // Select district
  const districtDropdown = page.locator(getTestId(TEST_IDS.districtSelect));
  await expect(districtDropdown).toBeVisible();
  await districtDropdown.click();
  await page
    .locator(`${getTestId(`${TEST_IDS.districtSelect}_listbox`)} > li[role="option"]`, {
      hasText: TEST_DATA.district
    })
    .first()
    .click();
  await expect(districtDropdown).toHaveText(TEST_DATA.district);

  // Address Input
  const addressInput = page.locator(`${getTestId(TEST_IDS.addressInput)} > input`);
  await expect(addressInput).toBeVisible();
  await addressInput.fill(TEST_DATA.address);
  await expect(addressInput).toHaveValue(TEST_DATA.address);
  await page.click(getTestId(TEST_IDS.nextStepButton));

  // STEP 9: ApplicationStepsEnum.fullName
  const fullNameInput = page.locator(`${getTestId(TEST_IDS.fullNameInput)} > input`);
  await expect(fullNameInput).toBeVisible();
  await fullNameInput.fill(TEST_DATA.fullName);
  await expect(fullNameInput).toHaveValue(TEST_DATA.fullName);
  await page.click(getTestId(TEST_IDS.nextStepButton));

  // Verify we've reached the registration step
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
    throw new Error('No emails found in MailHog');
  }
  const latestEmail = emails.items[0];
  const otpRegex = /\b\d{6}\b/;
  const match = latestEmail.Content.Body.match(otpRegex);
  if (!match) {
    throw new Error('OTP not found in email');
  }
  const otp = match[0];
  await otpInput.fill(otp);
  await page.locator(getTestId(TEST_IDS.submitOtpButton)).click();

  // Verify if user is redirected to dashboard
  await expect(page).toHaveURL('/user/dashboard');
  await expect(page.getByText(TEST_DATA.email)).toBeVisible();
});
