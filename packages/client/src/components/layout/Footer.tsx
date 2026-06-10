export default function Footer() {
  return (
    <footer className="bg-white/60 backdrop-blur-sm border-t border-primary-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🧮</span>
              <span className="font-display font-bold text-primary-700">Math Adventure Quest</span>
            </div>
            <p className="text-sm text-gray-500">
              Making math fun for kids ages 5–11 through gamified learning adventures!
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-gray-700 mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#" className="hover:text-primary-600 transition-colors">About</a></li>
              <li><a href="#" className="hover:text-primary-600 transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-primary-600 transition-colors">For Teachers</a></li>
              <li><a href="#" className="hover:text-primary-600 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Worlds */}
          <div>
            <h4 className="font-display font-semibold text-gray-700 mb-3">Explore</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>🌳 Addition Forest</li>
              <li>⛰️ Subtraction Mountain</li>
              <li>🏰 Multiplication Kingdom</li>
              <li>🏜️ Division Desert</li>
              <li>🥧 Fraction Castle</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-100 mt-6 pt-4 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Math Adventure Quest. Making math magical! ✨
        </div>
      </div>
    </footer>
  );
}