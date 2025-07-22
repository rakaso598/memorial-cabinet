import React, { useRef } from "react";

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
      {/* 왼쪽: 캐비넷 입장 시 캐비넷 정보, 아니면 로고 */}
      <div className="flex items-center space-x-2 min-w-0">
        {cabinetInfo ? (
          <>
            <span
              className="font-bold truncate max-w-[120px]"
              title={cabinetInfo.name}
            >
              캐비넷: {cabinetInfo.name}
            </span>
            <span
              className="ml-2 text-xs truncate max-w-[120px]"
              title={cabinetInfo.id}
            >
              (ID: {cabinetInfo.id})
            </span>
            {onExitCabinet && (
              <button
                onClick={onExitCabinet}
                className="ml-3 bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 font-bold py-1 px-3 rounded-lg text-xs transition duration-200"
              >
                나가기
              </button>
            )}
          </>
        ) : (
          <h1 className="text-2xl font-bold whitespace-nowrap">
            Memorial Cabinet
          </h1>
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

export default Header;
