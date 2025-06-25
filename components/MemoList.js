// src/components/MemoList.js
import React from 'react';

const MemoList = ({
  memos,
  selectedMemoId,
  onSelectMemo,
  onDeleteMemo,
  onUpdateMemoTitle,
}) => {
  // 제목 수정 상태 관리
  const [editingMemoId, setEditingMemoId] = React.useState(null);
  const [editingTitle, setEditingTitle] = React.useState('');

  // 제목 더블 클릭 시 수정 모드로 전환
  const handleTitleDoubleClick = (memo) => {
    setEditingMemoId(memo.id);
    setEditingTitle(memo.title);
  };

  // 제목 입력 필드 변경 핸들러
  const handleTitleChange = (e) => {
    setEditingTitle(e.target.value);
  };

  // 제목 입력 필드 포커스 잃었을 때 (blur) 또는 Enter 키 눌렀을 때 제목 업데이트
  const handleTitleBlur = (memoId) => {
    onUpdateMemoTitle(memoId, editingTitle);
    setEditingMemoId(null); // 수정 모드 종료
  };

  // 제목 입력 필드에서 키보드 이벤트 핸들러
  const handleTitleKeyDown = (e, memoId) => {
    if (e.key === 'Enter') {
      e.target.blur(); // Enter 키 누르면 blur 이벤트 발생시켜 저장
    }
  };

  // 메모 목록을 최신 업데이트 순으로 정렬 (원본 배열을 변경하지 않도록 복사본 사용)
  const sortedMemos = [...memos].sort((a, b) => b.updatedAt - a.updatedAt);

  // 날짜를 일관된 형식으로 포맷팅하는 헬퍼 함수
  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    // YYYY-MM-DD HH:MM 형식으로 고정 (서버-클라이언트 일관성을 위해 toLocaleString 사용 안함)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  return (
    <aside className="w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto shadow-inner rounded-l-lg">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">내 메모</h2>
      <ul>
        {memos.length === 0 ? (
          <p className="text-gray-500 text-center py-4">아직 저장된 메모가 없습니다.</p>
        ) : (
          sortedMemos.map(memo => (
            <li
              key={memo.id}
              className={`mb-2 p-3 rounded-lg cursor-pointer transition duration-200 ease-in-out transform hover:scale-[1.01]
                ${selectedMemoId === memo.id ? 'bg-blue-100 border border-blue-400 shadow-md' : 'hover:bg-gray-50'}`
              }
              onClick={() => onSelectMemo(memo.id)}
            >
              <div className="flex justify-between items-center">
                {editingMemoId === memo.id ? (
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={handleTitleChange}
                    onBlur={() => handleTitleBlur(memo.id)}
                    onKeyDown={(e) => handleTitleKeyDown(e, memo.id)}
                    autoFocus
                    className="flex-grow border rounded px-2 py-1 mr-2 text-lg font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    onClick={(e) => e.stopPropagation()} // 클릭 이벤트 전파 방지
                  />
                ) : (
                  <h3
                    className="text-lg font-medium text-gray-900 truncate"
                    onDoubleClick={() => handleTitleDoubleClick(memo)}
                  >
                    {memo.title}
                  </h3>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // 부모 리스트 아이템의 클릭 이벤트 방지
                    onDeleteMemo(memo.id); // 삭제 핸들러 호출
                  }}
                  className="ml-2 text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition duration-200"
                  title="메모 삭제"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {formatDateTime(memo.updatedAt)} {/* ⭐️⭐️⭐️ 수정된 날짜 포맷 함수 사용 ⭐️⭐️⭐️ */}
              </p>
            </li>
          ))
        )}
      </ul>
    </aside>
  );
};

export default MemoList;
