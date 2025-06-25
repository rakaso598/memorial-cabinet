// src/components/Header.js
import React, { useRef } from 'react'; // useRef 임포트 추가

// onExportMemos, onImportMemos, isDarkMode, onToggleDarkMode prop을 추가합니다.
const Header = ({ onNewMemo, onShowMessage, onExportMemos, onImportMemos, isDarkMode, onToggleDarkMode }) => {
  const fileInputRef = useRef(null); // 파일 입력 참조

  // 북마크 추가 버튼 클릭 핸들러
  const handleAddBookmark = () => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const bookmarkKey = isMac ? 'Cmd + D' : 'Ctrl + D';
    onShowMessage(`이 페이지를 북마크하려면 ${bookmarkKey} 키를 누르세요.`, 1500);
  };

  // ⭐️⭐️⭐️ CSV 가져오기 버튼 클릭 시 파일 입력 트리거 ⭐️⭐️⭐️
  const handleImportButtonClick = () => {
    fileInputRef.current?.click(); // 숨겨진 파일 입력 필드 클릭
  };

  // ⭐️⭐️⭐️ 파일 선택 시 CSV 가져오기 함수 호출 ⭐️⭐️⭐️
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onImportMemos(file); // page.js에서 정의된 가져오기 함수 호출
      event.target.value = null; // 파일 선택 필드 초기화 (동일 파일 재선택 가능하도록)
    }
  };

  return (
    <header className="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center rounded-b-lg">
      <h1 className="text-2xl font-bold">브라우저 메모장</h1>
      <div className="flex space-x-4">
        {/* ⭐️⭐️⭐️ 다크 모드 토글 버튼 추가 ⭐️⭐️⭐️ */}
        <button
          onClick={onToggleDarkMode}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
        >
          {isDarkMode ? '🌞 라이트 모드' : '🌙 다크 모드'}
        </button>

        <button
          onClick={handleAddBookmark}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
        >
          북마크 추가
        </button>
        <button
          onClick={onExportMemos}
          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
        >
          메모 내보내기 (CSV)
        </button>
        {/* ⭐️⭐️⭐️ CSV 가져오기 버튼 및 숨겨진 파일 입력 필드 ⭐️⭐️⭐️ */}
        <button
          onClick={handleImportButtonClick}
          className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
        >
          메모 가져오기 (CSV)
        </button>
        <input
          type="file"
          accept=".csv" // CSV 파일만 선택 가능하도록 설정
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }} // 숨김 처리
        />
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
