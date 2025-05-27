// import { ComputerVisionClient } from '@azure/cognitiveservices-computervision';
// import { GetReadResultResponse } from '@azure/cognitiveservices-computervision/esm/models';
// import { ApiKeyCredentials } from '@azure/ms-rest-js';

// const key = process.env.VISION_KEY;
// const endpoint = process.env.VISION_ENDPOINT || '';

// const computerVisionClient = new ComputerVisionClient(
//   new ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': key } }),
//   endpoint,
// );

// interface ExtractedData {
//   text: string;
//   boundingBox: number[];
// }

// // Function to extract text from an document, returning an array of extracted data
// async function runComputerVision(buffer: Buffer): Promise<any> {
//   try {
//     const result = await computerVisionClient.readInStream(buffer);

//     // Get the operation ID from the result for polling
//     const operationId = result.operationLocation.split('/').slice(-1)[0];

//     let readResult;

//     // Poll the service until the text extraction is complete
//     while (true) {
//       readResult = await computerVisionClient.getReadResult(operationId);
//       if (readResult.status === 'succeeded') break;
//       await new Promise((resolve) => setTimeout(resolve, 1000));
//     }

//     const extractedData = extractTextWithBoundingBox(readResult);

//     return extractedData;
//   } catch (error) {
//     throw new Error('Text extraction failed');
//   }
// }

// const extractTextWithBoundingBox = async (result: GetReadResultResponse) => {
//   const extractedData: { pageNumber: number; lines: ExtractedData[] }[] = [];

//   if (!result?.analyzeResult) return [];

//   // Process each page of the read results
//   result.analyzeResult.readResults.forEach((page: any, pageIndex: number) => {
//     const pageData: ExtractedData[] = [];

//     // Process each line found on the page
//     page.lines.forEach((line: any) => {
//       pageData.push({
//         text: line.text,
//         boundingBox: line.boundingBox,
//       });
//     });

//     // Push the page data into the extractedData array
//     extractedData.push({
//       pageNumber: pageIndex,
//       lines: pageData,
//     });
//   });

//   return extractedData; // Returns array of objects, each containing page number and extracted lines
// };

// export { runComputerVision };
