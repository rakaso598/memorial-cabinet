// src/components/Header.js
import React, { useRef } from 'react';

// onDeleteAllMemos prop을 추가합니다.
const Header = ({ onNewMemo, onShowMessage, onExportMemos, onImportMemos, onDeleteAllMemos }) => {
  const fileInputRef = useRef(null);

  // 북마크 추가 버튼 클릭 핸들러
  const handleAddBookmark = () => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const bookmarkKey = isMac ? 'Cmd + D' : 'Ctrl + D';
    onShowMessage(`이 페이지를 북마크하려면 ${bookmarkKey} 키를 누르세요.`, 1500);
  };

  // CSV 가져오기 버튼 클릭 시 파일 입력 트리거
  const handleImportButtonClick = () => {
    fileInputRef.current?.click();
  };

  // 파일 선택 시 CSV 가져오기 함수 호출
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onImportMemos(file);
      event.target.value = null;
    }
  };

  return (
    <header className="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center rounded-b-lg dark:bg-gray-900">
      <h1 className="text-2xl font-bold">브라우저 메모장</h1>
      <div className="flex space-x-4">

        <button
          onClick={handleAddBookmark}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md dark:bg-blue-700 dark:hover:bg-blue-800"
        >
          북마크 추가
        </button>
        <button
          onClick={onExportMemos}
          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md dark:bg-purple-700 dark:hover:bg-purple-800"
        >
          메모 내보내기 (CSV)
        </button>
        <button
          onClick={handleImportButtonClick}
          className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md dark:bg-indigo-700 dark:hover:bg-indigo-800"
        >
          메모 가져오기 (CSV)
        </button>
        {/* ⭐️⭐️⭐️ 전체 삭제 버튼 추가 ⭐️⭐️⭐️ */}
        <button
          onClick={onDeleteAllMemos}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md dark:bg-red-700 dark:hover:bg-red-800"
        >
          전체 삭제
        </button>
        <button
          onClick={onNewMemo}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md dark:bg-blue-700 dark:hover:bg-blue-800"
        >
          + 새 메모
        </button>
      </div>
    </header>
  );
};

export default Header;
