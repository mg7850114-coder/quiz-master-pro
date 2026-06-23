export type Question = {
  q: string;
  options: string[];
  answer: number; // index 0-3
};

export const QUESTIONS: Question[] = [
  { q: "Which language runs in a web browser?", options: ["Java", "C", "Python", "JavaScript"], answer: 3 },
  { q: "What does HTML stand for?", options: ["HyperText Markup Language", "HighText Machine Language", "HyperTabular Markup", "None"], answer: 0 },
  { q: "What does CSS stand for?", options: ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style System", "Colorful Style Sheets"], answer: 1 },
  { q: "Which tag is used for the largest heading in HTML?", options: ["<h6>", "<head>", "<h1>", "<heading>"], answer: 2 },
  { q: "Inside which HTML element do we put the JavaScript?", options: ["<js>", "<javascript>", "<scripting>", "<script>"], answer: 3 },
  { q: "Which property changes text color in CSS?", options: ["font-color", "text-style", "color", "fgcolor"], answer: 2 },
  { q: "Which is NOT a JavaScript framework?", options: ["React", "Angular", "Vue", "Laravel"], answer: 3 },
  { q: "Which symbol is used for comments in JavaScript?", options: ["#", "//", "<!-- -->", "**"], answer: 1 },
  { q: "Which HTTP method is used to send data to a server?", options: ["GET", "POST", "READ", "FETCH"], answer: 1 },
  { q: "What does API stand for?", options: ["Applied Programming Index", "Application Programming Interface", "Automated Process Integration", "Active Page Interface"], answer: 1 },
  { q: "Which company developed React?", options: ["Google", "Microsoft", "Facebook (Meta)", "Twitter"], answer: 2 },
  { q: "Which database is NoSQL?", options: ["MySQL", "PostgreSQL", "MongoDB", "SQLite"], answer: 2 },
  { q: "Which is a version control system?", options: ["Docker", "Git", "NPM", "Webpack"], answer: 1 },
  { q: "What does SQL stand for?", options: ["Structured Query Language", "Simple Question Language", "Strong Query Logic", "Server Quick Link"], answer: 0 },
  { q: "Which CSS unit is relative to the root font size?", options: ["px", "em", "rem", "vh"], answer: 2 },
  { q: "Which method converts JSON text to a JS object?", options: ["JSON.parse()", "JSON.stringify()", "JSON.toObject()", "JSON.read()"], answer: 0 },
  { q: "Which is used for state management in React?", options: ["useState", "useFetch", "useDOM", "useStyle"], answer: 0 },
  { q: "Which port is default for HTTPS?", options: ["80", "21", "8080", "443"], answer: 3 },
  { q: "Which one is a backend runtime for JavaScript?", options: ["Node.js", "Bootstrap", "Tailwind", "jQuery"], answer: 0 },
  { q: "What does DOM stand for?", options: ["Document Object Model", "Data Object Map", "Display Order Mode", "Digital Output Model"], answer: 0 },
];

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildShuffledQuiz(): Question[] {
  return shuffle(QUESTIONS).map((item) => {
    const indices = shuffle([0, 1, 2, 3]);
    const newOptions = indices.map((i) => item.options[i]);
    const newAnswer = indices.indexOf(item.answer);
    return { q: item.q, options: newOptions, answer: newAnswer };
  });
}