import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'parent' | 'teacher'>('parent');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await register({ email, password, name, role });
    setLoading(false);

    if (result.success) {
      navigate(role === 'teacher' ? '/parent-dashboard' : '/dashboard');
    } else {
      setError(result.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🚀</div>
          <h1 className="text-3xl font-display font-bold text-gray-800">Start Your Adventure!</h1>
          <p className="text-gray-500 mt-2">Create an account to get started</p>
        </div>

        <div className="kid-card">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-semibold">{error}</div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">I am a...</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('parent')}
                  className={`p-3 rounded-xl text-center transition-all border-2 ${
                    role === 'parent' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">👨‍👩‍👧‍👦</div>
                  <div className="text-sm font-semibold">Parent</div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('teacher')}
                  className={`p-3 rounded-xl text-center transition-all border-2 ${
                    role === 'teacher' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">🍎</div>
                  <div className="text-sm font-semibold">Teacher</div>
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">Your Name</label>
              <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="kid-input" placeholder="e.g. Sarah" required />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="kid-input" placeholder="you@example.com" required />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="kid-input" placeholder="Create a password (min 6 characters)" required minLength={6} />
            </div>

            <Button type="submit" variant="primary" fullWidth disabled={loading} icon={loading ? '⏳' : '🚀'}>
              {loading ? 'Creating account...' : 'Create Free Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700">Log in!</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}