import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

const worlds = [
  { emoji: '🌳', name: 'Addition Forest', desc: 'Master addition from 1+1 to 100+100', color: 'from-green-400 to-emerald-600' },
  { emoji: '⛰️', name: 'Subtraction Mountain', desc: 'Climb higher with subtraction skills', color: 'from-purple-400 to-violet-600' },
  { emoji: '👑', name: 'Multiplication Kingdom', desc: 'Times tables become your superpower', color: 'from-amber-400 to-yellow-600', premium: true },
  { emoji: '🏜️', name: 'Division Desert', desc: 'Divide and conquer the desert', color: 'from-orange-400 to-orange-600', premium: true },
  { emoji: '🥧', name: 'Fraction Castle', desc: 'Pies, pizzas, and perfect fractions', color: 'from-pink-400 to-rose-600', premium: true },
];

const features = [
  { emoji: '🎮', title: 'Gamified Learning', desc: 'Kids earn coins, gems, and stars while solving math problems. Rewards keep them motivated!' },
  { emoji: '🧠', title: 'Adaptive Difficulty', desc: 'Our smart engine adjusts problems to each child skill level - never too easy, never too hard.' },
  { emoji: '📊', title: 'Parent Dashboard', desc: 'Track progress, see strengths/weaknesses, and get detailed reports on your child learning journey.' },
  { emoji: '🎨', title: 'Custom Avatars', desc: 'Kids create their own character with hair styles, outfits, and accessories they unlock through gameplay.' },
  { emoji: '🔥', title: 'Daily Challenges', desc: 'Streak counters and daily missions keep kids coming back. 5 minutes a day builds math confidence!' },
  { emoji: '🏆', title: 'Achievements', desc: 'Unlock badges, trophies, and certificates. Celebrate every milestone on the math adventure!' },
];

const stats = [
  { num: '50,000+', label: 'Active Students' },
  { num: '1M+', label: 'Problems Solved' },
  { num: '5', label: 'Fantasy Worlds' },
  { num: '100+', label: 'Skill Levels' },
];

export default function Landing() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-16 md:py-24">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full opacity-30" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-200 rounded-full opacity-30" />
          <div className="absolute top-20 left-1/4 w-20 h-20 bg-yellow-200 rounded-full opacity-40 animate-float" />
          <div className="absolute top-40 right-1/4 w-12 h-12 bg-green-200 rounded-full opacity-40 animate-float" style={{ animationDelay: '1s' }} />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="text-7xl mb-6 animate-bounce-in">🧮</div>
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">
            <span className="bg-gradient-to-r from-primary-600 via-accent-500 to-energy-500 bg-clip-text text-transparent">
              Math Adventure Quest
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-4 font-display">
            Where math becomes a magical adventure! ✨
          </p>
          <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
            Join thousands of kids exploring fantasy worlds while mastering addition, subtraction, multiplication, division, and fractions. Fun, adaptive, and confidence-building!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button variant="primary" size="lg" icon="🚀">Start Your Adventure Free</Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" icon="👋">I Already Have an Account</Button>
            </Link>
          </div>
          <p className="text-sm text-gray-400 mt-4">No credit card required • Free worlds included</p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gradient-to-r from-primary-600 via-accent-500 to-energy-500 py-8">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-white">
          {stats.map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl md:text-4xl font-display font-bold">{stat.num}</div>
              <div className="text-sm opacity-90">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Worlds Preview */}
      <section className="py-16 px-4" id="worlds">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-4">
            Explore the <span className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">Worlds</span>
          </h2>
          <p className="text-center text-gray-500 mb-10">Each world builds essential math skills through fun challenges!</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {worlds.map((world) => (
              <div key={world.name} className={`relative bg-gradient-to-br ${world.color} rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300`}>
                {world.premium && (
                  <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">PREMIUM 💎</div>
                )}
                <div className="text-5xl mb-3">{world.emoji}</div>
                <h3 className="font-display font-bold text-xl mb-1">{world.name}</h3>
                <p className="text-white/80 text-sm">{world.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-white/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-10">Why Kids & Parents ❤️ Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="kid-card text-center">
                <div className="text-4xl mb-3">{feature.emoji}</div>
                <h3 className="font-display font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-4" id="pricing">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-4">Simple Pricing</h2>
          <p className="text-center text-gray-500 mb-10">Start free, upgrade when you are ready!</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div className="kid-card text-center border-2 border-primary-200">
              <h3 className="font-display font-bold text-2xl text-gray-800 mb-2">🌱 Free</h3>
              <p className="text-4xl font-display font-bold text-primary-600 mb-4">$0</p>
              <ul className="text-left space-y-3 mb-6 text-gray-600">
                <li>✓ Addition Forest world</li>
                <li>✓ Subtraction Mountain world</li>
                <li>✓ Basic avatar customization</li>
                <li>✓ Daily challenges</li>
                <li>✓ Basic progress tracking</li>
              </ul>
              <Link to="/register">
                <Button variant="outline" fullWidth>Get Started Free</Button>
              </Link>
            </div>
            <div className="kid-card text-center border-2 border-energy-200 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-energy-500 text-white text-xs font-bold px-4 py-1 rounded-full">POPULAR</div>
              <h3 className="font-display font-bold text-2xl text-gray-800 mb-2">💎 Premium</h3>
              <p className="text-4xl font-display font-bold text-energy-500 mb-4">$4.99<span className="text-lg text-gray-400">/mo</span></p>
              <ul className="text-left space-y-3 mb-6 text-gray-600">
                <li>✓ All free features</li>
                <li>✓ Multiplication Kingdom</li>
                <li>✓ Division Desert</li>
                <li>✓ Fraction Castle</li>
                <li>✓ Advanced analytics & reports</li>
                <li>✓ Exclusive rewards & items</li>
                <li>✓ Printable worksheets</li>
              </ul>
              <Button variant="energy" fullWidth>Upgrade to Premium</Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary-600 to-accent-600">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Ready to Start the Adventure?</h2>
          <p className="text-lg opacity-90 mb-8">Join thousands of young math explorers today!</p>
          <Link to="/register">
            <Button variant="energy" size="lg" icon="🚀">Start Free Now</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}