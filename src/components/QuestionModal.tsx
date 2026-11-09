import React, { useState, useEffect } from "react";
import { Question, Option, QuestionType } from "../types/quiz";
import { renderMarkdownWithMath } from "../utils/markdownRenderer";
import { handleClipboardImage } from "../utils/clipboardImage";
import {
  X,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Eye,
  Edit3,
  Image as ImageIcon,
  CheckSquare,
  Square,
  HelpCircle,
} from "lucide-react";

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (question: Question) => void;
  questionToEdit?: Question | null;
}

export const QuestionModal: React.FC<QuestionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  questionToEdit,
}) => {
  const [type, setType] = useState<QuestionType>("multiple_choice");
  const [course, setCourse] = useState("Física 10°");
  const [topic, setTopic] = useState("");
  const [subtopic, setSubtopic] = useState("");
  const [difficulty, setDifficulty] = useState<"Fácil" | "Media" | "Difícil">("Media");
  const [tagsInput, setTagsInput] = useState("");
  const [prompt, setPrompt] = useState("");
  const [openResponseHeight, setOpenResponseHeight] = useState<number>(3.5);
  const [options, setOptions] = useState<Option[]>([
    { id: "a", text: "", isCorrect: true },
    { id: "b", text: "", isCorrect: false },
    { id: "c", text: "", isCorrect: false },
    { id: "d", text: "", isCorrect: false },
  ]);
  const [explanation, setExplanation] = useState("");
  const [previewTab, setPreviewTab] = useState<"edit" | "preview">("edit");
  const [clipboardNotice, setClipboardNotice] = useState<string | null>(null);

  useEffect(() => {
    if (questionToEdit) {
      setType(questionToEdit.type || "multiple_choice");
      setCourse(questionToEdit.course || "Física 10°");
      setTopic(questionToEdit.topic || "");
      setSubtopic(questionToEdit.subtopic || "");
      setDifficulty(questionToEdit.difficulty || "Media");
      setTagsInput(questionToEdit.tags?.join(", ") || "");
      setPrompt(questionToEdit.prompt || "");
      setOpenResponseHeight(questionToEdit.openResponseHeight || 3.5);
      setOptions(
        questionToEdit.options?.length > 0
          ? questionToEdit.options
          : [
              { id: "a", text: "", isCorrect: true },
              { id: "b", text: "", isCorrect: false },
              { id: "c", text: "", isCorrect: false },
              { id: "d", text: "", isCorrect: false },
            ]
      );
      setExplanation(questionToEdit.explanation || "");
    } else {
      setType("multiple_choice");
      setCourse("Física 10°");
      setTopic("");
      setSubtopic("");
      setDifficulty("Media");
      setTagsInput("");
      setPrompt("");
      setOpenResponseHeight(3.5);
      setOptions([
        { id: "a", text: "", isCorrect: true },
        { id: "b", text: "", isCorrect: false },
        { id: "c", text: "", isCorrect: false },
        { id: "d", text: "", isCorrect: false },
      ]);
      setExplanation("");
    }
    setPreviewTab("edit");
    setClipboardNotice(null);
  }, [questionToEdit, isOpen]);

  if (!isOpen) return null;

  const handlePastePrompt = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    handleClipboardImage(e, prompt, setPrompt, (info) => {
      setClipboardNotice(info);
      setTimeout(() => setClipboardNotice(null), 4000);
    });
  };

  const handleAddOption = () => {
    const letters = ["a", "b", "c", "d", "e", "f", "g"];
    const nextLetter = letters[options.length] || `opt-${options.length + 1}`;
    setOptions([...options, { id: nextLetter, text: "", isCorrect: false }]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return;
    const newOptions = options.filter((_, i) => i !== index);
    if (!newOptions.some((o) => o.isCorrect)) {
      newOptions[0].isCorrect = true;
    }
    setOptions(newOptions);
  };

  const handleSetCorrect = (index: number) => {
    setOptions(
      options.map((opt, i) => ({
        ...opt,
        isCorrect: i === index,
      }))
    );
  };

  const handleOptionTextChange = (index: number, text: string) => {
    const newOptions = [...options];
    newOptions[index].text = text;
    setOptions(newOptions);
  };

  const insertMathSnippet = (snippet: string) => {
    setPrompt((prev) => prev + snippet);
  };

  const handleSave = () => {
    if (!prompt.trim()) {
      alert("Por favor ingresa el enunciado de la pregunta.");
      return;
    }

    if (type === "multiple_choice" && options.some((o) => !o.text.trim())) {
      alert("Por favor completa el texto de todas las opciones.");
      return;
    }

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const questionData: Question = {
      id: questionToEdit ? questionToEdit.id : `q-${Date.now()}`,
      type,
      course: course.trim() || "General",
      topic: topic.trim() || "General",
      subtopic: subtopic.trim() || undefined,
      difficulty,
      tags,
      prompt,
      options: type === "multiple_choice" ? options : [],
      openResponseHeight: type === "open" ? openResponseHeight : undefined,
      explanation: explanation.trim() || undefined,
      createdAt: questionToEdit?.createdAt || new Date().toISOString(),
    };

    onSave(questionData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-dark-850 border border-dark-700 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in duration-150">
        {/* Cabecera del modal */}
        <div className="px-6 py-4 border-b border-dark-700 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-brand-500" />
              {questionToEdit ? "Editar Pregunta" : "Nueva Pregunta para el Banco"}
            </h2>
            <p className="text-xs text-slate-400">
              Personaliza el tipo de celda, enunciado LaTeX/Markdown e imágenes (Ctrl+V)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-dark-750 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo del modal con scroll */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Selector de Tipo de Pregunta: Opción Múltiple vs Abierta */}
          <div className="bg-dark-900 border border-dark-700 rounded-xl p-3 flex items-center justify-between gap-4">
            <div className="text-xs">
              <span className="font-semibold text-slate-200 block">Tipo de Pregunta</span>
              <span className="text-slate-400 text-[11px]">
                {type === "multiple_choice"
                  ? "Selección múltiple (con alternativas A, B, C, D y hoja de respuestas)"
                  : "Pregunta abierta (con recuadro para procedimientos, demostraciones y respuesta escrita)"}
              </span>
            </div>

            <div className="flex items-center bg-dark-800 border border-dark-700 rounded-lg p-1 shrink-0">
              <button
                type="button"
                onClick={() => setType("multiple_choice")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                  type === "multiple_choice"
                    ? "bg-brand-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Opción Múltiple</span>
              </button>
              <button
                type="button"
                onClick={() => setType("open")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                  type === "open"
                    ? "bg-[#1F3A5F] text-[#B08D57] border border-[#B08D57]/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Square className="w-3.5 h-3.5" />
                <span>Pregunta Abierta</span>
              </button>
            </div>
          </div>

          {/* Metadatos: Curso, Tema, Dificultad, Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Curso / Asignatura
              </label>
              <input
                type="text"
                placeholder="Ej: Física 10°"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full bg-dark-900 border border-dark-700 focus:border-brand-500 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tema / Unidad</label>
              <input
                type="text"
                placeholder="Ej: Cinemática"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-dark-900 border border-dark-700 focus:border-brand-500 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Subtema (opcional)
              </label>
              <input
                type="text"
                placeholder="Ej: MRUV"
                value={subtopic}
                onChange={(e) => setSubtopic(e.target.value)}
                className="w-full bg-dark-900 border border-dark-700 focus:border-brand-500 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Dificultad</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full bg-dark-900 border border-dark-700 focus:border-brand-500 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
              >
                <option value="Fácil">Fácil</option>
                <option value="Media">Media</option>
                <option value="Difícil">Difícil</option>
              </select>
            </div>
          </div>

          {/* Etiquetas */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Etiquetas (separadas por comas)
            </label>
            <input
              type="text"
              placeholder="aceleración, gráficas, periodo-1, vectores"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full bg-dark-900 border border-dark-700 focus:border-brand-500 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
            />
          </div>

          {/* Enunciado con pestañas de Edición / Vista Previa */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <span>Enunciado de la Pregunta</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  (Usa $...$ para ecuaciones en línea y $$...$$ para bloques)
                </span>
              </label>

              {/* Botones de pestaña */}
              <div className="flex items-center bg-dark-900 border border-dark-700 rounded-md p-0.5">
                <button
                  type="button"
                  onClick={() => setPreviewTab("edit")}
                  className={`px-2.5 py-1 text-xs rounded font-medium flex items-center gap-1 ${
                    previewTab === "edit" ? "bg-dark-750 text-white" : "text-slate-400"
                  }`}
                >
                  <Edit3 className="w-3 h-3" /> Editor
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab("preview")}
                  className={`px-2.5 py-1 text-xs rounded font-medium flex items-center gap-1 ${
                    previewTab === "preview" ? "bg-brand-600 text-white" : "text-slate-400"
                  }`}
                >
                  <Eye className="w-3 h-3" /> Previa KaTeX
                </button>
              </div>
            </div>

            {/* Atajos rápidos para insertar fórmulas matemáticas */}
            {previewTab === "edit" && (
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
                <span className="text-[10px]">Insertar:</span>
                <button
                  type="button"
                  onClick={() => insertMathSnippet(" $x = \\frac{a}{b}$ ")}
                  className="px-2 py-0.5 bg-dark-800 hover:bg-dark-700 border border-dark-700 rounded text-[11px] text-brand-400 font-mono"
                >
                  Fracción
                </button>
                <button
                  type="button"
                  onClick={() => insertMathSnippet(" $x^2$ ")}
                  className="px-2 py-0.5 bg-dark-800 hover:bg-dark-700 border border-dark-700 rounded text-[11px] text-brand-400 font-mono"
                >
                  Potencia
                </button>
                <button
                  type="button"
                  onClick={() => insertMathSnippet(" $\\sqrt{x}$ ")}
                  className="px-2 py-0.5 bg-dark-800 hover:bg-dark-700 border border-dark-700 rounded text-[11px] text-brand-400 font-mono"
                >
                  Raíz
                </button>
                <button
                  type="button"
                  onClick={() => insertMathSnippet("\n$$\\int_{a}^{b} f(x)dx$$\n")}
                  className="px-2 py-0.5 bg-dark-800 hover:bg-dark-700 border border-dark-700 rounded text-[11px] text-brand-400 font-mono"
                >
                  Integral
                </button>
                <span className="text-[10px] text-emerald-400 ml-auto flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" /> Copia y pega imágenes aquí con Ctrl+V
                </span>
              </div>
            )}

            {clipboardNotice && (
              <div className="text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-3 py-1.5 rounded-lg animate-pulse">
                {clipboardNotice}
              </div>
            )}

            {previewTab === "edit" ? (
              <textarea
                rows={6}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onPaste={handlePastePrompt}
                placeholder="Escribe el enunciado aquí. Puedes pegar imágenes con Ctrl+V e incluir fórmulas como $v = \frac{d}{t}$ o en bloque $$E = mc^2$$"
                className="w-full bg-dark-900 border border-dark-700 focus:border-brand-500 rounded-lg p-3 text-xs text-slate-200 font-mono focus:outline-none"
              />
            ) : (
              <div className="min-h-[140px] bg-dark-900 border border-dark-700 rounded-lg p-4 text-xs text-slate-200 leading-relaxed overflow-x-auto">
                {prompt.trim() ? (
                  <div
                    className="prose prose-invert prose-sm max-w-none [&_img]:max-h-64 [&_img]:rounded-lg"
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdownWithMath(prompt),
                    }}
                  />
                ) : (
                  <p className="text-slate-500 italic">Escribe en el editor para previsualizar aquí.</p>
                )}
              </div>
            )}
          </div>

          {/* Opciones (si es Opción Múltiple) o Configuración de Cuadro (si es Abierta) */}
          {type === "multiple_choice" ? (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  Opciones de Respuesta (Marca cuál es la correcta)
                </label>
                <button
                  type="button"
                  onClick={handleAddOption}
                  disabled={options.length >= 6}
                  className="text-xs text-brand-400 hover:text-brand-300 font-medium flex items-center gap-1 disabled:opacity-40"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar Opción
                </button>
              </div>

              <div className="space-y-2">
                {options.map((opt, i) => {
                  const letters = ["A", "B", "C", "D", "E", "F"];
                  return (
                    <div
                      key={opt.id || i}
                      className={`flex items-center space-x-2 p-2 rounded-lg border transition-all ${
                        opt.isCorrect
                          ? "bg-emerald-950/20 border-emerald-700/60"
                          : "bg-dark-900 border-dark-700"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleSetCorrect(i)}
                        title="Marcar como respuesta correcta"
                        className="p-1 text-slate-400 hover:text-emerald-400"
                      >
                        {opt.isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-600 hover:text-slate-400" />
                        )}
                      </button>

                      <span className="text-xs font-bold text-slate-400 w-4">{letters[i]}.</span>

                      <input
                        type="text"
                        placeholder={`Texto de la opción ${letters[i]} (ej: $25\\,\\text{m}$)`}
                        value={opt.text}
                        onChange={(e) => handleOptionTextChange(i, e.target.value)}
                        className="flex-1 bg-transparent text-xs text-slate-200 focus:outline-none"
                      />

                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(i)}
                          className="p-1 text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Configuración para Pregunta Abierta */
            <div className="bg-dark-900/80 border border-[#B08D57]/40 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">
                    Cuadro de Respuesta del Estudiante
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Define la altura del espacio asignado en el examen impreso o en PDF
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <label className="text-xs text-slate-300 font-medium">Altura:</label>
                  <select
                    value={openResponseHeight}
                    onChange={(e) => setOpenResponseHeight(parseFloat(e.target.value))}
                    className="bg-dark-800 border border-dark-700 text-xs text-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-brand-500"
                  >
                    <option value={2.5}>2.5 cm (Corta - 4 líneas)</option>
                    <option value={3.5}>3.5 cm (Estándar - 6 líneas)</option>
                    <option value={4.5}>4.5 cm (Media - 8 líneas)</option>
                    <option value={6.0}>6.0 cm (Amplia - 12 líneas)</option>
                    <option value={8.0}>8.0 cm (Media página)</option>
                  </select>
                </div>
              </div>

              {/* Previa visual del cuadro con estilo plantilla */}
              <div
                style={{ height: `${openResponseHeight * 28}px` }}
                className="w-full bg-white/5 border border-slate-700 border-l-[3.5px] border-l-[#B08D57] rounded p-3 flex items-start text-[11px] text-slate-500 italic"
              >
                [Espacio asignado para procedimiento y respuesta escrita del estudiante - {openResponseHeight} cm]
              </div>
            </div>
          )}

          {/* Solución / Explicación / Criterio de evaluación */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {type === "open"
                ? "Criterio de Evaluación / Solución esperada (Visible en el solucionario)"
                : "Solución / Justificación (Opcional, visible en el solucionario)"}
            </label>
            <textarea
              rows={2}
              placeholder={
                type === "open"
                  ? "Describe los pasos, fórmulas o criterios clave que el estudiante debe presentar para obtener los puntos..."
                  : "Explica el paso a paso de la resolución..."
              }
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              className="w-full bg-dark-900 border border-dark-700 focus:border-brand-500 rounded-lg p-3 text-xs text-slate-200 focus:outline-none"
            />
          </div>
        </div>

        {/* Pie del modal */}
        <div className="px-6 py-4 bg-dark-850 border-t border-dark-700 flex items-center justify-end space-x-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-dark-800 hover:bg-dark-750 border border-dark-700 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-lg shadow-sm transition-all hover:shadow-brand-500/20 active:scale-95"
          >
            Guardar Pregunta en el Banco
          </button>
        </div>
      </div>
    </div>
  );
};
