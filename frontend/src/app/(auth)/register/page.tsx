'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

const schema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm:  z.string(),
}).refine(d => d.password === d.confirm, {
  message: 'Passwords do not match', path: ['confirm'],
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register: registerUser, isLoading } = useAuthStore();
  const router = useRouter();
  const [showPw, setShowPw]     = useState(false);
  const [showCf, setShowCf]     = useState(false);

  const { register, handleSubmit, formState: { errors }, setError } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await registerUser(data.email, data.password, data.fullName);
      router.push('/dashboard');
    } catch {
      setError('root', { message: 'Registration failed. This email may already be registered.' });
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>

      {/* Top nav */}
      <nav className="site-nav">
        <Link href="/" className="site-nav-brand">Smart Job Market</Link>
        <div className="flex-1" />
        <Link href="/login"
          style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-700)', textDecoration: 'none' }}>
          Sign in
        </Link>
      </nav>

      {/* Body */}
      <div style={{
        minHeight: 'calc(100vh - 56px)',
        background: 'var(--gray-25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}>
        <div style={{ width: '100%', maxWidth: 440 }}>

          {/* Brand */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--blue)', letterSpacing: -1, marginBottom: 4 }}>
              Smart Job Market
            </div>
            <p style={{ fontSize: 15, color: 'var(--gray-400)' }}>
              Create your free account
            </p>
          </div>

          <div className="auth-panel">
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 4 }}>
              Create your account
            </h1>
            <p style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 20 }}>
              Start exploring job market intelligence for free
            </p>

            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              <div>
                <label className="form-label">Full name</label>
                <input {...register('fullName')} type="text" placeholder="Jane Doe"
                  className="field" style={{ width: '100%' }} />
                {errors.fullName && <p className="form-error">{errors.fullName.message}</p>}
              </div>

              <div>
                <label className="form-label">Email address</label>
                <input {...register('email')} type="email" placeholder="you@example.com"
                  className="field" style={{ width: '100%' }} />
                {errors.email && <p className="form-error">{errors.email.message}</p>}
              </div>

              <div>
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input {...register('password')} type={showPw ? 'text' : 'password'}
                    placeholder="At least 8 characters"
                    className="field" style={{ width: '100%', paddingRight: 44 }} />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
                             background:'none', border:'none', cursor:'pointer', color:'var(--gray-400)',
                             display:'flex', alignItems:'center' }}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="form-error">{errors.password.message}</p>}
              </div>

              <div>
                <label className="form-label">Confirm password</label>
                <div style={{ position: 'relative' }}>
                  <input {...register('confirm')} type={showCf ? 'text' : 'password'}
                    placeholder="Repeat your password"
                    className="field" style={{ width: '100%', paddingRight: 44 }} />
                  <button type="button" onClick={() => setShowCf(v => !v)}
                    style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
                             background:'none', border:'none', cursor:'pointer', color:'var(--gray-400)',
                             display:'flex', alignItems:'center' }}>
                    {showCf ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirm && <p className="form-error">{errors.confirm.message}</p>}
              </div>

              {errors.root && (
                <div style={{ padding:'10px 14px', borderRadius:6,
                              background:'var(--red-bg)', border:'1px solid var(--red-border)',
                              fontSize:13, color:'var(--red)' }}>
                  {errors.root.message}
                </div>
              )}

              <button type="submit" disabled={isLoading}
                className="btn btn-primary"
                style={{ width: '100%', height: 46, fontSize: 15, borderRadius: 6 }}>
                {isLoading ? (
                  <>
                    <span style={{ width:16, height:16, borderRadius:'50%',
                                   border:'2px solid rgba(255,255,255,.3)', borderTopColor:'#fff',
                                   animation:'spin .65s linear infinite', display:'inline-block' }} />
                    Creating account…
                  </>
                ) : 'Create account'}
              </button>
            </form>

            <p style={{ fontSize: 11, color: 'var(--gray-400)', textAlign: 'center', marginTop: 14, lineHeight: 1.5 }}>
              By creating an account, you agree to Smart Job Market&apos;s Terms of Service,
              Cookie Policy, and Privacy Policy.
            </p>

            <div style={{ display:'flex', alignItems:'center', gap:12, margin:'18px 0' }}>
              <div style={{ flex:1, height:1, background:'var(--gray-200)' }} />
              <span style={{ fontSize:12, color:'var(--gray-400)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.06em' }}>or</span>
              <div style={{ flex:1, height:1, background:'var(--gray-200)' }} />
            </div>

            <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--gray-600)' }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color: 'var(--blue)', fontWeight: 700 }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
