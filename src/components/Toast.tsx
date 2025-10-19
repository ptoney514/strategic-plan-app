import React, { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastProps {
  message: ToastMessage;
  onClose: (id: string) => void;
}

function Toast({ message, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fade in
    setTimeout(() => setIsVisible(true), 10);

    // Auto-close after duration
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(message.id), 300); // Wait for fade out
    }, message.duration || 3000);

    return () => clearTimeout(timer);
  }, [message, onClose]);

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  }[message.type];

  const icon = {
    success: '✓',
    error: '✕',
    info: 'ℹ'
  }[message.type];

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white transition-all duration-300 min-w-[300px] max-w-md ${bgColor} ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      <span className="text-xl font-bold">{icon}</span>
      <span className="flex-1">{message.message}</span>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onClose(message.id), 300);
        }}
        className="text-white/80 hover:text-white"
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  );
}

interface ToastContainerProps {
  messages: ToastMessage[];
  onClose: (id: string) => void;
}

export function ToastContainer({ messages, onClose }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {messages.map((message) => (
        <Toast key={message.id} message={message} onClose={onClose} />
      ))}
    </div>
  );
}

// Toast manager hook
let toastListeners: Array<(message: ToastMessage) => void> = [];

export function useToast() {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const addMessage = (message: ToastMessage) => {
      setMessages((prev) => [...prev, message]);
    };

    toastListeners.push(addMessage);

    return () => {
      toastListeners = toastListeners.filter((listener) => listener !== addMessage);
    };
  }, []);

  const removeMessage = (id: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  };

  return {
    messages,
    removeMessage
  };
}

// Global toast function
export function showToast(type: ToastType, message: string, duration?: number) {
  const toast: ToastMessage = {
    id: Math.random().toString(36).substring(7),
    type,
    message,
    duration
  };

  toastListeners.forEach((listener) => listener(toast));
}

// Convenience functions
export const toast = {
  success: (message: string, duration?: number) => showToast('success', message, duration),
  error: (message: string, duration?: number) => showToast('error', message, duration),
  info: (message: string, duration?: number) => showToast('info', message, duration)
};
