import React from "react";
import { Question } from "../types/quiz";
import { renderMarkdownWithMath } from "../utils/markdownRenderer";
import { Plus, Edit2, Trash2, Tag, CheckCircle2, Square, CheckSquare } from "lucide-react";

interface QuestionCardProps {
  question: Question;
  onAddToQuiz?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isSelectedInQuiz?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onAddToQuiz,
  onEdit,
  onDelete,
  isSelectedInQuiz = false,
}) => {
  const renderedPrompt = React.useMemo(() => {
    return renderMarkdownWithMath(question.prompt);
  }, [question.prompt]);

  const difficultyColors = {
    Fácil: "text-emerald-400 bg-emerald-950/40 border-emerald-800/60",
    Media: "text-amber-400 bg-amber-950/40 border-amber-800/60",
    Difícil: "text-rose-400 bg-rose-950/40 border-rose-800/60",
  };

  const optionLabels = ["A", "B", "C", "D", "E", "F"];
  const isOpenType = question.type === "open";

  return (
    <div className="group relative bg-dark-850 hover:bg-dark-800/90 border border-dark-700 hover:border-dark-600 rounded-xl p-4 transition-all duration-200 shadow-sm flex flex-col justify-between">
      {/* Cabecera de la celda: Metadatos y etiquetas */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Tipo de pregunta badge */}
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                isOpenType
                  ? "bg-[#1F3A5F]/70 text-[#D8B480] border-[#B08D57]/50"
                  : "bg-brand-950/70 text-brand-300 border-brand-700/50"
              }`}
            >
              {isOpenType ? <Square className="w-2.5 h-2.5" /> : <CheckSquare className="w-2.5 h-2.5" />}
              {isOpenType ? "Abierta" : "Opción Múltiple"}
            </span>

            <span className="text-[11px] font-semibold text-brand-400 bg-brand-950/50 border border-brand-800/50 px-2 py-0.5 rounded-md">
              {question.course}
            </span>
            <span className="text-[11px] font-medium text-slate-300 bg-dark-700/80 px-2 py-0.5 rounded-md">
              {question.topic}
            </span>
            {question.subtopic && (
              <span className="text-[11px] text-slate-400 bg-dark-800 px-1.5 py-0.5 rounded border border-dark-700">
                {question.subtopic}
              </span>
            )}
            <span
              className={`text-[10px] font-medium border px-1.5 py-0.5 rounded ${
                difficultyColors[question.difficulty] || ""
              }`}
            >
              {question.difficulty}
            </span>
          </div>

          {/* Botones de acción de la celda */}
          <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button
                onClick={onEdit}
                title="Editar pregunta"
                className="p-1 text-slate-400 hover:text-slate-200 hover:bg-dark-700 rounded transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                title="Eliminar pregunta del banco"
                className="p-1 text-slate-400 hover:text-rose-400 hover:bg-dark-700 rounded transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Enunciado renderizado con LaTeX y Markdown */}
        <div
          className="prose prose-invert prose-sm max-w-none text-slate-200 text-xs leading-relaxed mb-3 break-words [&>p]:mb-2 [&_img]:max-h-56 [&_img]:rounded-lg [&_img]:my-2 [&_img]:border [&_img]:border-dark-700"
          dangerouslySetInnerHTML={{ __html: renderedPrompt }}
        />

        {/* Visualización según el tipo de celda */}
        {isOpenType ? (
          /* Cuadro de Respuesta Abierta */
          <div className="mb-3 p-3 bg-dark-900/80 border border-slate-700 border-l-[3.5px] border-l-[#B08D57] rounded-md text-[11px] text-slate-400 italic">
            [Espacio para respuesta escrita del estudiante: {question.openResponseHeight || 3.5} cm]
          </div>
        ) : (
          /* Opciones de respuesta */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-3">
            {question.options.map((opt, i) => {
              const renderedOpt = renderMarkdownWithMath(opt.text);
              return (
                <div
                  key={opt.id || i}
                  className={`flex items-start space-x-2 text-xs p-2 rounded-lg border transition-colors ${
                    opt.isCorrect
                      ? "bg-emerald-950/20 border-emerald-800/40 text-emerald-200"
                      : "bg-dark-900/60 border-dark-750 text-slate-300"
                  }`}
                >
                  <span
                    className={`font-semibold shrink-0 text-[11px] px-1 rounded ${
                      opt.isCorrect ? "text-emerald-400 bg-emerald-950/80" : "text-slate-400"
                    }`}
                  >
                    {optionLabels[i]}.
                  </span>
                  <div
                    className="flex-1 break-words [&>p]:inline"
                    dangerouslySetInnerHTML={{ __html: renderedOpt }}
                  />
                  {opt.isCorrect && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pie de la tarjeta: Tags y botón de añadir al quiz */}
      <div className="pt-2 border-t border-dark-750 flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1 overflow-hidden">
          {question.tags.map((t, idx) => (
            <span
              key={idx}
              className="text-[10px] text-slate-400 bg-dark-800 px-1.5 py-0.5 rounded flex items-center gap-1"
            >
              <Tag className="w-2.5 h-2.5 opacity-60" />
              {t}
            </span>
          ))}
        </div>

        {onAddToQuiz && (
          <button
            onClick={onAddToQuiz}
            disabled={isSelectedInQuiz}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all shrink-0 ${
              isSelectedInQuiz
                ? "bg-dark-700 text-slate-400 cursor-not-allowed"
                : "bg-brand-600 hover:bg-brand-500 text-white shadow hover:shadow-brand-500/20 active:scale-95"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isSelectedInQuiz ? "En el examen" : "Agregar"}</span>
          </button>
        )}
      </div>
    </div>
  );
};
