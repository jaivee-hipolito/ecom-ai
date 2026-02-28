import { Suspense } from 'react';
import Image from 'next/image';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import Loading from '@/components/ui/Loading';
import PageTopBanner from '@/components/shared/PageTopBanner';

export const metadata = {
  title: 'Reset Password | Teezee',
  description: 'Reset your password',
};

export default function ResetPasswordPage() {
  return (
    <>
      <PageTopBanner />
      <div className="min-h-screen flex">
      {/* Left Side - Product Showcase */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#000000] via-[#1a1a1a] to-[#000000] relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#F9629F]/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#F9629F]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 py-16 text-white">
          {/* Logo - circular */}
          <div className="mb-12">
            <div className="mb-6 w-24 h-24 lg:w-28 lg:h-28 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src="/teezee-logo.png"
                alt="Teezee - Adorn Yourself With The Radiance Of 18K Gold"
                width={280}
                height={280}
                className="w-full h-full object-cover"
                priority
                suppressHydrationWarning
              />
            </div>
            <p className="text-xl text-white/80">Your Ultimate Shopping Destination</p>
          </div>

          {/* Security Info */}
          <div className="space-y-6 mb-12">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-[#F9629F]/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-[#F9629F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Create Strong Password</h3>
                <p className="text-white/70">Use a combination of letters, numbers, and symbols</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-[#F9629F]/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-[#F9629F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Secure & Protected</h3>
                <p className="text-white/70">Your password is encrypted and securely stored</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-[#F9629F]/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-[#F9629F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Quick Setup</h3>
                <p className="text-white/70">Get back to shopping in seconds</p>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center gap-6 pt-8 border-t border-white/10">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#F9629F]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-white/70">SSL Secured</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#F9629F]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm text-white/70">Trusted Store</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#F9629F]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-white/70">100% Secure</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Reset Password Form */}
      <div className="flex-1 lg:w-1/2 bg-gradient-to-br from-[#000000] via-[#1a1a1a] to-[#000000] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#F9629F]/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#F9629F]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        </div>

        <div className="max-w-md w-full relative z-10">
          <Suspense fallback={
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 sm:p-10">
              <div className="flex items-center justify-center py-12">
                <Loading />
              </div>
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
    </>
  );
}
