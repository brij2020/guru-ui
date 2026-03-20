describe('Data Validation Utilities', () => {
  const isValidSection = (section: { label?: string; count?: number; topics?: string[] }) => {
    if (!section.label || typeof section.label !== 'string') return false;
    if (section.count !== undefined && (typeof section.count !== 'number' || section.count < 0)) return false;
    if (section.topics !== undefined && !Array.isArray(section.topics)) return false;
    return true;
  };

  const isValidStage = (stage: { slug?: string; name?: string; totalMarks?: number }) => {
    if (!stage.slug || typeof stage.slug !== 'string') return false;
    if (!stage.name || typeof stage.name !== 'string') return false;
    if (stage.totalMarks !== undefined && (typeof stage.totalMarks !== 'number' || stage.totalMarks < 0)) return false;
    return true;
  };

  const isValidBlueprint = (bp: {
    examSlug?: string;
    stageSlug?: string;
    sections?: Array<{ label?: string; count?: number }>;
    totalQuestions?: number;
  }) => {
    if (!bp.examSlug || typeof bp.examSlug !== 'string') return false;
    if (!bp.stageSlug || typeof bp.stageSlug !== 'string') return false;
    if (!Array.isArray(bp.sections) || bp.sections.length === 0) return false;
    if (bp.totalQuestions !== undefined && (typeof bp.totalQuestions !== 'number' || bp.totalQuestions < 0)) return false;
    return bp.sections.every((s) => isValidSection(s));
  };

  const isValidQuestion = (q: {
    examSlug?: string;
    stageSlug?: string;
    section?: string;
    topic?: string;
    question?: string;
    options?: string[];
    answer?: string;
  }) => {
    if (!q.examSlug || !q.stageSlug) return false;
    if (!q.section || !q.topic) return false;
    if (!q.question || q.question.trim().length === 0) return false;
    if (!Array.isArray(q.options) || q.options.length < 2) return false;
    if (!q.answer) return false;
    return true;
  };

  describe('Section validation', () => {
    it('accepts valid section with all fields', () => {
      const section = {
        key: 'section-1',
        label: 'General Awareness',
        count: 25,
        topics: ['history', 'geography', 'polity'],
      };
      expect(isValidSection(section)).toBe(true);
    });

    it('accepts section with empty topics array', () => {
      const section = {
        key: 'section-2',
        label: 'English',
        count: 25,
        topics: [],
      };
      expect(isValidSection(section)).toBe(true);
    });

    it('accepts section without optional count', () => {
      const section = {
        key: 'section-3',
        label: 'Math',
      };
      expect(isValidSection(section)).toBe(true);
    });

    it('accepts section without topics', () => {
      const section = {
        key: 'section-4',
        label: 'Reasoning',
        count: 50,
      };
      expect(isValidSection(section)).toBe(true);
    });

    it('rejects section with missing label', () => {
      const section = {
        key: 'section-5',
        count: 25,
      };
      expect(isValidSection(section)).toBe(false);
    });

    it('rejects section with empty label', () => {
      const section = {
        key: 'section-6',
        label: '',
        count: 25,
      };
      expect(isValidSection(section)).toBe(false);
    });

    it('rejects section with negative count', () => {
      const section = {
        key: 'section-7',
        label: 'Test',
        count: -10,
      };
      expect(isValidSection(section)).toBe(false);
    });

    it('rejects section with invalid topics type', () => {
      const section = {
        key: 'section-8',
        label: 'Test',
        topics: 'not-an-array' as unknown as string[],
      };
      expect(isValidSection(section)).toBe(false);
    });

    it('handles null/undefined values gracefully', () => {
      expect(isValidSection({})).toBe(false);
      expect(isValidSection({ label: null as unknown as string })).toBe(false);
      expect(isValidSection({ label: undefined as unknown as string })).toBe(false);
    });
  });

  describe('Exam stage validation', () => {
    it('accepts valid stage with all fields', () => {
      const stage = {
        slug: 'tier-1',
        name: 'Tier 1',
        durationMinutes: 60,
        questionCount: 100,
        totalMarks: 200,
      };
      expect(isValidStage(stage)).toBe(true);
    });

    it('accepts stage without optional totalMarks', () => {
      const stage = {
        slug: 'prelims',
        name: 'Preliminary',
      };
      expect(isValidStage(stage)).toBe(true);
    });

    it('rejects stage with missing slug', () => {
      const stage = {
        name: 'Test Stage',
      };
      expect(isValidStage(stage)).toBe(false);
    });

    it('rejects stage with negative totalMarks', () => {
      const stage = {
        slug: 'test',
        name: 'Test',
        totalMarks: -50,
      };
      expect(isValidStage(stage)).toBe(false);
    });
  });

  describe('Blueprint validation', () => {
    it('accepts valid blueprint', () => {
      const blueprint = {
        examSlug: 'ssc-cgl',
        stageSlug: 'tier-1',
        totalQuestions: 100,
        sections: [
          { label: 'Reasoning', count: 25 },
          { label: 'English', count: 25 },
          { label: 'Math', count: 25 },
          { label: 'GA', count: 25 },
        ],
      };
      expect(isValidBlueprint(blueprint)).toBe(true);
    });

    it('accepts blueprint with sections having empty topics', () => {
      const blueprint = {
        examSlug: 'upsc-cse',
        stageSlug: 'prelims',
        sections: [
          { label: 'GS 1', count: 100 },
          { label: 'CSAT', count: 80 },
        ],
      };
      expect(isValidBlueprint(blueprint)).toBe(true);
    });

    it('rejects blueprint with missing examSlug', () => {
      const blueprint = {
        stageSlug: 'tier-1',
        sections: [{ label: 'Test', count: 10 }],
      };
      expect(isValidBlueprint(blueprint)).toBe(false);
    });

    it('rejects blueprint with empty sections array', () => {
      const blueprint = {
        examSlug: 'test',
        stageSlug: 'stage-1',
        sections: [],
      };
      expect(isValidBlueprint(blueprint)).toBe(false);
    });

    it('rejects blueprint with invalid totalQuestions', () => {
      const blueprint = {
        examSlug: 'test',
        stageSlug: 'stage-1',
        totalQuestions: -10,
        sections: [{ label: 'Test', count: 10 }],
      };
      expect(isValidBlueprint(blueprint)).toBe(false);
    });
  });

  describe('Question form data validation', () => {
    it('accepts valid question with all required fields', () => {
      const question = {
        examSlug: 'ssc-cgl',
        stageSlug: 'tier-1',
        section: 'general-awareness',
        topic: 'history',
        question: 'What is the capital of India?',
        options: ['Mumbai', 'Delhi', 'Kolkata', 'Chennai'],
        answer: 'Delhi',
      };
      expect(isValidQuestion(question)).toBe(true);
    });

    it('accepts question with empty topics in blueprint', () => {
      const question = {
        examSlug: 'upsc-cse',
        stageSlug: 'prelims',
        section: 'csat',
        topic: 'reasoning',
        question: 'Find the odd one out',
        options: ['A', 'B', 'C', 'D'],
        answer: 'D',
      };
      expect(isValidQuestion(question)).toBe(true);
    });

    it('rejects question with missing examSlug', () => {
      const question = {
        stageSlug: 'tier-1',
        section: 'test',
        topic: 'test',
        question: 'Test?',
        options: ['A', 'B'],
        answer: 'A',
      };
      expect(isValidQuestion(question)).toBe(false);
    });

    it('rejects question with empty question text', () => {
      const question = {
        examSlug: 'test',
        stageSlug: 'stage-1',
        section: 'test',
        topic: 'test',
        question: '   ',
        options: ['A', 'B'],
        answer: 'A',
      };
      expect(isValidQuestion(question)).toBe(false);
    });

    it('rejects question with fewer than 2 options', () => {
      const question = {
        examSlug: 'test',
        stageSlug: 'stage-1',
        section: 'test',
        topic: 'test',
        question: 'Test?',
        options: ['Only One'],
        answer: 'Only One',
      };
      expect(isValidQuestion(question)).toBe(false);
    });
  });
});
