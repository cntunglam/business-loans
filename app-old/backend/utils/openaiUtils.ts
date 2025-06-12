export const buildPromptForValidation = (applicantInfo: unknown) => [
  {
    type: 'text',
    text: 'Analyze the document in the image to identify and extract Personal Identifiable Information (PII), such as Full Name, Age, Address, Phone Number, Residency, and NRIC/ID.',
  },
  {
    type: 'text',
    text: `Determine if the document is a valid ID or passport by comparing the extracted PII from the image with the following applicant information: ${JSON.stringify(applicantInfo)}. Based on this comparison, return a confidence score between 0 and 1, where 0 indicates the document is invalid and 1 indicates it is valid.`,
  },
  {
    type: 'text',
    text: 'For each identified PII, return the **label** (e.g., "Full Name", "Residency") and **value** (e.g., "John Doe"). Also, indicate whether each value is considered personally identifiable (isPII: true or false).',
  },
  {
    type: 'text',
    text: 'Ensure the response strictly follows this JSON format:',
  },
  {
    type: 'text',
    text: JSON.stringify({
      confidence: 'number', // A confidence score from 0 to 1, indicating how likely the document is valid.
      results: [
        {
          label: 'string', // e.g., "Full Name"
          value: 'string', // e.g., "John Doe"
          isPII: {
            type: 'boolean', //True if the value is considered PII
          },
        },
      ],
    }),
  },
];
export const buildPrompt = (extractedTexts: unknown) => [
  {
    type: 'text',
    text: 'Analyze the document in the image to identify and extract Personal Identifiable Information (PII).',
  },
  {
    type: 'text',
    text: `Now analyze the following extracted text to ensure the accuracy of the sensitive values identified from the image: ${JSON.stringify(extractedTexts)}`,
  },
  {
    type: 'text',
    text: 'For each identified PII, return the **label** and **value**. Also, indicate whether each value is considered personally identifiable (isPII: true or false).',
  },
  {
    type: 'text',
    text: 'Ensure the response strictly follows this JSON format:',
  },
  {
    type: 'text',
    text: JSON.stringify({
      results: [
        {
          label: 'string', // e.g., "Full Name"
          value: 'string', // e.g., "John Doe"
          isPII: {
            type: 'boolean', //True if the value is considered PII
          },
        },
      ],
    }),
  },
];
