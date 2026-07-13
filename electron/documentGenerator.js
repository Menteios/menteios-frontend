import fs from 'node:fs'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx'
import PDFDocument from 'pdfkit'

// Paleta de marca de Menteios (misma que src/index.css) para que los
// documentos generados se sientan consistentes con el resto de la app.
const BRAND_TEAL_DARK = '155A5F'
const BRAND_TEAL_DARKER = '0F4448'

// --- Bloques de contenido (formato-agnósticos) -------------------------
// Cada machote se arma como una lista de "bloques" simples (título,
// etiqueta, párrafo, línea en blanco, etc.) en vez de directamente en
// Paragraphs de docx o texto de pdfkit. Así el Word y el PDF salen del
// mismo contenido — un solo lugar para el texto real de cada machote —
// y `renderDocx`/`renderPdf` de más abajo son los únicos que saben cómo
// dibujar cada tipo de bloque en su formato.
function titulo(texto) {
  return { tipo: 'titulo', texto }
}

function raya() {
  return { tipo: 'raya' }
}

// Etiqueta en negrita para cada campo/sección del machote (ej. "Objetivo
// de la sesión", "Nombre del Alumno:").
function etiqueta(texto) {
  return { tipo: 'etiqueta', texto }
}

// Línea en blanco para rellenar a mano — imita el machote real (una raya
// larga en vez de un input), repetida `renglones` veces para dar espacio
// real de escritura.
function espacioParaRellenar(renglones = 2) {
  return Array.from({ length: renglones }, () => ({ tipo: 'blanco' }))
}

function parrafo(texto, opciones = {}) {
  return { tipo: 'parrafo', texto, ...opciones }
}

// Bloque mezclando texto literal con espacios en blanco intercalados —
// `segmentos` es un array de strings; `null` en cualquier posición se
// reemplaza por un espacio en blanco para rellenar a mano. Los renglones
// cortos tipo "Nombre del paciente: ___" van sin justificar
// (`alignment: 'left'`): con JUSTIFIED, Word/PDF estiran los espacios
// entre palabras para llenar el ancho de línea, dejando huecos raros.
function parrafoConEspacios(segmentos, opciones = {}) {
  return { tipo: 'mixto', segmentos, ...opciones }
}

// Bloque de firma — igual en los 3 documentos tipo carta, es la firma
// profesional real de la psicóloga que usa la app (no es un dato por
// paciente, es su encabezado/firma fija).
function bloqueFirma() {
  return [
    parrafo('ATENTAMENTE', { bold: true, before: 400, alignment: 'center' }),
    parrafo('Psic. Liliana Herrera Castillo', { alignment: 'center' }),
    parrafo('CÉDULA PROFESIONAL 10512415', { alignment: 'center', size: 20 }),
  ]
}

// --- Plantillas clínicas reales ---------------------------------------
// Texto exacto de los 4 machotes reales que usa la clínica, tal como
// fueron entregados — sin reescribir ni resumir el contenido. Los únicos
// campos reemplazados por espacios en blanco son el nombre del alumno y
// el nombre de la institución educativa (los que cambian en cada caso);
// todo lo demás — incluida la firma profesional — queda igual que en el
// documento original para que la psicóloga lo complete/edite ella misma
// al reutilizarlo, tanto en Word como en PDF.
const PLANTILLAS = {
  'Hoja de seguimiento': () => [
    titulo('Formato de seguimiento'),
    raya(),
    etiqueta('Fecha:'),
    ...espacioParaRellenar(1),
    etiqueta('Objetivo (s) de la sesión'),
    ...espacioParaRellenar(),
    etiqueta('Lo verbalizado por el paciente en sesión'),
    ...espacioParaRellenar(),
    etiqueta('Conducta observada y atención'),
    ...espacioParaRellenar(),
    etiqueta('Información referida por la familia'),
    ...espacioParaRellenar(),
    etiqueta('Recomendaciones'),
    ...espacioParaRellenar(),
  ],

  'Formato solicitud llenado de cuestionarios': () => [
    parrafo('Mérida, Yucatán a 21 de mayo de 2026'),
    ...espacioParaRellenar(2),
    parrafoConEspacios([
      'Por este medio, la que suscribe Psic. Liliana Herrera Castillo, solicita amablemente que todos los docentes que imparten clases al alumno ',
      null,
      ' (quien cursa primero de preparatoria), puedan llenar las Escalas de Evaluación Vanderbilt (Cuestionario para profesores) que se anexan en la carpeta según sus observaciones basadas en el estudiante.',
    ]),
    parrafoConEspacios([
      'Lo anterior, es con la finalidad de beneficiar el proceso de evaluación (diagnóstico clínico) que actualmente se realiza con ',
      null,
      ' de manera particular.',
    ]),
    parrafoConEspacios([
      'Por último, aprovecho esta oportunidad para expresar por anticipado mi agradecimiento por prestar atención a la solicitud mencionada. Estoy segura que la información recabada en el ambiente escolar, será determinante en el proceso de evaluación para apoyar a ',
      null,
      ' en lo necesario.',
    ]),
    ...bloqueFirma(),
  ],

  'Solicitud de permiso para realizar observacion aulica': () => [
    parrafo('Mérida, Yucatán a 25 de marzo de 2026'),
    parrafoConEspacios(['Dirección Primaria “', null, '”'], { alignment: 'left' }),
    parrafoConEspacios([
      'Asunto: Solicitud de permiso para realizar observación áulica como parte del seguimiento externo ahora que el alumno ',
      null,
      ' cursa 5°.',
    ]),
    parrafo(
      'Por este medio, quien suscribe Psic. Liliana Herrera Castillo, me dirijo a Ud. solicitando las facilidades a fin de que pueda acudir a realizar la observación conductual de tipo no participante del estudiante en el ambiente escolar natural.',
    ),
    parrafo(
      'Por lo anterior, se propone como fechas para la visita: a) el miércoles 22 de abril de 8 a 9:30 a.m. o b) el miércoles 29 de abril de 8 a 9:30 a.m.',
    ),
    parrafo(
      'Sirva la presente para solicitar que, en caso de ser posible al término de la observación, ese mismo día quien suscribe pueda intercambiar información con la Mtra. titular del grupo.',
    ),
    parrafoConEspacios([
      'Por otra parte, expreso por anticipado gratitud por prestar atención a la solicitud mencionada para apoyar a ',
      null,
      ' en lo necesario.',
    ]),
    parrafo(
      'Mucho agradeceré que sea a la madre del alumno con quien se confirme con antelación la fecha resultante para la visita escolar.',
    ),
    ...bloqueFirma(),
  ],

  'Registro de sesion con equipo escolar, familiar y especialista externa': () => {
    const roles = [
      'Mtra. de apoyo de USAER',
      'Psicóloga de USAER',
      'Maestra de grupo',
      'Directora de Primaria',
      'Especialista',
      'Psicóloga escolar USAER',
      'especialista externa',
      'los padres',
    ]

    return [
      titulo('REGISTRO DE SESIÓN CON EQUIPO ESCOLAR, FAMILIA Y ESPECIALISTA EXTERNA'),
      raya(),
      parrafo('Mérida, Yucatán a ____ de ________________ de ____'),
      parrafoConEspacios(['Nombre del paciente: ', null, '   Grado: ', null], { alignment: 'left' }),
      ...espacioParaRellenar(2),
      etiqueta('ACUERDOS Y COMPROMISOS'),
      ...espacioParaRellenar(3),
      ...roles.flatMap((rol) => [etiqueta(`Nombre y firma de ${rol}`), ...espacioParaRellenar(1)]),
    ]
  },
}

// Machote sin plantilla oficial registrada (ej. uno nuevo creado desde la
// pantalla de Reportes): se arma con el título y la descripción como
// cuerpo, igual que antes — mejor eso que un documento vacío.
function plantillaGenerica(machoteData) {
  return [titulo(machoteData.nombreArchivo), raya(), parrafo(machoteData.descripcion)]
}

function construirBloques(machoteData) {
  const construir = PLANTILLAS[machoteData.nombreArchivo] ?? (() => plantillaGenerica(machoteData))
  return construir(machoteData)
}

const ALINEACION_DOCX = {
  left: AlignmentType.LEFT,
  center: AlignmentType.CENTER,
  justify: AlignmentType.JUSTIFIED,
}

// --- Render a Word (docx) -----------------------------------------------
function renderDocx(bloques) {
  return bloques.map((bloque) => {
    switch (bloque.tipo) {
      case 'titulo':
        return new Paragraph({
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
          children: [new TextRun({ text: bloque.texto, bold: true, size: 32, color: BRAND_TEAL_DARK, font: 'Calibri' })],
        })
      case 'raya':
        return new Paragraph({
          border: { bottom: { color: BRAND_TEAL_DARK, space: 1, style: 'single', size: 6 } },
          spacing: { after: 300 },
        })
      case 'etiqueta':
        return new Paragraph({
          spacing: { before: 200, after: 80 },
          children: [new TextRun({ text: bloque.texto, bold: true, size: 24, font: 'Calibri' })],
        })
      case 'blanco':
        return new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: '_'.repeat(95), size: 22, font: 'Calibri', color: '999999' })],
        })
      case 'parrafo':
        return new Paragraph({
          alignment: ALINEACION_DOCX[bloque.alignment ?? 'justify'],
          spacing: { before: bloque.before ?? 0, after: 200 },
          children: [new TextRun({ text: bloque.texto, bold: bloque.bold, size: bloque.size ?? 22, font: 'Calibri' })],
        })
      case 'mixto':
        return new Paragraph({
          alignment: ALINEACION_DOCX[bloque.alignment ?? 'justify'],
          spacing: { after: 200 },
          children: bloque.segmentos.map((segmento) =>
            segmento === null
              ? new TextRun({ text: '_'.repeat(30), size: 22, font: 'Calibri', color: '999999' })
              : new TextRun({ text: segmento, size: 22, font: 'Calibri' }),
          ),
        })
      default:
        return new Paragraph({})
    }
  })
}

// --- Render a PDF (pdfkit) -----------------------------------------------
// pdfkit no maneja Paragraphs — se dibuja como texto que fluye y avanza
// `doc.y` solo, paginando automáticamente si el machote no entra en una
// página (ej. Registro de sesión, con sus 8 bloques de firma).
function renderPdf(doc, bloques) {
  for (const bloque of bloques) {
    switch (bloque.tipo) {
      case 'titulo':
        doc
          .fillColor(`#${BRAND_TEAL_DARK}`)
          .font('Helvetica-Bold')
          .fontSize(15)
          .text(bloque.texto, { align: 'center' })
        doc.moveDown(0.6)
        break
      case 'raya':
        doc
          .strokeColor(`#${BRAND_TEAL_DARK}`)
          .lineWidth(1)
          .moveTo(doc.page.margins.left, doc.y)
          .lineTo(doc.page.width - doc.page.margins.right, doc.y)
          .stroke()
        doc.moveDown(0.8)
        break
      case 'etiqueta':
        doc.fillColor(`#${BRAND_TEAL_DARKER}`).font('Helvetica-Bold').fontSize(11).text(bloque.texto, { align: 'left' })
        doc.moveDown(0.3)
        break
      case 'blanco':
        doc
          .fillColor('#999999')
          .font('Helvetica')
          .fontSize(11)
          .text('_'.repeat(95), { align: 'left', width: doc.page.width - doc.page.margins.left - doc.page.margins.right })
        doc.moveDown(0.3)
        break
      case 'parrafo':
        doc
          .fillColor('#333333')
          .font(bloque.bold ? 'Helvetica-Bold' : 'Helvetica')
          .fontSize(bloque.size ? bloque.size / 2 : 11)
          .text(bloque.texto, { align: bloque.alignment === 'justify' ? 'justify' : (bloque.alignment ?? 'left') })
        doc.moveDown(0.6)
        break
      case 'mixto': {
        const ultimo = bloque.segmentos.length - 1
        bloque.segmentos.forEach((segmento, indice) => {
          const opciones = { continued: indice !== ultimo }
          if (segmento === null) {
            doc.fillColor('#999999').font('Helvetica').fontSize(11).text('_'.repeat(28), opciones)
          } else {
            doc.fillColor('#333333').font('Helvetica').fontSize(11).text(segmento, opciones)
          }
        })
        doc.moveDown(0.6)
        break
      }
      default:
        break
    }
  }
}

/**
 * Arma el buffer binario de un documento Word oficial a partir de un
 * machote: usa la plantilla clínica real registrada en `PLANTILLAS` según
 * su `nombreArchivo` (títulos, secciones y espacios para rellenar), o cae
 * a una plantilla genérica si no hay una registrada. Devuelve un Buffer
 * listo para `fs.writeFileSync` — no escribe nada a disco por sí mismo,
 * así que también sirve para exportación en lote (un buffer por machote,
 * sin abrir diálogos repetidos).
 */
export async function generateWordBuffer(machoteData) {
  const documento = new Document({
    sections: [{ properties: {}, children: renderDocx(construirBloques(machoteData)) }],
  })

  return Packer.toBuffer(documento)
}

/**
 * Genera el PDF real en `filePath`: mismo contenido que `generateWordBuffer`
 * (la plantilla clínica completa, no solo la descripción corta) con un
 * membrete superior con los colores de Menteios. `pdfkit` trabaja por
 * streaming, así que la función resuelve la Promise recién cuando el
 * stream de escritura termina (evento 'finish') — de otra forma el
 * archivo podría reportarse como "listo" antes de terminar de escribirse
 * en disco.
 */
export function generatePdfFile(machoteData, filePath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'LETTER', margin: 50 })
    const stream = fs.createWriteStream(filePath)

    doc.pipe(stream)

    // Membrete — solo en la primera página; si el machote pagina (ej.
    // Registro de sesión), las páginas siguientes arrancan sin repetirlo.
    doc.rect(0, 0, doc.page.width, 90).fill(`#${BRAND_TEAL_DARK}`)
    doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(18).text('MENTEIOS', 50, 30)
    doc.font('Helvetica').fontSize(10).text('Plataforma de gestión clínica', 50, 55)

    doc.y = 130
    renderPdf(doc, construirBloques(machoteData))

    doc.end()

    stream.on('finish', () => resolve(filePath))
    stream.on('error', reject)
  })
}
