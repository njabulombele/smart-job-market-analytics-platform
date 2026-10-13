'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { User, Mail, Lock, Eye, EyeOff, BarChart3 } from 'lucide-react';
import { useState } from 'react';

const schema = z.object({
  fullName: z.string().min(2, 'At least 2 characters'),
  email:    z.string().email('Invalid email address'),
  password: z.string().min(8, 'Minimum 8 characters'),
  confirm:  z.string(),
}).refine(d => d.password === d.confirm, {
  message: 'Passwords do not match',
  path: ['confirm'],
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register: registerUser, isLoading } = useAuthStore();
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);

  const { register, handleSubmit, formState: { errors }, setError } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await registerUser(data.email, data.password, data.fullName);
      router.push('/dashboard');
    } catch {
      setError('root', { message: 'Registration failed. Email may already be in use.' });
    }
  };

  const fields = [
    { id: 'fullName', label: 'Full Name',        type: 'text',     placeholder: 'Jane Doe',         icon: User },
    { id: 'email',    label: 'Email address',     type: 'email',    placeholder: 'you@example.com',  icon: Mail },
    { id: 'password', label: 'Password',          type: showPw ? 'text' : 'password', placeholder: '••••••••',        icon: Lock, toggle: true },
    { id: 'confirm',  label: 'Confirm Password',  type: 'password', placeholder: '••••••••',        icon: Lock },
  ] as const;

  return (
    <div className="min-h-screen flex items-center justify-center
                    bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-6">
      {/* Blobs */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full
                      -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full
                      translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/40">
            <BarChart3 size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">JobMarket AI</span>
        </div>

        <div className="auth-card">
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
            <p className="text-slate-500 text-sm mt-1">Start exploring job market insights for free</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {fields.map(({ id, label, type, placeholder, icon: Icon, ...rest }) => (
              <div key={id}>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
                <div className="relative">
                  <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    {...register(id as keyof FormData)}
                    type={type}
                    placeholder={placeholder}
                    className="input pl-10 pr-10"
                  />
                  {'toggle' in rest && rest.toggle && (
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  )}
                </div>
                {errors[id as keyof FormData] && (
                  <p className="text-red-500 text-xs mt-1.5">{errors[id as keyof FormData]?.message}</p>
                )}
              </div>
            ))}

            {errors.root && (
              <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
                <p className="text-red-600 text-sm">{errors.root.message}</p>
              </div>
            )}

            <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 mt-1">
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
