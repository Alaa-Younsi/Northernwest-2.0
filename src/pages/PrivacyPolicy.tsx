import { motion } from 'framer-motion';
import { SEOHead } from '@/components/seo/SEOHead';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-10">
    <h2 className="font-display font-bold text-white uppercase tracking-widest text-lg mb-4 border-l-2 border-[#FF0000] pl-4">
      {title}
    </h2>
    <div className="font-mono text-sm text-[#888888] leading-relaxed space-y-3 pl-4">{children}</div>
  </div>
);

export default function PrivacyPolicy() {
  return (
    <>
      <SEOHead title="Privacy Policy — Northernwest" />

      <div className="min-h-screen py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="font-mono text-[#FF0000] text-xs uppercase tracking-[0.3em] mb-3">Legal</p>
            <h1 className="font-display font-black text-white uppercase tracking-widest text-4xl md:text-5xl mb-3">
              PRIVACY POLICY
            </h1>
            <p className="font-mono text-[#555] text-xs mb-12">Last updated: April 2026</p>

            <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-8 md:p-12">
              <Section title="1. Information We Collect">
                <p>
                  We collect information you provide directly to us, including your name, email address, shipping
                  address, and phone number when you place an order or contact us.
                </p>
                <p>
                  We also automatically collect certain information when you visit our Website, including your IP
                  address, browser type, and pages visited (through our anonymous analytics system).
                </p>
              </Section>

              <Section title="2. How We Use Your Information">
                <p>We use the information we collect to:</p>
                <ul className="list-none space-y-1 mt-2">
                  {[
                    'Process and fulfill your orders',
                    'Send order confirmations and shipping updates',
                    'Respond to your comments and questions',
                    'Send newsletter emails (only if you subscribed)',
                    'Improve our Website and products',
                    'Detect and prevent fraud',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-[#FF0000] mt-0.5">—</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Section>

              <Section title="3. Information Sharing">
                <p>
                  We do not sell, trade, or otherwise transfer your personally identifiable information to outside
                  parties except as described below.
                </p>
                <p>
                  We may share your information with trusted third parties who assist us in operating our Website and
                  conducting our business (e.g., payment processors, shipping carriers), so long as those parties
                  agree to keep this information confidential.
                </p>
              </Section>

              <Section title="4. Data Storage and Security">
                <p>
                  Your data is stored securely using Supabase, a cloud database platform with industry-standard
                  security practices. We implement appropriate technical and organizational measures to protect your
                  personal information.
                </p>
                <p>
                  However, no method of transmission over the Internet is 100% secure. While we strive to use
                  commercially acceptable means to protect your personal information, we cannot guarantee its
                  absolute security.
                </p>
              </Section>

              <Section title="5. Cookies and Tracking">
                <p>
                  We use localStorage (a browser-side storage mechanism) to maintain your shopping cart, language
                  preference, and an anonymous visitor identifier for analytics purposes.
                </p>
                <p>
                  No personally identifiable information is stored in localStorage. You can clear this data at any
                  time through your browser settings.
                </p>
              </Section>

              <Section title="6. Newsletter">
                <p>
                  If you subscribe to our newsletter, we will use your email address to send you updates about new
                  products and promotions. You can unsubscribe at any time by contacting us through our{' '}
                  <a href="/contact" className="text-[#FF0000] hover:underline">
                    Contact page
                  </a>
                  .
                </p>
              </Section>

              <Section title="7. Your Rights">
                <p>
                  You have the right to access, correct, or delete your personal information. To exercise these rights,
                  please contact us through our Contact page. We will respond to your request within 30 days.
                </p>
              </Section>

              <Section title="8. Changes to This Policy">
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting
                  the new Privacy Policy on this page with an updated date.
                </p>
              </Section>

              <Section title="9. Contact Us">
                <p>
                  If you have any questions about this Privacy Policy, please contact us through our{' '}
                  <a href="/contact" className="text-[#FF0000] hover:underline">
                    Contact page
                  </a>
                  .
                </p>
              </Section>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
