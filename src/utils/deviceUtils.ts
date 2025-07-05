import { useState, useEffect } from 'react';

/**
 * Utility functions for device detection and responsive design
 */

/**
 * Check if the current device is a mobile device based on screen width
 * @param width Optional width to check against (defaults to current window width)
 * @returns boolean indicating if device is mobile
 */
export const isMobileDevice = (width?: number): boolean => {
  const currentWidth = width || (typeof window !== 'undefined' ? window.innerWidth : 0);
  return currentWidth < 768; // Common breakpoint for mobile devices
};

/**
 * Hook to detect if the current device is mobile
 * @returns Object with isMobile flag and current width
 */
export const useDeviceDetection = () => {
  // Force mobile view for testing
  const forceMobile = true; // Set to true to force mobile view for testing
  
  const [state, setState] = useState({
    isMobile: forceMobile || (typeof window !== 'undefined' && isMobileDevice()),
    width: typeof window !== 'undefined' ? window.innerWidth : 0
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      setState({
        isMobile: forceMobile || isMobileDevice(),
        width: window.innerWidth
      });
    };

    // Initial check
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return state;
};
