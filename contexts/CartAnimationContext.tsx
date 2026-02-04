'use client';

import { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CartAnimationContextType {
  triggerAnimation: (startPosition: { x: number; y: number }, productImage?: string) => void;
  isAnimating: boolean;
}

const CartAnimationContext = createContext<CartAnimationContextType | undefined>(undefined);

export function CartAnimationProvider({ children }: { children: ReactNode }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationData, setAnimationData] = useState<{
    startPosition: { x: number; y: number };
    productImage?: string;
  } | null>(null);

  const triggerAnimation = useCallback(
    (startPosition: { x: number; y: number }, productImage?: string) => {
      console.log('🎬 Triggering cart animation:', { startPosition, productImage });
      setAnimationData({ startPosition, productImage });
      setIsAnimating(true);
      
      // Reset after animation completes (1200ms animation + 300ms buffer)
      setTimeout(() => {
        setIsAnimating(false);
        setAnimationData(null);
      }, 1500);
    },
    []
  );

  return (
    <CartAnimationContext.Provider value={{ triggerAnimation, isAnimating }}>
      {children}
      <AnimatePresence>
        {isAnimating && animationData && (
          <CartAnimationFly
            key="cart-animation"
            startPosition={animationData.startPosition}
            productImage={animationData.productImage}
          />
        )}
      </AnimatePresence>
    </CartAnimationContext.Provider>
  );
}

// Flying animation component with enhanced ecommerce effects
function CartAnimationFly({
  startPosition,
  productImage,
}: {
  startPosition: { x: number; y: number };
  productImage?: string;
}) {
  const [cartIconPosition, setCartIconPosition] = useState<{ x: number; y: number } | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Get cart icon position
  const updateCartPosition = useCallback(() => {
    const cartIcon = document.querySelector('[data-cart-icon]');
    console.log('🔍 Looking for cart icon:', cartIcon);
    if (cartIcon) {
      const rect = cartIcon.getBoundingClientRect();
      const position = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
      console.log('📍 Cart icon position:', position);
      setCartIconPosition(position);
    } else {
      console.warn('⚠️ Cart icon not found!');
    }
  }, []);

  // Update cart position when component mounts
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      updateCartPosition();
    }, 50);
    
    // Also update on scroll/resize
    window.addEventListener('scroll', updateCartPosition);
    window.addEventListener('resize', updateCartPosition);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', updateCartPosition);
      window.removeEventListener('resize', updateCartPosition);
    };
  }, [updateCartPosition]);

  // Trigger cart icon bounce when animation completes
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSuccess(true);
      // Trigger cart icon animation
      const cartIcon = document.querySelector('[data-cart-icon]');
      if (cartIcon) {
        cartIcon.classList.add('cart-icon-bounce');
        setTimeout(() => {
          cartIcon.classList.remove('cart-icon-bounce');
        }, 600);
      }
      // Also pulse the cart badge
      const cartBadge = document.querySelector('[data-cart-badge]');
      if (cartBadge) {
        cartBadge.classList.add('cart-badge-pulse');
        setTimeout(() => {
          cartBadge.classList.remove('cart-badge-pulse');
        }, 600);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Use fallback position if cart icon not found (top right corner)
  const finalCartPosition = cartIconPosition || {
    x: window.innerWidth - 60,
    y: 60,
  };
  
  console.log('✨ Rendering animation with:', { startPosition, cartIconPosition: finalCartPosition });

  const deltaX = finalCartPosition.x - startPosition.x;
  const deltaY = finalCartPosition.y - startPosition.y;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  
  // Create a curved path with control point
  const controlY = Math.min(deltaY * 0.3, -50); // Curve upward

  return (
    <>
      {/* Main Product Image Flying Animation */}
      <div
        className="fixed pointer-events-none z-[9999]"
        style={{
          left: startPosition.x,
          top: startPosition.y,
        }}
      >
        {/* Glowing background effect */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1.5, opacity: [0, 0.8, 0] }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 -translate-x-1/2 -translate-y-1/2"
        >
          <div className="w-32 h-32 bg-gradient-to-br from-[#ffa509] to-[#ff8c00] rounded-full blur-2xl opacity-60" />
        </motion.div>

        {/* Sparkle particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
            animate={{
              scale: [0, 1, 0],
              opacity: [1, 1, 0],
              x: Math.cos((i / 8) * Math.PI * 2) * 40,
              y: Math.sin((i / 8) * Math.PI * 2) * 40,
            }}
            transition={{
              duration: 0.8,
              delay: i * 0.05,
              ease: 'easeOut',
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <div className="w-2 h-2 bg-[#ffa509] rounded-full shadow-lg shadow-[#ffa509]/50" />
          </motion.div>
        ))}

        {/* Main product image */}
        <motion.div
          initial={{ 
            scale: 1, 
            opacity: 1, 
            rotate: 0,
            x: 0,
            y: 0,
          }}
          animate={{
            x: deltaX,
            y: deltaY,
            scale: [1, 1.2, 0.4],
            rotate: [0, 15, -15, 0],
            opacity: [1, 1, 0.8, 0],
          }}
          transition={{
            duration: 1.2,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="relative"
        >
          {/* Glow effect around product */}
          <motion.div
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: [1, 1.3, 1.5], opacity: [0.6, 0.3, 0] }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 -translate-x-1/2 -translate-y-1/2"
          >
            <div className="w-28 h-28 bg-gradient-to-br from-[#ffa509] to-[#ff8c00] rounded-xl blur-xl" />
          </motion.div>

          {/* Product image container */}
          <div className="relative w-24 h-24 rounded-xl overflow-hidden shadow-2xl border-4 border-white ring-4 ring-[#ffa509]/50">
            {productImage ? (
              <img
                src={productImage}
                alt="Product"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#ffa509] to-[#ff8c00] flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            )}
            {/* Shine effect */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
            />
          </div>
        </motion.div>
      </div>

      {/* Success checkmark at cart icon */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1] }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed pointer-events-none z-[10000]"
            style={{
              left: finalCartPosition.x,
              top: finalCartPosition.y,
            }}
          >
            <div className="relative -translate-x-1/2 -translate-y-1/2">
              {/* Ripple effect */}
              <motion.div
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: 3, opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 rounded-full bg-[#ffa509]"
              />
              {/* Checkmark circle */}
              <div className="relative w-12 h-12 bg-gradient-to-br from-[#ffa509] to-[#ff8c00] rounded-full flex items-center justify-center shadow-lg ring-4 ring-white/50">
                <motion.svg
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <motion.path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </motion.svg>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plus one badge */}
      <AnimatePresence>
        {showSuccess && cartIconPosition && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 0 }}
            animate={{ scale: 1, opacity: [0, 1, 1, 0], y: -30 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="fixed pointer-events-none z-[10000]"
            style={{
              left: cartIconPosition.x,
              top: cartIconPosition.y - 20,
            }}
          >
            <div className="relative -translate-x-1/2 -translate-y-1/2">
              <div className="bg-gradient-to-r from-[#ffa509] to-[#ff8c00] text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg border-2 border-white">
                +1
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function useCartAnimation() {
  const context = useContext(CartAnimationContext);
  if (context === undefined) {
    throw new Error('useCartAnimation must be used within a CartAnimationProvider');
  }
  return context;
}
