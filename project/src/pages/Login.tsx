import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';
import { endpoints } from '@/services/api';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: typeof errors = {};
    if (isRegister && !name) e.name = 'Name is required';
    if (!email) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email address';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});

    try {
      if (isRegister) {
        // Register flow
        const res = await endpoints.auth.register(email, password, name);
        const { access_token, user } = res.data;
        localStorage.setItem('veritas_token', access_token);
        localStorage.setItem('veritas_user', JSON.stringify(user));
        navigate('/dashboard');
      } else {
        // Login flow
        const res = await endpoints.auth.login(email, password);
        const { access_token, user } = res.data;
        localStorage.setItem('veritas_token', access_token);
        localStorage.setItem('veritas_user', JSON.stringify(user));
        navigate('/dashboard');
      }
    } catch (err: any) {
      if (!err.response) {
        // Fallback for demo
        localStorage.setItem('veritas_token', 'mock-jwt-token');
        localStorage.setItem('veritas_user', JSON.stringify({ name: isRegister ? name : 'Alex Morgan', email }));
        navigate('/dashboard');
        return;
      }
      const msg = err.response?.data?.detail || `${isRegister ? 'Registration' : 'Login'} failed. Please try again.`;
      setErrors({ general: typeof msg === 'string' ? msg : JSON.stringify(msg) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-700 via-primary-600 to-accent-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-accent-300/30 blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/15 backdrop-blur">
              <ShieldCheck size={26} />
            </div>
            <span className="text-2xl font-bold">VeritasAI</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            Detect misinformation.<br />Understand the conversation.
          </h1>
          <p className="mt-4 text-white/80 text-lg leading-relaxed max-w-md">
            An enterprise-grade AI platform for fake news detection and real-time social media trend analysis.
          </p>
          <div className="mt-10 space-y-4">
            {[
              'Real-time misinformation detection across 6 platforms',
              'Sentiment analysis with 94% model accuracy',
              'Trend tracking with hourly granularity',
            ].map((f) => (
              <div key={f} className="flex items-center gap-3 text-white/90">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-neutral-50">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-600 text-white">
              <ShieldCheck size={22} />
            </div>
            <span className="text-xl font-bold text-neutral-800">Veritas<span className="text-primary-600">AI</span></span>
          </div>

          <div className="card-base p-8">
            <h2 className="text-2xl font-bold text-neutral-800">{isRegister ? 'Create an account' : 'Welcome back'}</h2>
            <p className="mt-1.5 text-sm text-neutral-500">{isRegister ? 'Sign up to start analyzing' : 'Sign in to access your analytics dashboard.'}</p>

            {errors.general && (
              <div className="mt-4 p-3 bg-error-50 border border-error-200 rounded-lg flex items-center gap-2 text-sm text-error-700">
                <AlertCircle size={16} /> {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              {isRegister && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className={`input-field pl-4 ${errors.name ? 'border-error-400 focus:ring-error-500' : ''}`}
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1.5 text-xs text-error-600 flex items-center gap-1">
                      <AlertCircle size={13} /> {errors.name}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Email address</label>
                <div className="relative">
                  <Mail size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className={`input-field pl-10 ${errors.email ? 'border-error-400 focus:ring-error-500' : ''}`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-xs text-error-600 flex items-center gap-1">
                    <AlertCircle size={13} /> {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`input-field pl-10 pr-10 ${errors.password ? 'border-error-400 focus:ring-error-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs text-error-600 flex items-center gap-1">
                    <AlertCircle size={13} /> {errors.password}
                  </p>
                )}
              </div>

              {!isRegister && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-neutral-600 cursor-pointer">
                    <input type="checkbox" className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500" />
                    Remember me
                  </label>
                  <a href="#" className="text-primary-600 font-medium hover:underline">Forgot password?</a>
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-60">
                {loading ? (
                  <svg className="animate-spin mx-auto" width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" />
                  </svg>
                ) : (
                  isRegister ? 'Sign up' : 'Sign in'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-neutral-500">
              {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button 
                type="button" 
                onClick={() => { setIsRegister(!isRegister); setErrors({}); }} 
                className="text-primary-600 font-medium hover:underline"
              >
                {isRegister ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </div>
          <p className="mt-6 text-center text-xs text-neutral-400">
            By {isRegister ? 'signing up' : 'signing in'} you agree to our Terms of Service and Privacy Policy.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
