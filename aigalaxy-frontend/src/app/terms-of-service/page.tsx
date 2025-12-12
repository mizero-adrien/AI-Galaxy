'use client'

import Navbar from '../../Components/Navbar'
import Footer from '../../Components/Footer'
import Sidebar from '../../Components/Sidebar'
import Newsletter from '../../Components/Newsletter'
import SubmitToolButton from '../../Components/SubmitToolButton'
import { useState, useEffect } from 'react'

export default function TermsOfServicePage() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)
  const [sidebarWidth, setSidebarWidth] = useState<number>(192)

  // Load sidebar preferences
  useEffect(() => {
    const loadPreferences = async () => {
      if (typeof window === 'undefined') return;
      const storageModule = await import('../../utils/storage');
      const savedWidth = await storageModule.storage.getItem('sidebar-width');
      const savedOpen = await storageModule.storage.getItem('sidebar-open');
      
      if (savedWidth) {
        setSidebarWidth(parseInt(savedWidth, 10));
      }
      
      if (savedOpen === 'true') {
        setSidebarOpen(true);
      }
    };
    loadPreferences();
  }, []);

  const handleSidebarWidthChange = async (width: number) => {
    setSidebarWidth(width);
    if (typeof window !== 'undefined') {
      const storageModule = await import('../../utils/storage');
      await storageModule.storage.setItem('sidebar-width', width.toString());
    }
  };

  const handleSidebarToggle = async () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    if (typeof window !== 'undefined') {
      const storageModule = await import('../../utils/storage');
      await storageModule.storage.setItem('sidebar-open', newState.toString());
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Navbar onToggleSidebar={handleSidebarToggle} sidebarOpen={sidebarOpen} />
      <Sidebar 
        onClose={() => setSidebarOpen(false)} 
        isOpen={sidebarOpen}
        width={sidebarWidth}
        onWidthChange={handleSidebarWidthChange}
      />
      <main 
        className="pt-16 transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? `${sidebarWidth}px` : '0' }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 sm:p-8 md:p-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-6">
              Terms of Service
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <div className="prose prose-indigo dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">1. Acceptance of Terms</h2>
                <p className="leading-relaxed">
                  By accessing and using AI-Galaxy, you accept and agree to be bound by the terms and provision of 
                  this agreement. If you do not agree to these terms, please do not use our services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">2. Description of Service</h2>
                <p className="leading-relaxed">
                  AI-Galaxy is a platform that provides access to a curated collection of AI tools, resources, and 
                  information. We offer both free and premium services, including tool listings, categories, user 
                  accounts, favorites, and community features.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">3. User Accounts</h2>
                <p className="leading-relaxed mb-3">When you create an account, you agree to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and update your information to keep it accurate</li>
                  <li>Maintain the security of your password and account</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized use</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">4. Acceptable Use</h2>
                <p className="leading-relaxed mb-3">You agree not to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Use the service for any illegal purpose or in violation of any laws</li>
                  <li>Transmit any harmful code, viruses, or malicious software</li>
                  <li>Attempt to gain unauthorized access to any part of the service</li>
                  <li>Interfere with or disrupt the service or servers</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Impersonate any person or entity</li>
                  <li>Collect or store personal data about other users without permission</li>
                  <li>Use automated systems to access the service without authorization</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">5. Intellectual Property</h2>
                <p className="leading-relaxed">
                  All content on AI-Galaxy, including text, graphics, logos, images, and software, is the property of 
                  AI-Galaxy or its content suppliers and is protected by copyright and other intellectual property laws. 
                  You may not reproduce, distribute, or create derivative works without our written permission.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">6. Third-Party Tools and Services</h2>
                <p className="leading-relaxed">
                  AI-Galaxy provides information and links to third-party AI tools and services. We are not responsible 
                  for the content, privacy practices, or terms of service of these external tools. Your use of third-party 
                  services is subject to their respective terms and conditions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">7. Subscriptions and Payments</h2>
                <p className="leading-relaxed mb-3">For premium services:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Subscription fees are billed in advance on a recurring basis</li>
                  <li>All fees are non-refundable unless required by law</li>
                  <li>You may cancel your subscription at any time</li>
                  <li>Cancellation takes effect at the end of the current billing period</li>
                  <li>We reserve the right to change pricing with 30 days' notice</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">8. Disclaimer of Warranties</h2>
                <p className="leading-relaxed">
                  AI-Galaxy is provided "as is" and "as available" without warranties of any kind, either express or 
                  implied. We do not guarantee that the service will be uninterrupted, secure, or error-free, or that 
                  defects will be corrected.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">9. Limitation of Liability</h2>
                <p className="leading-relaxed">
                  To the maximum extent permitted by law, AI-Galaxy shall not be liable for any indirect, incidental, 
                  special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred 
                  directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">10. Indemnification</h2>
                <p className="leading-relaxed">
                  You agree to indemnify and hold harmless AI-Galaxy, its officers, directors, employees, and agents 
                  from any claims, damages, losses, liabilities, and expenses arising out of your use of the service 
                  or violation of these terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">11. Termination</h2>
                <p className="leading-relaxed">
                  We may terminate or suspend your account and access to the service immediately, without prior notice, 
                  for any breach of these terms. Upon termination, your right to use the service will cease immediately.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">12. Changes to Terms</h2>
                <p className="leading-relaxed">
                  We reserve the right to modify these terms at any time. We will notify users of significant changes 
                  by posting the updated terms on this page. Your continued use of the service after changes constitutes 
                  acceptance of the new terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">13. Governing Law</h2>
                <p className="leading-relaxed">
                  These terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], 
                  without regard to its conflict of law provisions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">14. Contact Information</h2>
                <p className="leading-relaxed">
                  If you have questions about these Terms of Service, please contact us at:
                </p>
                <p className="leading-relaxed mt-2">
                  <strong>Email:</strong> legal@aigalaxy.com<br />
                  <strong>Address:</strong> AI-Galaxy Legal Team, [Your Address]
                </p>
              </section>
            </div>
          </div>
        </div>
        <Newsletter />
        <SubmitToolButton />
        <Footer />
      </main>
    </div>
  )
}




