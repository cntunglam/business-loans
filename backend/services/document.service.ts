import { Document } from '@roshi/shared';

// directory that stores files after obfuscation for testing purposes
// const DOCUMENT_FOLDER = 'obfuscateDocuments';
// const PAGE_WIDTH = 2480;
// const PAGE_HEIGHT = 3508;

export const formatDocumentForLenderOrBorrower = (document: Document) => {
  return {
    filename: document.filename,
    documentType: document.documentType,
  };
};

// export const validateDocument = async (
//   filename: string,
//   mimetype: string,
//   documentType: DocumentTypeEnum,
//   applicantInfoId: string,
// ) => {
//   try {
//     // Check if the file was not deleted
//     const applicant = await prismaClient.applicantInfo.findUnique({
//       where: { id: applicantInfoId, documents: { some: { documentType: documentType, isDeleted: false } } },
//       include: {
//         documents: true,
//       },
//     });

//     if (!applicant) {
//       return;
//     }

//     const link = await getBlobLink(filename);

//     const response = await fetch(link);
//     const input = await response.arrayBuffer();
//     const base64 = Buffer.from(input).toString('base64');

//     const document = applicant.documents.find((doc) => doc.documentType === documentType && doc.isDeleted === false);

//     if (mimetype === 'application/pdf') {
//       return await validateDocumentPdf(base64, documentType, applicant.data, document?.id || '');
//     } else {
//       return await validateDocumentImage(base64, documentType, applicant.data, document?.id || '');
//     }
//   } catch (error) {
//     console.log(`validate document :::`, error);
//   }
// };

// export const validateDocumentImage = async (
//   base64: string,
//   documentType: DocumentTypeEnum,
//   applicantInfo: unknown,
//   documentId: string,
// ) => {
//   try {
//     const buffer = Buffer.from(base64, 'base64');
//     // Run OCR to extract text from the image
//     const ocrResult = await runComputerVision(buffer);
//     const extractedTexts = ocrResult.map((ocr: any) => ocr.lines.map((line: any) => line.text));

//     // Build prompt for OpenAI based on document type
//     const openAIPrompt =
//       documentType === DocumentTypeEnum.ID_CARD ? buildPromptForValidation(applicantInfo) : buildPrompt(extractedTexts);

//     // Run the OpenAI NLP prompt on the base64 image and get sensitive information
//     const nlpResult = await runPromptImage(base64 as string, openAIPrompt);

//     await prismaClient.document.update({
//       where: { id: documentId },
//       data: {
//         DocumentMetadata: {
//           create: {
//             extractedData: { ...nlpResult },
//           },
//         },
//       },
//     });

//     // Extract sensitive information identified by OpenAI
//     const sensitiveData = nlpResult?.results?.filter((item: any) => item.isPII).map((item: any) => item.value);

//     // Filter OCR results to only include sensitive text for obfuscation
//     const filteredResults = ocrResult?.[0]?.lines.filter((line: any) => sensitiveData.includes(line.text));
//     const outputFile = `${DOCUMENT_FOLDER}/${new Date().getTime()}.png`;
//     await obfuscateImage(Buffer.from(base64, 'base64'), filteredResults, outputFile);
//     return nlpResult;
//   } catch (error) {
//     console.log(`validate document image:::`, error);
//   }
// };

// export const validateDocumentPdf = async (
//   base64: string,
//   documentType: DocumentTypeEnum,
//   applicantInfo: unknown,
//   documentId: string,
// ) => {
//   try {
//     const buffer = Buffer.from(base64, 'base64');
//     const pdfDoc = await PDFDocument.load(buffer);
//     const pages = pdfDoc.getPages();

//     const results = await Promise.allSettled(
//       pages.map(async (page, index) => {
//         const pageBuffer = await getPdfPageBuffer(buffer, index);
//         return await analyzePdfPage(page, pageBuffer, documentType, applicantInfo);
//       }),
//     ).catch((error) => console.log(error));

//     const nlpResults = results?.map((result) => {
//       if (result.status === 'fulfilled') {
//         return result.value.results;
//       } else {
//         return null;
//       }
//     });

//     if (nlpResults) {
//       await prismaClient.document.update({
//         where: { id: documentId },
//         data: {
//           DocumentMetadata: {
//             create: {
//               extractedData: { ...nlpResults },
//             },
//           },
//         },
//       });
//     }

//     const pdfBytes = await pdfDoc.save();
//     return await handleConvertPdfToImage(Buffer.from(pdfBytes));
//   } catch (error) {
//     console.log(`obfuscate document pdf::::`, error);
//   }
// };

// export const analyzePdfPage = async (
//   page: PDFPage,
//   pageBuffer: Buffer,
//   documentType: DocumentTypeEnum,
//   applicantInfo: unknown,
// ) => {
//   // Convert this page of the PDF to an image
//   // OpenAI vision doesn't support PDF format
//   const convert = fromBuffer(pageBuffer, {
//     format: 'png',
//     width: page.getWidth(),
//     height: page.getHeight(),
//     density: 300,
//   });

//   // Run OCR on the image to extract text
//   const ocrResult = await runComputerVision(pageBuffer);
//   const extractedTexts = ocrResult.map((ocr: any) => ocr.lines.map((line: any) => line.text));

//   const image = await convert(1, { responseType: 'base64' });
//   // Build prompt for OpenAI based on document type
//   // Build prompt for OpenAI based on document type
//   const openAIPrompt =
//     documentType === DocumentTypeEnum.ID_CARD ? buildPromptForValidation(applicantInfo) : buildPrompt(extractedTexts); // Run the OpenAI NLP prompt on the base64 image and get sensitive information
//   const nlpResult = await runPromptImage(image.base64 as string, openAIPrompt);
//   // Extract sensitive information identified by OpenAI
//   const sensitiveData = nlpResult?.results?.filter((item: any) => item.isPII).map((item: any) => item.value);

//   // Filter OCR results to only include sensitive text for obfuscation
//   const filteredResults = ocrResult?.[0]?.lines.filter((line: any) => sensitiveData.includes(line.text));

//   await obfuscatePdf(page, filteredResults);

//   return { results: nlpResult.results };
// };
// export const handleConvertPdfToImage = async (buffer: Buffer) => {
//   const pdfDoc = await PDFDocument.load(buffer);
//   const pages = pdfDoc.getPages();

//   const buffers = await Promise.all(
//     pages.map(async (_, index) => {
//       const pageBuffer = await getPdfPageBuffer(buffer, index);
//       return await convertPdfToImage(pageBuffer);
//     }),
//   );

//   const newPdfDoc = await PDFDocument.create();

//   for (const imagePath of buffers) {
//     const pngImage = await newPdfDoc.embedPng(imagePath);

//     // Add a new page for each image
//     const page = newPdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
//     page.drawImage(pngImage, {
//       x: 0,
//       y: 0,
//       width: PAGE_WIDTH,
//       height: PAGE_HEIGHT,
//     });
//   }
//   const pdfBytes = await newPdfDoc.save();
//   const outputFile = `${DOCUMENT_FOLDER}/${new Date().getTime()}.pdf`;
//   fs.writeFileSync(outputFile, pdfBytes);
//   // TODO: handle save to cloud storage
//   return outputFile;
// };

// export const convertPdfToImage = async (pageBuffer: Buffer) => {
//   const convert = fromBuffer(pageBuffer, {
//     format: 'png',
//     width: PAGE_WIDTH, // A4 size at 300 DPI
//     height: PAGE_HEIGHT, // A4 size at 300 DPI
//     preserveAspectRatio: true,
//     density: 300, // Maintain high resolution
//   });

//   const pageToConvertAsImage = 1;
//   const image = await convert(pageToConvertAsImage, { responseType: 'base64' });
//   return Buffer.from(image.base64 || '', 'base64');
// };

// export const getPdfPageBuffer = async (pdfBuffer: Buffer, pageNumber: number): Promise<Buffer> => {
//   const pdfDoc = await PDFDocument.load(pdfBuffer);
//   const newPdfDoc = await PDFDocument.create();
//   const [extractedPage] = await newPdfDoc.copyPages(pdfDoc, [pageNumber]);
//   newPdfDoc.addPage(extractedPage);
//   const newPdfBytes = await newPdfDoc.save();
//   return Buffer.from(newPdfBytes);
// };
