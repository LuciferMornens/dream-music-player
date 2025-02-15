'use client';

interface ToastNotificationProps {
  message: string;
}

export default function ToastNotification({ message }: ToastNotificationProps) {
  return (
    <div 
      className="fixed left-1/2 transform -translate-x-1/2 z-[60] animate-fade-in-up"
      style={{ bottom: 'calc(5rem + 1rem)' }}
    >
      <div className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg backdrop-blur-sm">
        {message}
      </div>
    </div>
  );
}