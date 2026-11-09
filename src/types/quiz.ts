export type QuestionType = "multiple_choice" | "open";

export interface Option {
  id: string; // ej: "a", "b", "c", "d"
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  type: QuestionType; // "multiple_choice" o "open"
  course: string; // ej: "Física 10°", "Matemáticas 11°"
  topic: string; // ej: "Cinemática", "Cálculo Diferencial"
  subtopic?: string; // ej: "MRUV", "Derivadas"
  difficulty: "Fácil" | "Media" | "Difícil";
  tags: string[]; // ej: ["aceleración", "parcial-1"]
  prompt: string; // Enunciado en Markdown + LaTeX
  options: Option[]; // Solo para opción múltiple
  openResponseHeight?: number; // Altura en cm del cuadro de respuesta para abierta (ej: 3.5, 4.0)
  explanation?: string; // Solución / rúbrica / justificación
  createdAt: string;
}

export interface QuizHeader {
  institution: string;
  course: string;
  title: string;
  teacher: string;
  date: string;
  instructions: string;
  showAnswerSheet: boolean; // Mostrar u ocultar hoja de burbujas
}

export interface QuizItem {
  instanceId: string;
  question: Question;
  points: number;
}

export interface Quiz {
  id: string;
  header: QuizHeader;
  items: QuizItem[];
}
