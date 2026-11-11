import React, { useState, useMemo } from "react";
import { Question } from "../types/quiz";
import { QuestionCard } from "./QuestionCard";
import { Search, Filter, X, Layers, ChevronDown } from "lucide-react";

interface BankPanelProps {
  questions: Question[];
  onAddToQuiz: (q: Question) => void;
  onEditQuestion: (q: Question) => void;
  onDeleteQuestion: (id: string) => void;
  quizQuestionIds: Set<string>;
}

export const BankPanel: React.FC<BankPanelProps> = ({
  questions,
  onAddToQuiz,
  onEditQuestion,
  onDeleteQuestion,
  quizQuestionIds,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState<number>(() => Math.min(50, questions.length));
  const [currentPage, setCurrentPage] = useState(1);

  // Listas únicas de cursos y temas para los filtros
  const courses = useMemo(() => {
    return Array.from(new Set(questions.map((q) => q.course))).filter(Boolean);
  }, [questions]);

  const topics = useMemo(() => {
    const list =
      selectedCourse === "all"
        ? questions.map((q) => q.topic)
        : questions.filter((q) => q.course === selectedCourse).map((q) => q.topic);
    return Array.from(new Set(list)).filter(Boolean);
  }, [questions, selectedCourse]);

  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    questions.forEach((q) => q.tags?.forEach((t) => tagsSet.add(t)));
    return Array.from(tagsSet);
  }, [questions]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      // Búsqueda por texto en enunciado y opciones
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesPrompt = q.prompt.toLowerCase().includes(term);
        const matchesOptions = q.options.some((opt) => opt.text.toLowerCase().includes(term));
        const matchesTags = q.tags.some((t) => t.toLowerCase().includes(term));
        if (!matchesPrompt && !matchesOptions && !matchesTags) return false;
      }

      // Filtro de Curso
      if (selectedCourse !== "all" && q.course !== selectedCourse) return false;

      // Filtro de Tema
      if (selectedTopic !== "all" && q.topic !== selectedTopic) return false;

      // Filtro de Dificultad
      if (selectedDifficulty !== "all" && q.difficulty !== selectedDifficulty) return false;

      // Filtro de Etiquetas
      if (selectedTags.length > 0) {
        const hasAllTags = selectedTags.every((t) => q.tags.includes(t));
        if (!hasAllTags) return false;
      }

      return true;
    });
  }, [questions, searchTerm, selectedCourse, selectedTopic, selectedDifficulty, selectedTags]);

  // Aplicar paginación después del filtrado
  const pagedQuestions = useMemo(() => {
    const total = questions.length;
    const page = pageSize >= total ? total : pageSize;
    const start = (currentPage - 1) * page;
    const end = start + page;
    return filteredQuestions.slice(start, end);
  }, [filteredQuestions, currentPage, pageSize, questions.length]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCourse("all");
    setSelectedTopic("all");
    setSelectedDifficulty("all");
    setSelectedTags([]);
  };

  const hasActiveFilters =
    searchTerm ||
    selectedCourse !== "all" ||
    selectedTopic !== "all" ||
    selectedDifficulty !== "all" ||
    selectedTags.length > 0 ||
    pageSize < questions.length;

  return (
    <div className="h-full flex flex-col bg-dark-900 border-r border-dark-750 overflow-hidden">
      {/* Barra de Búsqueda y Filtros */}
      <div className="p-3 bg-dark-850/70 border-b border-dark-750 space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por fórmula, enunciado, tema o etiqueta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-dark-900 border border-dark-700 focus:border-brand-500 rounded-lg pl-9 pr-8 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Desplegables de filtros con diseño moderno coherente */}
        <div className="grid grid-cols-3 gap-2">
          {/* Selector de Cursos */}
          <div className="relative">
            <select
              value={selectedCourse}
              onChange={(e) => {
                setSelectedCourse(e.target.value);
                setSelectedTopic("all");
              }}
              style={{ backgroundColor: "#101622", color: "#e2e8f0" }}
              className="w-full appearance-none bg-dark-850 hover:bg-dark-800 border border-dark-700 hover:border-dark-600 rounded-lg pl-2.5 pr-7 py-1.5 text-xs font-medium focus:outline-none focus:border-brand-500 transition-colors cursor-pointer truncate"
            >
              <option value="all" style={{ backgroundColor: "#101622", color: "#e2e8f0" }}>
                Todos los Cursos
              </option>
              {courses.map((c) => (
                <option key={c} value={c} style={{ backgroundColor: "#101622", color: "#e2e8f0" }}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Selector de Temas */}
          <div className="relative">
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              style={{ backgroundColor: "#101622", color: "#e2e8f0" }}
              className="w-full appearance-none bg-dark-850 hover:bg-dark-800 border border-dark-700 hover:border-dark-600 rounded-lg pl-2.5 pr-7 py-1.5 text-xs font-medium focus:outline-none focus:border-brand-500 transition-colors cursor-pointer truncate"
            >
              <option value="all" style={{ backgroundColor: "#101622", color: "#e2e8f0" }}>
                Todos los Temas
              </option>
              {topics.map((t) => (
                <option key={t} value={t} style={{ backgroundColor: "#101622", color: "#e2e8f0" }}>
                  {t}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Selector de Dificultad */}
          <div className="relative">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              style={{ backgroundColor: "#101622", color: "#e2e8f0" }}
              className="w-full appearance-none bg-dark-850 hover:bg-dark-800 border border-dark-700 hover:border-dark-600 rounded-lg pl-2.5 pr-7 py-1.5 text-xs font-medium focus:outline-none focus:border-brand-500 transition-colors cursor-pointer truncate"
            >
              <option value="all" style={{ backgroundColor: "#101622", color: "#e2e8f0" }}>
                Dificultad
              </option>
              <option value="Fácil" style={{ backgroundColor: "#101622", color: "#e2e8f0" }}>
                Fácil
              </option>
              <option value="Media" style={{ backgroundColor: "#101622", color: "#e2e8f0" }}>
                Media
              </option>
              <option value="Difícil" style={{ backgroundColor: "#101622", color: "#e2e8f0" }}>
                Difícil
              </option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Selector de Tamaño de Página */}
        <div className="relative">
          <select
            value={pageSize}
            onChange={(e) => {
              let newSize = parseInt(e.target.value, 10);
              if (e.target.value === "all") {
                newSize = questions.length;
              }
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            style={{ backgroundColor: "#101622", color: "#e2e8f0" }}
            className="w-full appearance-none bg-dark-850 hover:bg-dark-800 border border-dark-700 hover:border-dark-600 rounded-lg pl-2.5 pr-7 py-1.5 text-xs font-medium focus:outline-none focus:border-brand-500 transition-colors cursor-pointer truncate"
          >
            <option value={50} style={{ backgroundColor: "#101622", color: "#e2e8f0" }}>
              50 preguntas
            </option>
            <option value={25} style={{ backgroundColor: "#101622", color: "#e2e8f0" }}>
              25 preguntas
            </option>
            <option value={100} style={{ backgroundColor: "#101622", color: "#e2e8f0" }}>
              100 preguntas
            </option>
            <option value="all" style={{ backgroundColor: "#101622", color: "#e2e8f0" }}>
              Todas
            </option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Chips de Etiquetas seleccionables */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 max-h-16 overflow-y-auto pt-1">
            <span className="text-[10px] text-slate-500 flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" /> Tags:
            </span>
            {allTags.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${
                    active
                      ? "bg-brand-600 border-brand-500 text-white font-medium"
                      : "bg-dark-800 border-dark-700 text-slate-400 hover:text-slate-200 hover:border-dark-600"
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        )}

        {/* Contador y botón de limpiar */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span>
            Mostrando <strong>{pagedQuestions.length}</strong> de{" "}
            <strong>{filteredQuestions.length}</strong> preguntas{questions.length > pageSize && (
              <>
                {currentPage} de {Math.ceil(filteredQuestions.length / pageSize)}
              </>
            )}
          </span>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-brand-400 hover:underline flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Limpiar filtros
            </button>
          )}

          {/* Navegación de Páginas */}
          {questions.length > pageSize && (
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 text-xs text-slate-300 bg-dark-800 border border-dark-700 rounded hover:bg-dark-750"
                title="Página anterior"
              >
                ← Anterior
              </button>
              <span className="text-xs text-slate-400">
                Página {currentPage}{" "}
                {questions.length > pageSize && (
                  <strong>
                    de {Math.ceil(filteredQuestions.length / pageSize)}
                  </strong>
                )}
              </span>
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage >= Math.ceil(filteredQuestions.length / pageSize) || filteredQuestions.length === 0}
                className="px-2 py-1 text-xs text-slate-300 bg-dark-800 border border-dark-700 rounded hover:bg-dark-750"
                title="Siguiente página"
              >
                Siguiente →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Lista scrolleable de Celdas del Banco */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {filteredQuestions.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <Layers className="w-10 h-10 mb-2 stroke-1 opacity-50" />
            <p className="text-sm font-medium text-slate-400">No se encontraron preguntas</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Prueba cambiando o limpiando los filtros o añade una nueva pregunta al banco.
            </p>
          </div>
        ) : (
          pagedQuestions.map((q) => (
            <QuestionCard
              key={q.id}
              question={q}
              isSelectedInQuiz={quizQuestionIds.has(q.id)}
              onAddToQuiz={() => onAddToQuiz(q)}
              onEdit={() => onEditQuestion(q)}
              onDelete={() => onDeleteQuestion(q.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};
