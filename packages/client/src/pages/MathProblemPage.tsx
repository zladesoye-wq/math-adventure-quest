import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSubmitAnswer } from '../hooks/useStudentData';
import MathProblemUI from '../components/game/MathProblem';
import ProgressBar from '../components/common/ProgressBar';
import Button from '../components/common/Button';
import type { MathProblem, MathOperation } from '../types';

// ── World ID → Operation mapping ─────────────────────────────────────────────
// Hardcoded UUIDs from the database so we don't need to wait for useWorld to load.
const WORLD_OPERATIONS: Record<string, MathOperation> = {
  '8a47d304-3876-4c2f-9569-4e39543104a1': 'addition',        // Addition Forest
  '103d259d-4786-4357-a327-7b48b7f02beb': 'subtraction',     // Subtraction Mountain
  'b94abf03-45e6-4235-a7bd-d7036895170e': 'multiplication', // Multiplication Kingdom
  '42cb1952-3b46-4028-8cd1-c3a8b1153a20': 'division',        // Division Desert
  'b64513dc-cb3a-485d-998d-d04f4b8de63e': 'addition',        // Fraction Castle (simplified)
};

// ── Problem Generator ─────────────────────────────────────────────────────────

function makeProblem(op: MathOperation, index: number): MathProblem {
  let a: number, b: number, answer: number, displayText: string, hints: string[];

  switch (op) {
    case 'subtraction': {
      a = Math.floor(Math.random() * 40) + 10;
      b = Math.floor(Math.random() * (a - 1)) + 1;
      answer = a - b;
      displayText = `${a} - ${b} = ?`;
      hints = [
        `Start at ${a} and count back ${b}`,
        `${a} - ${Math.ceil(b / 2)} = ${a - Math.ceil(b / 2)}, then subtract ${b - Math.ceil(b / 2)} more`,
      ];
      break;
    }
    case 'multiplication': {
      a = Math.floor(Math.random() * 10) + 1;
      b = Math.floor(Math.random() * 10) + 1;
      answer = a * b;
      displayText = `${a} × ${b} = ?`;
      hints = [
        `Add ${a} to itself ${b} times`,
        `${a} × ${Math.floor(b / 2)} = ${a * Math.floor(b / 2)}, then add ${a} more ${b - Math.floor(b / 2)} time(s)`,
      ];
      break;
    }
    case 'division': {
      b = Math.floor(Math.random() * 9) + 2;
      answer = Math.floor(Math.random() * 10) + 1;
      a = b * answer;
      displayText = `${a} ÷ ${b} = ?`;
      hints = [
        `How many groups of ${b} fit into ${a}?`,
        `${b} × ${Math.floor(answer / 2)} = ${b * Math.floor(answer / 2)} — how many more ${b}s to reach ${a}?`,
      ];
      break;
    }
    default: {
      a = Math.floor(Math.random() * 30) + 1;
      b = Math.floor(Math.random() * 30) + 1;
      answer = a + b;
      displayText = `${a} + ${b} = ?`;
      hints = [
        `Count on from ${a}: add ${b} more`,
        `${a} + ${Math.floor(b / 2)} = ${a + Math.floor(b / 2)}, then add ${b - Math.floor(b / 2)} more`,
      ];
    }
  }

  return {
    id: `gen-${op}-${index}-${Date.now()}`,
    operation: op,
    operandA: a,
    operandB: b,
    answer,
    displayText,
    difficulty: 'easy',
    hints,
  };
}

function generateProblems(worldId: string, count = 5): MathProblem[] {
  const op = WORLD_OPERATIONS[worldId] || 'addition';
  return Array.from({ length: count }, (_, i) => makeProblem(op, i));
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function MathProblemPage() {
  const { worldId, levelId: _levelId } = useParams<{ worldId: string; levelId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const studentId = user?.role === 'student' ? user.id : undefined;

  const { submit } = useSubmitAnswer();

  const [problemQueue, setProblemQueue] = useState<MathProblem[]>(() =>
    generateProblems(worldId || '', 5)
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [streak, setStreak] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [score, setScore] = useState(0);
  const [problemsDone, setProblemsDone] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);

  const currentProblem = problemQueue[currentIndex] ?? problemQueue[0];

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

if (studentId && !currentProblem.id.startsWith('gen-')) {
  submit(studentId, {
    problemId: currentProblem.id,
    answerGiven: answer,
    timeTaken,
    hintsUsed,
  });
}
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
    setProblemQueue(generateProblems(worldId || '', 5));
    setCurrentIndex(0);
    setStreak(0);
    setHintsUsed(0);
    setScore(0);
    setProblemsDone(0);
    setShowCompletion(false);
  };

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
                <span
                  key={s}
                  className={`inline-block mx-1 animate-star-pop ${s <= starsEarned ? '' : 'opacity-20'}`}
                  style={{ animationDelay: `${s * 0.3}s` }}
                >
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
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(`/world/${worldId}`)} className="text-gray-400 hover:text-gray-600">
          ← Back
        </button>
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-gray-500">Problem {problemsDone + 1}/5</span>
          <ProgressBar value={problemsDone} max={5} size="sm" color="secondary" className="w-24" />
        </div>
      </div>

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
