// src/components/Header.js
import React from 'react';

// onExportMemos prop을 추가합니다.
const Header = ({ onNewMemo, onShowMessage, onExportMemos }) => {
  // 북마크 추가 버튼 클릭 핸들러
  const handleAddBookmark = () => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const bookmarkKey = isMac ? 'Cmd + D' : 'Ctrl + D';
    // alert 대신 onShowMessage 함수를 호출합니다.
    onShowMessage(`이 페이지를 북마크하려면 ${bookmarkKey} 키를 누르세요.`, 1500); // 메시지와 1.5초 지속 시간을 전달
  };

  return (
    <header className="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center rounded-b-lg">
      <h1 className="text-2xl font-bold">브라우저 메모장</h1>
      <div className="flex space-x-4"> {/* 버튼들을 가로로 정렬하기 위한 div 추가 */}
        <button
          onClick={onExportMemos} // ⭐️ CSV 내보내기 버튼 ⭐️
          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
        >
          메모 내보내기 (CSV)
        </button>
        <button
          onClick={handleAddBookmark} // 북마크 추가 버튼
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
        >
          북마크 추가
        </button>
        <button
          onClick={onNewMemo}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
        >
          + 새 메모
        </button>
      </div>
    </header>
  );
};

export default Header;
