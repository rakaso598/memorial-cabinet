// src/components/ToastMessage.js
import React, { useEffect } from 'react';

const ToastMessage = ({ message, duration, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose(); // 지정된 시간 후에 토스트 메시지를 닫음
      }, duration);

      return () => clearTimeout(timer); // 컴포넌트 언마운트 시 타이머 클리어
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null; // isVisible이 false면 렌더링하지 않음

  return (
    // 위치를 중앙으로 변경하고 반투명 효과를 추가했습니다.
    // pointer-events-none은 토스트 메시지가 나타나도 아래의 요소를 클릭할 수 있도록 합니다.
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="bg-gray-800 bg-opacity-75 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-up max-w-xs text-center">
        <p className="text-base font-medium">{message}</p>
      </div>
    </div>
  );
};

export default ToastMessage;
