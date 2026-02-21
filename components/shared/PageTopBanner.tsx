'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

/**
 * Reusable top-of-page banner: value props (In-Stock, Tax-Free, Prestige),
 * brand quote, and payment/financing options. Shown on every page except home.
 */
export default function PageTopBanner() {
  return (
    <>
      {/* Value props bar: In-Stock Ready to Ship · Exclusively Tax-Free · Prestige Investment (~30% smaller) */}
      <section className="bg-gray-50 border-b border-gray-200/80 overflow-x-auto">
        <div className="max-w-5xl mx-auto px-3 sm:px-5 lg:px-6 py-2.5 sm:py-3.5 lg:py-4">
          <div className="flex flex-nowrap items-center justify-center gap-0 divide-x divide-gray-300/60">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="flex flex-col items-center justify-center flex-shrink-0 px-4 sm:px-5 lg:px-8"
            >
              <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">In-stock</span>
              <span className="mt-0.5 font-bold text-xs sm:text-sm lg:text-base text-[#000000] whitespace-nowrap">Ready to Ship</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex flex-col items-center justify-center flex-shrink-0 px-4 sm:px-5 lg:px-8"
            >
              <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">Exclusively</span>
              <span className="mt-0.5 font-bold text-xs sm:text-sm lg:text-base text-[#F9629F] whitespace-nowrap">Tax-Free</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="flex flex-col items-center justify-center flex-shrink-0 px-4 sm:px-5 lg:px-8"
            >
              <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">Prestige</span>
              <span className="mt-0.5 font-bold text-xs sm:text-sm lg:text-base text-[#000000] whitespace-nowrap">Investment</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Brand tagline - professional ecommerce block before payment options */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-gray-50/60 border-y border-gray-200/80 py-3 sm:py-5 lg:py-6"
      >
        <div className="max-w-3xl mx-auto px-3 sm:px-5 lg:px-6 text-center">
          <p className="text-base sm:text-lg lg:text-xl text-[#000000] tracking-wide max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
            &ldquo;𝓔𝓵𝓮𝓿𝓪𝓽𝓮 𝔂𝓸𝓾𝓻 𝓵𝓸𝓸𝓴 𝔀𝓲𝓽𝓱 𝓮𝔁𝓺𝓾𝓲𝓼𝓲𝓽𝓮 𝓳𝓮𝔀𝓮𝓵𝓼&rdquo;
          </p>
          <div className="mt-2.5 w-8 h-px bg-[#F9629F]/60 mx-auto rounded-full" aria-hidden />
        </div>
      </motion.section>

      {/* Payment options: Affirm, Klarna, Afterpay */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-gray-50/80 border-y border-gray-200/90 py-3 sm:py-5 lg:py-7"
      >
        <div className="max-w-4xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="text-center mb-3 sm:mb-4 lg:mb-5">
            <h3 className="text-xs font-bold uppercase tracking-[0.24em] text-[#000000] mb-2">
              Shop now. Pay later.
            </h3>
            <p className="text-[#000000] text-sm sm:text-base font-semibold leading-relaxed max-w-2xl mx-auto text-gray-800" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
              ✨ᴇɴᴊᴏʏ ʏᴏᴜʀ ᴊᴇᴡᴇʟʀʏ ɪɴᴠᴇꜱᴛᴍᴇɴᴛ ᴛᴏᴅᴀʏ ᴀɴᴅ ᴘᴀʏ ᴏᴠᴇʀ ᴛɪᴍᴇ ᴡɪᴛʜ ꜰʟᴇxɪʙʟᴇ ɪɴꜱᴛᴀʟʟᴍᴇɴᴛ ᴏᴘᴛɪᴏɴꜱ. ᴄʜᴏᴏꜱᴇ ꜰʀᴏᴍ ᴛʀᴜꜱᴛᴇᴅ ᴘʀᴏᴠɪᴅᴇʀꜱ ɪɴᴄʟᴜᴅɪɴɢ ᴀꜰꜰɪʀᴍ, ᴋʟᴀʀɴᴀ ᴀɴᴅ ᴀꜰᴛᴇʀᴘᴀʏ—ᴍᴀᴋɪɴɢ ɪᴛ ᴇᴀꜱʏ ᴛᴏ ꜱʜᴏᴘ ɴᴏᴡ ᴀɴᴅ ᴘᴀʏ ʟᴀᴛᴇʀ ᴡɪᴛʜ ᴄᴏɴꜰɪᴅᴇɴᴄᴇ. ✨
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4">
            <div className="flex items-center justify-center py-1.5">
              <Image src="/payment/affirm-logo.svg" alt="Affirm" width={84} height={25} className="h-6 sm:h-7 w-auto object-contain" unoptimized />
            </div>
            <div className="px-2.5 py-1.5 rounded-lg flex items-center justify-center bg-[#FDE2E8]">
              <span className="font-bold text-sm sm:text-base text-black">Klarna.</span>
            </div>
            <div className="px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 bg-[#C4F2E8]">
              <span className="font-bold text-sm sm:text-base text-black lowercase">afterpay</span>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-black flex-shrink-0" aria-hidden>
                <path d="M4 12L2 8L4 4M12 4L14 8L12 12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div className="mt-3 pt-3 sm:mt-5 sm:pt-4 border-t border-gray-200">
            <p className="text-center text-[9px] font-semibold uppercase tracking-[0.18em] text-gray-500 mb-2 sm:mb-2.5">
              Or pay with
            </p>
            <div className="flex flex-wrap items-stretch justify-center gap-2 sm:gap-2.5 lg:gap-3.5">
              <motion.div
                whileHover={{ y: -2 }}
                className="w-[126px] sm:w-[140px] rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-gray-300/80 transition-all overflow-hidden flex flex-col"
              >
                <div className="flex-1 flex items-center justify-center min-h-[36px] p-2">
                  <div className="inline-flex items-stretch overflow-hidden rounded border border-gray-200/80 shadow-inner">
                    <div className="flex items-center pl-1.5 pr-1 py-1 bg-[#f5a623]" style={{ borderTopLeftRadius: 3, borderBottomLeftRadius: 3 }}>
                      <span className="font-black text-[#2d2d2d] text-[8px] uppercase italic tracking-tight">Interac</span>
                    </div>
                    <div className="flex items-center px-1.5 py-1 bg-[#4a4a4a]" style={{ borderTopRightRadius: 3, borderBottomRightRadius: 3 }}>
                      <span className="font-bold text-white text-[8px]">e-Transfer</span>
                    </div>
                  </div>
                </div>
                <p className="text-center text-[8px] font-bold uppercase tracking-widest text-gray-700 py-1.5 px-2 border-t border-gray-100">Interac e-Transfer</p>
              </motion.div>
              <motion.div
                whileHover={{ y: -2 }}
                className="w-[126px] sm:w-[140px] rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300/80 transition-all flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50"
              >
                <div className="flex-1 flex items-center justify-center min-h-[36px] gap-2 p-2">
                  <span className="font-bold text-xs tracking-tight text-[#1A1F71]">Visa</span>
                  <div className="relative w-6 h-4 flex items-center justify-center flex-shrink-0">
                    <span className="absolute w-3 h-3 rounded-full bg-[#EB001B]" style={{ left: 0, top: '50%', transform: 'translateY(-50%)' }} aria-hidden />
                    <span className="absolute w-3 h-3 rounded-full bg-[#F79E1B]" style={{ right: 0, top: '50%', transform: 'translateY(-50%)' }} aria-hidden />
                    <span className="relative z-10 font-bold text-[5px] text-white uppercase tracking-tight" style={{ textShadow: '0 0 1px #000' }}>Mastercard</span>
                  </div>
                </div>
                <p className="text-center text-[8px] font-bold uppercase tracking-widest text-black py-1.5 px-2 border-t border-gray-100">Debit &amp; Credit</p>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>
    </>
  );
}
