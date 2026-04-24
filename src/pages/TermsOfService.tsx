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

export default function TermsOfService() {
  return (
    <>
      <SEOHead title="Terms of Service — Northernwest" />

      <div className="min-h-screen py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="font-mono text-[#FF0000] text-xs uppercase tracking-[0.3em] mb-3">Legal</p>
            <h1 className="font-display font-black text-white uppercase tracking-widest text-4xl md:text-5xl mb-3">
              TERMS OF SERVICE
            </h1>
            <p className="font-mono text-[#555] text-xs mb-12">Last updated: April 2026</p>

            <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-8 md:p-12">
              <Section title="1. Acceptance of Terms">
                <p>
                  By accessing and using Northernwest ("the Website"), you accept and agree to be bound by these Terms of
                  Service. If you do not agree to these terms, please do not use our Website.
                </p>
              </Section>

              <Section title="2. Products and Orders">
                <p>
                  All products listed on Northernwest are subject to availability. We reserve the right to discontinue
                  any product at any time without notice.
                </p>
                <p>
                  Prices are listed in USD and are subject to change without notice. We reserve the right to refuse or
                  cancel any order at our discretion.
                </p>
                <p>
                  Once an order is placed, you will receive an order confirmation. This does not constitute acceptance
                  of your order — we reserve the right to cancel orders due to pricing errors or stock unavailability.
                </p>
              </Section>

              <Section title="3. Shipping and Delivery">
                <p>
                  We ship to the address provided at checkout. Northernwest is not responsible for incorrect addresses
                  provided by the customer. Delivery times are estimates and not guaranteed.
                </p>
                <p>
                  Risk of loss and title for items purchased pass to you upon delivery to the carrier.
                </p>
              </Section>

              <Section title="4. Returns and Refunds">
                <p>
                  We accept returns within 30 days of delivery for items in their original, unused condition with
                  original packaging. To initiate a return, contact us via our Contact page.
                </p>
                <p>
                  Refunds will be processed within 7–10 business days of receiving the returned item. Shipping costs
                  for returns are the responsibility of the customer unless the item arrived damaged or incorrect.
                </p>
              </Section>

              <Section title="5. Intellectual Property">
                <p>
                  All content on this Website, including text, graphics, logos, images, and software, is the property
                  of Northernwest and is protected by applicable intellectual property laws.
                </p>
                <p>
                  You may not reproduce, distribute, or create derivative works from any content on this Website
                  without our express written permission.
                </p>
              </Section>

              <Section title="6. Limitation of Liability">
                <p>
                  To the maximum extent permitted by law, Northernwest shall not be liable for any indirect,
                  incidental, special, consequential, or punitive damages arising from your use of the Website or
                  our products.
                </p>
              </Section>

              <Section title="7. Governing Law">
                <p>
                  These Terms of Service shall be governed by and construed in accordance with applicable laws.
                  Any disputes arising from these terms shall be resolved through binding arbitration.
                </p>
              </Section>

              <Section title="8. Changes to Terms">
                <p>
                  We reserve the right to modify these Terms of Service at any time. Changes will be effective
                  immediately upon posting to the Website. Your continued use of the Website after any changes
                  constitutes your acceptance of the new terms.
                </p>
              </Section>

              <Section title="9. Contact">
                <p>
                  If you have any questions about these Terms of Service, please contact us through our{' '}
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
