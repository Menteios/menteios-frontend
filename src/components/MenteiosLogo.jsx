// Assets vectoriales reales de la marca (provistos por el cliente,
// trazados con VTracer a partir de sus logos originales) — Vite los trata
// como URL de imagen al importarlos así, sin plugins extra.
import arbolMenteios from '../assets/arbol-menteios.svg'
import menteiosWordmark from '../assets/menteios-wordmark.svg'

// `object-contain` es lo que evita la distorsión: si el cuadro (className)
// no tiene la misma proporción que el archivo, deja espacio en vez de
// estirar la imagen para llenarlo.
export function TreeLogo({ className = 'h-28 w-40' }) {
  return (
    <img
      src={arbolMenteios}
      alt="Logotipo Menteios: árbol de manos con símbolo Psi"
      className={`${className} object-contain`}
    />
  )
}

// El archivo ya trae el ícono y el texto "MENTEIOS" trazados juntos como
// una sola imagen (viene de una foto/diseño del logo completo) — a
// diferencia de la versión anterior, acá no hace falta un <span> de texto
// aparte.
export function MenteiosWordmark({ className = 'h-6 w-auto' }) {
  return (
    <img
      src={menteiosWordmark}
      alt="Menteios"
      className={`${className} max-h-full object-contain`}
    />
  )
}
