import React, { useState } from "react";
import { Quiz } from "../types/quiz";
import { renderMarkdownWithMath } from "../utils/markdownRenderer";
import {
  FileText,
  FileCode,
  Printer,
  Shuffle,
  ChevronUp,
  ChevronDown,
  Trash2,
  Settings2,
  Eye,
  EyeOff,
  Sparkles,
  Grid,
} from "lucide-react";

interface QuizPanelProps {
  quiz: Quiz;
  onUpdateHeader: (newHeader: Quiz["header"]) => void;
  onRemoveItem: (instanceId: string) => void;
  onMoveItem: (index: number, direction: "up" | "down") => void;
  onUpdatePoints: (instanceId: string, points: number) => void;
  onShuffleQuestions: () => void;
  onShuffleOptions: () => void;
  onExportPdf: () => void;
  onOpenLatexModal: (mode: "exam" | "solutions") => void;
  onExportWord: (mode: "exam" | "solutions") => void;
}

export const QuizPanel: React.FC<QuizPanelProps> = ({
  quiz,
  onUpdateHeader,
  onRemoveItem,
  onMoveItem,
  onUpdatePoints,
  onShuffleQuestions,
  onShuffleOptions,
  onExportPdf,
  onOpenLatexModal,
  onExportWord,
}) => {
  const [showHeaderSettings, setShowHeaderSettings] = useState(false);
  const [previewMode, setPreviewMode] = useState<"exam" | "solutions">("exam");

  const totalPoints = quiz.items.reduce((sum, item) => sum + (item.points || 0), 0);
  const optionLabels = ["A", "B", "C", "D", "E", "F"];

  // Preguntas de opción múltiple para la hoja de respuestas
  const mcQuestions = quiz.items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => item.question.type !== "open");

  const isSolutions = previewMode === "solutions";

  return (
    <div className="h-full flex flex-col bg-dark-900 overflow-hidden">
      {/* Barra superior de herramientas del Quiz */}
      <div className="p-3 bg-dark-850/80 border-b border-dark-750 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowHeaderSettings(!showHeaderSettings)}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors ${
              showHeaderSettings
                ? "bg-brand-600/20 border-brand-500 text-brand-400"
                : "bg-dark-800 border-dark-700 text-slate-300 hover:text-white"
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Encabezado</span>
          </button>

          <button
            onClick={onShuffleQuestions}
            disabled={quiz.items.length < 2}
            title="Mezclar orden de las preguntas aleatoriamente"
            className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-dark-800 hover:bg-dark-700 border border-dark-700 rounded-md disabled:opacity-40 transition-colors"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Mezclar Preguntas</span>
          </button>

          <button
            onClick={onShuffleOptions}
            disabled={mcQuestions.length === 0}
            title="Mezclar orden de opciones A, B, C, D manteniendo la correcta"
            className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-dark-800 hover:bg-dark-700 border border-dark-700 rounded-md disabled:opacity-40 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mezclar Incisos</span>
          </button>
        </div>

        {/* Interruptor de Modo Alumno vs Modo Solucionario */}
        <div className="flex items-center bg-dark-800 border border-dark-700 rounded-md p-0.5">
          <button
            onClick={() => setPreviewMode("exam")}
            className={`flex items-center space-x-1 px-2.5 py-1 text-xs rounded font-medium transition-colors ${
              previewMode === "exam"
                ? "bg-brand-600 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Estudiante</span>
          </button>
          <button
            onClick={() => setPreviewMode("solutions")}
            className={`flex items-center space-x-1 px-2.5 py-1 text-xs rounded font-medium transition-colors ${
              previewMode === "solutions"
                ? "bg-emerald-600 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <EyeOff className="w-3 h-3" />
            <span>Solucionario</span>
          </button>
        </div>
      </div>

      {/* Editor desplegable del Encabezado */}
      {showHeaderSettings && (
        <div className="p-4 bg-dark-850 border-b border-dark-700 space-y-3 shrink-0">
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Configuración del Encabezado
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Institución / Colegio</label>
              <input
                type="text"
                value={quiz.header.institution}
                onChange={(e) =>
                  onUpdateHeader({ ...quiz.header, institution: e.target.value })
                }
                className="w-full bg-dark-900 border border-dark-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Título de la Evaluación</label>
              <input
                type="text"
                value={quiz.header.title}
                onChange={(e) =>
                  onUpdateHeader({ ...quiz.header, title: e.target.value })
                }
                className="w-full bg-dark-900 border border-dark-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Curso / Asignatura</label>
              <input
                type="text"
                value={quiz.header.course}
                onChange={(e) =>
                  onUpdateHeader({ ...quiz.header, course: e.target.value })
                }
                className="w-full bg-dark-900 border border-dark-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Docente / Profesor</label>
              <input
                type="text"
                value={quiz.header.teacher}
                onChange={(e) =>
                  onUpdateHeader({ ...quiz.header, teacher: e.target.value })
                }
                className="w-full bg-dark-900 border border-dark-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-[11px] text-slate-400 mb-1">Instrucciones Generales</label>
              <textarea
                rows={2}
                value={quiz.header.instructions}
                onChange={(e) =>
                  onUpdateHeader({ ...quiz.header, instructions: e.target.value })
                }
                className="w-full bg-dark-900 border border-dark-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>
            <div className="col-span-2 flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="showAnswerSheetCheck"
                checked={quiz.header.showAnswerSheet !== false}
                onChange={(e) =>
                  onUpdateHeader({ ...quiz.header, showAnswerSheet: e.target.checked })
                }
                className="rounded bg-dark-900 border-dark-700 text-brand-500 focus:ring-0"
              />
              <label htmlFor="showAnswerSheetCheck" className="text-xs text-slate-300">
                Incluir Hoja de Respuestas (burbujas estilo ICFES) arriba de las preguntas
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Contenedor central scrolleable con la previsualización fiel de la plantilla */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5 print-container">
        {/* BANDA SUPERIOR (Azul Marino y Dorado) */}
        <div className="rounded-xl overflow-hidden shadow-md bg-dark-850 border border-dark-700">
          <div className="h-3 bg-[#1F3A5F] w-full" />
          <div className="h-1 bg-[#B08D57] w-full" />

          {/* Encabezado del examen */}
          <div className="p-6 space-y-4">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-slate-100 uppercase tracking-tight">
                {quiz.header.institution}
              </h2>
              <h3 className="text-base font-semibold text-brand-400">
                {quiz.header.title}
              </h3>
              <p className="text-xs text-slate-400">
                {quiz.header.course} &bull; Docente: {quiz.header.teacher} &bull; Fecha: {quiz.header.date}
              </p>
            </div>

            <div className="h-[1px] bg-[#1F3A5F]/60 w-full" />

            {/* Estudiante y Grupo con línea punteada */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300 pt-1">
              <div className="sm:col-span-2 flex items-baseline">
                <span className="font-semibold text-slate-400 mr-2">Estudiante:</span>
                <div className="flex-1 border-b border-dotted border-slate-600 h-4" />
              </div>
              <div className="flex items-baseline">
                <span className="font-semibold text-slate-400 mr-2">Grupo:</span>
                <div className="flex-1 border-b border-dotted border-slate-600 h-4" />
              </div>
            </div>

            {/* Caja de Instrucciones con borde izquierdo dorado */}
            <div className="text-xs text-slate-300 italic bg-dark-900/60 p-3 rounded-lg border border-dark-700 border-l-4 border-l-[#B08D57]">
              <strong className="text-brand-400 not-italic">Instrucciones: </strong>
              {quiz.header.instructions}
            </div>

            {/* HOJA DE RESPUESTAS (Burbujas ICFES) */}
            {quiz.header.showAnswerSheet !== false && mcQuestions.length > 0 && (
              <div className="relative border border-[#1F3A5F] rounded-lg p-3 pt-5 bg-dark-900/40">
                {/* Título de la caja */}
                <div className="absolute -top-2.5 left-3 bg-[#1F3A5F] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  HOJA DE RESPUESTAS
                </div>

                {/* Burbujas en columnas de 4 en 4 */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2 text-xs">
                  {mcQuestions.map(({ item, index }) => {
                    const q = item.question;
                    const correctIndex = q.options.findIndex((o) => o.isCorrect);

                    return (
                      <div key={item.instanceId} className="flex items-center space-x-1.5">
                        <span className="w-4 text-right font-bold text-xs text-brand-400">
                          {index + 1}
                        </span>
                        <div className="flex items-center space-x-1">
                          {["A", "B", "C", "D"].map((letter, optIdx) => {
                            const isThisCorrect = isSolutions && optIdx === correctIndex;
                            return (
                              <span
                                key={letter}
                                className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-semibold transition-colors ${
                                  isThisCorrect
                                    ? "bg-emerald-600 border-emerald-500 text-white font-bold"
                                    : "border-[#1F3A5F] text-slate-300 bg-dark-850"
                                }`}
                              >
                                {letter}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lista de Preguntas agregadas al examen */}
        {quiz.items.length === 0 ? (
          <div className="h-64 border-2 border-dashed border-dark-750 rounded-xl flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <FileText className="w-12 h-12 mb-3 stroke-1 text-slate-600" />
            <p className="text-sm font-medium text-slate-300">Tu examen está vacío</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Selecciona preguntas del panel izquierdo usando el botón verde <strong>"+ Agregar"</strong> para construir tu evaluación aquí.
            </p>
          </div>
        ) : (
          quiz.items.map((item, index) => {
            const q = item.question;
            const renderedPrompt = renderMarkdownWithMath(q.prompt);
            const isOpenType = q.type === "open";

            return (
              <div
                key={item.instanceId}
                className="group relative bg-dark-850 border border-dark-700 rounded-xl p-4 shadow-sm hover:border-dark-600 transition-all"
              >
                {/* Barra superior de la celda en el quiz */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2.5">
                    {/* Número en círculo azul estilo plantilla (\numpreg) */}
                    <div className="w-6 h-6 rounded-full bg-[#1F3A5F] text-white flex items-center justify-center text-xs font-bold shadow-sm">
                      {index + 1}
                    </div>
                    <span className="text-xs font-medium text-slate-300">
                      {q.course} &bull; {q.topic}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                        isOpenType
                          ? "bg-[#1F3A5F]/70 text-[#D8B480] border-[#B08D57]/50"
                          : "bg-brand-950/70 text-brand-300 border-brand-700/50"
                      }`}
                    >
                      {isOpenType ? "Pregunta Abierta" : "Opción Múltiple"}
                    </span>
                  </div>

                  {/* Puntuación y botones de mover / quitar */}
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 bg-dark-900 border border-dark-700 rounded px-2 py-0.5 text-xs text-slate-300">
                      <span>Pts:</span>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={item.points}
                        onChange={(e) =>
                          onUpdatePoints(item.instanceId, parseFloat(e.target.value) || 0)
                        }
                        className="w-12 bg-transparent text-center font-bold text-brand-400 focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center space-x-0.5">
                      <button
                        onClick={() => onMoveItem(index, "up")}
                        disabled={index === 0}
                        title="Subir posición"
                        className="p-1 text-slate-400 hover:text-white disabled:opacity-20 rounded hover:bg-dark-750"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onMoveItem(index, "down")}
                        disabled={index === quiz.items.length - 1}
                        title="Bajar posición"
                        className="p-1 text-slate-400 hover:text-white disabled:opacity-20 rounded hover:bg-dark-750"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onRemoveItem(item.instanceId)}
                        title="Quitar de este examen"
                        className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-dark-750"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Enunciado renderizado */}
                <div
                  className="prose prose-invert prose-sm max-w-none text-slate-200 text-xs leading-relaxed mb-3 break-words [&>p]:mb-2 [&_img]:max-h-56 [&_img]:rounded-lg [&_img]:my-2 [&_img]:border [&_img]:border-dark-700"
                  dangerouslySetInnerHTML={{ __html: renderedPrompt }}
                />

                {/* Opciones o Cuadro de respuesta abierta */}
                {isOpenType ? (
                  /* Cuadro para respuesta abierta estilo plantilla */
                  <div
                    style={{ minHeight: `${(q.openResponseHeight || 3.5) * 26}px` }}
                    className="w-full bg-white/5 border border-slate-700 border-l-[3.5px] border-l-[#B08D57] rounded-md p-3 text-[11px] text-slate-500 italic flex items-start"
                  >
                    [Espacio asignado para procedimiento y respuesta escrita &bull; {q.openResponseHeight || 3.5} cm]
                  </div>
                ) : (
                  /* Rejilla de 2 columnas de opciones (A, B y C, D) como en la plantilla */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, optIdx) => {
                      const renderedOpt = renderMarkdownWithMath(opt.text);
                      const highlightCorrect = isSolutions && opt.isCorrect;

                      return (
                        <div
                          key={opt.id || optIdx}
                          className={`flex items-start space-x-2 text-xs p-2.5 rounded-lg border transition-colors ${
                            highlightCorrect
                              ? "bg-emerald-950/30 border-emerald-700 text-emerald-200 font-medium"
                              : "bg-dark-900/60 border-dark-750 text-slate-300"
                          }`}
                        >
                          <span
                            className={`font-bold shrink-0 text-xs ${
                              highlightCorrect ? "text-emerald-400" : "text-[#1F3A5F] dark:text-brand-400"
                            }`}
                          >
                            {optionLabels[optIdx]}.
                          </span>
                          <div
                            className="flex-1 break-words [&>p]:inline"
                            dangerouslySetInnerHTML={{ __html: renderedOpt }}
                          />
                          {highlightCorrect && (
                            <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded shrink-0">
                              Correcta
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Explicación / Solucionario */}
                {isSolutions && q.explanation && (
                  <div className="mt-3 p-2.5 bg-brand-950/30 border border-brand-800/40 rounded-lg text-xs text-brand-200">
                    <span className="font-semibold text-brand-300">
                      {isOpenType ? "Criterio de Evaluación / Solución: " : "Solución / Justificación: "}
                    </span>
                    <div
                      className="inline [&>p]:inline"
                      dangerouslySetInnerHTML={{
                        __html: renderMarkdownWithMath(q.explanation),
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Cierre del examen estilo plantilla */}
        {quiz.items.length > 0 && (
          <div className="py-6 text-center space-y-1 text-xs">
            <div className="flex items-center justify-center space-x-3">
              <div className="h-[1px] w-16 bg-[#B08D57]" />
              <span className="font-bold text-[#1F3A5F] dark:text-brand-400 italic">
                Fin del examen
              </span>
              <div className="h-[1px] w-16 bg-[#B08D57]" />
            </div>
            <p className="text-[11px] text-slate-400">Revise sus respuestas antes de entregar.</p>
          </div>
        )}
      </div>

      {/* Barra inferior: Resumen y Botones de Exportación */}
      <div className="p-3 bg-dark-850 border-t border-dark-750 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="text-xs text-slate-300 flex items-center space-x-3">
          <span>
            Preguntas: <strong>{quiz.items.length}</strong>
          </span>
          <span>&bull;</span>
          <span>
            Total Puntos: <strong className="text-brand-400">{totalPoints}</strong>
          </span>
        </div>

        {/* Botones de Exportación */}
        <div className="flex items-center space-x-2">
          {/* Exportar a PDF / Imprimir */}
          <button
            onClick={onExportPdf}
            disabled={quiz.items.length === 0}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-dark-800 hover:bg-dark-700 border border-dark-700 hover:border-dark-600 rounded-md transition-all disabled:opacity-40"
          >
            <Printer className="w-3.5 h-3.5 text-rose-400" />
            <span>Imprimir / PDF</span>
          </button>

          {/* Ver / Exportar LaTeX */}
          <button
            onClick={() => onOpenLatexModal(previewMode)}
            disabled={quiz.items.length === 0}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-dark-800 hover:bg-dark-700 border border-dark-700 hover:border-dark-600 rounded-md transition-all disabled:opacity-40"
          >
            <FileCode className="w-3.5 h-3.5 text-emerald-400" />
            <span>LaTeX (.tex)</span>
          </button>

          {/* Exportar a Word */}
          <button
            onClick={() => onExportWord(previewMode)}
            disabled={quiz.items.length === 0}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-md transition-all shadow hover:shadow-brand-500/20 disabled:opacity-40"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Word (.docx)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
