import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, User, MessageSquare, Send } from 'lucide-react';
import { SEOHead } from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { toast } from '@/components/ui/Toast';

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    setLoading(true);
    try {
      await api.messages.create(form);
      setSent(true);
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full bg-[#0d0d0d] border border-[#1a1a1a] px-4 py-3 font-mono text-sm text-white placeholder-[#333] focus:border-[#FF0000] focus:outline-none transition-colors';

  return (
    <>
      <SEOHead title="Contact — Northernwest" />

      <div className="min-h-screen py-20 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <p className="font-mono text-[#FF0000] text-xs uppercase tracking-[0.3em] mb-3">
              Get in touch
            </p>
            <h1 className="font-display font-black text-white uppercase tracking-widest text-4xl md:text-5xl mb-4">
              CONTACT US
            </h1>
            <p className="font-mono text-[#888888] text-sm leading-relaxed max-w-xl">
              Have a question, feedback, or need support? Fill out the form below and we'll get back to you as soon as possible.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Info column */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-2 space-y-8"
            >
              {[
                {
                  icon: Mail,
                  label: 'Email',
                  value: 'support@northernwest.store',
                },
                {
                  icon: MessageSquare,
                  label: 'Response Time',
                  value: 'Within 24 hours',
                },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#0d0d0d] border border-[#1a1a1a] flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-[#FF0000]" />
                  </div>
                  <div>
                    <p className="font-mono text-xs text-[#888888] uppercase tracking-widest mb-1">
                      {label}
                    </p>
                    <p className="font-mono text-sm text-white">{value}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="lg:col-span-3"
            >
              {sent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#0d0d0d] border border-[#1a1a1a] p-12 text-center"
                >
                  <div className="w-16 h-16 bg-black border border-[#FF0000] flex items-center justify-center mx-auto mb-6">
                    <Send size={24} className="text-[#FF0000]" />
                  </div>
                  <h2 className="font-display font-bold text-white uppercase tracking-widest text-xl mb-3">
                    MESSAGE RECEIVED
                  </h2>
                  <p className="font-mono text-[#888888] text-sm mb-6">
                    Thank you for reaching out. We'll get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => setSent(false)}
                    className="font-mono text-xs text-[#FF0000] hover:underline uppercase tracking-widest"
                  >
                    Send another message →
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="flex items-center gap-2 font-mono text-xs text-[#888888] uppercase tracking-widest mb-2">
                        <User size={12} />
                        Name *
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        required
                        className={inputClass}
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 font-mono text-xs text-[#888888] uppercase tracking-widest mb-2">
                        <Mail size={12} />
                        Email *
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        required
                        className={inputClass}
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 font-mono text-xs text-[#888888] uppercase tracking-widest mb-2">
                      <MessageSquare size={12} />
                      Message *
                    </label>
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                      required
                      rows={8}
                      className={`${inputClass} resize-none`}
                      placeholder="Your message..."
                    />
                  </div>

                  <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full sm:w-auto">
                    SEND MESSAGE
                  </Button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
