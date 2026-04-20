import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/auth';
import Spinner from '@/components/ui/Spinner';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Min 6 characters'),
});

const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters'),
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  role: z.enum(['client', 'performer']),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export default function Auth() {
  const [params] = useSearchParams();
  const [tab, setTab] = useState<'login' | 'register'>(params.get('tab') === 'register' ? 'register' : 'login');
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    setTab(params.get('tab') === 'register' ? 'register' : 'login');
  }, [params]);

  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'client' },
  });

  const onLogin = loginForm.handleSubmit(async (data) => {
    setServerError('');
    try {
      const result = await authApi.login(data);
      setAuth(result.user, result.accessToken);
      navigate(result.user.role === 'performer' ? '/performer/dashboard' : result.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setServerError(e?.response?.data?.message ?? 'Login failed');
    }
  });

  const onRegister = registerForm.handleSubmit(async (data) => {
    setServerError('');
    try {
      const result = await authApi.register(data);
      setAuth(result.user, result.accessToken);
      navigate(data.role === 'performer' ? '/performer/dashboard' : '/dashboard');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setServerError(e?.response?.data?.message ?? 'Registration failed');
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 flex items-stretch">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] bg-gradient-to-br from-primary to-violet-700 p-12 text-white flex-shrink-0">
        <Link to="/" className="text-2xl font-extrabold tracking-tight">Festiv<span className="text-accent">o</span></Link>
        <div>
          <h2 className="text-3xl font-extrabold mb-4 leading-tight">Your event deserves<br />the best professionals</h2>
          <p className="text-violet-200 mb-8">Join Festivo and connect with thousands of talented event pros.</p>
          <div className="flex flex-col gap-4">
            {[
              { icon: '✅', text: 'Verified performer profiles with real reviews' },
              { icon: '💬', text: 'Direct chat before you book' },
              { icon: '📅', text: 'Real-time availability calendar' },
              { icon: '🔒', text: 'Secure payments & booking confirmation' },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-sm flex-shrink-0">{f.icon}</div>
                <span className="text-sm text-violet-100">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white/10 rounded-2xl p-5 border border-white/20">
          <p className="text-sm italic text-violet-100">"Found our wedding photographer in 10 minutes. The whole booking process was seamless!"</p>
          <div className="text-xs text-violet-300 mt-2">— Maria V., Client</div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden text-2xl font-extrabold text-primary mb-8 block tracking-tight">Festiv<span className="text-accent">o</span></Link>

          {tab === 'login' ? (
            <div className="card p-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
              <p className="text-gray-500 text-sm mb-6">Sign in to your account to continue</p>

              {/* Tabs */}
              <div className="flex border-b border-gray-100 mb-6">
                <button onClick={() => setTab('login')} className="flex-1 pb-3 text-sm font-semibold text-primary border-b-2 border-primary">Log In</button>
                <button onClick={() => setTab('register')} className="flex-1 pb-3 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">Sign Up</button>
              </div>

              <form onSubmit={onLogin} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input {...loginForm.register('email')} type="email" placeholder="you@email.com" className="input-field" />
                  {loginForm.formState.errors.email && <p className="text-xs text-red-500 mt-1">{loginForm.formState.errors.email.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <input {...loginForm.register('password')} type="password" placeholder="••••••••" className="input-field" />
                  {loginForm.formState.errors.password && <p className="text-xs text-red-500 mt-1">{loginForm.formState.errors.password.message}</p>}
                </div>
                <div className="text-right">
                  <button type="button" className="text-sm text-primary hover:underline">Forgot password?</button>
                </div>
                {serverError && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{serverError}</p>}
                <button type="submit" disabled={loginForm.formState.isSubmitting} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                  {loginForm.formState.isSubmitting && <Spinner className="w-4 h-4" />}
                  Log In
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-5">
                Don't have an account?{' '}
                <button onClick={() => setTab('register')} className="text-primary font-semibold hover:underline">Sign up free</button>
              </p>
            </div>
          ) : (
            <div className="card p-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
              <p className="text-gray-500 text-sm mb-6">Choose how you'd like to join Festivo</p>

              <div className="flex border-b border-gray-100 mb-6">
                <button onClick={() => setTab('login')} className="flex-1 pb-3 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">Log In</button>
                <button onClick={() => setTab('register')} className="flex-1 pb-3 text-sm font-semibold text-primary border-b-2 border-primary">Sign Up</button>
              </div>

              {/* Role selector */}
              <div className="flex gap-3 mb-5">
                {(['client', 'performer'] as const).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => registerForm.setValue('role', role)}
                    className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-[1.5px] transition-all ${registerForm.watch('role') === role ? 'border-primary bg-primary-light' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                  >
                    <span className="text-2xl">{role === 'client' ? '🎉' : '🎭'}</span>
                    <span className="text-sm font-semibold text-gray-700 capitalize">{role}</span>
                    <span className="text-xs text-gray-400">{role === 'client' ? 'I want to book' : 'I offer services'}</span>
                  </button>
                ))}
              </div>

              <form onSubmit={onRegister} className="flex flex-col gap-4">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">First name</label>
                    <input {...registerForm.register('firstName')} type="text" placeholder="First name" className="input-field" />
                    {registerForm.formState.errors.firstName && <p className="text-xs text-red-500 mt-1">{registerForm.formState.errors.firstName.message}</p>}
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Last name</label>
                    <input {...registerForm.register('lastName')} type="text" placeholder="Last name" className="input-field" />
                    {registerForm.formState.errors.lastName && <p className="text-xs text-red-500 mt-1">{registerForm.formState.errors.lastName.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input {...registerForm.register('email')} type="email" placeholder="you@email.com" className="input-field" />
                  {registerForm.formState.errors.email && <p className="text-xs text-red-500 mt-1">{registerForm.formState.errors.email.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <input {...registerForm.register('password')} type="password" placeholder="Min 8 characters" className="input-field" />
                  {registerForm.formState.errors.password && <p className="text-xs text-red-500 mt-1">{registerForm.formState.errors.password.message}</p>}
                </div>
                {serverError && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{serverError}</p>}
                <button type="submit" disabled={registerForm.formState.isSubmitting} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                  {registerForm.formState.isSubmitting && <Spinner className="w-4 h-4" />}
                  Create Account
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-5">
                Already have an account?{' '}
                <button onClick={() => setTab('login')} className="text-primary font-semibold hover:underline">Log in</button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}