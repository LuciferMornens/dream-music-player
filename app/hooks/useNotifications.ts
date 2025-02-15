import { useState, useRef, useCallback, useEffect } from 'react';

interface UseNotificationsOptions {
  duration?: number;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { duration = 3000 } = options;
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const toastTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const showNotification = useCallback((message: string) => {
    // Clear any existing timeout
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    // Set the new message and show the toast
    setToastMessage(message);
    setShowToast(true);

    // Set timeout to hide the toast
    toastTimeoutRef.current = setTimeout(() => {
      setShowToast(false);
    }, duration);
  }, [duration]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  return {
    showToast,
    toastMessage,
    showNotification
  };
}
