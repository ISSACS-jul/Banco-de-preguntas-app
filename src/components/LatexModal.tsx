import React, { useState } from "react";
import { Quiz } from "../types/quiz";
import { generateLatexCode } from "../utils/exporters";
import { saveFileWithDialog } from "../utils/fileDialog";
import { X, Copy, Check, Download, FileCode, Eye, EyeOff } from "lucide-react";

interface LatexModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: Quiz;
  initialMode?: "exam" | "solutions";
}

export const LatexModal: React.FC<LatexModalProps> = ({
  isOpen,
  onClose,
  quiz,
  initialMode = "exam",
}) => {
  const [mode, setMode] = useState<"exam" | "solutions">(initialMode);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const latexCode = generateLatexCode(quiz, mode);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(latexCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Error al copiar al portapapeles:", err);
    }
  };

  const handleDownload = async () => {
    const filename = `${quiz.header.title.replace(/[^a-zA-Z0-9_\-]/g, "_") || "evaluacion"}_${
      mode === "solutions" ? "Solucionario" : "Examen"
    }.tex`;
    await saveFileWithDialog(filename, latexCode, "Archivo LaTeX (*.tex)", "tex");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-dark-850 border border-dark-700 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in duration-150">
        {/* Cabecera del modal */}
        <div className="px-6 py-4 border-b border-dark-700 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center text-emerald-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Código Fuente LaTeX (.tex)
              </h2>
              <p className="text-xs text-slate-400">
                Plantilla formal institucional con hoja de respuestas y preguntas abiertas
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Alternar modo examen vs solucionario */}
            <div className="flex items-center bg-dark-900 border border-dark-700 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setMode("exam")}
                className={`px-2.5 py-1 text-xs rounded font-medium flex items-center gap-1 transition-colors ${
                  mode === "exam" ? "bg-brand-600 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Eye className="w-3 h-3" /> Examen
              </button>
              <button
                type="button"
                onClick={() => setMode("solutions")}
                className={`px-2.5 py-1 text-xs rounded font-medium flex items-center gap-1 transition-colors ${
                  mode === "solutions" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <EyeOff className="w-3 h-3" /> Solucionario
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-dark-750 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Visor de código LaTeX con scroll y número de líneas aproximado */}
        <div className="flex-1 p-4 overflow-hidden flex flex-col bg-dark-900">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 px-1">
            <span className="font-mono text-[11px] text-slate-500">
              {quiz.items.length} preguntas &bull; Compatible con pdflatex y Overleaf
            </span>
            <span className="text-[11px] text-brand-400 font-medium">
              {mode === "solutions" ? "Modo: Con Respuestas y Criterios" : "Modo: Para Estudiantes"}
            </span>
          </div>

          <textarea
            readOnly
            value={latexCode}
            style={{
              color: "#0f172a",
              backgroundColor: "#f8fafc",
            }}
            className="flex-1 w-full border border-slate-300 rounded-xl p-4 font-mono text-xs font-medium leading-relaxed focus:outline-none resize-none selection:bg-brand-500 selection:text-white overflow-auto shadow-inner"
            onClick={(e) => (e.target as HTMLTextAreaElement).select()}
          />
        </div>

        {/* Pie con los 2 botones: Copiar y Descargar */}
        <div className="px-6 py-3.5 bg-dark-850 border-t border-dark-700 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400">
            Puedes pegar este código directamente en Overleaf o guardarlo como archivo .tex
          </span>

          <div className="flex items-center space-x-2.5">
            {/* Botón Copiar al Portapapeles */}
            <button
              onClick={handleCopy}
              className={`flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-lg border transition-all active:scale-95 ${
                copied
                  ? "bg-emerald-600 text-white border-emerald-500"
                  : "bg-dark-800 hover:bg-dark-750 text-slate-200 border-dark-700 hover:border-dark-600"
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4 text-emerald-400" />}
              <span>{copied ? "¡Código Copiado!" : "Copiar Código LaTeX"}</span>
            </button>

            {/* Botón Descargar Archivo .tex */}
            <button
              onClick={handleDownload}
              className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-all hover:shadow-emerald-500/20 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Descargar .tex</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
