type PromptInput = {
  examName: string;
  stageName: string;
  goalName: string;
  planName: string;
  struggleFocus?: string;
  questionStyles: string[];
  durationMinutes: number;
  questionCount: number;
  alignmentTarget: number;
  negativeMarking: string;
  language: "English" | "Hindi";
  currentAffairsMonths: 3 | 6 | 12;
};

type PromptContextInput = Omit<PromptInput, "alignmentTarget" | "negativeMarking" | "language" | "currentAffairsMonths"> & {
  currentAffairsMonths?: 3 | 6 | 12;
};

export const FULL_COVERAGE_GOV_STYLES = [
  "Reading Comprehension",
  "Cloze Test",
  "Fill in the blanks",
  "Error Detection",
  "Para Jumbles",
  "Data Interpretation",
  "Puzzle / Seating Arrangement",
  "Coding Decoding",
  "Syllogism",
  "Statement based MCQ",
  "Assertion Reason",
  "Mathematical Word Problems",
];

const buildQuestionTypeTargetMix = (styles: string[], questionCount: number) => {
  const cleaned = (Array.isArray(styles) ? styles : [])
    .map((item) => String(item || "").trim())
    .filter(Boolean);
  const targets = cleaned.length > 0 ? cleaned : FULL_COVERAGE_GOV_STYLES;
  const total = Math.max(1, Number(questionCount || 0));
  const base = Math.floor(total / targets.length);
  let rem = total % targets.length;
  return targets.map((style) => {
    const count = base + (rem > 0 ? 1 : 0);
    if (rem > 0) rem -= 1;
    return `${style}: ${count}`;
  });
};

export const buildGovExamPrompt = (input: PromptInput) => {
  const questionTypeTargets = buildQuestionTypeTargetMix(input.questionStyles, input.questionCount);
  return [
    "You are an expert Government Exam Mock Designer.",
    "",
    "Objective:",
    `Generate a highly realistic ${input.examName} (${input.stageName}) mock test for ${input.goalName}.`,
    `Target exam-pattern alignment: ${input.alignmentTarget}% (acceptable range 70%-90%).`,
    "",
    "Configuration:",
    `- Plan type: ${input.planName}`,
    `- Main struggle focus: ${input.struggleFocus || "Not specified"}`,
    `- Preferred question styles: ${input.questionStyles.length ? input.questionStyles.join(", ") : "Standard MCQ mix"}`,
    `- Question-type target mix: ${questionTypeTargets.join(" | ")}`,
    `- Duration: ${input.durationMinutes} minutes`,
    `- Total questions: ${input.questionCount}`,
    `- Negative marking rule: ${input.negativeMarking}`,
    `- Output language: ${input.language}`,
    `- Current affairs relevance window: last ${input.currentAffairsMonths} months`,
    "",
    "Design Rules:",
    "- Match real exam style: section order, section weights, question tone, and pacing.",
    "- Mix easy/medium/hard in a practical distribution suitable for target aspirants.",
    "- Include trap options similar to real gov exams but avoid ambiguous answers.",
    "- Include at least 20% questions testing elimination strategy and time pressure.",
    "- Ensure options are balanced in length and plausible.",
    "- Add section-wise estimated time and safe-attempt recommendation.",
    "- Respect question-type target mix with +/-1 variance per type.",
    "",
    "Output Format (strict JSON):",
    "{",
    '  "exam": "string",',
    '  "stage": "string",',
    '  "alignment_estimate": "number (70-90)",',
    '  "total_duration_minutes": "number",',
    '  "total_questions": "number",',
    '  "section_plan": [',
    '    { "section": "string", "question_count": "number", "time_minutes": "number", "difficulty_mix": "string" }',
    "  ],",
    '  "attempt_strategy": {',
    '    "round_1": "string",',
    '    "round_2": "string",',
    '    "round_3": "string"',
    "  },",
    '  "questions": [',
    '    {',
    '      "id": "string",',
    '      "section": "string",',
    '      "question": "string",',
    '      "options": ["A", "B", "C", "D"],',
    '      "correct_option": "A|B|C|D",',
    '      "difficulty": "easy|medium|hard",',
    '      "explanation": "string"',
    "    }",
    "  ],",
    '  "post_test_feedback_prompts": ["string", "string", "string"]',
    "}",
    "",
    "Quality check before final response:",
    "- If alignment_estimate is below 70, revise pattern and section distribution.",
    "- If alignment_estimate is above 90, reduce overfitting and keep realistic variance.",
  ].join("\n");
};

export const buildGovExamPromptContext = (input: PromptContextInput) => {
  const questionTypeTargets = buildQuestionTypeTargetMix(input.questionStyles, input.questionCount);
  const focus = input.struggleFocus ? `Focus area: ${input.struggleFocus}.` : "Focus area: balanced performance.";

  return [
    `Create a realistic ${input.examName} (${input.stageName}) mock for ${input.goalName}.`,
    `Plan: ${input.planName}.`,
    focus,
    `Generate exactly ${input.questionCount} single-correct MCQs to fit ${input.durationMinutes} minutes.`,
    `Question-type target mix: ${questionTypeTargets.join(" | ")}.`,
    "Keep stems concise, options plausible, and explanations short.",
    "Prioritize elimination-based traps and real exam pacing.",
    `Current affairs relevance: last ${input.currentAffairsMonths || 6} months.`,
  ].join(" ");
};
