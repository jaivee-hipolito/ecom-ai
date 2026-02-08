'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMail, FiPhone, FiMapPin, FiSend, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { useState } from 'react';

interface ContactUsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactUsModal({ isOpen, onClose }: ContactUsModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setNotification({
          type: 'success',
          message: data.message || 'Thank you for contacting us! We will get back to you soon.',
        });
        setFormData({ name: '', email: '', subject: '', message: '' });
        
        // Close modal after 2 seconds
        setTimeout(() => {
          setNotification(null);
          onClose();
        }, 2000);
      } else {
        setNotification({
          type: 'error',
          message: data.error || 'Failed to send message. Please try again.',
        });
        setTimeout(() => setNotification(null), 5000);
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setNotification({
        type: 'error',
        message: 'An error occurred. Please try again later.',
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#050b2c] via-[#0a1538] to-[#050b2c] p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">Contact Us</h2>
                  <button
                    onClick={onClose}
                    className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                    aria-label="Close modal"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 sm:p-8">
                {/* Notification Toast */}
                <AnimatePresence>
                  {notification && (
                    <motion.div
                      initial={{ opacity: 0, y: -20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      className={`mb-6 p-4 rounded-xl shadow-lg border-2 ${
                        notification.type === 'success'
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800'
                          : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-red-800'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                          notification.type === 'success'
                            ? 'bg-green-500 text-white'
                            : 'bg-red-500 text-white'
                        }`}>
                          {notification.type === 'success' ? (
                            <FiCheckCircle className="w-5 h-5" />
                          ) : (
                            <FiAlertCircle className="w-5 h-5" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-bold text-sm mb-1 ${
                            notification.type === 'success' ? 'text-green-900' : 'text-red-900'
                          }`}>
                            {notification.type === 'success' ? 'Message Sent Successfully!' : 'Error Sending Message'}
                          </h3>
                          <p className={`text-sm ${
                            notification.type === 'success' ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {notification.message}
                          </p>
                        </div>
                        <button
                          onClick={() => setNotification(null)}
                          className={`flex-shrink-0 text-current opacity-70 hover:opacity-100 transition-opacity ${
                            notification.type === 'success' ? 'text-green-600' : 'text-red-600'
                          }`}
                          aria-label="Close notification"
                        >
                          <FiX className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Contact Information */}
                <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-[#050b2c]/5 to-[#ffa509]/5 rounded-xl p-4 text-center"
                  >
                    <div className="w-12 h-12 bg-[#ffa509] rounded-full flex items-center justify-center mx-auto mb-3">
                      <FiPhone className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-[#050b2c] mb-1">Phone</h3>
                    <a href="tel:+1234567890" className="text-gray-700 hover:text-[#ffa509] transition-colors text-sm">
                      +1 (234) 567-890
                    </a>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-[#050b2c]/5 to-[#ffa509]/5 rounded-xl p-4 text-center"
                  >
                    <div className="w-12 h-12 bg-[#ffa509] rounded-full flex items-center justify-center mx-auto mb-3">
                      <FiMail className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-[#050b2c] mb-1">Email</h3>
                    <a href="mailto:support@teezee.com" className="text-gray-700 hover:text-[#ffa509] transition-colors text-sm break-all">
                      support@teezee.com
                    </a>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-[#050b2c]/5 to-[#ffa509]/5 rounded-xl p-4 text-center"
                  >
                    <div className="w-12 h-12 bg-[#ffa509] rounded-full flex items-center justify-center mx-auto mb-3">
                      <FiMapPin className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-[#050b2c] mb-1">Location</h3>
                    <p className="text-gray-700 text-sm">Victoria, British Columbia, Canada</p>
                  </motion.div>
                </div>

                {/* Contact Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-[#050b2c] mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#ffa509] transition-colors bg-white text-[#050b2c] placeholder:text-gray-400"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-[#050b2c] mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#ffa509] transition-colors bg-white text-[#050b2c] placeholder:text-gray-400"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-[#050b2c] mb-2">
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#ffa509] transition-colors bg-white text-[#050b2c]"
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="order">Order Question</option>
                      <option value="return">Return/Exchange</option>
                      <option value="shipping">Shipping Question</option>
                      <option value="product">Product Question</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-[#050b2c] mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#ffa509] transition-colors resize-none bg-white text-[#050b2c] placeholder:text-gray-400"
                      placeholder="Your message..."
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-[#ffa509] to-[#ffb833] text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-[#ffa509]/30 hover:shadow-[#ffa509]/50 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <FiSend className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </motion.button>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
