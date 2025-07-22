// src/components/ToastMessage.js
import React, { useEffect } from "react";

interface ToastMessageProps {
  message: string;
  duration: number;
  isVisible: boolean;
  onClose: () => void;
}

const DEFAULT_DURATION = 1500;

const ToastMessage: React.FC<ToastMessageProps> = ({
  message,
  duration = DEFAULT_DURATION,
  isVisible,
  onClose,
}) => {
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (isVisible) {
      timer = setTimeout(() => {
        onClose();
      }, DEFAULT_DURATION); // 항상 1.5초로 고정
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
      <div className="bg-gray-800 bg-opacity-80 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-up transition-all duration-300 max-w-xs text-center">
        <p className="text-base font-medium">{message}</p>
      </div>
    </div>
  );
};

export default ToastMessage;
