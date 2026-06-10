import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { AvatarPicker } from '../components/avatar/AvatarPicker';
import type { AvatarData } from '../types';

const DEFAULT_AVATAR: AvatarData = {
  gender: 'boy',
  hairStyle: 'short',
  hairColor: 'brown',
  skinTone: 'medium',
  outfit: 'casual',
  accessory: null,
  pet: null,
};

export default function Profile() {
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState<AvatarData>(DEFAULT_AVATAR);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-gray-600">
          ←
        </button>
        <h1 className="text-3xl font-display font-bold text-gray-800">🎨 Customize Avatar</h1>
      </div>

      <Card>
        <AvatarPicker
          avatar={avatar}
          onUpdate={(updates) => setAvatar((prev) => ({ ...prev, ...updates }))}
        />

        <div className="mt-6 flex gap-3">
          <Button variant="primary" icon="💾" onClick={handleSave} fullWidth>
            {saved ? 'Saved! ✅' : 'Save Avatar'}
          </Button>
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
}