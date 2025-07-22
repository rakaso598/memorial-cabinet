// src/components/ToastMessage.js
import React, { useEffect } from "react";

interface ToastMessageProps {
  message: string;
  duration: number;
  isVisible: boolean;
  onClose: () => void;
}

const ToastMessage: React.FC<ToastMessageProps> = ({
  message,
  duration,
  isVisible,
  onClose,
}) => {
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (isVisible) {
      // 메시지가 보이기 시작하면 타이머 설정
      timer = setTimeout(() => {
        onClose(); // 지정된 시간 후에 토스트 메시지를 닫음
      }, duration);
    }

    return () => {
      // 컴포넌트 언마운트되거나 isVisible이 false가 되면 타이머 클리어
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isVisible, duration, onClose]);

  // isVisible이 false면 렌더링하지 않음
  if (!isVisible) return null;

  return (
    // ⭐️⭐️⭐️ 위치를 화면 중앙 하단으로 변경: bottom-24, left-1/2, transform -translate-x-1/2 ⭐️⭐️⭐️
    // pointer-events-none은 토스트 메시지가 나타나도 아래의 요소를 클릭할 수 있도록 합니다.
    <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
      <div className="bg-gray-800 bg-opacity-75 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-up max-w-xs text-center">
        <p className="text-base font-medium">{message}</p>
      </div>
    </div>
  );
};

export default ToastMessage;
