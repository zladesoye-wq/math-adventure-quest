import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🧮</div>
          <h1 className="text-3xl font-display font-bold text-gray-800">Welcome Back!</h1>
          <p className="text-gray-500 mt-2">Log in to continue your adventure</p>
        </div>

        <div className="kid-card">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-semibold">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="kid-input"
                placeholder="parent@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="kid-input"
                placeholder="Enter your password"
                required
              />
            </div>

            <Button type="submit" variant="primary" fullWidth disabled={loading} icon={loading ? '⏳' : '🚀'}>
              {loading ? 'Logging in...' : 'Log In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 font-semibold hover:text-primary-700">
                Sign up!
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}