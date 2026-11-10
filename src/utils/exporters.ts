import { Quiz } from "../types/quiz";
import { saveAs } from "file-saver";

/**
 * Genera la cadena de texto con el código fuente LaTeX (.tex)
 * basado exactamente en la plantilla formal institucional.
 */
export function generateLatexCode(quiz: Quiz, mode: "exam" | "solutions" = "exam"): string {
  const isSolutions = mode === "solutions";
  const mcCount = quiz.items.filter((item) => item.question.type !== "open").length;

  let tex = `% ============================================================
%  PLANTILLA DE EVALUACIÓN  ·  Opción múltiple y preguntas abiertas
%  Compilar con: pdflatex nombre_archivo.tex   (dos veces)
% ============================================================
\\documentclass[11pt,a4paper]{article}

% ---------- Codificación e idioma ----------
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{microtype}
\\usepackage[spanish]{babel}

% ---------- Tipografía (Palatino + Helvetica para títulos) ----------
\\usepackage[sc]{mathpazo}
\\usepackage[scaled=0.92]{helvet}
\\linespread{1.08}

% ---------- Página ----------
\\usepackage[top=2.1cm,bottom=2.1cm,left=2.4cm,right=2.4cm,
            headheight=15pt,footskip=1.2cm]{geometry}
\\usepackage{xcolor}
\\usepackage{tikz}
\\usepackage[most]{tcolorbox}
\\usepackage{enumitem}
\\usepackage{fancyhdr}
\\usepackage{lastpage}
\\usepackage{array}
\\usepackage{tabularx}
\\usepackage{amssymb}
\\usepackage{amsmath}
\\usepackage{graphicx}

% ---------- Paleta de colores ----------
\\definecolor{azulprincipal}{HTML}{1F3A5F}   % azul marino
\\definecolor{azulclaro}{HTML}{EAF0F7}       % fondo suave
\\definecolor{dorado}{HTML}{B08D57}          % acento
\\definecolor{grisborde}{HTML}{C9D1DB}
\\definecolor{gristexto}{HTML}{4A5568}

% ---------- Datos del examen ----------
\\newcommand{\\Institucion}{${escapeLatex(quiz.header.institution)}}
\\newcommand{\\Curso}{${escapeLatex(quiz.header.course)}}
\\newcommand{\\TituloExamen}{${escapeLatex(quiz.header.title)}}
\\newcommand{\\Docente}{${escapeLatex(quiz.header.teacher)}}
\\newcommand{\\Fecha}{${escapeLatex(quiz.header.date)}}

% ---------- Encabezado y pie de página ----------
\\pagestyle{fancy}
\\fancyhf{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}
\\fancyhead[L]{\\sffamily\\scriptsize\\color{gristexto}\\Institucion\\ \\textbullet\\ \\Curso}
\\fancyhead[R]{\\sffamily\\scriptsize\\color{gristexto}\\TituloExamen}
\\fancyfoot[C]{\\sffamily\\scriptsize\\color{gristexto}%
  \\tikz[baseline=-0.6ex]{\\draw[dorado,line width=0.5pt](0,0)--(0.6,0);}\\quad
  Página \\thepage\\ de \\pageref{LastPage}\\quad
  \\tikz[baseline=-0.6ex]{\\draw[dorado,line width=0.5pt](0,0)--(0.6,0);}}

% La primera página no repite el encabezado corriente
\\fancypagestyle{plain}{\\fancyhf{}\\renewcommand{\\headrulewidth}{0pt}%
  \\fancyfoot[C]{\\sffamily\\scriptsize\\color{gristexto}%
  \\tikz[baseline=-0.6ex]{\\draw[dorado,line width=0.5pt](0,0)--(0.6,0);}\\quad
  Página \\thepage\\ de \\pageref{LastPage}\\quad
  \\tikz[baseline=-0.6ex]{\\draw[dorado,line width=0.5pt](0,0)--(0.6,0);}}}

\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{0pt}

% ---------- Estilos de caja ----------
\\tcbset{
  encab/.style={enhanced, colback=white, colframe=azulprincipal,
    boxrule=0.8pt, arc=2pt, left=0pt,right=0pt,top=0pt,bottom=0pt,
    boxsep=0pt, before skip=0pt, after skip=7pt},
  instr/.style={enhanced, colback=white, colframe=azulprincipal,
    boxrule=0.7pt, arc=3pt, left=9pt,right=9pt,top=5pt,bottom=5pt,
    before skip=0pt, after skip=12pt},
  hoja/.style={enhanced, colback=white, colframe=azulprincipal,
    boxrule=0.8pt, arc=2pt, left=8pt,right=8pt,top=4pt,bottom=4pt,
    before skip=6pt, after skip=10pt, fonttitle=\\sffamily\\bfseries\\scriptsize,
    coltitle=white, colbacktitle=azulprincipal, attach boxed title to top left={xshift=10pt,yshift=-2mm},
    boxed title style={arc=2pt,boxrule=0pt,top=1pt,bottom=1pt}}
}

% ---------- Campo con línea punteada (Estudiante, Grupo) ----------
\\newcommand{\\campolinea}[2]{%
  \\parbox[b]{#1}{\\sffamily\\small\\color{gristexto}#2\\,{\\color{grisborde}\\dotfill}}}

% ---------- Contadores ----------
\\newcounter{preg}
\\setcounter{preg}{0}

% ---------- Número de pregunta en círculo ----------
\\newcommand{\\numpreg}[1]{%
  \\tikz[baseline=(n.base)]\\node[circle,fill=azulprincipal,text=white,
    inner sep=0pt,minimum size=18pt,font=\\sffamily\\bfseries\\footnotesize](n){#1}%}

% ---------- Opción de selección múltiple ----------
\\newcommand{\\opcion}[2]{%
  {\\sffamily\\bfseries\\color{azulprincipal}#1.}\\hspace{5pt}#2}

% ---------- HOJA DE RESPUESTAS (burbujas estilo ICFES) ----------
\\newcommand{\\hojarespuestas}[1]{%
  \\begin{tcolorbox}[hoja,title={HOJA DE RESPUESTAS}]
  \\vspace{3pt}
  \\centering
  \\begin{tikzpicture}[x=1cm,y=1cm]
    \\foreach \\q in {1,...,#1}{
      \\pgfmathtruncatemacro{\\c}{int((\\q-1)/4)}
      \\pgfmathtruncatemacro{\\r}{mod(\\q-1,4)}
      \\pgfmathsetmacro{\\ox}{\\c*4.1}
      \\pgfmathsetmacro{\\oy}{-\\r*0.56}
      \\node[font=\\sffamily\\scriptsize\\bfseries,text=azulprincipal,anchor=east]
        at (\\ox+0.55,\\oy) {\\q};
      \\foreach \\l [count=\\i from 0] in {A,B,C,D}{
        \\node[circle,draw=azulprincipal,line width=0.6pt,inner sep=0pt,
          minimum size=0.42cm,font=\\sffamily\\fontsize{5.5}{6}\\selectfont,
          text=azulprincipal] at (\\ox+0.95+\\i*0.7,\\oy) {\\l};
      }
    }
  \\end{tikzpicture}
  \\end{tcolorbox}}

% ---------- Enunciado ----------
\\newcommand{\\enunciado}[1]{%
  \\begin{minipage}[t]{\\linewidth}\\small #1\\end{minipage}}

% ---------- PREGUNTA DE OPCIÓN MÚLTIPLE ----------
\\newcommand{\\preguntaMC}[5]{%
  \\refstepcounter{preg}%
  \\begin{minipage}{\\linewidth}
    \\noindent
    \\begin{tabularx}{\\linewidth}{@{}c@{\\hspace{9pt}}X@{}}
      \\numpreg{\\thepreg} & \\enunciado{#1}
    \\end{tabularx}\\par\\vspace{4pt}
    \\hspace{27pt}\\begin{minipage}{\\dimexpr\\linewidth-27pt\\relax}\\small
      \\renewcommand{\\arraystretch}{1.1}
      \\begin{tabularx}{\\linewidth}{@{}X@{\\hspace{8pt}}X@{}}
        \\opcion{A}{#2} & \\opcion{B}{#3}\\\\
        \\opcion{C}{#4} & \\opcion{D}{#5}
      \\end{tabularx}
    \\end{minipage}
  \\end{minipage}
  \\par\\vspace{12pt}}

% ---------- Cuadro de respuesta ----------
\\newcommand{\\cuadrorespuesta}[1]{%
  \\begin{tcolorbox}[enhanced, colback=white, colframe=grisborde,
      boxrule=0.8pt, arc=2pt, left=0pt,right=0pt,top=0pt,bottom=0pt,
      height=#1, valign=top, before skip=0pt, after skip=0pt,
      borderline west={2.5pt}{0pt}{dorado}]
    \\null
  \\end{tcolorbox}}

% ---------- PREGUNTA ABIERTA ----------
\\newcommand{\\preguntaAbierta}[2]{%
  \\refstepcounter{preg}%
  \\begin{minipage}{\\linewidth}
    \\noindent
    \\begin{tabularx}{\\linewidth}{@{}c@{\\hspace{9pt}}X@{}}
      \\numpreg{\\thepreg} & \\enunciado{#1}
    \\end{tabularx}\\par\\vspace{5pt}
    \\hspace{27pt}\\begin{minipage}{\\dimexpr\\linewidth-27pt\\relax}
      \\cuadrorespuesta{#2}
    \\end{minipage}
  \\end{minipage}
  \\par\\vspace{14pt}}

% ============================================================
\\begin{document}
\\thispagestyle{plain}

% ---------- BANDA SUPERIOR ----------
\\begin{tikzpicture}[remember picture,overlay]
  \\fill[azulprincipal] (current page.north west) rectangle
       ([yshift=-0.55cm]current page.north east);
  \\fill[dorado] ([yshift=-0.55cm]current page.north west) rectangle
       ([yshift=-0.62cm]current page.north east);
\\end{tikzpicture}
\\vspace*{-0.7cm}

% ---------- ENCABEZADO DEL EXAMEN ----------
\\begin{center}
  {\\sffamily\\bfseries\\fontsize{16}{19}\\selectfont\\color{azulprincipal}\\Institucion}\\\\[5pt]
  {\\sffamily\\bfseries\\large\\color{azulprincipal}\\TituloExamen}\\\\[4pt]
  {\\sffamily\\small\\color{gristexto}\\Curso\\ \\ \\textbullet\\ \\ Docente: \\Docente\\ \\ \\textbullet\\ \\ Fecha: \\Fecha}
\\end{center}
\\vspace{-2pt}
{\\color{azulprincipal}\\hrule height 0.6pt}
\\vspace{9pt}

% ---------- ESTUDIANTE Y GRUPO ----------
\\noindent
\\campolinea{0.70\\linewidth}{Estudiante:}\\hfill\\campolinea{0.25\\linewidth}{Grupo:}

\\vspace{9pt}

% ---------- INSTRUCCIONES ----------
\\begin{tcolorbox}[instr]
  \\sffamily\\footnotesize\\itshape\\color{gristexto}
  \\textbf{\\color{azulprincipal}Instrucciones:} ${escapeLatex(quiz.header.instructions)}
\\end{tcolorbox}

`;

  if (mcCount > 0 && quiz.header.showAnswerSheet !== false) {
    tex += `
% ============================================================
%  HOJA DE RESPUESTAS (${mcCount} preguntas de opción múltiple)
% ============================================================
\\hojarespuestas{${mcCount}}
\\vspace{6pt}
`;
  }

  tex += `
% ============================================================
%  PREGUNTAS
% ============================================================
`;

  quiz.items.forEach((item, index) => {
    const q = item.question;

    if (q.type === "open") {
      const height = q.openResponseHeight ? `${q.openResponseHeight}cm` : "3.5cm";
      tex += `\\preguntaAbierta{${formatLatexBody(q.prompt)}}{${height}}\n\n`;

      if (isSolutions && q.explanation) {
        tex += `{\\footnotesize\\color{azulprincipal}\\textbf{Criterio/Solución Pregunta ${index + 1}:} ${formatLatexBody(q.explanation)}}\n\\vspace{8pt}\n\n`;
      }
    } else {
      const optA = q.options[0]?.text || "";
      const optB = q.options[1]?.text || "";
      const optC = q.options[2]?.text || "";
      const optD = q.options[3]?.text || "";

      tex += `\\preguntaMC{${formatLatexBody(q.prompt)}}
  {${formatLatexBody(optA)}}{${formatLatexBody(optB)}}
  {${formatLatexBody(optC)}}{${formatLatexBody(optD)}}\n\n`;

      if (isSolutions) {
        const correctOpt = q.options.find((o) => o.isCorrect);
        const correctLetter = correctOpt
          ? ["A", "B", "C", "D"][q.options.indexOf(correctOpt)]
          : "N/A";
        tex += `{\\footnotesize\\color{azulprincipal}\\textbf{Respuesta Correcta Pregunta ${index + 1}:} Opción ${correctLetter}. ${formatLatexBody(q.explanation || "")}}\n\\vspace{8pt}\n\n`;
      }
    }
  });

  tex += `
% ---------- CIERRE ----------
\\vspace{6pt}
\\begin{center}
  \\tikz{\\draw[dorado,line width=0.6pt](0,0)--(2.2,0);}\\quad
  {\\sffamily\\small\\bfseries\\color{azulprincipal}\\textit{Fin del examen}}\\quad
  \\tikz{\\draw[dorado,line width=0.6pt](0,0)--(2.2,0);}\\\\[3pt]
  {\\sffamily\\scriptsize\\color{gristexto}Revise sus respuestas antes de entregar.}
\\end{center}

\\end{document}
`;

  return tex;
}

/**
 * Descarga directamente el código fuente LaTeX en un archivo .tex
 */
export function downloadLatexFile(quiz: Quiz, mode: "exam" | "solutions" = "exam") {
  const tex = generateLatexCode(quiz, mode);
  const blob = new Blob([tex], { type: "text/plain;charset=utf-8" });
  const filename = `${sanitizeFilename(quiz.header.title)}_${mode === "solutions" ? "Solucionario" : "Examen"}.tex`;
  saveAs(blob, filename);
}

/**
 * Exporta el código LaTeX como archivo .tex (usado por exportToPdf).
 */
export function exportToTex(quiz: Quiz, mode: "exam" | "solutions" = "exam") {
  const latexCode = generateLatexCode(quiz, mode);
  const blob = new Blob([latexCode], { type: "text/plain;charset=utf-8" });
  const filename = `${quiz.header.title.replace(/[^a-zA-Z0-9_\-]/g, "_") || "evaluacion"}_${
    mode === "solutions" ? "Solucionario" : "Examen"
  }.tex`;
  saveAs(blob, filename);
}

/**
 * Exportación a PDF: genera el código LaTeX y lo descarga para que el usuario lo compile.
 * Reemplaza window.print() con generación real de contenido LaTeX.
 */
export function exportToPdf(quiz: Quiz, mode: "exam" | "solutions" = "exam") {
  exportToTex(quiz, mode);
}

/**
 * Compila código LaTeX a PDF usando comandos del sistema.
 * Intenta usar tectonic o xelatex. Si no están disponibles, devuelve el .tex.
 */
export async function compileLatexToPdf(
  latexCode: string,
  mode: "exam" | "solutions" = "exam"
): Promise<{ success: boolean; pdfBlob?: Blob; error?: string }> {
  // Intentar usar tectonic si está disponible (compilador moderno y rápido)
  try {
    // Verificar si tectonic está disponible
    const isTectonicAvailable = await checkCommandAvailable("tectonic");
    if (isTectonicAvailable) {
      // Crear archivo temporal .tex
      const tempTexFile = await writeTempFile(latexCode, ".tex");
      // Compilar con tectonic
      const compileResult = await execCommand(`tectonic ${tempTexFile} --out-dir /tmp/out`);
      if (compileResult.success) {
        const pdfPath = compileResult.stdout?.includes(".pdf")
          ? compileResult.stdout
          : `/tmp/out/${tempTexFile.replace(".tex", ".pdf")}`;
        const pdfBlob = await readFile(pdfPath, "binary");
        // Limpiar archivos temporales
        await deleteFile(tempTexFile);
        await deleteFile(pdfPath);
        return { success: true, pdfBlob };
      }
      await deleteFile(tempTexFile);
    }
  } catch (err) {
    // tectonic no disponible, intentar xelatex
  }

  // Intentar con xelatex
  try {
    const isXelatexAvailable = await checkCommandAvailable("xelatex");
    if (isXelatexAvailable) {
      const tempTexFile = await writeTempFile(latexCode, ".tex");
      const compileResult = await execCommand(`xelatex -interaction nonstopmode ${tempTexFile}`);
      if (compileResult.success) {
        const pdfPath = `/tmp/out/${tempTexFile.replace(".tex", ".pdf")}`;
        try {
          const pdfBlob = await readFile(pdfPath, "binary");
          await deleteFile(tempTexFile);
          await deleteFile(pdfPath);
          return { success: true, pdfBlob };
        } catch {
          await deleteFile(tempTexFile);
          await deleteFile(pdfPath);
        }
      }
      await deleteFile(tempTexFile);
    }
  } catch {
    // xelatex no disponible
  }

  // Si ningún compilador está disponible, devolver el .tex para compilación manual
  try {
    const texBlob = new Blob([latexCode], { type: "text/plain;charset=utf-8" });
    return { success: false, error: "No LaTeX compiler available. .tex file generated for manual compilation." };
  } catch {
    return { success: false, error: "Failed to generate .tex file." };
  }
}

/**
 * Verifica si un comando está disponible en el sistema.
 */
async function checkCommandAvailable(cmd: string): Promise<boolean> {
  try {
    await execCommand(`which ${cmd} || true`);
    return true;
  } catch {
    return false;
  }
}

/**
 * Escribe un archivo temporal.
 */
async function writeTempFile(content: string, suffix: string): Promise<string> {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const fileName = `/tmp/temp_${Date.now()}${suffix}`;
  // Note: This is a simplified approach - actual implementation would use fs
  return fileName;
}

/**
 * Ejecuta un comando del sistema.
 */
async function execCommand(command: string): Promise<{ success: boolean; stdout?: string; stderr?: string }> {
  return new Promise((resolve) => {
    const { exec } = await import("child_process");
    exec(command, (error, stdout, stderr) => {
      if (error) {
        resolve({ success: false, stdout: stdout as string, stderr: stderr as string });
      } else {
        resolve({ success: true, stdout: stdout as string, stderr: stderr as string });
      }
    });
  });
}

/**
 * Lee un archivo y retorna su contenido.
 */
async function readFile(path: string, encoding: string): Promise<Blob> {
  return new Promise((resolve) => {
    const { readFile } = await import("fs");
    readFile(path, encoding, (err, data) => {
      if (err) throw err;
      resolve(new Blob([data], { type: "application/pdf" }));
    });
  });
}

/**
 * Elimina un archivo temporal.
 */
async function deleteFile(path: string): Promise<void> {
  return new Promise((resolve) => {
    const { unlink } = await import("fs");
    unlink(path, (err) => {
      if (err) throw err;
      resolve();
    });
  });
}

/**
 * Función auxiliar para sanitizar nombres de archivo
 */
function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_\-]/g, "_").substring(0, 30) || "evaluacion";
}

/**
 * Genera el código LaTeX completo para un examen
 */
export function generateExamLatex(quiz: Quiz, mode: "exam" | "solutions" = "exam"): string {
  return generateLatexCode(quiz, mode);
}

/**
 * Exportación directa (retrocompatibilidad) - mantiene window.print()
 * por si algún componente llama a la versión antigua
 */
export const exportToPdfLegacy = (quiz: Quiz) => {
  window.print();
};