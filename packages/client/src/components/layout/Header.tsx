import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-primary-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-3xl group-hover:scale-110 transition-transform duration-200">🧮</span>
            <span className="text-xl font-display font-bold bg-gradient-to-r from-primary-600 via-accent-500 to-energy-500 bg-clip-text text-transparent">
              Math Adventure Quest
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {isAuthenticated ? (
              <>
                {(user?.role === 'parent' || user?.role === 'teacher') && (
                  <Link
                    to="/parent-dashboard"
                    className="font-semibold text-gray-600 hover:text-primary-600 transition-colors duration-200"
                  >
                    📊 Dashboard
                  </Link>
                )}
                {user?.role === 'student' && (
                  <Link
                    to="/dashboard"
                    className="font-semibold text-gray-600 hover:text-primary-600 transition-colors duration-200"
                  >
                    🎮 My World
                  </Link>
                )}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-500">
                    👋 {user?.name}
                  </span>
                  <button
                    onClick={logout}
                    className="kid-button bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 text-sm"
                  >
                    Log Out
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="kid-button bg-white text-primary-600 border-2 border-primary-300 hover:bg-primary-50 px-5 py-2 text-sm">
                  Log In
                </Link>
                <Link to="/register" className="kid-button-primary px-5 py-2 text-sm">
                  Sign Up Free
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile menu toggle */}
          <MobileMenu isAuthenticated={isAuthenticated} user={user} logout={logout} />
        </div>
      </div>
    </header>
  );
}

function MobileMenu({ isAuthenticated, user, logout }: { isAuthenticated: boolean; user: any; logout: () => void }) {
  return (
    <details className="md:hidden group">
      <summary className="list-none cursor-pointer p-2 hover:bg-gray-100 rounded-lg">
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </summary>
      <div className="absolute top-full right-0 left-0 bg-white/95 backdrop-blur-md border-b border-primary-100 shadow-lg p-4 flex flex-col gap-3">
        {isAuthenticated ? (
          <>
            <span className="text-sm font-semibold text-gray-500 px-2">👋 {user?.name}</span>
            {(user?.role === 'parent' || user?.role === 'teacher') && (
              <Link to="/parent-dashboard" className="kid-button bg-gray-50 text-center">📊 Dashboard</Link>
            )}
            {user?.role === 'student' && (
              <Link to="/dashboard" className="kid-button bg-gray-50 text-center">🎮 My World</Link>
            )}
            <button onClick={logout} className="kid-button bg-gray-100 text-gray-700 text-center">Log Out</button>
          </>
        ) : (
          <>
            <Link to="/login" className="kid-button bg-gray-50 text-center">Log In</Link>
            <Link to="/register" className="kid-button-primary text-center">Sign Up Free</Link>
          </>
        )}
      </div>
    </details>
  );
}