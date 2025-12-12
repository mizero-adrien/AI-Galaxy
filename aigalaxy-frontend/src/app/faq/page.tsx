'use client'

import Navbar from '../../Components/Navbar'
import Footer from '../../Components/Footer'
import Sidebar from '../../Components/Sidebar'
import Newsletter from '../../Components/Newsletter'
import SubmitToolButton from '../../Components/SubmitToolButton'
import { useState, useEffect } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'

interface FAQItem {
  question: string
  answer: string
}

export default function FAQPage() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)
  const [sidebarWidth, setSidebarWidth] = useState<number>(192)
  const [openIndex, setOpenIndex] = useState<number | null>(0)

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

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  const faqs: FAQItem[] = [
    {
      question: "What is AI-Galaxy?",
      answer: "AI-Galaxy is a comprehensive platform that curates and provides access to over 3000+ AI tools across various categories. We help users discover, compare, and learn about AI solutions to enhance productivity and innovation."
    },
    {
      question: "How do I create an account?",
      answer: "Click on the 'Sign In' button in the top navigation, then select 'Sign Up' or 'Register'. Fill in your information including username, email, and password. Once registered, you can access personalized features like favorites and profile management."
    },
    {
      question: "Is AI-Galaxy free to use?",
      answer: "Yes! AI-Galaxy offers free access to browse and discover AI tools. Some tools listed on our platform may have their own pricing, and we also offer premium subscription plans for enhanced features and exclusive content."
    },
    {
      question: "What's the difference between free and premium tools?",
      answer: "Free tools are accessible to all users without cost. Premium tools may require a subscription or payment to the tool provider. Some tools offer both free and premium tiers with different feature sets."
    },
    {
      question: "How do I add tools to my favorites?",
      answer: "When browsing AI tools, click the heart icon on any tool card to add it to your favorites. You can view all your favorite tools in the 'Favorites' section of your profile."
    },
    {
      question: "Can I suggest a new AI tool to be added?",
      answer: "Yes! We welcome tool suggestions. Please contact us through our Contact page or Support center with details about the tool, and our team will review it for inclusion in our directory."
    },
    {
      question: "How do I cancel my subscription?",
      answer: "You can cancel your subscription at any time from your Profile page under the Subscriptions section. Cancellation will take effect at the end of your current billing period, and you'll continue to have access until then."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept major credit cards, debit cards, and PayPal. All payments are processed securely through our payment partners."
    },
    {
      question: "How do I update my profile information?",
      answer: "Navigate to your Profile page (click on your username in the top navigation), then click 'Edit Profile' to update your information, including username, email, and preferences."
    },
    {
      question: "Is my data secure?",
      answer: "Yes, we take data security seriously. We implement industry-standard security measures to protect your personal information. Please review our Privacy Policy for detailed information about how we handle your data."
    },
    {
      question: "How do I report a bug or issue?",
      answer: "You can report bugs or issues through our Support page or Contact form. Please provide as much detail as possible, including what you were doing when the issue occurred and any error messages you saw."
    },
    {
      question: "Can I use AI-Galaxy on mobile devices?",
      answer: "Yes! AI-Galaxy is fully responsive and works on mobile phones, tablets, and desktop computers. You can access all features from any device with a modern web browser."
    },
    {
      question: "Do you have an API?",
      answer: "Yes, we offer API access for developers. Please contact our support team for API documentation and access credentials."
    },
    {
      question: "How often is the tool directory updated?",
      answer: "We regularly update our directory with new tools and information. New tools are added weekly, and existing tool information is reviewed and updated regularly to ensure accuracy."
    },
    {
      question: "Can I contribute content or write for the blog?",
      answer: "We welcome contributions! Please contact us through our Support or Contact page with your proposal, and our team will review it. We're always looking for quality content about AI tools and innovations."
    }
  ]

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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-10 md:py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg">
              Find answers to common questions about AI-Galaxy
            </p>
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 sm:px-8 sm:py-5 text-left flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 pr-4">
                    {faq.question}
                  </h3>
                  {openIndex === index ? (
                    <ChevronUpIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                  )}
                </button>
                {openIndex === index && (
                  <div className="px-6 sm:px-8 pb-5 sm:pb-6">
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Still Have Questions */}
          <div className="mt-12 bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 sm:p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Still have questions?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Can't find the answer you're looking for? Please reach out to our friendly support team.
            </p>
            <a
              href="/contact"
              className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
        <Newsletter />
        <SubmitToolButton />
        <Footer />
      </main>
    </div>
  )
}




