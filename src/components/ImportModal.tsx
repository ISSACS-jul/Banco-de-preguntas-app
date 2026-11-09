import React, { useState } from "react";
import { Question } from "../types/quiz";
import { X, Upload, FileText, Check, AlertCircle, PlusCircle, RefreshCw } from "lucide-react";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (questions: Question[], mode: "append" | "replace") => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [tab, setTab] = useState<"file" | "paste">("file");
  const [rawJson, setRawJson] = useState("");
  const [parsedQuestions, setParsedQuestions] = useState<Question[] | null>(null);
  const [importMode, setImportMode] = useState<"append" | "replace">("append");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const validateAndParse = (text: string) => {
    try {
      setErrorMsg(null);
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) {
        throw new Error("El contenido no es una lista de preguntas válida.");
      }
      if (parsed.length === 0) {
        throw new Error("El archivo no contiene preguntas.");
      }
      setParsedQuestions(parsed);
    } catch (e: any) {
      setParsedQuestions(null);
      setErrorMsg(e.message || "Formato JSON inválido.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawJson(content);
      validateAndParse(content);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handlePasteChange = (text: string) => {
    setRawJson(text);
    if (text.trim()) {
      validateAndParse(text);
    } else {
      setParsedQuestions(null);
      setErrorMsg(null);
    }
  };

  const handleConfirmImport = () => {
    if (!parsedQuestions || parsedQuestions.length === 0) return;
    onImport(parsedQuestions, importMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-dark-850 border border-dark-700 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in duration-150">
        {/* Cabecera del modal */}
        <div className="px-6 py-4 border-b border-dark-700 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-brand-950/70 border border-brand-800/60 flex items-center justify-center text-brand-400">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Importar Banco de Preguntas</h2>
              <p className="text-xs text-slate-400">
                Carga preguntas desde un archivo de respaldo o pegando el código JSON
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-dark-750 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas de método */}
        <div className="px-6 pt-4 flex items-center space-x-2 border-b border-dark-750">
          <button
            onClick={() => setTab("file")}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              tab === "file"
                ? "border-brand-500 text-brand-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Seleccionar Archivo .json</span>
          </button>
          <button
            onClick={() => setTab("paste")}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              tab === "paste"
                ? "border-brand-500 text-brand-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Pegar Texto Directamente</span>
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
          {tab === "file" ? (
            <div>
              <label
                htmlFor="importFileInput"
                className="border-2 border-dashed border-dark-700 hover:border-brand-500 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-dark-900/40 hover:bg-dark-900/70 group"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-600/10 text-brand-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-200">
                  Haz clic para buscar en tus carpetas o arrastra tu archivo aquí
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Admite archivos de respaldo en formato <strong>.json</strong>
                </p>
                <input
                  id="importFileInput"
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">
                Pega el código JSON de tu respaldo:
              </label>
              <textarea
                rows={6}
                value={rawJson}
                onChange={(e) => handlePasteChange(e.target.value)}
                placeholder='[ { "id": "...", "prompt": "...", "options": [...] } ]'
                className="w-full bg-dark-900 border border-dark-700 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>
          )}

          {/* Estado de validación */}
          {errorMsg && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {parsedQuestions && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-emerald-200">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>¡Se detectaron {parsedQuestions.length} preguntas válidas para importar!</span>
              </div>

              {/* Modo de importación: Agregar vs Reemplazar */}
              <div className="pt-2 border-t border-emerald-800/40 flex items-center gap-4 text-slate-300">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    value="append"
                    checked={importMode === "append"}
                    onChange={() => setImportMode("append")}
                    className="text-brand-500 bg-dark-900 border-dark-700"
                  />
                  <span className="text-xs flex items-center gap-1">
                    <PlusCircle className="w-3.5 h-3.5 text-brand-400" />
                    Añadir al banco actual
                  </span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    value="replace"
                    checked={importMode === "replace"}
                    onChange={() => setImportMode("replace")}
                    className="text-brand-500 bg-dark-900 border-dark-700"
                  />
                  <span className="text-xs flex items-center gap-1">
                    <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                    Reemplazar banco completo
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Pie del modal */}
        <div className="px-6 py-3.5 bg-dark-850 border-t border-dark-700 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-dark-800 hover:bg-dark-750 border border-dark-700 rounded-lg transition-colors"
          >
            Cancelar
          </button>

          <button
            onClick={handleConfirmImport}
            disabled={!parsedQuestions || parsedQuestions.length === 0}
            className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-lg shadow-sm transition-all hover:shadow-brand-500/20 active:scale-95 disabled:opacity-40"
          >
            Importar {parsedQuestions ? `${parsedQuestions.length} Preguntas` : ""}
          </button>
        </div>
      </div>
    </div>
  );
};
