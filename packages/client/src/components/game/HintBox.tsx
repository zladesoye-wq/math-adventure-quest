interface HintBoxProps {
  hints: string[];
  usedCount: number;
  onRequestHint: () => void;
}

export default function HintBox({ hints, usedCount, onRequestHint }: HintBoxProps) {
  if (usedCount >= hints.length) {
    return (
      <div className="text-center p-3 bg-gray-50 rounded-xl">
        <span className="text-sm text-gray-400">No more hints available! 🤔</span>
      </div>
    );
  }

  return (
    <button
      onClick={onRequestHint}
      className="w-full p-3 bg-energy-50 hover:bg-energy-100 rounded-xl border-2 border-dashed border-energy-200 
                 transition-all duration-200 hover:scale-[1.02] group"
    >
      <div className="flex items-center justify-center gap-2">
        <span className="text-xl group-hover:animate-bounce">💡</span>
        <span className="font-semibold text-energy-600">Get a hint ({usedCount}/{hints.length})</span>
      </div>
    </button>
  );
}