import React, { useState, useEffect } from "react";
import { Question, Quiz } from "./types/quiz";
import { initialQuestions } from "./data/sampleQuestions";
import { Header } from "./components/Header";
import { BankPanel } from "./components/BankPanel";
import { QuizPanel } from "./components/QuizPanel";
import { QuestionModal } from "./components/QuestionModal";
import { LatexModal } from "./components/LatexModal";
import { BackupModal } from "./components/BackupModal";
import { ImportModal } from "./components/ImportModal";
import { exportToWord, exportToPdf } from "./utils/exporters";
import { saveAs } from "file-saver";

const STORAGE_KEY_BANK = "banco_preguntas_data_v2";
const STORAGE_KEY_QUIZ = "banco_preguntas_quiz_v2";

export function App() {
  // 1. Estado del Banco de Preguntas
  const [questions, setQuestions] = useState<Question[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BANK);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error al cargar banco desde localStorage", e);
    }
    return initialQuestions;
  });

  // 2. Estado del Quiz / Evaluación
  const [quiz, setQuiz] = useState<Quiz>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_QUIZ);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error al cargar evaluación desde localStorage", e);
    }
    return {
      id: `quiz-${Date.now()}`,
      header: {
        institution: "Nombre de la Institución",
        course: "Física y Matemáticas",
        title: "Evaluación Periódica",
        teacher: "Nombre del Docente",
        date: new Date().toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
        instructions:
          "Lea atentamente cada enunciado. Seleccione la única respuesta correcta rellenando el círculo en la hoja de respuestas. Responda las preguntas abiertas en el cuadro asignado y justifique sus procedimientos. Use bolígrafo azul o negro. Tiempo disponible: 90 minutos.",
        showAnswerSheet: true,
      },
      items: [
        { instanceId: "inst-1", question: initialQuestions[0], points: 1.0 },
        { instanceId: "inst-2", question: initialQuestions[1], points: 1.0 },
        { instanceId: "inst-3", question: initialQuestions[2], points: 1.5 },
      ],
    };
  });

  // 3. Configuración de la aplicación
  const [fontSize, setFontSize] = useState<"small" | "medium" | "large">("medium");
  const [showSettings, setShowSettings] = useState(false);
  // Pregunta en edición (para el modal de crear/editar)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  // 3. Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLatexModalOpen, setIsLatexModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // 4. Ancho del panel izquierdo (split screen redimensionable)
  const [leftWidthPercent, setLeftWidthPercent] = useState<number>(48);
  const [isResizing, setIsResizing] = useState(false);

  // Guardar en localStorage automáticamente ante cambios
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BANK, JSON.stringify(questions));
    } catch (e) {
      console.error("Error guardando en localStorage", e);
    }
  }, [questions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_QUIZ, JSON.stringify(quiz));
    } catch (e) {
      console.error("Error guardando quiz en localStorage", e);
    }
  }, [quiz]);

  // Aplica el tamaño de letra elegido al elemento raíz (afecta a todas las
  // clases text-* de Tailwind, que usan unidades rem relativas al html)
  useEffect(() => {
    const scale = { small: "14px", medium: "16px", large: "20px" }[fontSize];
    document.documentElement.style.fontSize = scale;
  }, [fontSize]);

  // Manejo del redimensionamiento de pantalla dividida
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newPercent = (e.clientX / window.innerWidth) * 100;
      if (newPercent >= 25 && newPercent <= 75) {
        setLeftWidthPercent(newPercent);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  // Operaciones sobre el Banco
  const handleSaveQuestion = (newOrUpdated: Question) => {
    setQuestions((prev) => {
      const existsIndex = prev.findIndex((q) => q.id === newOrUpdated.id);
      if (existsIndex >= 0) {
        const copy = [...prev];
        copy[existsIndex] = newOrUpdated;
        return copy;
      }
      return [newOrUpdated, ...prev];
    });

    // Actualizar también en el quiz si ya estaba agregada
    setQuiz((prevQuiz) => ({
      ...prevQuiz,
      items: prevQuiz.items.map((it) =>
        it.question.id === newOrUpdated.id ? { ...it, question: newOrUpdated } : it
      ),
    }));
  };

  const handleDeleteQuestion = (id: string) => {
    if (window.confirm("¿Seguro que deseas eliminar esta pregunta del banco?")) {
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      setQuiz((prevQuiz) => ({
        ...prevQuiz,
        items: prevQuiz.items.filter((it) => it.question.id !== id),
      }));
    }
  };

  // Operaciones sobre el Quiz / Constructor
  const handleAddToQuiz = (q: Question) => {
    const newItem = {
      instanceId: `inst-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      question: q,
      points: 1.0,
    };
    setQuiz((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const handleRemoveItem = (instanceId: string) => {
    setQuiz((prev) => ({
      ...prev,
      items: prev.items.filter((it) => it.instanceId !== instanceId),
    }));
  };

  const handleMoveItem = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= quiz.items.length) return;

    setQuiz((prev) => {
      const newItems = [...prev.items];
      const temp = newItems[index];
      newItems[index] = newItems[targetIndex];
      newItems[targetIndex] = temp;
      return { ...prev, items: newItems };
    });
  };

  const handleUpdatePoints = (instanceId: string, points: number) => {
    setQuiz((prev) => ({
      ...prev,
      items: prev.items.map((it) =>
        it.instanceId === instanceId ? { ...it, points } : it
      ),
    }));
  };

  const handleShuffleQuestions = () => {
    setQuiz((prev) => {
      const shuffled = [...prev.items].sort(() => Math.random() - 0.5);
      return { ...prev, items: shuffled };
    });
  };

  const handleShuffleOptions = () => {
    setQuiz((prev) => ({
      ...prev,
      items: prev.items.map((item) => ({
        ...item,
        question: {
          ...item.question,
          options: [...item.question.options].sort(() => Math.random() - 0.5),
        },
      })),
    }));
  };

  // Respaldo e Importación JSON
  const handleExportBank = () => {
    const dataStr = JSON.stringify(questions, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const filename = `Banco_Preguntas_Respaldo_${new Date().toISOString().slice(0, 10)}.json`;
    saveAs(blob, filename);
  };

  // Respaldo e Importación de Banco
  const handleImportQuestions = (imported: Question[], mode: "append" | "replace") => {
    if (mode === "replace") {
      setQuestions(imported);
    } else {
      // Agregar sin duplicar por ID
      setQuestions((prev) => {
        const existingIds = new Set(prev.map((q) => q.id));
        const newOnes = imported.filter((q) => !existingIds.has(q.id));
        return [...prev, ...newOnes];
      });
    }
  };

  const quizQuestionIds = new Set(quiz.items.map((it) => it.question.id));

  return (
    <div className="h-screen w-screen flex flex-col bg-dark-900 select-none overflow-hidden">
      {/* Barra de Navegación Superior */}
      <Header
        totalQuestions={questions.length}
        onOpenNewModal={() => {
          setEditingQuestion(null);
          setIsModalOpen(true);
        }}
        onExportBank={() => setIsBackupModalOpen(true)}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
      />

      {/* Pantalla Dividida en Vertical (Split Screen) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Panel Izquierdo: Banco de Preguntas */}
        <div
          style={{ width: `${leftWidthPercent}%` }}
          className="h-full flex-shrink-0 select-auto"
        >
          <BankPanel
            questions={questions}
            onAddToQuiz={handleAddToQuiz}
            onEditQuestion={(q) => {
              setEditingQuestion(q);
              setIsModalOpen(true);
            }}
            onDeleteQuestion={handleDeleteQuestion}
            quizQuestionIds={quizQuestionIds}
          />
        </div>

        {/* Separador vertical redimensionable */}
        <div
          onMouseDown={() => setIsResizing(true)}
          className="w-1.5 hover:w-2 bg-dark-750 hover:bg-brand-500 cursor-col-resize transition-all shrink-0 flex items-center justify-center group z-20"
          title="Arrastra para ajustar el ancho de los paneles"
        >
          <div className="h-8 w-0.5 bg-dark-600 group-hover:bg-white rounded" />
        </div>

        {/* Panel Derecho: Constructor de Examen / Quiz */}
        <div
          style={{ width: `${100 - leftWidthPercent}%` }}
          className="h-full flex-shrink-0 select-auto"
        >
          <QuizPanel
            quiz={quiz}
            onUpdateHeader={(newHeader) =>
              setQuiz((prev) => ({ ...prev, header: newHeader }))
            }
            onRemoveItem={handleRemoveItem}
            onMoveItem={handleMoveItem}
            onUpdatePoints={handleUpdatePoints}
            onShuffleQuestions={handleShuffleQuestions}
            onShuffleOptions={handleShuffleOptions}
            onExportPdf={exportToPdf}
            onOpenLatexModal={() => setIsLatexModalOpen(true)}
            onExportWord={(mode) => exportToWord(quiz, mode)}
          />
        </div>
      </div>

      {/* Modal para Crear / Editar Pregunta */}
      <QuestionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingQuestion(null);
        }}
        onSave={handleSaveQuestion}
        questionToEdit={editingQuestion}
      />

      {/* Modal para Ver, Copiar y Descargar Código LaTeX */}
      <LatexModal
        isOpen={isLatexModalOpen}
        onClose={() => setIsLatexModalOpen(false)}
        quiz={quiz}
      />

      {/* Modal para Respaldar el Banco (Descargar o Copiar JSON) */}
      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        questions={questions}
      />

      {/* Modal para Importar el Banco (Archivo o Texto JSON) */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportQuestions}
      />
      {/* Modal de Configuración */}
      <div
        className={`fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 ${showSettings ? "block" : "hidden"}`}
      >
        <div className={`bg-dark-850 border border-dark-700 w-full max-w-sm rounded-2xl p-6 text-center transform scale-95 opacity-0 transition-all duration-300 ${showSettings ? "transform-scale-100 opacity-100" : ""}`}>
          <h3 className="text-base font-bold text-slate-100 mb-4">Configuración</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tamaño de letra</label>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value as any)}
                style={{ backgroundColor: "#101622", color: "#e2e8f0" }}
                className="w-full border border-dark-700 rounded px-3 py-2 text-xs focus:outline-none focus:border-brand-500"
              >
                <option value="small">Pequeño</option>
                <option value="medium" selected>Mediano</option>
                <option value="large">Grande</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tema</label>
              <select
                style={{ backgroundColor: "#101622", color: "#e2e8f0" }}
                className="w-full border border-dark-700 rounded px-3 py-2 text-xs focus:outline-none focus:border-brand-500"
              >
                <option value="dark">Oscuro (actual)</option>
                <option value="light">Claro</option>
              </select>
            </div>

            <div className="pt-4 border-t border-dark-700">
              <button
                onClick={() => setShowSettings(false)}
                className="w-full py-2 text-sm font-medium text-slate-300 bg-dark-800 hover:bg-dark-700 border border-dark-700 rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
