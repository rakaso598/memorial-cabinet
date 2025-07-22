import React, { useRef } from "react";
import { useState } from "react";

// isDarkMode와 onToggleDarkMode prop을 추가합니다.
interface HeaderProps {
  onNewMemo: () => void;
  onShowMessage: (message: string, duration?: number) => void;
  onExportMemos: () => void;
  onImportMemos: (file: File) => void;
  onDeleteAllMemos: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenCabinetMenu: () => void; // 추가
  cabinetInfo?: { id: string; name: string; hasPassword: boolean } | null;
  onExitCabinet?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onNewMemo,
  onShowMessage,
  onExportMemos,
  onImportMemos,
  onDeleteAllMemos,
  isDarkMode,
  onToggleDarkMode,
  onOpenCabinetMenu, // 추가
  cabinetInfo,
  onExitCabinet,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 북마크 추가 버튼 클릭 핸들러
  const handleAddBookmark = () => {
    const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    const bookmarkKey = isMac ? "Cmd + D" : "Ctrl + D";
    onShowMessage(
      `이 페이지를 북마크하려면 ${bookmarkKey} 키를 누르세요.`,
      1500
    );
  };

  // CSV 가져오기 버튼 클릭 시 파일 입력 트리거
  const handleImportButtonClick = () => {
    fileInputRef.current?.click();
  };

  // 파일 선택 시 CSV 가져오기 함수 호출
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      onImportMemos(files[0]);
      // 파일 선택 후 input의 value를 초기화하여 동일 파일 재선택 가능하게 함
      (event.target as HTMLInputElement).value = "";
    }
  };

  return (
    <header className="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center dark:bg-gray-900">
      {/* 왼쪽: 캐비넷 입장 시 캐비넷 정보, 아니면 로고+가이드 */}
      <div className="flex items-center space-x-2 min-w-0 relative">
        {cabinetInfo ? (
          <div className="flex items-center h-10">
            <span
              className="font-bold text-2xl truncate max-w-[120px]"
              title={cabinetInfo.name}
            >
              캐비넷: {cabinetInfo.name}
            </span>
            <span
              className="ml-3 text-base truncate max-w-[120px]"
              title={cabinetInfo.id}
            >
              (ID: {cabinetInfo.id})
            </span>
            {onExitCabinet && (
              <button
                onClick={onExitCabinet}
                className="ml-4 bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 font-bold py-1.5 px-4 rounded-lg text-base transition duration-200"
              >
                나가기
              </button>
            )}
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold whitespace-nowrap">
              Memorial Cabinet
            </h1>
            {/* 가이드 아이콘 */}
            <GuideTooltip />
          </>
        )}
      </div>
      <div className="flex space-x-4">
        {/* 파일 입력 필드 (숨김) */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv" // CSV 파일만 선택할 수 있도록 지정
          className="hidden" // 화면에 보이지 않도록 숨김
        />

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
        {/* 캐비넷 열기 버튼 추가 */}
        <button
          onClick={onOpenCabinetMenu}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md dark:bg-green-700 dark:hover:bg-green-800"
        >
          캐비넷 열기
        </button>
        {/* 다크 모드 토글 버튼 추가 */}
        {/* <button
          onClick={onToggleDarkMode}
          className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md dark:bg-gray-600 dark:hover:bg-gray-700"
        >
          {isDarkMode ? '라이트 모드' : '다크 모드'}
        </button> */}
      </div>
    </header>
  );
};

// 컴포넌트 하단에 GuideTooltip 정의 추가
function GuideTooltip() {
  const [show, setShow] = useState(false);
  return (
    <div className="relative ml-2 flex items-center">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="w-6 h-6 flex items-center justify-center rounded-full bg-white/80 text-blue-700 font-bold cursor-pointer border border-blue-300 hover:bg-white shadow-sm transition"
        title="사용법 안내"
      >
        i
      </div>
      {show && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-white text-gray-800 dark:bg-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg px-4 py-3 text-sm w-72 z-50 animate-fade-in-up">
          <b>Memorial Cabinet 사용 가이드</b>
          <ul className="mt-2 list-disc pl-4 space-y-1">
            <li>로컬모드: 내 브라우저에만 저장, 빠르고 간편하게 메모 관리</li>
            <li>
              &quot;캐비넷 열기&quot;로 공유/협업 공간 생성 (최대 6자 이름, 숫자
              4자리 비밀번호 필요)
            </li>
            <li>캐비넷 입장 시 해당 공간의 메모를 DB에 안전하게 저장/공유</li>
            <li>QR코드로 모바일 등에서 바로 접속 가능</li>
            <li>&quot;나가기&quot;로 다시 로컬모드로 전환</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default Header;
