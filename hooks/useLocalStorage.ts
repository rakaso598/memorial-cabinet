// src/hooks/useLocalStorage.js
import { useState, useEffect } from "react";

function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  // 1. 상태를 initialValue로 초기화하여 서버와 클라이언트의 첫 렌더링을 일치시킵니다.
  const [storedValue, setStoredValue] = useState(initialValue);
  // 클라이언트 환경에서 마운트되었는지 추적하는 상태 (Hydration 오류 방지)
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // 이 useEffect는 클라이언트 환경에서만 실행됩니다 (컴포넌트 마운트 시).
    if (typeof window !== "undefined") {
      setIsMounted(true); // 클라이언트에서 마운트되었음을 표시
      try {
        const item = window.localStorage.getItem(key);
        // localStorage에서 값을 가져와 상태를 업데이트합니다.
        setStoredValue(item ? JSON.parse(item) : initialValue);
      } catch (error) {
        console.error("로컬 스토리지에서 읽어오는 중 오류 발생:", error);
        // 오류 발생 시에도 initialValue로 설정하여 안정성 확보
        setStoredValue(initialValue);
      }
    }
  }, []); // 빈 의존성 배열: 컴포넌트가 마운트될 때 한 번만 실행

  // storedValue가 변경될 때마다 localStorage에 저장 (클라이언트에서 마운트된 후에만)
  useEffect(() => {
    if (isMounted) {
      // isMounted가 true일 때만 localStorage에 쓰기
      try {
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      } catch (error) {
        console.error("로컬 스토리지에 쓰는 중 오류 발생:", error);
      }
    }
  }, [key, storedValue, isMounted]); // key, storedValue, isMounted가 변경될 때마다 실행

  return [storedValue, setStoredValue];
}

export default useLocalStorage;
