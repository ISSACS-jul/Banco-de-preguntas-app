import React from "react";
import { BookOpen, Plus, Download, Upload, HelpCircle } from "lucide-react";
import { Question } from "../types/quiz";

interface HeaderProps {
  totalQuestions: number;
  onOpenNewModal: () => void;
  onExportBank: () => void;
  onImportBank: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalQuestions,
  onOpenNewModal,
  onExportBank,
  onImportBank,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <header className="h-14 bg-dark-850 border-b border-dark-700 px-4 flex items-center justify-between select-none z-10 shrink-0">
      {/* Logo y título */}
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            Banco de Preguntas & Evaluador
            <span className="text-[10px] font-medium bg-dark-700 text-brand-500 px-2 py-0.5 rounded-full border border-dark-600">
              v1.0
            </span>
          </h1>
          <p className="text-xs text-slate-400">
            {totalQuestions} {totalQuestions === 1 ? "pregunta registrada" : "preguntas registradas"}
          </p>
        </div>
      </div>

      {/* Botones de acción principales */}
      <div className="flex items-center space-x-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={onImportBank}
          accept=".json"
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          title="Importar banco desde archivo JSON"
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-dark-800 hover:bg-dark-700 border border-dark-700 rounded-md transition-colors"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Importar Banco</span>
        </button>

        <button
          onClick={onExportBank}
          title="Exportar respaldo completo del banco a JSON"
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-dark-800 hover:bg-dark-700 border border-dark-700 rounded-md transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Respaldar Banco</span>
        </button>

        <div className="h-4 w-[1px] bg-dark-700 mx-1" />

        <button
          onClick={onOpenNewModal}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-md shadow-sm transition-all hover:shadow-brand-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Pregunta</span>
        </button>
      </div>
    </header>
  );
};
