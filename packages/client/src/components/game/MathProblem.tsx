import { useState, useEffect, useRef, useCallback } from 'react';
import type { MathProblem } from '../../types';
import Button from '../common/Button';

interface MathProblemProps {
  problem: MathProblem;
  onAnswer: (answer: number, timeTaken: number) => void;
  onUseHint: () => void;
  hints: string[];
  hintsUsed: number;
  streak: number;
}

export default function MathProblemUI({
  problem,
  onAnswer,
  onUseHint,
  hints,
  hintsUsed,
  streak,
}: MathProblemProps) {
  const [inputValue, setInputValue] = useState('');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const startTime = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset state on new problem
  useEffect(() => {
    setInputValue('');
    setSelectedOption(null);
    setShowHint(false);
    setFeedback(null);
    setTimeLeft(30);
    startTime.current = Date.now();
    inputRef.current?.focus();

    // Start countdown
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [problem.id]);

  const handleSubmit = useCallback((answer: number) => {
    if (feedback) return; // Already answered
    const timeTaken = Date.now() - startTime.current;
    const correct = answer === problem.answer;

    setFeedback(correct ? 'correct' : 'incorrect');

    if (timerRef.current) clearInterval(timerRef.current);

    // Brief delay before continuing
    setTimeout(() => {
      onAnswer(answer, timeTaken);
    }, correct ? 1500 : 2000);
  }, [feedback, problem.answer, onAnswer]);

  const handleOptionClick = (option: number) => {
    setSelectedOption(option);
    handleSubmit(option);
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(inputValue, 10);
    if (!isNaN(val)) {
      handleSubmit(val);
    }
  };

  const handleHintClick = () => {
    setShowHint(true);
    onUseHint();
  };

  // Time's up
  useEffect(() => {
    if (timeLeft === 0 && !feedback) {
      handleSubmit(-999); // Force incorrect
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  return (
    <div className="max-w-lg mx-auto">
      {/* Timer and Streak */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          <span className="font-display font-bold text-energy-500">{streak}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-2xl ${timeLeft <= 10 ? 'animate-bounce' : ''}`}>⏱️</span>
          <span className={`font-bold font-display ${timeLeft <= 10 ? 'text-red-500' : 'text-gray-600'}`}>
            {timeLeft}s
          </span>
        </div>
      </div>

      {/* Problem Card */}
      <div
        className={`
          kid-card text-center mb-4 transition-all duration-300
          ${feedback === 'correct' ? 'ring-4 ring-green-400 scale-[1.02]' : ''}
          ${feedback === 'incorrect' ? 'ring-4 ring-red-400 shake' : ''}
        `}
      >
        {/* Visual aid */}
        {problem.visualAid && problem.visualAid === 'fraction-circle' && (
          <div className="mb-4">
            <FractionCircle numerator={problem.operandA} denominator={problem.operandB} />
          </div>
        )}

        {/* Problem text */}
        <div className="text-4xl md:text-5xl font-display font-bold text-gray-800 mb-6 mt-4">
          {problem.displayText}
        </div>

        {/* Hints */}
        {showHint && hints.length > 0 && hintsUsed <= hints.length && (
          <div className="mb-4 p-3 bg-energy-50 rounded-xl border border-energy-200 animate-slide-up">
            <span className="text-energy-500 font-semibold">💡 Hint: </span>
            <span className="text-gray-700">{hints[hintsUsed - 1] || hints[0]}</span>
          </div>
        )}
      </div>

      {/* Answer Input */}
      {problem.options ? (
        <div className="grid grid-cols-2 gap-3 mb-4">
          {problem.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleOptionClick(option)}
              disabled={!!feedback}
              className={`
                kid-button text-2xl font-bold py-5
                ${selectedOption === option && feedback === 'correct'
                  ? 'bg-green-500 text-white scale-105'
                  : selectedOption === option && feedback === 'incorrect'
                    ? 'bg-red-500 text-white'
                    : option === problem.answer && feedback === 'incorrect'
                      ? 'ring-2 ring-green-400 bg-green-50'
                      : 'bg-white text-gray-800 border-2 border-primary-200 hover:border-primary-400'
                }
                disabled:cursor-default transition-all duration-300
              `}
            >
              {option}
            </button>
          ))}
        </div>
      ) : (
        <form onSubmit={handleInputSubmit} className="mb-4">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type answer..."
              disabled={!!feedback}
              className="kid-input flex-1 text-center text-2xl font-bold"
              autoFocus
            />
            <Button type="submit" disabled={!!feedback || !inputValue}>
              ✓
            </Button>
          </div>
        </form>
      )}

      {/* Hint Button */}
      {!showHint && hints.length > 0 && (
        <div className="text-center">
          <button
            onClick={handleHintClick}
            className="text-sm font-semibold text-gray-400 hover:text-energy-500 transition-colors"
          >
            💡 Need a hint?
          </button>
        </div>
      )}

      {/* Feedback overlay */}
      {feedback && (
        <div className={`text-center py-4 animate-bounce-in ${feedback === 'correct' ? 'text-green-500' : 'text-red-500'}`}>
          <div className="text-5xl mb-2">{feedback === 'correct' ? '🎉' : '😅'}</div>
          <div className="font-display font-bold text-2xl">
            {feedback === 'correct' ? 'Awesome!' : 'Not quite!'}
          </div>
          <div className="text-gray-500 text-sm mt-1">
            {feedback === 'correct' ? 'Keep going!' : `The answer was ${problem.answer}`}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Fraction Circle Visual Aid ───────────────────────────────

function FractionCircle({ numerator, denominator }: { numerator: number; denominator: number }) {
  const slices = Array.from({ length: denominator }, (_, i) => i < numerator);
  const angle = 360 / denominator;

  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {slices.map((filled, i) => {
          const startAngle = i * angle - 90;
          const endAngle = (i + 1) * angle - 90;
          const x1 = 50 + 50 * Math.cos((startAngle * Math.PI) / 180);
          const y1 = 50 + 50 * Math.sin((startAngle * Math.PI) / 180);
          const x2 = 50 + 50 * Math.cos((endAngle * Math.PI) / 180);
          const y2 = 50 + 50 * Math.sin((endAngle * Math.PI) / 180);
          const largeArc = angle > 180 ? 1 : 0;

          return (
            <path
              key={i}
              d={`M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`}
              fill={filled ? '#f97316' : '#e5e7eb'}
              stroke="white"
              strokeWidth="2"
            />
          );
        })}
        <circle cx="50" cy="50" r="50" fill="none" stroke="#d1d5db" strokeWidth="2" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-display font-bold text-lg text-gray-600">
        {numerator}/{denominator}
      </div>
    </div>
  );
}