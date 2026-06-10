import type { AvatarData } from '../../types';

interface AvatarDisplayProps {
  avatar: AvatarData;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'text-3xl w-12 h-12',
  md: 'text-5xl w-20 h-20',
  lg: 'text-7xl w-32 h-32',
};

const skinToneMap: Record<string, string> = {
  light: '👶',
  medium: '🧒',
  dark: '👦',
  tan: '👧',
};

const outfitMap: Record<string, string> = {
  casual: '👕',
  superhero: '🦸',
  princess: '👸',
  explorer: '🧭',
  wizard: '🧙',
  sporty: '🏃',
};

const accessoryMap: Record<string, string> = {
  crown: '👑',
  glasses: '👓',
  hat: '🧢',
  bow: '🎀',
  backpack: '🎒',
  none: '',
};

export default function AvatarDisplay({ avatar, size = 'md', className = '' }: AvatarDisplayProps) {
  const skin = skinToneMap[avatar.skinTone] || '🧒';
  const outfit = outfitMap[avatar.outfit] || '👕';
  const accessory = avatar.accessory ? accessoryMap[avatar.accessory] || '' : '';

  return (
    <div className={`relative flex items-center justify-center ${sizeClasses[size]} ${className}`}>
      {/* Avatar emoji composite */}
      <div className="relative">
        <span className="block">{skin}</span>
        {/* Outfit indicator */}
        <span className="absolute -bottom-1 -right-1 text-sm">{outfit}</span>
        {/* Accessory */}
        {accessory && (
          <span className="absolute -top-2 -left-1 text-xs animate-float">{accessory}</span>
        )}
      </div>
    </div>
  );
}

interface AvatarPickerProps {
  avatar: AvatarData;
  onUpdate: (updates: Partial<AvatarData>) => void;
}

const hairStyles = [
  { id: 'short', label: 'Short', icon: '💇' },
  { id: 'long', label: 'Long', icon: '💇‍♀️' },
  { id: 'curly', label: 'Curly', icon: '🦱' },
  { id: 'ponytail', label: 'Ponytail', icon: '💁‍♀️' },
  { id: 'bald', label: 'Simple', icon: '🧑' },
];

const skinTones = [
  { id: 'light', label: 'Light', icon: '👶' },
  { id: 'medium', label: 'Medium', icon: '🧒' },
  { id: 'tan', label: 'Tan', icon: '👧' },
  { id: 'dark', label: 'Dark', icon: '👦' },
];

const outfits = [
  { id: 'casual', label: 'Casual', icon: '👕' },
  { id: 'superhero', label: 'Superhero', icon: '🦸' },
  { id: 'explorer', label: 'Explorer', icon: '🧭' },
  { id: 'wizard', label: 'Wizard', icon: '🧙' },
  { id: 'sporty', label: 'Sporty', icon: '🏃' },
];

const accessories = [
  { id: 'none', label: 'None', icon: '✖️' },
  { id: 'crown', label: 'Crown', icon: '👑' },
  { id: 'glasses', label: 'Glasses', icon: '👓' },
  { id: 'hat', label: 'Hat', icon: '🧢' },
  { id: 'backpack', label: 'Backpack', icon: '🎒' },
];

export function AvatarPicker({ avatar, onUpdate }: AvatarPickerProps) {
  return (
    <div className="space-y-6">
      {/* Preview */}
      <div className="flex justify-center mb-6">
        <AvatarDisplay avatar={avatar} size="lg" />
      </div>

      {/* Skin Tone */}
      <div>
        <h4 className="font-display font-semibold text-gray-700 mb-2">Skin Tone</h4>
        <div className="flex gap-2">
          {skinTones.map((s) => (
            <button
              key={s.id}
              onClick={() => onUpdate({ skinTone: s.id })}
              className={`p-3 rounded-xl text-2xl transition-all ${
                avatar.skinTone === s.id ? 'ring-2 ring-primary-500 bg-primary-50 scale-110' : 'hover:bg-gray-100'
              }`}
              title={s.label}
            >
              {s.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Hair Style */}
      <div>
        <h4 className="font-display font-semibold text-gray-700 mb-2">Hair</h4>
        <div className="flex gap-2 flex-wrap">
          {hairStyles.map((h) => (
            <button
              key={h.id}
              onClick={() => onUpdate({ hairStyle: h.id })}
              className={`p-3 rounded-xl text-2xl transition-all ${
                avatar.hairStyle === h.id ? 'ring-2 ring-primary-500 bg-primary-50 scale-110' : 'hover:bg-gray-100'
              }`}
              title={h.label}
            >
              {h.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Outfit */}
      <div>
        <h4 className="font-display font-semibold text-gray-700 mb-2">Outfit</h4>
        <div className="flex gap-2 flex-wrap">
          {outfits.map((o) => (
            <button
              key={o.id}
              onClick={() => onUpdate({ outfit: o.id })}
              className={`p-3 rounded-xl text-2xl transition-all ${
                avatar.outfit === o.id ? 'ring-2 ring-primary-500 bg-primary-50 scale-110' : 'hover:bg-gray-100'
              }`}
              title={o.label}
            >
              {o.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Accessories */}
      <div>
        <h4 className="font-display font-semibold text-gray-700 mb-2">Accessories</h4>
        <div className="flex gap-2 flex-wrap">
          {accessories.map((a) => (
            <button
              key={a.id}
              onClick={() => onUpdate({ accessory: a.id === 'none' ? null : a.id })}
              className={`p-3 rounded-xl text-2xl transition-all ${
                (avatar.accessory === a.id) || (a.id === 'none' && !avatar.accessory)
                  ? 'ring-2 ring-primary-500 bg-primary-50 scale-110'
                  : 'hover:bg-gray-100'
              }`}
              title={a.label}
            >
              {a.icon}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}