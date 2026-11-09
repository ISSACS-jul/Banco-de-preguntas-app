import { Question } from "../types/quiz";

export const initialQuestions: Question[] = [
  {
    id: "q-fis-001",
    type: "multiple_choice",
    course: "Física 10°",
    topic: "Cinemática",
    subtopic: "MRUV",
    difficulty: "Media",
    tags: ["aceleración", "MRUV", "gráficas"],
    prompt:
      "Un móvil que parte del reposo acelera de manera constante a razón de $a = 2\\,\\text{m/s}^2$ durante $t = 5\\,\\text{s}$.\n\n¿Cuál es la distancia total recorrida por el móvil?\n\nRecuerde la ecuación de cinemática:\n$$d = v_0 t + \\frac{1}{2} a t^2$$",
    options: [
      { id: "a", text: "$10\\,\\text{m}$", isCorrect: false },
      { id: "b", text: "$25\\,\\text{m}$", isCorrect: true },
      { id: "c", text: "$50\\,\\text{m}$", isCorrect: false },
      { id: "d", text: "$5\\,\\text{m}$", isCorrect: false },
    ],
    explanation:
      "Dado que parte del reposo, $v_0 = 0$. Por lo tanto: $d = \\frac{1}{2}(2\\,\\text{m/s}^2)(5\\,\\text{s})^2 = 25\\,\\text{m}$.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "q-mat-002",
    type: "multiple_choice",
    course: "Matemáticas 11°",
    topic: "Cálculo Diferencial",
    subtopic: "Derivadas",
    difficulty: "Media",
    tags: ["derivadas", "regla-de-la-cadena", "trigonométricas"],
    prompt:
      "Dada la función $f(x) = \\sin(3x^2 + 1)$, determine la primera derivada $f'(x)$ aplicando la regla de la cadena:\n$$\\frac{d}{dx}[\\sin(u)] = \\cos(u) \\cdot \\frac{du}{dx}$$",
    options: [
      { id: "a", text: "$6x \\cos(3x^2 + 1)$", isCorrect: true },
      { id: "b", text: "$\\cos(6x)$", isCorrect: false },
      { id: "c", text: "$6x \\sin(3x^2 + 1)$", isCorrect: false },
      { id: "d", text: "$-6x \\cos(3x^2 + 1)$", isCorrect: false },
    ],
    explanation:
      "Sea $u = 3x^2 + 1$, su derivada es $u' = 6x$. Aplicando la regla de la cadena: $f'(x) = \\cos(3x^2 + 1) \\cdot 6x = 6x\\cos(3x^2 + 1)$.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "q-fis-003",
    type: "open",
    course: "Física 10°",
    topic: "Dinámica",
    subtopic: "Leyes de Newton",
    difficulty: "Media",
    tags: ["newton", "diagrama-cuerpo-libre", "fuerzas"],
    prompt:
      "Un bloque de masa $m = 5\\,\\text{kg}$ se encuentra sobre un plano inclinado $\\theta = 30^\\circ$ respecto a la horizontal. El coeficiente de fricción cinético entre el bloque y la superficie es $\\mu_k = 0.2$.\n\nDibuje el **diagrama de cuerpo libre** del bloque y deduzca la ecuación de la aceleración $a$ hacia abajo del plano inclinado considerando $g = 9.8\\,\\text{m/s}^2$.",
    options: [],
    openResponseHeight: 4.5,
    explanation:
      "1. Diagrama de cuerpo libre: peso descompuesto ($mg\\sin\\theta$, $mg\\cos\\theta$), normal $N = mg\\cos\\theta$, fricción $f_k = \\mu_k N$.\n2. Sumatoria de fuerzas: $mg\\sin\\theta - \\mu_k mg\\cos\\theta = ma$.\n3. Aceleración: $a = g(\\sin\\theta - \\mu_k\\cos\\theta) = 9.8(0.5 - 0.2 \\cdot 0.866) \\approx 3.20\\,\\text{m/s}^2$.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "q-mat-004",
    type: "open",
    course: "Matemáticas 11°",
    topic: "Cálculo Integral",
    subtopic: "Áreas entre curvas",
    difficulty: "Difícil",
    tags: ["integrales", "área", "cálculo"],
    prompt:
      "Calcule el área acotada entre la parábola $y = x^2$ y la recta $y = 2x$. Presente el planteamiento de los límites de integración y el cálculo paso a paso utilizando el Teorema Fundamental del Cálculo:\n$$A = \\int_{a}^{b} [f(x) - g(x)]\\,dx$$",
    options: [],
    openResponseHeight: 4.0,
    explanation:
      "1. Puntos de intersección: $x^2 = 2x \\implies x(x - 2) = 0 \\implies a = 0, b = 2$.\n2. Integral: $A = \\int_{0}^{2} (2x - x^2)\\,dx = \\left[ x^2 - \\frac{x^3}{3} \\right]_0^2 = 4 - \\frac{8}{3} = \\frac{4}{3}\\,\\text{u}^2$.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "q-mat-005",
    type: "multiple_choice",
    course: "Matemáticas 11°",
    topic: "Álgebra",
    subtopic: "Ecuaciones Cuadráticas",
    difficulty: "Fácil",
    tags: ["álgebra", "discriminante"],
    prompt:
      "¿Cuál es el valor del discriminante $\\Delta = b^2 - 4ac$ para la ecuación $x^2 - 6x + 9 = 0$?",
    options: [
      { id: "a", text: "$\\Delta = 0$", isCorrect: true },
      { id: "b", text: "$\\Delta = 36$", isCorrect: false },
      { id: "c", text: "$\\Delta = -36$", isCorrect: false },
      { id: "d", text: "$\\Delta = 18$", isCorrect: false },
    ],
    explanation: "$\\Delta = (-6)^2 - 4(1)(9) = 36 - 36 = 0$. Tiene una única solución real doble.",
    createdAt: new Date().toISOString(),
  },
];
