import React, { useState, useMemo } from "react";
import { Question } from "../types/quiz";
import { QuestionCard } from "./QuestionCard";
import { Search, Filter, X, Layers } from "lucide-react";

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
    selectedTags.length > 0;

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

        {/* Desplegables de filtros */}
        <div className="grid grid-cols-3 gap-2">
          <select
            value={selectedCourse}
            onChange={(e) => {
              setSelectedCourse(e.target.value);
              setSelectedTopic("all");
            }}
            className="bg-dark-900 border border-dark-700 text-slate-300 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:border-brand-500"
          >
            <option value="all">Todos los Cursos</option>
            {courses.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="bg-dark-900 border border-dark-700 text-slate-300 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:border-brand-500"
          >
            <option value="all">Todos los Temas</option>
            {topics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="bg-dark-900 border border-dark-700 text-slate-300 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:border-brand-500"
          >
            <option value="all">Dificultad</option>
            <option value="Fácil">Fácil</option>
            <option value="Media">Media</option>
            <option value="Difícil">Difícil</option>
          </select>
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
            Mostrando <strong>{filteredQuestions.length}</strong> de{" "}
            <strong>{questions.length}</strong> preguntas
          </span>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-brand-400 hover:underline flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Limpiar filtros
            </button>
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
          filteredQuestions.map((q) => (
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
