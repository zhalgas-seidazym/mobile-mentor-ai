export interface Module {
  id: string;
  title: string;
  metadata: string;
  description: string;
  questions: Question[];
  completed: boolean;
}

export interface Question {
  id: string;
  title: string;
  completed: boolean;
  correctAnswer?: string;
  userAnswer?: string;
}

export const SAMPLE_MODULES: Module[] = [
  {
    id: '1',
    title: 'Card title',
    metadata: 'Additional metadata',
    description: 'Copilot is an AI tool designed to improve productivity by integrating with Microsoft applications, offering content generation and task automation features.',
    completed: false,
    questions: [
      { id: '1-1', title: 'Question 1', completed: true },
      { id: '1-2', title: 'Question 1', completed: true },
      { id: '1-3', title: 'Question 1', completed: false },
      { id: '1-4', title: 'Question 1', completed: false },
      { id: '1-5', title: 'Question 1', completed: false },
    ],
  },
  {
    id: '2',
    title: 'Card title',
    metadata: 'Additional metadata',
    description: 'Copilot is an AI tool designed to improve productivity by integrating with Microsoft applications, offering content generation and task automation features.',
    completed: false,
    questions: [
      { id: '2-1', title: 'Question 1', completed: false },
      { id: '2-2', title: 'Question 1', completed: false },
    ],
  },
  {
    id: '3',
    title: 'Card title',
    metadata: 'Additional metadata',
    description: 'Copilot is an AI tool designed to improve productivity by integrating with Microsoft applications, offering content generation and task automation features.',
    completed: false,
    questions: [],
  },
  {
    id: '4',
    title: 'Card title',
    metadata: 'Additional metadata',
    description: 'Copilot is an AI tool designed to improve productivity by integrating with Microsoft applications, offering content generation and task automation features.',
    completed: false,
    questions: [],
  },
  {
    id: '5',
    title: 'Card title',
    metadata: 'Additional metadata',
    description: 'Copilot is an AI tool designed to improve productivity by integrating with Microsoft applications, offering content generation and task automation features.',
    completed: false,
    questions: [],
  },
];
