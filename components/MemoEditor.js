// src/components/MemoEditor.js
import React, { useRef, useEffect } from 'react';

const MemoEditor = ({
  content,
  onContentChange,
  title,
  onTitleChange,
  onSaveMemo, // 새로 추가된 저장 함수 prop
}) => {
  const textareaRef = useRef(null);

  // textarea 높이 자동 조절
  useEffect(() => {
    if (textareaRef.current) {
      // 높이 초기화 후 스크롤 높이에 맞게 설정
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]); // content가 변경될 때마다 실행

  return (
    <main className="flex-grow p-6 bg-white overflow-y-auto rounded-r-lg shadow-lg flex flex-col">
      <input
        type="text"
        placeholder="메모 제목을 입력하세요"
        className="w-full text-3xl font-bold mb-4 p-2 border-b border-gray-300 focus:outline-none focus:border-blue-500 transition duration-200 ease-in-out rounded-md"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
      />
      <textarea
        ref={textareaRef}
        className="w-full flex-grow p-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition duration-200 ease-in-out resize-none overflow-hidden"
        placeholder="여기에 메모 내용을 입력하세요..."
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        rows={10} // 초기 높이 설정 (내용이 길어지면 자동 조절됨)
      />
      <button
        onClick={onSaveMemo} // 저장 버튼 클릭 시 onSaveMemo 함수 호출
        className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md self-end"
      >
        메모 저장
      </button>
    </main>
  );
};

export default MemoEditor;
