import React, { useState, useEffect, useMemo } from "react";
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
  Code2,
  FileCode,
  Sparkles,
} from "lucide-react";

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (question: Question) => void;
  questionToEdit?: Question | null;
}

const TEMPLATE_MULTIPLE_CHOICE = `Curso: Física 10°
Tema: Cinemática
Subtema: MRUV
Dificultad: Media
Tags: aceleración, MRUV, gráficas
Tipo: multiple

Un móvil que parte del reposo acelera de manera constante a razón de $a = 2\\,\\text{m/s}^2$ durante $t = 5\\,\\text{s}$.
¿Cuál es la distancia total recorrida?
$$d = v_0 t + \\frac{1}{2} a t^2$$

A) $10\\,\\text{m}$
*B) $25\\,\\text{m}$
C) $50\\,\\text{m}$
D) $5\\,\\text{m}$

Solución: Como parte del reposo, $v_0 = 0$, resultando $d = \\frac{1}{2}(2)(25) = 25\\,\\text{m}$.`;

const TEMPLATE_OPEN_QUESTION = `Curso: Matemáticas 11°
Tema: Cálculo Integral
Dificultad: Difícil
Tags: integrales, área, cálculo
Tipo: abierta
Alto: 4.5cm

Calcule el área acotada entre la parábola $y = x^2$ y la recta $y = 2x$.
Presente el procedimiento completo y límites de integración:
$$A = \\int_{a}^{b} [f(x) - g(x)]\\,dx$$

Solución: Puntos de intersección en $x=0$ y $x=2$. El área es $A = \\int_0^2 (2x - x^2)dx = \\frac{4}{3}$.`;

export const QuestionModal: React.FC<QuestionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  questionToEdit,
}) => {
  // Modo de edición: Formulario visual vs Código directo
  const [entryMode, setEntryMode] = useState<"form" | "code">("form");

  // Estado del modo formulario
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

  // Estado del modo código directo
  const [directCode, setDirectCode] = useState(TEMPLATE_MULTIPLE_CHOICE);

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
      setEntryMode("form");
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
      setDirectCode(TEMPLATE_MULTIPLE_CHOICE);
    }
    setPreviewTab("edit");
    setClipboardNotice(null);
  }, [questionToEdit, isOpen]);

  // Parser inteligente para el código directo
  const parsedFromCode = useMemo<Question | null>(() => {
    if (entryMode !== "code" || !directCode.trim()) return null;

    try {
      // 1. Si el usuario pegó JSON puro
      if (directCode.trim().startsWith("{")) {
        const parsed = JSON.parse(directCode);
        return {
          id: questionToEdit ? questionToEdit.id : `q-${Date.now()}`,
          type: parsed.type || (parsed.options?.length > 0 ? "multiple_choice" : "open"),
          course: parsed.course || "General",
          topic: parsed.topic || "General",
          subtopic: parsed.subtopic,
          difficulty: parsed.difficulty || "Media",
          tags: parsed.tags || [],
          prompt: parsed.prompt || "",
          options: parsed.options || [],
          openResponseHeight: parsed.openResponseHeight || 3.5,
          explanation: parsed.explanation,
          createdAt: new Date().toISOString(),
        };
      }

      // 2. Parser para formato texto estructurado (clave: valor)
      const lines = directCode.split("\n");
      let parsedCourse = "General";
      let parsedTopic = "General";
      let parsedSubtopic: string | undefined = undefined;
      let parsedDiff: "Fácil" | "Media" | "Difícil" = "Media";
      let parsedTags: string[] = [];
      let parsedType: QuestionType = "multiple_choice";
      let parsedHeight = 3.5;
      let parsedExplanation = "";

      let contentLines: string[] = [];
      let inOptionsOrSol = false;
      const parsedOptions: Option[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Metadatos iniciales
        if (!inOptionsOrSol && contentLines.length === 0) {
          if (/^curso:\s*(.+)$/i.test(trimmed)) {
            parsedCourse = trimmed.replace(/^curso:\s*/i, "").trim();
            continue;
          }
          if (/^tema:\s*(.+)$/i.test(trimmed)) {
            parsedTopic = trimmed.replace(/^tema:\s*/i, "").trim();
            continue;
          }
          if (/^subtema:\s*(.+)$/i.test(trimmed)) {
            parsedSubtopic = trimmed.replace(/^subtema:\s*/i, "").trim();
            continue;
          }
          if (/^dificultad:\s*(.+)$/i.test(trimmed)) {
            const d = trimmed.replace(/^dificultad:\s*/i, "").trim();
            if (["Fácil", "Media", "Difícil"].includes(d)) parsedDiff = d as any;
            continue;
          }
          if (/^tags:\s*(.+)$/i.test(trimmed) || /^etiquetas:\s*(.+)$/i.test(trimmed)) {
            const rawTags = trimmed.replace(/^(tags|etiquetas):\s*/i, "");
            parsedTags = rawTags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
            continue;
          }
          if (/^tipo:\s*(.+)$/i.test(trimmed)) {
            const t = trimmed.replace(/^tipo:\s*/i, "").toLowerCase();
            parsedType = t.includes("abierta") || t.includes("open") ? "open" : "multiple_choice";
            continue;
          }
          if (/^alto:\s*([\d\.]+)cm?$/i.test(trimmed)) {
            const match = trimmed.match(/^alto:\s*([\d\.]+)cm?$/i);
            if (match) parsedHeight = parseFloat(match[1]) || 3.5;
            continue;
          }
        }

        // Opciones de respuesta (A), B), *C), D))
        const optMatch = trimmed.match(/^(\*)?\s*([A-Fa-f])[\)\.]\s*(.+)$/);
        if (optMatch) {
          inOptionsOrSol = true;
          const isCorrect = Boolean(optMatch[1]);
          const letter = optMatch[2].toLowerCase();
          const text = optMatch[3].trim();
          parsedOptions.push({ id: letter, text, isCorrect });
          continue;
        }

        // Solución / Justificación
        if (/^(soluci[oó]n|explicaci[oó]n|criterio):\s*(.+)$/i.test(trimmed)) {
          inOptionsOrSol = true;
          parsedExplanation = trimmed.replace(/^(soluci[oó]n|explicaci[oó]n|criterio):\s*/i, "").trim();
          continue;
        }

        if (inOptionsOrSol && parsedExplanation) {
          parsedExplanation += "\n" + line;
          continue;
        }

        // Enunciado
        contentLines.push(line);
      }

      // Asegurar al menos una opción correcta si es múltiple
      if (parsedType === "multiple_choice" && parsedOptions.length > 0) {
        if (!parsedOptions.some((o) => o.isCorrect)) {
          parsedOptions[0].isCorrect = true;
        }
      }

      return {
        id: questionToEdit ? questionToEdit.id : `q-${Date.now()}`,
        type: parsedType,
        course: parsedCourse,
        topic: parsedTopic,
        subtopic: parsedSubtopic,
        difficulty: parsedDiff,
        tags: parsedTags,
        prompt: contentLines.join("\n").trim(),
        options: parsedOptions,
        openResponseHeight: parsedHeight,
        explanation: parsedExplanation.trim() || undefined,
        createdAt: new Date().toISOString(),
      };
    } catch {
      return null;
    }
  }, [directCode, entryMode, questionToEdit]);

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
    if (entryMode === "code") {
      if (!parsedFromCode) {
        alert("El código ingresado no contiene una pregunta válida.");
        return;
      }
      if (!parsedFromCode.prompt.trim()) {
        alert("El código debe incluir el enunciado de la pregunta.");
        return;
      }
      if (
        parsedFromCode.type === "multiple_choice" &&
        parsedFromCode.options.length < 2
      ) {
        alert("Las preguntas de opción múltiple deben tener al menos dos opciones (ej: A) y B)).");
        return;
      }
      onSave(parsedFromCode);
      onClose();
      return;
    }

    // Modo Formulario
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
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-dark-850 border border-dark-700 w-full max-w-5xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in duration-150">
        {/* Cabecera del modal */}
        <div className="px-6 py-4 border-b border-dark-700 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-brand-500" />
              {questionToEdit ? "Editar Pregunta" : "Nueva Pregunta para el Banco"}
            </h2>
            <p className="text-xs text-slate-400">
              Crea celdas mediante formulario visual o escribiendo directamente en código rápido
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {/* Selector de Modo: Formulario vs Código Directo */}
            <div className="flex items-center bg-dark-900 border border-dark-700 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setEntryMode("form")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                  entryMode === "form"
                    ? "bg-brand-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Formulario</span>
              </button>
              <button
                type="button"
                onClick={() => setEntryMode("code")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                  entryMode === "code"
                    ? "bg-brand-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Escribir Código</span>
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

        {/* ==============================================================
            MODO CÓDIGO DIRECTO: Permite escribir la pregunta como texto rápido
           ============================================================== */}
        {entryMode === "code" ? (
          <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
            {/* Editor de Código (Izquierda) */}
            <div className="flex-1 p-5 border-r border-dark-700 flex flex-col bg-dark-900">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-brand-400" />
                  Editor de Código Rápido
                </span>

                {/* Plantillas rápidas */}
                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={() => setDirectCode(TEMPLATE_MULTIPLE_CHOICE)}
                    className="text-[11px] text-brand-400 hover:underline px-1.5 py-0.5 rounded bg-dark-800 border border-dark-700"
                  >
                    Plantilla Opción Múltiple
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirectCode(TEMPLATE_OPEN_QUESTION)}
                    className="text-[11px] text-[#B08D57] hover:underline px-1.5 py-0.5 rounded bg-dark-800 border border-dark-700"
                  >
                    Plantilla Abierta
                  </button>
                </div>
              </div>

              <textarea
                value={directCode}
                onChange={(e) => setDirectCode(e.target.value)}
                placeholder="Escribe aquí tu pregunta en texto..."
                className="flex-1 w-full bg-dark-950 border border-dark-700 rounded-xl p-3.5 font-mono text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-brand-500 resize-none"
              />

              <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Tip: Agrega un asterisco <code>*B)</code> a la opción que sea correcta.</span>
                <span className="text-emerald-400">Ctrl+V para pegar imágenes</span>
              </div>
            </div>

            {/* Vista Previa Renderizada en Tiempo Real (Derecha) */}
            <div className="flex-1 p-5 overflow-y-auto bg-dark-850 space-y-4">
              <div className="flex items-center justify-between border-b border-dark-700 pb-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  Previsualización KaTeX en Vivo
                </span>
                {parsedFromCode && (
                  <span className="text-[10px] font-semibold text-brand-400 bg-brand-950/60 border border-brand-800/60 px-2 py-0.5 rounded-md">
                    {parsedFromCode.course} &bull; {parsedFromCode.topic}
                  </span>
                )}
              </div>

              {parsedFromCode ? (
                <div className="space-y-3.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-semibold bg-dark-700 text-slate-200 px-2 py-0.5 rounded">
                      {parsedFromCode.type === "open" ? "Abierta" : "Opción Múltiple"}
                    </span>
                    <span className="text-[10px] text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded">
                      {parsedFromCode.difficulty}
                    </span>
                    {parsedFromCode.tags.map((t, i) => (
                      <span key={i} className="text-[10px] text-slate-400 bg-dark-800 px-1.5 py-0.5 rounded">
                        #{t}
                      </span>
                    ))}
                  </div>

                  {/* Enunciado renderizado */}
                  <div
                    className="prose prose-invert prose-sm max-w-none text-slate-200 text-xs leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdownWithMath(parsedFromCode.prompt),
                    }}
                  />

                  {/* Opciones o Cuadro */}
                  {parsedFromCode.type === "open" ? (
                    <div
                      style={{ height: `${(parsedFromCode.openResponseHeight || 3.5) * 26}px` }}
                      className="w-full bg-white/5 border border-slate-700 border-l-[3.5px] border-l-[#B08D57] rounded-md p-3 text-[11px] text-slate-500 italic"
                    >
                      [Cuadro de respuesta abierta &bull; {parsedFromCode.openResponseHeight || 3.5} cm]
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {parsedFromCode.options.map((opt, i) => (
                        <div
                          key={i}
                          className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
                            opt.isCorrect
                              ? "bg-emerald-950/20 border-emerald-700/60 text-emerald-200"
                              : "bg-dark-900 border-dark-750 text-slate-300"
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-400">{opt.id.toUpperCase()})</span>
                            <span
                              dangerouslySetInnerHTML={{
                                __html: renderMarkdownWithMath(opt.text),
                              }}
                            />
                          </div>
                          {opt.isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                        </div>
                      ))}
                    </div>
                  )}

                  {parsedFromCode.explanation && (
                    <div className="p-2.5 bg-dark-900/60 border border-dark-700 rounded-lg text-xs text-slate-300">
                      <strong className="text-brand-400">Solución: </strong>
                      <span
                        dangerouslySetInnerHTML={{
                          __html: renderMarkdownWithMath(parsedFromCode.explanation),
                        }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-500">
                  Escribe en el editor para ver aquí la previsualización en tiempo real.
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ==============================================================
             MODO FORMULARIO GUIADO
             ============================================================== */
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Selector de Tipo de Pregunta */}
            <div className="bg-dark-900 border border-dark-700 rounded-xl p-3 flex items-center justify-between gap-4">
              <div className="text-xs">
                <span className="font-semibold text-slate-200 block">Tipo de Pregunta</span>
                <span className="text-slate-400 text-[11px]">
                  {type === "multiple_choice"
                    ? "Selección múltiple (con alternativas A, B, C, D y hoja de respuestas)"
                    : "Pregunta abierta (con recuadro para procedimientos y respuestas escritas)"}
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

            {/* Metadatos: Curso, Tema, Dificultad */}
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
                  style={{ backgroundColor: "#101622", color: "#e2e8f0" }}
                  className="w-full border border-dark-700 focus:border-brand-500 rounded-lg px-3 py-2 text-xs focus:outline-none"
                >
                  <option value="Fácil" style={{ backgroundColor: "#101622", color: "#e2e8f0" }}>Fácil</option>
                  <option value="Media" style={{ backgroundColor: "#101622", color: "#e2e8f0" }}>Media</option>
                  <option value="Difícil" style={{ backgroundColor: "#101622", color: "#e2e8f0" }}>Difícil</option>
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

            {/* Enunciado */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <span>Enunciado de la Pregunta</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    (Usa $...$ para ecuaciones en línea y $$...$$ para bloques)
                  </span>
                </label>

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
                  rows={5}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onPaste={handlePastePrompt}
                  placeholder="Escribe el enunciado aquí. Puedes pegar imágenes con Ctrl+V e incluir fórmulas como $v = \frac{d}{t}$ o en bloque $$E = mc^2$$"
                  className="w-full bg-dark-900 border border-dark-700 focus:border-brand-500 rounded-lg p-3 text-xs text-slate-200 font-mono focus:outline-none"
                />
              ) : (
                <div className="min-h-[120px] bg-dark-900 border border-dark-700 rounded-lg p-4 text-xs text-slate-200 leading-relaxed overflow-x-auto">
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

            {/* Opciones o Cuadro de respuesta */}
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
              <div className="bg-dark-900/80 border border-[#B08D57]/40 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">
                      Cuadro de Respuesta del Estudiante
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Define la altura del espacio asignado en el examen
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <label className="text-xs text-slate-300 font-medium">Altura:</label>
                    <select
                      value={openResponseHeight}
                      onChange={(e) => setOpenResponseHeight(parseFloat(e.target.value))}
                      style={{ backgroundColor: "#101622", color: "#e2e8f0" }}
                      className="border border-dark-700 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-brand-500"
                    >
                      <option value={2.5} style={{ backgroundColor: "#101622", color: "#e2e8f0" }}>2.5 cm (Corta - 4 líneas)</option>
                      <option value={3.5} style={{ backgroundColor: "#101622", color: "#e2e8f0" }}>3.5 cm (Estándar - 6 líneas)</option>
                      <option value={4.5} style={{ backgroundColor: "#101622", color: "#e2e8f0" }}>4.5 cm (Media - 8 líneas)</option>
                      <option value={6.0} style={{ backgroundColor: "#101622", color: "#e2e8f0" }}>6.0 cm (Amplia - 12 líneas)</option>
                      <option value={8.0} style={{ backgroundColor: "#101622", color: "#e2e8f0" }}>8.0 cm (Media página)</option>
                    </select>
                  </div>
                </div>

                <div
                  style={{ height: `${openResponseHeight * 28}px` }}
                  className="w-full bg-white/5 border border-slate-700 border-l-[3.5px] border-l-[#B08D57] rounded p-3 flex items-start text-[11px] text-slate-500 italic"
                >
                  [Espacio asignado para procedimiento y respuesta escrita del estudiante - {openResponseHeight} cm]
                </div>
              </div>
            )}

            {/* Solución / Explicación */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {type === "open"
                  ? "Criterio de Evaluación / Solución esperada"
                  : "Solución / Justificación (Opcional)"}
              </label>
              <textarea
                rows={2}
                placeholder="Describe los pasos o solución..."
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                className="w-full bg-dark-900 border border-dark-700 focus:border-brand-500 rounded-lg p-3 text-xs text-slate-200 focus:outline-none"
              />
            </div>
          </div>
        )}

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
