import fs from 'node:fs'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx'
import PDFDocument from 'pdfkit'

// Paleta de marca de Menteios (misma que src/index.css) para que los
// documentos generados se sientan consistentes con el resto de la app.
const BRAND_TEAL_DARK = '155A5F'
const BRAND_TEAL_DARKER = '0F4448'

/**
 * Arma el buffer binario de un documento Word oficial a partir de un
 * machote: título en negritas (nombreArchivo) + la descripción como
 * cuerpo. Devuelve un Buffer listo para `fs.writeFileSync` — no escribe
 * nada a disco por sí mismo, así que también sirve para exportación en
 * lote (un buffer por machote, sin abrir diálogos repetidos).
 */
export async function generateWordBuffer(machoteData) {
  const documento = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: machoteData.nombreArchivo,
                bold: true,
                size: 32, // 16pt (docx mide en half-points)
                color: BRAND_TEAL_DARK,
              }),
            ],
          }),
          new Paragraph({
            border: {
              bottom: { color: BRAND_TEAL_DARK, space: 1, style: 'single', size: 6 },
            },
            spacing: { after: 300 },
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: machoteData.descripcion,
                size: 24, // 12pt
              }),
            ],
          }),
        ],
      },
    ],
  })

  return Packer.toBuffer(documento)
}

/**
 * Genera el PDF real en `filePath`: membrete superior con los colores de
 * Menteios, título del machote y la descripción como cuerpo. `pdfkit`
 * trabaja por streaming, así que la función resuelve la Promise recién
 * cuando el stream de escritura termina (evento 'finish') — de otra
 * forma el archivo podría reportarse como "listo" antes de terminar de
 * escribirse en disco.
 */
export function generatePdfFile(machoteData, filePath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'LETTER', margin: 50 })
    const stream = fs.createWriteStream(filePath)

    doc.pipe(stream)

    // Membrete
    doc.rect(0, 0, doc.page.width, 90).fill(`#${BRAND_TEAL_DARK}`)
    doc
      .fillColor('#FFFFFF')
      .font('Helvetica-Bold')
      .fontSize(18)
      .text('MENTEIOS', 50, 30)
    doc
      .font('Helvetica')
      .fontSize(10)
      .text('Plataforma de gestión clínica', 50, 55)

    // Título del documento
    doc
      .fillColor(`#${BRAND_TEAL_DARKER}`)
      .font('Helvetica-Bold')
      .fontSize(16)
      .text(machoteData.nombreArchivo, 50, 130)

    // Cuerpo
    doc
      .fillColor('#333333')
      .font('Helvetica')
      .fontSize(12)
      .text(machoteData.descripcion, 50, 165, {
        width: doc.page.width - 100,
        align: 'justify',
        lineGap: 4,
      })

    doc.end()

    stream.on('finish', () => resolve(filePath))
    stream.on('error', reject)
  })
}
