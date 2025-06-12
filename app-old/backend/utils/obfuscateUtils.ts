// import { PDFPage, rgb } from 'pdf-lib';
// import sharp from 'sharp';

// export async function obfuscateImage(
//   imagePath: Buffer,
//   boundingBoxes: { text: string; boundingBox: number[] }[],
//   outputImagePath: string,
// ) {
//   try {
//     const image = sharp(imagePath).png();
//     const metadata = await image.metadata();

//     const svgRects = boundingBoxes.map(({ boundingBox }) => {
//       const [x1, y1, x2, y2, x3, y3, x4, y4] = boundingBox;
//       const x = Math.min(x1, x2, x3, x4);
//       const y = Math.min(y1, y2, y3, y4);
//       const width = Math.max(x2, x3) - x;
//       const height = Math.max(y3, y4) - y;

//       return `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="black" />`;
//     });

//     const svgImage = `
//       <svg width="${metadata.width}" height="${metadata.height}">
//         ${svgRects.join('')}
//       </svg>
//     `;
//     await image.composite([{ input: Buffer.from(svgImage), blend: 'over' }]).toFile(outputImagePath);
//     // TODO: handle save to cloud storage
//   } catch (error) {
//     console.log(`ERROR obfuscateImage ::::`, error);
//   }
// }

// export async function obfuscatePdf(page: PDFPage, extractedData: { text: string; boundingBox: number[] }[]) {
//   try {
//     //  DPI (Dots Per Inch)
//     // 1 inch = 72 points
//     const DPI = 72;
//     const array = extractedData;

//     const { height } = page.getSize();

//     // Loop through each bounding box to obfuscate
//     for (const box of array) {
//       const [x1, y1, x2, y2, x3, y3, x4, y4] = box.boundingBox;

//       // Calculate the coordinates of the bounding box
//       const x = Math.min(x1, x2, x3, x4) * DPI;
//       const y = Math.min(y1, y2, y3, y4) * DPI;
//       const boxWidth = (Math.max(x2, x3) - Math.min(x1, x2)) * DPI;
//       const boxHeight = (Math.max(y3, y4) - Math.min(y1, y2)) * DPI;

//       // Draw a black rectangle over the sensitive area
//       page.drawRectangle({
//         x: x,
//         y: height - y - boxHeight, // Adjust for PDF coordinate system (origin is bottom-left)
//         width: boxWidth,
//         height: boxHeight,
//         color: rgb(0, 0, 0),
//       });
//     }

//     return page;
//   } catch (error) {
//     console.log(`ERROR obfuscatePdf ::::`, error);
//   }
// }
