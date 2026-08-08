// ============================================
// NEXORA CAPITAL - Landing Page
// ============================================

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Shield,
  Clock,
  ChevronRight,
  Menu,
  X,
  ArrowRight,
  CheckCircle,
  Lock,
  Globe,
  BarChart3,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const features = [
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: 'Professional Management',
      description: 'Your portfolio is managed by experienced investment professionals.',
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Institutional Security',
      description: 'Bank-grade security protocols protect your investments 24/7.',
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: 'Goal-Based Investing',
      description: 'Set clear financial goals and track your progress over time.',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Create Account',
      description: 'Sign up and complete verification in minutes.',
    },
    {
      number: '02',
      title: 'Set Your Goal',
      description: 'Define your investment target and timeline.',
    },
    {
      number: '03',
      title: 'Deposit Funds',
      description: 'Fund your account securely via crypto transfer.',
    },
    {
      number: '04',
      title: 'Watch It Grow',
      description: 'Track performance as professionals manage your portfolio.',
    },
  ];

  const stats = [
    { value: '$500M+', label: 'Assets Under Management' },
    { value: '10,000+', label: 'Active Investors' },
    { value: '12%', label: 'Average Annual Return' },
    { value: '99.9%', label: 'Uptime' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1e3a5f] rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="font-semibold text-xl text-[#1c1917]">
                Nexora Capital
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <a href="#features" className="text-[#57534e] hover:text-[#1c1917] transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-[#57534e] hover:text-[#1c1917] transition-colors">
                How It Works
              </a>
              <a href="#security" className="text-[#57534e] hover:text-[#1c1917] transition-colors">
                Security
              </a>
            </nav>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Sign In
              </Button>
              <Button onClick={() => navigate('/register')}>
                Get Started
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 text-[#57534e]"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden bg-white border-t border-[#e7e5e4]"
          >
            <div className="px-4 py-4 space-y-3">
              <a
                href="#features"
                className="block py-2 text-[#57534e]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="block py-2 text-[#57534e]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                How It Works
              </a>
              <a
                href="#security"
                className="block py-2 text-[#57534e]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Security
              </a>
              <div className="pt-3 border-t border-[#e7e5e4] space-y-2">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => {
                    navigate('/login');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Sign In
                </Button>
                <Button
                  fullWidth
                  onClick={() => {
                    navigate('/register');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Get Started
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#fafaf9] via-white to-[#f5f5f4]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1c1917] leading-tight">
                Build Wealth Through
                <span className="text-[#1e3a5f]"> Professional</span> Investment Management
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-[#78716c] max-w-2xl mx-auto">
                Nexora Capital provides premium digital asset portfolio management 
                for discerning investors. Experience the confidence of professional 
                wealth management.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  size="lg"
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                  onClick={() => navigate('/register')}
                >
                  Start Investing
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl sm:text-4xl font-bold text-[#1e3a5f]">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-[#78716c]">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-[#fafaf9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1c1917]">
              Why Choose Nexora Capital
            </h2>
            <p className="mt-4 text-lg text-[#78716c] max-w-2xl mx-auto">
              We combine institutional-grade security with professional portfolio 
              management to deliver exceptional results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl border border-[#e7e5e4] hover:shadow-lg hover:shadow-[#1e3a5f]/5 transition-all"
              >
                <div className="w-14 h-14 bg-[#1e3a5f]/10 rounded-xl flex items-center justify-center text-[#1e3a5f] mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-[#1c1917] mb-3">
                  {feature.title}
                </h3>
                <p className="text-[#78716c]">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1c1917]">
              How Nexora Works
            </h2>
            <p className="mt-4 text-lg text-[#78716c] max-w-2xl mx-auto">
              Start your investment journey in four simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <span className="text-5xl font-bold text-[#e7e5e4]">
                  {step.number}
                </span>
                <h3 className="mt-4 text-xl font-semibold text-[#1c1917]">
                  {step.title}
                </h3>
                <p className="mt-2 text-[#78716c]">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-20 bg-[#1e3a5f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                Security You Can Trust
              </h2>
              <p className="mt-4 text-lg text-blue-100">
                Your security is our top priority. We employ multiple layers of 
                protection to safeguard your investments.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  'Multi-signature cold storage for digital assets',
                  'Two-factor authentication (2FA) support',
                  'Regular third-party security audits',
                  '24/7 monitoring and threat detection',
                  'Insurance coverage for custodied assets',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span className="text-blue-50">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl text-center">
                <Lock className="h-10 w-10 text-blue-300 mx-auto mb-4" />
                <p className="text-white font-semibold">Encrypted</p>
                <p className="text-blue-200 text-sm">AES-256 encryption</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl text-center">
                <Globe className="h-10 w-10 text-blue-300 mx-auto mb-4" />
                <p className="text-white font-semibold">Global</p>
                <p className="text-blue-200 text-sm">Worldwide coverage</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl text-center">
                <BarChart3 className="h-10 w-10 text-blue-300 mx-auto mb-4" />
                <p className="text-white font-semibold">Audited</p>
                <p className="text-blue-200 text-sm">Regular audits</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl text-center">
                <Users className="h-10 w-10 text-blue-300 mx-auto mb-4" />
                <p className="text-white font-semibold">Expert Team</p>
                <p className="text-blue-200 text-sm">Industry veterans</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-[#fafaf9]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1c1917]">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'What is the minimum investment amount?',
                a: 'The minimum investment to open an account is $1,000. This ensures we can provide professional portfolio management that aligns with your goals.',
              },
              {
                q: 'How are my investments managed?',
                a: 'Our team of experienced portfolio managers allocates your funds across a diversified portfolio of digital assets based on your investment goals and risk tolerance.',
              },
              {
                q: 'When can I withdraw my funds?',
                a: 'Withdrawals are available once you reach 50% of your investment goal progress. This ensures alignment with long-term wealth building objectives.',
              },
              {
                q: 'What fees does Nexora charge?',
                a: 'We charge a 0.5% withdrawal fee. There are no management fees, deposit fees, or hidden charges.',
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-xl border border-[#e7e5e4]"
              >
                <h3 className="font-semibold text-[#1c1917] mb-2">{faq.q}</h3>
                <p className="text-[#78716c]">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1c1917]">
            Ready to Start Building Wealth?
          </h2>
          <p className="mt-4 text-lg text-[#78716c]">
            Join thousands of investors who trust Nexora Capital with their financial future.
          </p>
          <div className="mt-10">
            <Button
              size="lg"
              rightIcon={<ChevronRight className="h-5 w-5" />}
              onClick={() => navigate('/register')}
            >
              Create Your Account
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1c1917] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#1e3a5f] rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">N</span>
                </div>
                <span className="font-semibold text-xl text-white">
                  Nexora Capital
                </span>
              </div>
              <p className="text-gray-400 max-w-sm">
                Premium digital asset portfolio management for discerning investors. 
                Build wealth with confidence.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#features" className="text-gray-400 hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#security" className="text-gray-400 hover:text-white transition-colors">
                    Security
                  </a>
                </li>
                <li>
                  <Link to="/login" className="text-gray-400 hover:text-white transition-colors">
                    Sign In
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Risk Disclosure
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8">
            <p className="text-gray-500 text-sm text-center">
              © {new Date().getFullYear()} Nexora Capital. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
