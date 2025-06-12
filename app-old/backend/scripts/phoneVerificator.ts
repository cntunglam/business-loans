import { openaiClient } from '../clients/openaiClient';

(async () => {
  // Get phone number from command line arguments
  let phoneNumber = process.argv[2];
  if (!phoneNumber) {
    console.error('Usage: node phoneVerificator.js <phone_number>');
    process.exit(1);
  }

  if (phoneNumber.startsWith('+65')) {
    phoneNumber = phoneNumber.slice(3);
  }

  phoneNumber = phoneNumber.slice(1);

  console.log('Checking phone number:', phoneNumber);

  // Construct the message to ask ChatGPT for a score (0-10) on the likelihood of the phone number being fake.
  const promptMessage = `
    Given a phone number, based on the pattern, (repeating numbers, consecutive numbers etc...) please provide a score from 0 to 10 indicating how likely it is that the phone number is fake.
    Only output the score
    Here is the phone number to evaluate: ${phoneNumber}
  `;

  try {
    const response = await openaiClient.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'system', content: promptMessage }],
    });
    console.log('Phone verification score:', response.choices[0].message.content);
  } catch (error) {
    console.error('Error during phone verification:', error);
  }
})();
