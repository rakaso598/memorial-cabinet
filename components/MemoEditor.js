// src/components/MemoEditor.js
import React, { useRef, useEffect, useState } from 'react'; // useState 임포트 추가
import MarkdownPreview from './MarkdownPreview'; // MarkdownPreview 컴포넌트 임포트

const MemoEditor = ({
  content,
  onContentChange,
  title,
  onTitleChange,
  onSaveMemo,
  isListEmpty,
  onNewMemoClick,
}) => {
  const textareaRef = useRef(null);
  // ⭐️⭐️⭐️ 마크다운 미리보기 모드 상태 추가 ⭐️⭐️⭐️
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // textarea 높이 자동 조절
  useEffect(() => {
    if (!isPreviewMode && textareaRef.current) { // 미리보기 모드가 아닐 때만 높이 조절
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content, isPreviewMode]); // content 또는 미리보기 모드 변경 시 실행

  // 메모가 하나도 없을 때 표시할 안내 메시지
  if (isListEmpty) {
    return (
      <main className="flex-grow p-6 bg-white dark:bg-gray-800 overflow-y-auto rounded-r-lg shadow-lg flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 text-center">
        <p className="text-xl mb-4">저장된 메모가 없습니다.</p>
        <p className="text-lg mb-6">새로운 아이디어를 기록해보세요!</p>
        <button
          onClick={onNewMemoClick}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
        >
          + 새 메모 생성하기
        </button>
      </main>
    );
  }

  // 메모가 있을 때는 기존 편집기 UI 렌더링
  return (
    <main className="flex-grow p-6 bg-white dark:bg-gray-800 overflow-y-auto rounded-r-lg shadow-lg flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="메모 제목을 입력하세요"
          className="flex-grow text-3xl font-bold p-2 border-b border-gray-300 focus:outline-none focus:border-blue-500 transition duration-200 ease-in-out rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
        />
        {/* ⭐️⭐️⭐️ 미리보기 토글 버튼 추가 ⭐️⭐️⭐️ */}
        <button
          onClick={() => setIsPreviewMode(!isPreviewMode)}
          className="ml-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out shadow-md"
        >
          {isPreviewMode ? '편집 모드' : '미리보기'}
        </button>
      </div>

      {/* ⭐️⭐️⭐️ 미리보기 모드에 따라 렌더링 전환 ⭐️⭐️⭐️ */}
      {isPreviewMode ? (
        <MarkdownPreview content={content} />
      ) : (
        <textarea
          ref={textareaRef}
          className="w-full flex-grow p-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition duration-200 ease-in-out resize-none overflow-hidden bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          placeholder="여기에 메모 내용을 입력하세요..."
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          rows={10}
        />
      )}

      <button
        onClick={onSaveMemo}
        className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md self-end"
      >
        메모 저장
      </button>
    </main>
  );
};

export default MemoEditor;
