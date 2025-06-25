// src/app/page.js
'use client'; // 클라이언트 컴포넌트로 지정

import { useState, useEffect, useRef, useCallback } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { v4 as uuidv4 } from 'uuid'; // 고유 ID 생성을 위해 uuid 라이브러리 설치 필요: npm install uuid
import MemoList from '../components/MemoList';
import MemoEditor from '../components/MemoEditor';
import Header from '../components/Header'; // 헤더 컴포넌트 추가
import ConfirmModal from '../components/ConfirmModal'; // 커스텀 확인 모달 추가
import ToastMessage from '../components/ToastMessage'; // 토스트 메시지 컴포넌트

// 오늘의 날짜를 'YYYY-MM-DD' 형식으로 반환하는 헬퍼 함수
const getFormattedDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function HomePage() {
  // 로컬 스토리지에서 메모 목록을 불러오거나 초기값으로 빈 배열 사용
  const [memos, setMemos] = useLocalStorage('my-browser-memos', []);
  // 현재 선택된 메모의 ID
  const [selectedMemoId, setSelectedMemoId] = useState(null);
  // 현재 편집 중인 메모의 내용
  const [currentMemoContent, setCurrentMemoContent] = useState('');
  // 현재 편집 중인 메모의 제목
  const [currentMemoTitle, setCurrentMemoTitle] = useState('');

  // 자동 저장을 위한 타이머 참조 (현재는 사용하지 않음)
  const autoSaveTimerRef = useRef(null);

  // 삭제 확인 모달 관련 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [memoToDeleteId, setMemoToDeleteId] = useState(null);

  // 토스트 메시지 상태
  const [toast, setToast] = useState({ message: '', duration: 0, isVisible: false });

  // 토스트 메시지를 표시하는 함수
  const showToast = useCallback((message, duration = 1500) => {
    setToast({ message, duration, isVisible: true });
  }, []);

  // 선택된 메모가 변경될 때마다 내용을 에디터에 로드
  useEffect(() => {
    const memo = memos.find(m => m.id === selectedMemoId);
    if (memo) {
      setCurrentMemoContent(memo.content);
      setCurrentMemoTitle(memo.title);
    } else {
      // 선택된 메모가 없거나 새로운 메모를 만들 때
      setCurrentMemoContent('');
      // 새 메모가 생성되는 시점에 제목이 결정되므로, 여기서는 기본 날짜를 설정하지 않습니다.
      // setCurrentMemoTitle(getFormattedDate());
    }
  }, [selectedMemoId, memos]);

  // 클라이언트에서 memos 데이터 로드 후 가장 최근 업데이트된 메모를 선택 (초기 로드 시 한 번만)
  useEffect(() => {
    // 메모 데이터가 로드되었고 (memos.length > 0), 아직 어떤 메모도 선택되지 않았을 때
    if (memos.length > 0 && selectedMemoId === null) {
      const latestMemo = memos.reduce((prev, current) =>
        (prev.updatedAt > current.updatedAt) ? prev : current
      );
      setSelectedMemoId(latestMemo.id);
      setCurrentMemoContent(latestMemo.content);
      setCurrentMemoTitle(latestMemo.title);
    } else if (memos.length === 0 && selectedMemoId === null) {
      // 메모가 하나도 없을 경우, 빈 새 메모를 자동으로 하나 생성
      handleNewMemo();
    }
  }, [memos, selectedMemoId]);

  // 메모 저장 로직 (수동 저장 버튼에 연결)
  const saveCurrentMemo = useCallback(() => {
    // 내용이나 제목이 전혀 없을 경우 저장하지 않고 알림
    if (!currentMemoContent.trim() && !currentMemoTitle.trim()) {
      showToast('저장할 내용이나 제목이 없습니다.', 1500); // duration 1500ms로 변경
      return;
    }

    if (selectedMemoId) {
      // 기존 메모 업데이트
      setMemos(prevMemos =>
        prevMemos.map(memo =>
          memo.id === selectedMemoId
            ? { ...memo, content: currentMemoContent, title: currentMemoTitle, updatedAt: Date.now() }
            : memo
        )
      );
      showToast('메모가 업데이트되었습니다!', 1500); // duration 1500ms로 변경
    } else {
      // 이 else 블록은 handleNewMemo가 호출되지 않고
      // 에디터에 바로 내용을 입력하고 저장하는 드문 경우에만 실행됩니다.
      // 이 경우에도 고유한 제목을 생성하도록 로직 추가
      let newTitle = getFormattedDate();
      let counter = 0;
      while (memos.some(memo => memo.title === newTitle)) {
        counter++;
        newTitle = `${getFormattedDate()} (${counter})`;
      }

      const newMemo = {
        id: uuidv4(),
        title: newTitle, // 고유한 제목 사용
        content: currentMemoContent,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setMemos(prevMemos => [newMemo, ...prevMemos]);
      setSelectedMemoId(newMemo.id); // 새로 생성된 메모를 선택
      showToast('새 메모가 성공적으로 저장되었습니다!', 1500); // duration 1500ms로 변경
    }
  }, [selectedMemoId, currentMemoContent, currentMemoTitle, memos, setMemos, showToast]); // memos 의존성 추가

  // 메모 선택 핸들러
  const handleSelectMemo = (id) => {
    setSelectedMemoId(id);
  };

  // 새 메모 생성 핸들러 (수정됨: 중복 제목 방지 로직 추가)
  const handleNewMemo = useCallback(() => {
    // 1. 새 메모의 고유한 제목 생성
    let newTitle = getFormattedDate();
    let counter = 0;
    while (memos.some(memo => memo.title === newTitle)) {
      counter++;
      newTitle = `${getFormattedDate()} (${counter})`;
    }

    // 2. 새 메모 객체 생성
    const newMemo = {
      id: uuidv4(),
      title: newTitle, // 고유한 제목 사용
      content: '', // 빈 내용
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // 3. memos 리스트에 새 메모를 즉시 추가 (맨 앞에 추가)
    setMemos(prevMemos => [newMemo, ...prevMemos]);

    // 4. 새로 추가된 메모를 현재 선택된 메모로 설정하여 에디터에 표시
    setSelectedMemoId(newMemo.id);
    setCurrentMemoContent(newMemo.content); // 새 메모의 빈 내용 설정
    setCurrentMemoTitle(newMemo.title); // 새 메모의 제목 설정

    showToast('새 메모가 리스트에 추가되었습니다.', 1500); // duration 1500ms로 변경
  }, [memos, setMemos, showToast]); // memos 의존성 추가

  // 메모 삭제 핸들러 (모달 열기)
  const handleDeleteMemo = (id) => {
    setMemoToDeleteId(id);
    setIsModalOpen(true);
  };

  // 모달에서 삭제 확정 시 실행될 함수
  const confirmDelete = () => {
    setMemos(prevMemos => prevMemos.filter(memo => memo.id !== memoToDeleteId));
    if (selectedMemoId === memoToDeleteId) {
      setSelectedMemoId(null); // 삭제된 메모가 현재 선택된 메모라면 선택 해제
      setCurrentMemoContent('');
      setCurrentMemoTitle(getFormattedDate()); // 새 메모의 기본 제목으로 설정
    }
    setIsModalOpen(false);
    setMemoToDeleteId(null);
    showToast('메모가 삭제되었습니다.', 1500); // duration 1500ms로 변경
  };

  // 모달에서 삭제 취소 시 실행될 함수
  const cancelDelete = () => {
    setIsModalOpen(false);
    setMemoToDeleteId(null);
  };

  // 메모 제목 업데이트 핸들러
  const handleUpdateMemoTitle = (id, newTitle) => {
    setMemos(prevMemos =>
      prevMemos.map(memo =>
        memo.id === id ? { ...memo, title: newTitle, updatedAt: Date.now() } : memo
      )
    );
    if (selectedMemoId === id) {
      setCurrentMemoTitle(newTitle);
    }
    showToast('메모 제목이 업데이트되었습니다.', 1000); // duration 1000ms로 변경
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans">
      <Header onNewMemo={handleNewMemo} onShowMessage={showToast} /> {/* onShowMessage prop 전달 */}
      <div className="flex flex-grow overflow-hidden">
        <MemoList
          memos={memos}
          selectedMemoId={selectedMemoId}
          onSelectMemo={handleSelectMemo}
          onDeleteMemo={handleDeleteMemo}
          onUpdateMemoTitle={handleUpdateMemoTitle}
        />
        <MemoEditor
          content={currentMemoContent}
          onContentChange={setCurrentMemoContent}
          title={currentMemoTitle}
          onTitleChange={setCurrentMemoTitle}
          onSaveMemo={saveCurrentMemo}
        />
      </div>
      {/* 삭제 확인 모달 */}
      <ConfirmModal
        isOpen={isModalOpen}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        message="정말로 이 메모를 삭제하시겠습니까?"
      />
      {/* 토스트 메시지 컴포넌트 렌더링 */}
      <ToastMessage
        message={toast.message}
        duration={toast.duration}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}
