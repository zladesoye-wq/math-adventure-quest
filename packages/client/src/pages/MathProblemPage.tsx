import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProblem, useSubmitAnswer } from '../hooks/useStudentData';
import { LoadingSpinner, ErrorDisplay } from '../hooks/useApi';
import MathProblemUI from '../components/game/MathProblem';
import ProgressBar from '../components/common/ProgressBar';
import Button from '../components/common/Button';
import type { MathProblem } from '../types';

// Fallback problems if API is not available
const FALLBACK_PROBLEMS: MathProblem[] = [
  { id: 'p1', operation: 'addition', operandA: 12, operandB: 8, answer: 20, displayText: '12 + 8 = ?', difficulty: 'easy', hints: ['Try counting on your fingers!', '12 + 8 is the same as 12 + 10 - 2'] },
  { id: 'p2', operation: 'addition', operandA: 25, operandB: 17, answer: 42, displayText: '25 + 17 = ?', difficulty: 'medium', hints: ['Break it down: 25 + 10 = 35, then + 7', 'Or try 20 + 17 = 37, then + 5'] },
  { id: 'p3', operation: 'addition', operandA: 45, operandB: 38, answer: 83, displayText: '45 + 38 = ?', difficulty: 'medium', hints: ['40 + 30 = 70, then 5 + 8 = 13', '70 + 13 = ?'], options: [73, 83, 93, 103] },
  { id: 'p4', operation: 'subtraction', operandA: 50, operandB: 23, answer: 27, displayText: '50 - 23 = ?', difficulty: 'medium', hints: ['50 - 20 = 30, then - 3', 'Or count backwards from 50'], options: [27, 33, 37, 23] },
  { id: 'p5', operation: 'addition', operandA: 100, operandB: 99, answer: 199, displayText: '100 + 99 = ?', difficulty: 'hard', hints: ['100 + 100 = 200, then subtract 1', 'Think about what is one less than 200'], options: [189, 199, 1999, 109] },
];

export default function MathProblemPage() {
  const { worldId, levelId: _levelId } = useParams<{ worldId: string; levelId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const studentId = user?.role === 'student' ? user.id : undefined;

  const { problem, loading: problemLoading, error: problemError, refetch: refetchProblem } = useProblem(studentId, worldId, _levelId);
  const { submit } = useSubmitAnswer();

  const [problemQueue, setProblemQueue] = useState<MathProblem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [streak, setStreak] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [score, setScore] = useState(0);
  const [problemsDone, setProblemsDone] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);

  // Initialize problem queue from API or fallback
  useEffect(() => {
    if (problem && !problemQueue.length) {
      setProblemQueue([problem, ...FALLBACK_PROBLEMS.slice(1)]);
    } else if (!problemLoading && !problem && FALLBACK_PROBLEMS.length > 0 && !problemQueue.length) {
      setProblemQueue(FALLBACK_PROBLEMS);
    }
  }, [problem, problemLoading, problemQueue.length]);

  const currentProblem = problemQueue[currentIndex] || problemQueue[0];

  const handleAnswer = useCallback(async (answer: number, timeTaken: number) => {
    if (!currentProblem) return;

    const correct = answer === currentProblem.answer;
    if (correct) {
      setStreak((prev) => prev + 1);
      setScore((prev) => prev + (3 - hintsUsed) * 10 + Math.max(0, Math.floor((30 - timeTaken / 1000) * 2)));
    } else {
      setStreak(0);
    }
    setProblemsDone((prev) => prev + 1);
    setHintsUsed(0);

    // Submit answer to API if student is logged in
    if (studentId) {
      submit(studentId, {
        problemId: currentProblem.id,
        answerGiven: answer,
        timeTaken,
        hintsUsed,
      });
    }

    // Advance after 5 problems or show completion
    if (problemsDone >= 4 || currentIndex >= problemQueue.length - 1) {
      setTimeout(() => setShowCompletion(true), 500);
    } else {
      setTimeout(() => setCurrentIndex((prev) => prev + 1), 500);
    }
  }, [currentProblem, hintsUsed, problemsDone, currentIndex, problemQueue.length, studentId, submit]);

  const handleUseHint = useCallback(() => {
    setHintsUsed((prev) => prev + 1);
  }, []);

  const handleRetry = () => {
    setCurrentIndex(0);
    setStreak(0);
    setHintsUsed(0);
    setScore(0);
    setProblemsDone(0);
    setShowCompletion(false);
    if (studentId && worldId && _levelId) {
      refetchProblem();
    }
    setProblemQueue([]);
  };

  if ((problemLoading && !problem && problemQueue.length === 0) || (!currentProblem && problemLoading)) {
    return <LoadingSpinner message="Getting your problem ready..." />;
  }

  if (problemError && !problem && problemQueue.length === 0) {
    return <ErrorDisplay message={problemError} onRetry={refetchProblem} />;
  }

  if (!currentProblem) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <div className="text-6xl mb-4">🧮</div>
        <h2 className="text-2xl font-display font-bold text-gray-800 mb-2">No Problems Available</h2>
        <p className="text-gray-500 mb-4">Check back later for new challenges!</p>
        <Button variant="primary" onClick={() => navigate(`/world/${worldId}`)}>Back to World</Button>
      </div>
    );
  }

  if (showCompletion) {
    const starsEarned = score >= 150 ? 3 : score >= 80 ? 2 : 1;
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="text-7xl mb-6 animate-bounce-in">🎉</div>
          <h2 className="text-3xl font-display font-bold text-gray-800 mb-2">Level Complete!</h2>
          <p className="text-gray-500 mb-6">Great job, math explorer!</p>

          <div className="kid-card mb-6">
            <div className="text-4xl mb-4">
              {[1, 2, 3].map((s) => (
                <span key={s} className={`inline-block mx-1 animate-star-pop ${s <= starsEarned ? '' : 'opacity-20'}`} style={{ animationDelay: `${s * 0.3}s` }}>
                  ⭐
                </span>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-display font-bold text-gray-800">{score}</div>
                <div className="text-xs text-gray-500">Score</div>
              </div>
              <div>
                <div className="text-2xl font-display font-bold text-energy-500">+{score}</div>
                <div className="text-xs text-gray-500">XP Earned</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="primary" icon="🔁" onClick={handleRetry}>Play Again</Button>
            <Button variant="outline" icon="🗺️" onClick={() => navigate(`/world/${worldId}`)}>Back to World</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Progress header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(`/world/${worldId}`)} className="text-gray-400 hover:text-gray-600">
          ← Back
        </button>
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-gray-500">Problem {problemsDone + 1}/5</span>
          <ProgressBar value={problemsDone} max={5} size="sm" color="secondary" className="w-24" />
        </div>
      </div>

      {/* Math Problem */}
      <MathProblemUI
        problem={currentProblem}
        onAnswer={handleAnswer}
        onUseHint={handleUseHint}
        hints={currentProblem.hints}
        hintsUsed={hintsUsed}
        streak={streak}
      />
    </div>
  );
}