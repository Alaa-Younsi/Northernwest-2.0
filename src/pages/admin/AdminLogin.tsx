import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SEOHead } from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { toast } from '@/components/ui/Toast';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password required'),
});
type LoginForm = z.infer<typeof schema>;

export default function AdminLogin() {
  const navigate = useNavigate();
  const setToken = useAuthStore((s) => s.setToken);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const result = await api.admin.login(data.email, data.password);
      setToken(result.token);
      navigate('/admin');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full bg-[#050505] border border-[#1a1a1a] px-4 py-3 font-mono text-sm text-white placeholder-[#333] focus:border-[#FF0000] focus:outline-none transition-colors';

  return (
    <>
      <SEOHead title="Admin Login — Northernwest" />

      <div className="min-h-screen flex items-center justify-center px-4 red-grid-bg">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          className="w-full max-w-sm bg-[#0d0d0d] border border-[#1a1a1a] p-8"
        >
          <div className="text-center mb-8">
            <img src="/logo.png" alt="Northernwest" className="h-12 w-auto mx-auto mb-4" />
            <h1
              className="font-display font-black text-white uppercase text-2xl tracking-widest glitch-text"
              data-text="ADMIN ACCESS"
            >
              ADMIN ACCESS
            </h1>
            <p className="font-mono text-[#888888] text-xs mt-2">
              Northernwest Admin Panel
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block font-mono text-xs text-[#888888] uppercase tracking-widest mb-2">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className={inputClass}
              />
              {errors.email && (
                <p className="font-mono text-xs text-[#FF0000] mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block font-mono text-xs text-[#888888] uppercase tracking-widest mb-2">
                Password
              </label>
              <input
                {...register('password')}
                type="password"
                autoComplete="current-password"
                className={inputClass}
              />
              {errors.password && (
                <p className="font-mono text-xs text-[#FF0000] mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-4"
            >
              ACCESS SYSTEM
            </Button>
          </form>
        </motion.div>
      </div>
    </>
  );
}
