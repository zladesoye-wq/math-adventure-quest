import { calculateNewMastery, recommendQuestionDifficulty } from '../services/adaptiveEngine';

describe('Adaptive Learning Engine', () => {
  describe('calculateNewMastery', () => {
    it('should increase mastery when answer is correct', () => {
      const currentMastery = 0.5;
      const newMastery = calculateNewMastery(currentMastery, true, 3);
      expect(newMastery).toBeGreaterThan(currentMastery);
    });

    it('should decrease mastery when answer is incorrect', () => {
      const currentMastery = 0.5;
      const newMastery = calculateNewMastery(currentMastery, false, 3);
      expect(newMastery).toBeLessThan(currentMastery);
    });

    it('should clamp mastery between 0 and 1', () => {
      expect(calculateNewMastery(0.95, true, 5)).toBeLessThanOrEqual(1.0);
      expect(calculateNewMastery(0.05, false, 1)).toBeGreaterThanOrEqual(0.0);
    });

    it('should reward harder questions more when correct', () => {
      const m1 = calculateNewMastery(0.5, true, 5); // Hard
      const m2 = calculateNewMastery(0.5, true, 1); // Easy
      expect(m1).toBeGreaterThan(m2);
    });
  });

  describe('recommendQuestionDifficulty', () => {
    it('should recommend higher difficulty for higher mastery', () => {
      expect(recommendQuestionDifficulty(0.9)).toBe(5);
      expect(recommendQuestionDifficulty(0.7)).toBe(4);
      expect(recommendQuestionDifficulty(0.5)).toBe(3);
      expect(recommendQuestionDifficulty(0.3)).toBe(2);
      expect(recommendQuestionDifficulty(0.1)).toBe(1);
    });
  });
});
