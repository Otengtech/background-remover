import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiShield,
  FiCreditCard,
  FiRefreshCw,
  FiLock,
  FiHelpCircle,
  FiMail,
  FiMessageSquare
} from 'react-icons/fi';
import { useScrollReveal, useScrollRevealMap } from "../hooks/useIntersectionObserver";
import payImage from "../assets/paystack.png";

const SupportPage = () => {
  // Section refs
  const headerRef = useScrollReveal();
  const accountRef = useScrollReveal();
  const paymentRef = useScrollReveal();
  const refundRef = useScrollReveal();
  const faqRef = useScrollReveal();
  const contactRef = useScrollReveal();

  // Map refs
  const accountCardsRef = useScrollRevealMap(2);
  const paymentCardsRef = useScrollRevealMap(3);
  const faqItemsRef = useScrollRevealMap(5);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-white">
      
      {/* Header */}
      <header
        ref={headerRef}
        className="scroll-reveal from-bottom container mx-auto px-4 py-10 text-center"
      >
        <h1 className="text-4xl md:text-5xl font-bold mt-4">Support Center</h1>
        <p className="text-gray-400 mt-2">
          Get help with payments, accounts, and our services
        </p>
      </header>

      <main className="container mx-auto px-4 py-8">

        {/* Account Requirements */}
        <section
          ref={accountRef}
          className="scroll-reveal from-bottom mb-16"
        >
          <div className="p-6 md:p-8">
            <div className="flex items-center mb-6">
              <FiLock className="text-2xl text-blue-400 mr-3" />
              <h2 className="text-2xl font-bold">Account Requirements</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: "Why You Need an Account",
                  content: (
                    <>
                      <p className="text-gray-300 mb-4">
                        To access our professional background removal interface:
                      </p>
                      <ul className="space-y-2 text-gray-300">
                        <li>✓ Secure storage of images</li>
                        <li>✓ Credit tracking</li>
                        <li>✓ Usage history</li>
                        <li>✓ Secure payments</li>
                      </ul>
                    </>
                  )
                },
                {
                  title: "Getting Started",
                  content: (
                    <>
                      <ol className="space-y-3 text-gray-300">
                        <li>1. Register with email</li>
                        <li>2. Verify email</li>
                        <li>3. Access dashboard</li>
                        <li>4. Add credits</li>
                      </ol>
                      <Link
                        to="/register"
                        className="inline-block mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"
                      >
                        Create Free Account
                      </Link>
                    </>
                  )
                }
              ].map((item, index) => (
                <div
                  key={index}
                  ref={accountCardsRef(index)}
                  className="scroll-reveal from-bottom bg-gray-900/50 rounded-xl border border-gray-700 p-5"
                  style={{ transitionDelay: `${index * 0.15}s` }}
                >
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  {item.content}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Payment System */}
        <section
          ref={paymentRef}
          className="scroll-reveal from-bottom mb-16"
        >
          <div className="p-6 md:p-8">
            <div className="flex items-center mb-6">
              <FiCreditCard className="text-2xl text-green-400 mr-3" />
              <h2 className="text-2xl font-bold">Payment System</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "Powered by Paystack",
                  icon: (
                    <img src={payImage} alt="Paystack" className="w-8 h-8" />
                  ),
                  desc: "Secure payments powered by Paystack."
                },
                {
                  title: "Ghana Cedis (GHS)",
                  icon: <span className="text-xl font-bold">₵</span>,
                  desc: "All payments processed in GHS."
                },
                {
                  title: "Secure Transactions",
                  icon: <FiShield className="text-green-400" />,
                  desc: "PCI DSS compliant and encrypted."
                }
              ].map((card, index) => (
                <div
                  key={index}
                  ref={paymentCardsRef(index)}
                  className="scroll-reveal from-bottom bg-gray-900/50 rounded-xl border border-gray-700 p-5"
                  style={{ transitionDelay: `${index * 0.15}s` }}
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mr-4">
                      {card.icon}
                    </div>
                    <h3 className="text-xl font-semibold">{card.title}</h3>
                  </div>
                  <p className="text-gray-300">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Refund Policy */}
        <section
          ref={refundRef}
          className="scroll-reveal from-bottom mb-16 bg-gray-800/40 border border-gray-700 rounded-2xl p-6 md:p-8"
        >
          <div className="flex items-center mb-6">
            <FiRefreshCw className="text-2xl text-yellow-400 mr-3" />
            <h2 className="text-2xl font-bold">Refund Policy</h2>
          </div>
          <p className="text-gray-300">
            Refunds apply only to failed processing or duplicate charges.
          </p>
        </section>

        {/* FAQ */}
        <section
          ref={faqRef}
          className="scroll-reveal from-bottom mb-16 bg-gray-800/40 border border-gray-700 rounded-2xl p-6 md:p-8"
        >
          <h2 className="text-2xl font-bold mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              "Account creation is free",
              "Multiple payment methods supported",
              "Payments are secure",
              "Refunds are reviewed manually",
              "Support responds within 24 hours"
            ].map((faq, index) => (
              <div
                key={index}
                ref={faqItemsRef(index)}
                className="scroll-reveal from-bottom p-4 bg-gray-900/30 rounded-xl border border-gray-700"
                style={{ transitionDelay: `${index * 0.1}s` }}
              >
                <h3 className="font-semibold flex items-center">
                  <FiHelpCircle className="text-blue-400 mr-2" />
                  {faq}
                </h3>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section
          ref={contactRef}
          className="scroll-reveal from-bottom bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-700/30 rounded-2xl p-8 text-center"
        >
          <FiMessageSquare className="text-4xl text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
          <p className="text-gray-300 mb-6">
            Contact our support team anytime.
          </p>

          <div className="flex justify-center gap-4">
            <Link
              to="/contact"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"
            >
              Contact Support
            </Link>
            <a
              href="mailto:otengebenezer326@gmail.com"
              className="px-6 py-3 bg-gray-800 rounded-lg"
            >
              Email Us
            </a>
          </div>
        </section>

      </main>
    </div>
  );
};

export default SupportPage;
