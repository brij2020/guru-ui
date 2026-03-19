import { API_ENDPOINTS } from '../../src/lib/apiConfig';

describe('API Config', () => {
  describe('API_ENDPOINTS', () => {
    it('should have exams endpoints', () => {
      expect(API_ENDPOINTS.exams).toBeDefined();
      expect(API_ENDPOINTS.exams.list).toBe('/api/v1/exams');
      expect(API_ENDPOINTS.exams.create).toBe('/api/v1/exams');
    });

    it('should have paperBlueprints endpoint', () => {
      expect(API_ENDPOINTS.paperBlueprints).toBeDefined();
      expect(API_ENDPOINTS.paperBlueprints.get).toBe('/api/v1/paper-blueprints');
      expect(API_ENDPOINTS.paperBlueprints.upsert).toBe('/api/v1/paper-blueprints');
    });

    it('should have questionBank endpoint', () => {
      expect(API_ENDPOINTS.questionBank).toBeDefined();
      expect(API_ENDPOINTS.questionBank.assemblePaper).toBe('/api/v1/question-bank/assemble-paper');
      expect(API_ENDPOINTS.questionBank.coverage).toBe('/api/v1/question-bank/coverage');
      expect(API_ENDPOINTS.questionBank.similar).toBe('/api/v1/question-bank/similar');
      expect(API_ENDPOINTS.questionBank.reviewStatus).toBe('/api/v1/question-bank/review-status');
      expect(API_ENDPOINTS.questionBank.reviewList).toBe('/api/v1/question-bank/review-list');
    });

    it('should have examHierarchy endpoint', () => {
      expect(API_ENDPOINTS.examHierarchy).toBeDefined();
      expect(API_ENDPOINTS.examHierarchy.get).toBe('/api/v1/exam-hierarchy');
      expect(API_ENDPOINTS.examHierarchy.upsert).toBe('/api/v1/exam-hierarchy');
    });

    it('should have auth endpoints', () => {
      expect(API_ENDPOINTS.auth).toBeDefined();
      expect(API_ENDPOINTS.auth.register).toBe('/api/v1/auth/register');
      expect(API_ENDPOINTS.auth.login).toBe('/api/v1/auth/login');
      expect(API_ENDPOINTS.auth.logout).toBe('/api/v1/auth/logout');
    });

    it('should have categories endpoint', () => {
      expect(API_ENDPOINTS.categories).toBeDefined();
      expect(API_ENDPOINTS.categories.list).toBe('/api/v1/categories');
      expect(API_ENDPOINTS.categories.create).toBe('/api/v1/categories');
    });

    it('should have topics endpoint', () => {
      expect(API_ENDPOINTS.topics).toBeDefined();
      expect(API_ENDPOINTS.topics.list).toBe('/api/v1/topics');
      expect(API_ENDPOINTS.topics.create).toBe('/api/v1/topics');
    });
  });
});
