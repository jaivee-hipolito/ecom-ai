'use client';

import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { FiFileText, FiShield, FiMail, FiPhone, FiArrowUp } from 'react-icons/fi';
import Link from 'next/link';

function TermsContent() {
  const searchParams = useSearchParams();
  const isEmbed = searchParams?.get('embed') === '1';

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 ${isEmbed ? 'pt-4' : ''}`}>
      {!isEmbed && <Navbar />}
      
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-[#000000] via-[#1a1a1a] to-[#000000] py-16 sm:py-20"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 bg-gradient-to-br from-[#F9629F] to-[#FC9BC2] rounded-2xl flex items-center justify-center shadow-2xl shadow-[#F9629F]/50"
            >
              <FiFileText className="w-10 h-10 text-[#000000]" />
            </motion.div>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-center text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-center text-white/80 text-lg sm:text-xl">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
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
            <p className="text-gray-700 leading-relaxed text-base sm:text-lg">
              This website is operated by <span className="font-bold text-[#000000]">Teezee</span> ("Company", "we", "us", or "our"). Throughout the site, the terms "we", "us" and "our" refer to Teezee. Teezee offers this website, including all information, tools and Services available from this site to you, the user, conditioned upon your acceptance of all terms, conditions, policies and notices stated here.
            </p>
            <p className="text-gray-700 leading-relaxed text-base sm:text-lg mt-4">
              By visiting our site and/or purchasing something from us, you engage in our "Service" and agree to be bound by the following terms and conditions ("Terms of Service", "Terms"), including those additional terms and conditions and policies referenced herein and/or available by hyperlink. These Terms of Service apply to all users of the site, including without limitation users who are browsers, vendors, customers, merchants, and/or contributors of content.
            </p>
            <p className="text-gray-700 leading-relaxed text-base sm:text-lg mt-4">
              Please read these Terms of Service carefully before accessing or using our website. By accessing or using any part of the site, you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions of this agreement, then you may not access the website or use any Services. If these Terms of Service are considered an offer, acceptance is expressly limited to these Terms of Service.
            </p>
            <p className="text-gray-700 leading-relaxed text-base sm:text-lg mt-4">
              Any new features or tools which are added to the current store shall also be subject to the Terms of Service. You can review the most current version of the Terms of Service at any time on this page. We reserve the right to update, change or replace any part of these Terms of Service by posting updates and/or changes to our website. It is your responsibility to check this page periodically for changes. Your continued use of or access to the website following the posting of any changes constitutes acceptance of those changes.
            </p>
          </motion.div>

          {/* Section 1 */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#000000] mb-4 flex items-center gap-3">
              <span className="inline-flex w-11 h-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#F9629F] text-white text-sm font-bold">1</span>
              ONLINE STORE TERMS
            </h2>
            <div className="ml-14 space-y-4 text-gray-700">
              <p className="leading-relaxed">
                By agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence, or that you are the age of majority and you have given us your consent to allow any of your minor dependents to use this site.
              </p>
              <p className="leading-relaxed">
                You may not use our products for any illegal or unauthorized purpose nor may you, in the use of the Service, violate any laws in your jurisdiction (including but not limited to copyright laws).
              </p>
              <p className="leading-relaxed">
                You must not transmit any worms or viruses or any code of a destructive nature.
              </p>
              <p className="leading-relaxed">
                A breach or violation of any of the Terms will result in an immediate termination of your Services.
              </p>
            </div>
          </motion.section>

          {/* Section 2 */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#000000] mb-4 flex items-center gap-3">
              <span className="inline-flex w-11 h-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#F9629F] text-white text-sm font-bold">2</span>
              GENERAL CONDITIONS
            </h2>
            <div className="ml-14 space-y-4 text-gray-700">
              <p className="leading-relaxed">
                We reserve the right to refuse Service to anyone for any reason at any time.
              </p>
              <p className="leading-relaxed">
                You understand that your content (not including credit card information) may be transferred unencrypted and involve:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>(a) transmissions over various networks; and</li>
                <li>(b) changes to conform and adapt to technical requirements of connecting networks or devices.</li>
              </ul>
              <p className="leading-relaxed">
                Credit card information is always encrypted during transfer over networks.
              </p>
              <p className="leading-relaxed">
                You agree not to reproduce, duplicate, copy, sell, resell or exploit any portion of the Service without express written permission by us.
              </p>
              <p className="leading-relaxed">
                The headings used in this agreement are included for convenience only and will not limit or otherwise affect these Terms.
              </p>
            </div>
          </motion.section>

          {/* Section 3 */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#000000] mb-4 flex items-center gap-3">
              <span className="inline-flex w-11 h-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#F9629F] text-white text-sm font-bold">3</span>
              ACCURACY, COMPLETENESS AND TIMELINESS OF INFORMATION
            </h2>
            <div className="ml-14 space-y-4 text-gray-700">
              <p className="leading-relaxed">
                We are not responsible if information made available on this site is not accurate, complete or current. The material on this site is provided for general information only and should not be relied upon as the sole basis for making decisions.
              </p>
              <p className="leading-relaxed">
                This site may contain historical information, which is provided for your reference only. We reserve the right to modify the contents of this site at any time but have no obligation to update any information.
              </p>
            </div>
          </motion.section>

          {/* Section 4 */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#000000] mb-4 flex items-center gap-3">
              <span className="inline-flex w-11 h-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#F9629F] text-white text-sm font-bold">4</span>
              MODIFICATIONS TO THE SERVICE AND PRICES
            </h2>
            <div className="ml-14 space-y-4 text-gray-700">
              <p className="leading-relaxed">
                Prices for our products are subject to change without notice.
              </p>
              <p className="leading-relaxed">
                We reserve the right at any time to modify or discontinue the Service without notice.
              </p>
              <p className="leading-relaxed">
                We shall not be liable to you or to any third-party for any modification, price change, suspension or discontinuance of the Service.
              </p>
            </div>
          </motion.section>

          {/* Section 5 */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#000000] mb-4 flex items-center gap-3">
              <span className="inline-flex w-11 h-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#F9629F] text-white text-sm font-bold">5</span>
              PRODUCTS OR SERVICES
            </h2>
            <div className="ml-14 space-y-4 text-gray-700">
              <p className="leading-relaxed">
                Certain products or Services may be available exclusively online through the website and may have limited quantities. These products are subject to return or exchange only according to our <Link href="/refund" className="text-[#F9629F] hover:text-[#FC9BC2] font-semibold underline">Refund Policy</Link>.
              </p>
              <p className="leading-relaxed">
                We have made every effort to display our products as accurately as possible. We cannot guarantee that your device's display of any color will be accurate.
              </p>
              <p className="leading-relaxed">
                We reserve the right to limit sales, quantities, or discontinue products at any time without notice.
              </p>
            </div>
          </motion.section>

          {/* Section 6 */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
            className="mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#000000] mb-4 flex items-center gap-3">
              <span className="inline-flex w-11 h-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#F9629F] text-white text-sm font-bold">6</span>
              ACCURACY OF BILLING AND ACCOUNT INFORMATION
            </h2>
            <div className="ml-14 space-y-4 text-gray-700">
              <p className="leading-relaxed">
                We reserve the right to refuse any order you place with us. We may limit or cancel quantities purchased per person, per household, or per order.
              </p>
              <p className="leading-relaxed">
                You agree to provide current, complete, and accurate purchase and account information and to promptly update your information as needed.
              </p>
              <p className="leading-relaxed">
                For more details, please review our <Link href="/refund" className="text-[#F9629F] hover:text-[#FC9BC2] font-semibold underline">Refund Policy</Link>.
              </p>
            </div>
          </motion.section>

          {/* Section 7 */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#000000] mb-4 flex items-center gap-3">
              <span className="inline-flex w-11 h-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#F9629F] text-white text-sm font-bold">7</span>
              OPTIONAL TOOLS
            </h2>
            <div className="ml-14 space-y-4 text-gray-700">
              <p className="leading-relaxed">
                We may provide access to third-party tools which we neither monitor nor control.
              </p>
              <p className="leading-relaxed">
                You acknowledge that such tools are provided "as is" and "as available" without warranties of any kind. Any use of optional tools is at your own risk.
              </p>
            </div>
          </motion.section>

          {/* Section 8 */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#000000] mb-4 flex items-center gap-3">
              <span className="inline-flex w-11 h-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#F9629F] text-white text-sm font-bold">8</span>
              THIRD-PARTY LINKS
            </h2>
            <div className="ml-14 space-y-4 text-gray-700">
              <p className="leading-relaxed">
                Certain content, products, and Services may include materials from third-parties. We are not responsible for third-party content or websites and are not liable for any damages related to third-party transactions.
              </p>
            </div>
          </motion.section>

          {/* Section 9 */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#000000] mb-4 flex items-center gap-3">
              <span className="inline-flex w-11 h-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#F9629F] text-white text-sm font-bold">9</span>
              USER COMMENTS, FEEDBACK AND OTHER SUBMISSIONS
            </h2>
            <div className="ml-14 space-y-4 text-gray-700">
              <p className="leading-relaxed">
                You agree that we may use, edit, copy, publish, and distribute any comments you submit without restriction or compensation.
              </p>
              <p className="leading-relaxed">
                You are solely responsible for your comments and agree they will not violate any third-party rights or laws.
              </p>
            </div>
          </motion.section>

          {/* Section 10 */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#000000] mb-4 flex items-center gap-3">
              <span className="inline-flex w-11 h-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#F9629F] text-white text-sm font-bold">10</span>
              PERSONAL INFORMATION
            </h2>
            <div className="ml-14 space-y-4 text-gray-700">
              <p className="leading-relaxed">
                Your submission of personal information through the store is governed by our Privacy Policy: <Link href="/privacy" className="text-[#F9629F] hover:text-[#FC9BC2] font-semibold underline">[LINK TO PRIVACY POLICY]</Link>
              </p>
            </div>
          </motion.section>

          {/* Section 11 */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#000000] mb-4 flex items-center gap-3">
              <span className="inline-flex w-11 h-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#F9629F] text-white text-sm font-bold">11</span>
              ERRORS, INACCURACIES AND OMISSIONS
            </h2>
            <div className="ml-14 space-y-4 text-gray-700">
              <p className="leading-relaxed">
                We reserve the right to correct errors, inaccuracies, or omissions and to change or cancel orders if information is inaccurate at any time without prior notice.
              </p>
            </div>
          </motion.section>

          {/* Section 12 */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
            className="mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#000000] mb-4 flex items-center gap-3">
              <span className="inline-flex w-11 h-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#F9629F] text-white text-sm font-bold">12</span>
              PROHIBITED USES
            </h2>
            <div className="ml-14 space-y-4 text-gray-700">
              <p className="leading-relaxed">
                You are prohibited from using the site or its content for unlawful purposes, violating laws, infringing intellectual property, harassing others, uploading malicious code, collecting personal data, or interfering with security features. Violation may result in termination of Services.
              </p>
            </div>
          </motion.section>

          {/* Section 13 */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.7 }}
            className="mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#000000] mb-4 flex items-center gap-3">
              <span className="inline-flex w-11 h-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#F9629F] text-white text-sm font-bold">13</span>
              DISCLAIMER OF WARRANTIES; LIMITATION OF LIABILITY
            </h2>
            <div className="ml-14 space-y-4 text-gray-700">
              <p className="leading-relaxed">
                All Services and products are provided "as is" and "as available" without warranties of any kind.
              </p>
              <p className="leading-relaxed">
                In no case shall Teezee, its owners, employees, affiliates, or Service providers be liable for any indirect, incidental, punitive, or consequential damages arising from your use of the Service or products, to the maximum extent permitted by law.
              </p>
            </div>
          </motion.section>

          {/* Section 14 */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
            className="mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#000000] mb-4 flex items-center gap-3">
              <span className="inline-flex w-11 h-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#F9629F] text-white text-sm font-bold">14</span>
              INDEMNIFICATION
            </h2>
            <div className="ml-14 space-y-4 text-gray-700">
              <p className="leading-relaxed">
                You agree to indemnify and hold harmless Teezee from any claim or demand arising from your breach of these Terms or violation of any law or third-party rights.
              </p>
            </div>
          </motion.section>

          {/* Section 15 */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.9 }}
            className="mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#000000] mb-4 flex items-center gap-3">
              <span className="inline-flex w-11 h-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#F9629F] text-white text-sm font-bold">15</span>
              SEVERABILITY
            </h2>
            <div className="ml-14 space-y-4 text-gray-700">
              <p className="leading-relaxed">
                If any provision of these Terms is found unlawful or unenforceable, the remaining provisions shall remain in full force and effect.
              </p>
            </div>
          </motion.section>

          {/* Section 16 */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.0 }}
            className="mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#000000] mb-4 flex items-center gap-3">
              <span className="inline-flex w-11 h-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#F9629F] text-white text-sm font-bold">16</span>
              TERMINATION
            </h2>
            <div className="ml-14 space-y-4 text-gray-700">
              <p className="leading-relaxed">
                These Terms remain effective unless terminated by you or us. We may terminate access to the Service at any time if you fail to comply with these Terms.
              </p>
            </div>
          </motion.section>

          {/* Section 17 */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.1 }}
            className="mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#000000] mb-4 flex items-center gap-3">
              <span className="inline-flex w-11 h-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#F9629F] text-white text-sm font-bold">17</span>
              ENTIRE AGREEMENT
            </h2>
            <div className="ml-14 space-y-4 text-gray-700">
              <p className="leading-relaxed">
                These Terms and any policies posted on this site constitute the entire agreement between you and Teezee and supersede prior agreements.
              </p>
            </div>
          </motion.section>

          {/* Section 18 */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.2 }}
            className="mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#000000] mb-4 flex items-center gap-3">
              <span className="inline-flex w-11 h-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#F9629F] text-white text-sm font-bold">18</span>
              GOVERNING LAW
            </h2>
            <div className="ml-14 space-y-4 text-gray-700">
              <p className="leading-relaxed">
                These Terms of Service shall be governed by and construed in accordance with the laws of Canada/British Columbia.
              </p>
            </div>
          </motion.section>

          {/* Section 19 */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.3 }}
            className="mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#000000] mb-4 flex items-center gap-3">
              <span className="inline-flex w-11 h-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#F9629F] text-white text-sm font-bold">19</span>
              CHANGES TO TERMS OF SERVICE
            </h2>
            <div className="ml-14 space-y-4 text-gray-700">
              <p className="leading-relaxed">
                We reserve the right to update or replace any part of these Terms at our discretion. Continued use of the website constitutes acceptance of changes.
              </p>
            </div>
          </motion.section>

          {/* Section 20 */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.4 }}
            className="mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#000000] mb-4 flex items-center gap-3">
              <span className="inline-flex w-11 h-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#F9629F] text-white text-sm font-bold">20</span>
              CONTACT INFORMATION
            </h2>
            <div className="ml-14 space-y-4 text-gray-700">
              <p className="leading-relaxed">
                Questions about the Terms of Service should be sent to us at:
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="flex items-center gap-2 text-[#000000]">
                  <FiMail className="w-5 h-5 flex-shrink-0 text-[#F9629F]" />
                  <a href="mailto:teezeejewelry.official@gmail.com" className="font-semibold hover:text-[#F9629F] transition-colors break-all">teezeejewelry.official@gmail.com</a>
                </div>
                <div className="flex items-center gap-2 text-[#000000]">
                  <FiPhone className="w-5 h-5 flex-shrink-0 text-[#F9629F]" />
                  <a href="tel:+12504094574" className="font-semibold hover:text-[#F9629F] transition-colors">+1 (250) 409-4574</a>
                </div>
              </div>
            </div>
          </motion.section>
        </motion.div>
      </div>

      {/* Scroll to Top Button - hidden in embed mode */}
      {!isEmbed && (
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2.5 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-[#F9629F] to-[#FC9BC2] text-white rounded-full shadow-2xl shadow-[#F9629F]/50 flex items-center justify-center z-50 hover:shadow-[#F9629F]/70 transition-all"
        aria-label="Scroll to top"
      >
        <FiArrowUp className="w-6 h-6" />
      </motion.button>
      )}

      {!isEmbed && <Footer />}
    </div>
  );
}

export default function TermsOfServicePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center min-h-[60vh]">Loading...</div>
        <Footer />
      </div>
    }>
      <TermsContent />
    </Suspense>
  );
}
