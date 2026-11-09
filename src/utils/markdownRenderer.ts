import katex from "katex";
import { marked } from "marked";

/**
 * Procesa un texto que contiene Markdown y fórmulas LaTeX ($...$ para inline, $$...$$ para bloque).
 * Renderiza las fórmulas con KaTeX de forma instantánea y segura.
 */
export function renderMarkdownWithMath(text: string): string {
  if (!text) return "";

  // 1. Reemplazar bloques matemáticos $$...$$ por un marcador temporal
  const mathBlocks: string[] = [];
  let processed = text.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
    try {
      const rendered = katex.renderToString(math.trim(), {
        displayMode: true,
        throwOnError: false,
      });
      mathBlocks.push(rendered);
      return `%%MATH_BLOCK_${mathBlocks.length - 1}%%`;
    } catch {
      return `$$${math}$$`;
    }
  });

  // 2. Reemplazar fórmulas en línea $...$
  const mathInlines: string[] = [];
  processed = processed.replace(/(?<!\\)\$([^\$\n]+?)\$/g, (_, math) => {
    try {
      const rendered = katex.renderToString(math.trim(), {
        displayMode: false,
        throwOnError: false,
      });
      mathInlines.push(rendered);
      return `%%MATH_INLINE_${mathInlines.length - 1}%%`;
    } catch {
      return `$${math}$`;
    }
  });

  // 3. Renderizar Markdown con Marked
  let html = marked.parse(processed, {
    gfm: true,
    breaks: true,
  }) as string;

  // 4. Restaurar los bloques y fórmulas matemáticas ya renderizados
  html = html.replace(/%%MATH_BLOCK_(\d+)%%/g, (_, index) => {
    return `<div class="katex-display-wrapper my-2 overflow-x-auto">${mathBlocks[Number(index)]}</div>`;
  });

  html = html.replace(/%%MATH_INLINE_(\d+)%%/g, (_, index) => {
    return mathInlines[Number(index)] || "";
  });

  return html;
}
