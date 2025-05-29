import { faker } from '@faker-js/faker/locale/vi';
import { uniqueId } from 'lodash';
import { prismaClient } from '../clients/prismaClient';

// Generate Vietnamese company names
const generateCompanyName = (index: number) => {
  const prefixes = ['Công ty', 'Tập đoàn', 'Tổng công ty', 'Công ty CP', 'Công ty TNHH'];
  const industries = [
    'Tài chính',
    'Ngân hàng',
    'Bảo hiểm',
    'Chứng khoán',
    'Bất động sản',
    'Xây dựng',
    'Vận tải',
    'Logistics',
    'Thương mại',
    'Dịch vụ',
    'Công nghệ',
    'Viễn thông',
    'Năng lượng',
    'Môi trường',
    'Y tế',
    'Giáo dục',
    'Du lịch',
  ];
  const suffixes = ['Hưng Thịnh', 'Phát Đạt', 'Thành Công', 'Minh Quang', 'Phúc Lộc', 'An Khang'];
  return `${faker.helpers.arrayElement(prefixes)} ${faker.helpers.arrayElement(industries)} ${faker.helpers.arrayElement(suffixes)} ${index + 1}`;
};

const generateAddress = () => {
  const streets = ['Lê Lợi', 'Nguyễn Huệ', 'Hai Bà Trưng', 'Lê Duẩn', 'Pasteur', 'Điện Biên Phủ'];
  const wards = ['Phường Bến Nghé', 'Phường Bến Thành', 'Phường Đa Kao', 'Phường Tân Định'];
  const districts = ['Quận 1', 'Quận 3', 'Quận 5', 'Quận 10', 'Quận Bình Thạnh'];

  return `${faker.number.int({ min: 1, max: 200 })} ${faker.helpers.arrayElement(streets)}, ${faker.helpers.arrayElement(wards)}, ${faker.helpers.arrayElement(districts)}, TP.HCM`;
};

const generatePhoneNumber = () => {
  return `+84${faker.string.numeric(9)}`;
};

const generateCompanyType = () => {
  return faker.helpers.arrayElement(['LENDER', 'BROKER', 'BANK']);
};

const generateCompanyStatus = () => {
  return faker.helpers.arrayElement(['ACTIVE', 'INACTIVE', 'PENDING']);
};

async function createCompany(index: number) {
  const companyName = generateCompanyName(index);
  const companyType = generateCompanyType();
  const companyStatus = generateCompanyStatus();
  const companyEmail = `contact@${companyName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')}.com`;

  const company = await prismaClient.company.create({
    data: {
      name: companyName,
      logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=random`,
      country: 'VN',
      type: companyType,
      status: companyStatus,
      description: `${companyName} là một trong những công ty hàng đầu trong lĩnh vực tài chính tại Việt Nam`,
      commission: faker.number.float({ min: 0.01, max: 0.1 }),
      salesPhoneNumber: generatePhoneNumber(),
      companyLeadSettings: {
        create: {
          minMonthlyIncomeForeigner: faker.number.int({ min: 30000000, max: 100000000 }),
          minMonthlyIncomeLocal: faker.number.int({ min: 10000000, max: 50000000 }),
          minLoanAmount: faker.number.int({ min: 5000000, max: 50000000 }),
          maxDebtIncomeRatio: faker.number.float({ min: 0.5, max: 0.8 }),
          employmentStatus: faker.helpers.arrayElements(
            ['FULL_TIME', 'PART_TIME', 'PROBATION', 'CONTRACT', 'FREELANCE'],
            { min: 1, max: 3 },
          ),
          employmentTime: faker.helpers.arrayElements(
            ['LESS_THAN_3_MONTHS', 'MORE_THAN_3_MONTHS', 'MORE_THAN_6_MONTHS', 'MORE_THAN_1_YEAR', 'MORE_THAN_2_YEARS'],
            { min: 1, max: 3 },
          ),
          residencyStatus: faker.helpers.arrayElements(['OWNED', 'RENTED', 'COMPANY_PROVIDED', 'WITH_RELATIVES'], {
            min: 1,
            max: 3,
          }),
          propertyOwnerships: faker.helpers.arrayElements(['OWNED', 'MORTGAGED', 'RENTED', 'FAMILY_OWNED'], {
            min: 1,
            max: 3,
          }),
          documents: faker.helpers.arrayElements(
            ['ID_CARD', 'PASSPORT', 'HOUSEHOLD_BOOK', 'SALARY_SLIP', 'BANK_STATEMENT', 'EMPLOYMENT_CONTRACT'],
            { min: 2, max: 5 },
          ),
          documentCount: faker.number.int({ min: 2, max: 6 }),
          isApprovedByRoshi: faker.datatype.boolean({ probability: 0.8 }),
        },
      },
      stores: {
        create: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, (_, i) => ({
          name: `${companyName} - Chi nhánh ${i + 1}`,
          address: generateAddress(),
          phoneNumber: generatePhoneNumber(),
          email: `cn${i + 1}@${companyEmail}`,
          mapsUrl: 'https://maps.app.goo.gl/example',
          mapsEmbedUrl: 'https://www.google.com/maps/embed/v1/place?key=API_KEY&q=Company',
          imageUrl: 'https://picsum.photos/800/400?random',
          gPlaceId: `ChIJN1t_tDeuEmsRUsoyG83frY${index}${i}`,
          ratings: faker.number.int({ min: 1, max: 5 }),
          openingHours: {
            create: [
              {
                dayOfWeek: 0,
                isOpen: false,
                openHour: '09:00',
                closeHour: '18:00',
                maxCustomers: faker.number.int({ min: 5, max: 20 }),
              },
              ...Array.from({ length: 6 }, (_, day) => ({
                dayOfWeek: day + 1,
                isOpen: true,
                openHour: '09:00',
                closeHour: '18:00',
                maxCustomers: faker.number.int({ min: 5, max: 20 }),
              })),
            ],
          },
        })),
      },
    },
    include: {
      companyLeadSettings: true,
      stores: {
        include: {
          openingHours: true,
        },
      },
    },
  });

  // Create 1-3 lender users for each company
  const numLenders = faker.number.int({ min: 1, max: 3 });
  for (let i = 0; i < numLenders; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = `lender+${uniqueId()}@example.com`;

    await prismaClient.user.create({
      data: {
        email,
        name: `${lastName} ${firstName}`,
        phone: generatePhoneNumber(),
        role: 'LENDER',
        companyId: company.id,
        isAssignableToLoanRequest: faker.datatype.boolean({ probability: 0.7 }),
        status: faker.helpers.arrayElement(['ACTIVE', 'INACTIVE', 'PENDING']),
        lastLoginAt: faker.date.recent({ days: 30 }),
      },
    });
  }

  return company;
}

export async function seedData() {
  console.log('Starting seed...');
  const totalCompanies = 100;
  const batchSize = 10;
  console.log(`Creating ${totalCompanies} companies with their users...`);
  for (let i = 0; i < totalCompanies; i += batchSize) {
    const batchPromises = [];
    const currentBatchSize = Math.min(batchSize, totalCompanies - i);
    console.log(`Processing batch ${i / batchSize + 1}/${Math.ceil(totalCompanies / batchSize)}...`);
    for (let j = 0; j < currentBatchSize; j++) {
      const companyIndex = i + j;
      batchPromises.push(
        createCompany(companyIndex)
          .then(() => {
            if ((companyIndex + 1) % 10 === 0) {
              console.log(`Created ${companyIndex + 1}/${totalCompanies} companies`);
            }
          })
          .catch((error) => {
            console.error(`Error creating company ${companyIndex + 1}:`, error);
          }),
      );
    }
    await Promise.all(batchPromises);
  }

  console.log('Seed completed successfully!');
}
