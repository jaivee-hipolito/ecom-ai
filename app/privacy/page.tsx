'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { FiShield, FiMail, FiMapPin, FiArrowUp, FiLock, FiEye, FiUser, FiCreditCard, FiShoppingBag, FiMessageCircle, FiSmartphone, FiActivity, FiMail as FiMailIcon, FiLink, FiUsers, FiAlertCircle, FiCheckCircle, FiGlobe } from 'react-icons/fi';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-[#050b2c] via-[#0a1538] to-[#050b2c] py-16 sm:py-20"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 bg-gradient-to-br from-[#ffa509] to-[#ffb833] rounded-2xl flex items-center justify-center shadow-2xl shadow-[#ffa509]/50"
            >
              <FiShield className="w-10 h-10 text-[#050b2c]" />
            </motion.div>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-center text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-center text-white/80 text-lg sm:text-xl">
            Last updated: January, 2026
          </p>
        </div>
      </motion.div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-12"
        >
          {/* Introduction */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <p className="text-gray-700 leading-relaxed text-base sm:text-lg mb-4">
              Teezee operates this store and website, including all related information, content, features, tools, products and services, in order to provide you, the customer, with a curated shopping experience (the "Services"). Teezee is powered by Shopify, which enables us to provide the Services to you.
            </p>
            <p className="text-gray-700 leading-relaxed text-base sm:text-lg mb-4">
              This Privacy Policy describes how we collect, use, and disclose your personal information when you visit, use, or make a purchase or other transaction using the Services or otherwise communicate with us. If there is a conflict between our <Link href="/terms" className="text-[#ffa509] hover:text-[#ffb833] font-semibold underline">Terms of Service</Link> and this Privacy Policy, this Privacy Policy controls with respect to the collection, processing, and disclosure of your personal information.
            </p>
            <p className="text-gray-700 leading-relaxed text-base sm:text-lg">
              Please read this Privacy Policy carefully. By using or accessing any of the Services, you acknowledge that you have read this Privacy Policy and understand the collection, use, and disclosure of your information as described.
            </p>
          </motion.div>

          {/* Personal Information We Collect */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#050b2c] mb-4 flex items-center gap-3">
              <FiUser className="w-8 h-8 text-[#ffa509]" />
              Personal Information We Collect or Process
            </h2>
            <div className="ml-2 space-y-4 text-gray-700">
              <p className="leading-relaxed">
                When we use the term "personal information," we mean information that identifies or can reasonably be linked to you or another person. Personal information does not include information that has been anonymized or de-identified.
              </p>
              <p className="leading-relaxed">
                Depending on how you interact with the Services, where you live, and as permitted or required by law, we may collect or process the following categories of personal information:
              </p>
              <ul className="space-y-3 ml-4">
                <li className="flex items-start gap-3">
                  <FiMail className="w-5 h-5 text-[#ffa509] mt-1 flex-shrink-0" />
                  <span><strong className="text-[#050b2c]">Contact details</strong> including your name, billing address, shipping address, phone number, and email address</span>
                </li>
                <li className="flex items-start gap-3">
                  <FiCreditCard className="w-5 h-5 text-[#ffa509] mt-1 flex-shrink-0" />
                  <span><strong className="text-[#050b2c]">Financial information</strong> including credit card or debit card details, payment confirmation, transaction details, and form of payment</span>
                </li>
                <li className="flex items-start gap-3">
                  <FiUser className="w-5 h-5 text-[#ffa509] mt-1 flex-shrink-0" />
                  <span><strong className="text-[#050b2c]">Account information</strong> including username, password, preferences, and settings</span>
                </li>
                <li className="flex items-start gap-3">
                  <FiShoppingBag className="w-5 h-5 text-[#ffa509] mt-1 flex-shrink-0" />
                  <span><strong className="text-[#050b2c]">Transaction information</strong> including items viewed, added to cart or wishlist, purchased, returned, exchanged, or canceled</span>
                </li>
                <li className="flex items-start gap-3">
                  <FiMessageCircle className="w-5 h-5 text-[#ffa509] mt-1 flex-shrink-0" />
                  <span><strong className="text-[#050b2c]">Communications</strong> including messages you send us through customer support or inquiries</span>
                </li>
                <li className="flex items-start gap-3">
                  <FiSmartphone className="w-5 h-5 text-[#ffa509] mt-1 flex-shrink-0" />
                  <span><strong className="text-[#050b2c]">Device information</strong> including IP address, browser type, device identifiers, and network information</span>
                </li>
                <li className="flex items-start gap-3">
                  <FiActivity className="w-5 h-5 text-[#ffa509] mt-1 flex-shrink-0" />
                  <span><strong className="text-[#050b2c]">Usage information</strong> including how and when you interact with or navigate the Services</span>
                </li>
              </ul>
            </div>
          </motion.section>

          {/* Personal Information Sources */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#050b2c] mb-4 flex items-center gap-3">
              <FiEye className="w-8 h-8 text-[#ffa509]" />
              Personal Information Sources
            </h2>
            <div className="ml-2 space-y-3 text-gray-700">
              <p className="leading-relaxed">We may collect personal information from the following sources:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#ffa509] rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong className="text-[#050b2c]">Directly from you,</strong> such as when you create an account, place an order, contact us, or otherwise provide information</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#ffa509] rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong className="text-[#050b2c]">Automatically,</strong> through cookies and similar technologies when you use our website or Services</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#ffa509] rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong className="text-[#050b2c]">From service providers,</strong> payment processors who collect or process information on our behalf</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#ffa509] rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong className="text-[#050b2c]">From partners or other third parties,</strong> as permitted by law</span>
                </li>
              </ul>
            </div>
          </motion.section>

          {/* How We Use Your Personal Information */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#050b2c] mb-4 flex items-center gap-3">
              <FiActivity className="w-8 h-8 text-[#ffa509]" />
              How We Use Your Personal Information
            </h2>
            <div className="ml-2 space-y-4 text-gray-700">
              <p className="leading-relaxed">We may use your personal information for the following purposes:</p>
              
              <div className="bg-gradient-to-r from-[#050b2c]/5 to-[#ffa509]/5 rounded-xl p-4 mb-4">
                <h3 className="font-bold text-[#050b2c] mb-2 flex items-center gap-2">
                  <FiShoppingBag className="w-5 h-5 text-[#ffa509]" />
                  Provide, Tailor, and Improve the Services
                </h3>
                <p className="leading-relaxed ml-7">
                  To process payments, fulfill orders, manage your account, ship jewelry items, handle returns or exchanges, remember preferences, enable reviews, and personalize your shopping experience.
                </p>
              </div>

              <div className="bg-gradient-to-r from-[#050b2c]/5 to-[#ffa509]/5 rounded-xl p-4 mb-4">
                <h3 className="font-bold text-[#050b2c] mb-2 flex items-center gap-2">
                  <FiMailIcon className="w-5 h-5 text-[#ffa509]" />
                  Marketing and Advertising
                </h3>
                <p className="leading-relaxed ml-7">
                  To send promotional communications by email or text message, and to show you advertisements on our website or other platforms based on your activity and interests.
                </p>
              </div>

              <div className="bg-gradient-to-r from-[#050b2c]/5 to-[#ffa509]/5 rounded-xl p-4 mb-4">
                <h3 className="font-bold text-[#050b2c] mb-2 flex items-center gap-2">
                  <FiLock className="w-5 h-5 text-[#ffa509]" />
                  Security and Fraud Prevention
                </h3>
                <p className="leading-relaxed ml-7">
                  To authenticate accounts, process secure payments, detect fraudulent or illegal activity, and protect our business and customers.
                </p>
              </div>

              <div className="bg-gradient-to-r from-[#050b2c]/5 to-[#ffa509]/5 rounded-xl p-4 mb-4">
                <h3 className="font-bold text-[#050b2c] mb-2 flex items-center gap-2">
                  <FiMessageCircle className="w-5 h-5 text-[#ffa509]" />
                  Communicating with You
                </h3>
                <p className="leading-relaxed ml-7">
                  To respond to inquiries, provide customer support, and maintain our relationship with you.
                </p>
              </div>

              <div className="bg-gradient-to-r from-[#050b2c]/5 to-[#ffa509]/5 rounded-xl p-4">
                <h3 className="font-bold text-[#050b2c] mb-2 flex items-center gap-2">
                  <FiShield className="w-5 h-5 text-[#ffa509]" />
                  Legal Reasons
                </h3>
                <p className="leading-relaxed ml-7">
                  To comply with applicable laws, respond to lawful requests, enforce our Terms of Service, and protect our legal rights.
                </p>
              </div>
            </div>
          </motion.section>

          {/* How We Disclose Personal Information */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#050b2c] mb-4 flex items-center gap-3">
              <FiLink className="w-8 h-8 text-[#ffa509]" />
              How We Disclose Personal Information
            </h2>
            <div className="ml-2 space-y-3 text-gray-700">
              <p className="leading-relaxed">We may disclose personal information in the following circumstances:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#ffa509] rounded-full mt-2 flex-shrink-0"></span>
                  <span>With vendors, and service providers (payment processing, analytics, shipping, customer support)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#ffa509] rounded-full mt-2 flex-shrink-0"></span>
                  <span>With marketing and advertising partners for personalized advertising, in accordance with their privacy policies</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#ffa509] rounded-full mt-2 flex-shrink-0"></span>
                  <span>When you direct or consent to disclosure (e.g., shipping providers or social media integrations)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#ffa509] rounded-full mt-2 flex-shrink-0"></span>
                  <span>With affiliates or within our corporate group</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#ffa509] rounded-full mt-2 flex-shrink-0"></span>
                  <span>In connection with business transactions, legal obligations, or to protect rights and safety</span>
                </li>
              </ul>
            </div>
          </motion.section>

          {/* Third-Party Websites */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#050b2c] mb-4 flex items-center gap-3">
              <FiLink className="w-8 h-8 text-[#ffa509]" />
              Third-Party Websites and Links
            </h2>
            <div className="ml-2 space-y-3 text-gray-700">
              <p className="leading-relaxed">
                Our Services may include links to third-party websites. We are not responsible for the privacy or security practices of those sites. Information shared publicly or through third-party platforms may be visible to others.
              </p>
            </div>
          </motion.section>

          {/* Children's Data */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
            className="mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#050b2c] mb-4 flex items-center gap-3">
              <FiUsers className="w-8 h-8 text-[#ffa509]" />
              Children's Data
            </h2>
            <div className="ml-2 space-y-3 text-gray-700">
              <p className="leading-relaxed">
                The Services are not intended for children, and we do not knowingly collect personal information from individuals under the age of majority in their jurisdiction.
              </p>
            </div>
          </motion.section>

          {/* Security and Retention */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#050b2c] mb-4 flex items-center gap-3">
              <FiLock className="w-8 h-8 text-[#ffa509]" />
              Security and Retention of Information
            </h2>
            <div className="ml-2 space-y-3 text-gray-700">
              <p className="leading-relaxed">
                No security system is perfect, and we cannot guarantee absolute security. Information retention depends on operational, legal, and contractual requirements.
              </p>
            </div>
          </motion.section>

          {/* Your Rights and Choices */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#050b2c] mb-4 flex items-center gap-3">
              <FiCheckCircle className="w-8 h-8 text-[#ffa509]" />
              Your Rights and Choices
            </h2>
            <div className="ml-2 space-y-4 text-gray-700">
              <p className="leading-relaxed">
                Depending on where you live, you may have the right to:
              </p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#ffa509] rounded-full mt-2 flex-shrink-0"></span>
                  <span>Access or know what personal information we hold</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#ffa509] rounded-full mt-2 flex-shrink-0"></span>
                  <span>Request deletion of personal information</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#ffa509] rounded-full mt-2 flex-shrink-0"></span>
                  <span>Correct inaccurate personal information</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#ffa509] rounded-full mt-2 flex-shrink-0"></span>
                  <span>Request portability of your information</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#ffa509] rounded-full mt-2 flex-shrink-0"></span>
                  <span>Opt out of sale or sharing of personal information for targeted advertising</span>
                </li>
              </ul>
              <p className="leading-relaxed mt-4">
                We honor Global Privacy Control (GPC) signals where required by law. You may unsubscribe from marketing emails at any time.
              </p>
              <p className="leading-relaxed">
                If you reside in the UK or EEA, you may also have the right to object to processing or withdraw consent.
              </p>
              <p className="leading-relaxed">
                We will not discriminate against you for exercising your rights and may verify your identity before fulfilling requests.
              </p>
            </div>
          </motion.section>

          {/* Complaints */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#050b2c] mb-4 flex items-center gap-3">
              <FiAlertCircle className="w-8 h-8 text-[#ffa509]" />
              Complaints
            </h2>
            <div className="ml-2 space-y-3 text-gray-700">
              <p className="leading-relaxed">
                If you have concerns about how we process your personal information, please contact us. Depending on your location, you may also have the right to lodge a complaint with a data protection authority.
              </p>
            </div>
          </motion.section>

          {/* International Transfers */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#050b2c] mb-4 flex items-center gap-3">
              <FiGlobe className="w-8 h-8 text-[#ffa509]" />
              International Transfers
            </h2>
            <div className="ml-2 space-y-3 text-gray-700">
              <p className="leading-relaxed">
                Your personal information may be transferred, stored, or processed outside your country. Where required, we rely on approved transfer mechanisms such as Standard Contractual Clauses.
              </p>
            </div>
          </motion.section>

          {/* Changes to Privacy Policy */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#050b2c] mb-4 flex items-center gap-3">
              <FiActivity className="w-8 h-8 text-[#ffa509]" />
              Changes to This Privacy Policy
            </h2>
            <div className="ml-2 space-y-3 text-gray-700">
              <p className="leading-relaxed">
                We may update this Privacy Policy periodically. Updates will be posted on this page with a revised "Last updated" date.
              </p>
            </div>
          </motion.section>

          {/* Contact */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
            className="mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#050b2c] mb-4 flex items-center gap-3">
              <FiMail className="w-8 h-8 text-[#ffa509]" />
              Contact
            </h2>
            <div className="ml-2 space-y-4 text-gray-700">
              <p className="leading-relaxed">
                If you have questions about this Privacy Policy or wish to exercise your rights, contact us at:
              </p>
              <div className="bg-gradient-to-r from-[#050b2c]/10 to-[#ffa509]/10 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-3 text-[#050b2c]">
                  <FiMail className="w-6 h-6 text-[#ffa509]" />
                  <a href="mailto:support@teezee.com" className="font-semibold text-lg hover:text-[#ffa509] transition-colors">
                    📧 support@teezee.com
                  </a>
                </div>
                <div className="flex items-center gap-3 text-[#050b2c]">
                  <FiMapPin className="w-6 h-6 text-[#ffa509]" />
                  <span className="font-semibold text-lg">
                    📍 Victoria, British Columbia, Canada
                  </span>
                </div>
              </div>
            </div>
          </motion.section>
        </motion.div>
      </div>

      {/* Scroll to Top Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.7 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-[#ffa509] to-[#ffb833] text-white rounded-full shadow-2xl shadow-[#ffa509]/50 flex items-center justify-center z-50 hover:shadow-[#ffa509]/70 transition-all"
        aria-label="Scroll to top"
      >
        <FiArrowUp className="w-6 h-6" />
      </motion.button>

      <Footer />
    </div>
  );
}
