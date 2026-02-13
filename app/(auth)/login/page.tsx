import { Suspense } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import Loading from '@/components/ui/Loading';

export const metadata = {
  title: 'Login | Teezee',
  description: 'Sign in to your account',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Product Showcase */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#050b2c] via-[#0a1a4a] to-[#050b2c] relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#ffa509]/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#ffa509]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 py-16 text-white">
          {/* Logo */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#ffa509] to-[#ffb833] rounded-2xl flex items-center justify-center shadow-2xl shadow-[#ffa509]/50">
                <svg className="w-8 h-8 text-[#050b2c]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold">Teezee</h1>
            </div>
            <p className="text-xl text-white/80">Your Ultimate Shopping Destination</p>
          </div>

          {/* Shopping Benefits */}
          <div className="space-y-6 mb-12">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-[#ffa509]/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-[#ffa509]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Fast & Secure Checkout</h3>
                <p className="text-white/70">Complete your purchase in seconds with our streamlined checkout process</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-[#ffa509]/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-[#ffa509]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Secure Shopping</h3>
                <p className="text-white/70">Your data is protected with bank-level encryption and security</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-[#ffa509]/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-[#ffa509]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Exclusive Deals</h3>
                <p className="text-white/70">Access member-only discounts and flash sales</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-[#ffa509]/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-[#ffa509]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Track Your Orders</h3>
                <p className="text-white/70">Monitor your purchases from checkout to delivery</p>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center gap-6 pt-8 border-t border-white/10">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#ffa509]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-white/70">SSL Secured</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#ffa509]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm text-white/70">Trusted Store</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#ffa509]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-white/70">100% Secure</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 lg:w-1/2 bg-gradient-to-br from-[#050b2c] via-[#0a1a4a] to-[#050b2c] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#ffa509]/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#ffa509]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        </div>

        <div className="max-w-md w-full relative z-10" suppressHydrationWarning>
          <Suspense fallback={
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 sm:p-10">
              <div className="flex items-center justify-center py-12">
                <Loading />
              </div>
            </div>
          }>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
