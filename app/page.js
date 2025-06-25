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

  // ⭐️ 토스트 메시지 상태 ⭐️
  const [toast, setToast] = useState({ message: '', duration: 0, isVisible: false });

  // 토스트 메시지를 표시하는 함수
  const showToast = useCallback((message, duration = 1500) => {
    setToast({ message, duration, isVisible: true });
  }, []);

  // ⭐️⭐️⭐️ 새 메모 생성 핸들러 (중복 제목 방지 로직 포함) - useEffect보다 위로 이동 ⭐️⭐️⭐️
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

    showToast('새 메모가 리스트에 추가되었습니다.', 1500);
  }, [memos, setMemos, showToast]); // memos 의존성 추가

  // 선택된 메모가 변경될 때마다 내용을 에디터에 로드
  useEffect(() => {
    const memo = memos.find(m => m.id === selectedMemoId);
    if (memo) {
      setCurrentMemoContent(memo.content);
      setCurrentMemoTitle(memo.title);
    } else {
      // 선택된 메모가 없거나 새로운 메모를 만들 때 (초기 로드 시 또는 모든 메모 삭제 후)
      setCurrentMemoContent('');
      setCurrentMemoTitle(getFormattedDate()); // 기본 제목을 오늘의 날짜로 설정 (사용자 입력 대기)
    }
  }, [selectedMemoId, memos]);

  // ⭐️⭐️⭐️ 중요: 클라이언트에서 memos 데이터 로드 후 초기 메모 처리 로직 변경 ⭐️⭐️⭐️
  // handleNewMemo가 이 useEffect보다 먼저 정의되도록 순서를 변경했습니다.
  useEffect(() => {
    // 이펙트가 마운트될 때 (selectedMemoId가 아직 null일 때) 한 번만 실행
    // useLocalStorage 훅 덕분에 memos는 클라이언트에서 로드된 후 업데이트됨
    if (selectedMemoId === null && memos.length > 0) {
      // 메모가 하나라도 존재하면, 가장 최근 업데이트된 메모를 선택
      const latestMemo = memos.reduce((prev, current) =>
        (prev.updatedAt > current.updatedAt) ? prev : current
      );
      setSelectedMemoId(latestMemo.id);
      setCurrentMemoContent(latestMemo.content);
      setCurrentMemoTitle(latestMemo.title);
    }
    // else 블록 (메모가 하나도 없을 때 자동으로 새 메모를 생성하던 로직)은 제거되었습니다.
    // 이제 이 경우에도 아무것도 선택되지 않은 빈 상태로 시작합니다.
  }, [memos, selectedMemoId]);

  // 메모 저장 로직 (수동 저장 버튼에 연결)
  const saveCurrentMemo = useCallback(() => {
    // 내용이나 제목이 전혀 없을 경우 저장하지 않고 알림
    if (!currentMemoContent.trim() && !currentMemoTitle.trim()) {
      showToast('저장할 내용이나 제목이 없습니다.', 1500);
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
      showToast('메모가 업데이트되었습니다!', 1500);
    } else {
      // 이 else 블록은 handleNewMemo가 호출되지 않고
      // 에디터에 바로 내용을 입력하고 저장하는 드문 경우에만 실행됩니다.
      // 이 경우에도 고유한 제목을 생성하도록 로직 추가
      let newTitle = currentMemoTitle.trim() || getFormattedDate(); // 현재 제목이 있으면 사용, 없으면 날짜 사용
      let counter = 0;
      // 생성하려는 제목이 이미 존재하는지 확인하고 숫자를 붙여 고유하게 만듦
      while (memos.some(memo => memo.title === newTitle)) {
        counter++;
        // 사용자가 직접 입력한 제목에 "(숫자)"를 붙이는 로직 강화
        if (newTitle.startsWith(getFormattedDate())) { // 제목이 날짜로 시작하면 날짜 포맷 유지
          newTitle = `${getFormattedDate()} (${counter})`;
        } else { // 날짜가 아니면 원래 제목에 숫자만 붙임
          const baseTitle = newTitle.replace(/\s*\(\d+\)$/, ''); // 기존의 "(숫자)" 제거
          newTitle = `${baseTitle} (${counter})`;
        }
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
      showToast('새 메모가 성공적으로 저장되었습니다!', 1500);
    }
  }, [selectedMemoId, currentMemoContent, currentMemoTitle, memos, setMemos, showToast]);

  // 메모 선택 핸들러
  const handleSelectMemo = (id) => {
    setSelectedMemoId(id);
  };

  // 메모 삭제 핸들러 (모달 열기)
  const handleDeleteMemo = (id) => {
    setMemoToDeleteId(id);
    setIsModalOpen(true);
  };

  // 모달에서 삭제 확정 시 실행될 함수
  const confirmDelete = () => {
    setMemos(prevMemos => {
      const updatedMemos = prevMemos.filter(memo => memo.id !== memoToDeleteId);
      // 삭제 후 메모가 하나도 없다면 선택 상태를 초기화
      if (selectedMemoId === memoToDeleteId) {
        setSelectedMemoId(null);
        setCurrentMemoContent('');
        setCurrentMemoTitle(getFormattedDate()); // 기본 제목으로 설정
      }
      return updatedMemos;
    });

    setIsModalOpen(false);
    setMemoToDeleteId(null);
    showToast('메모가 삭제되었습니다.', 1500);
  };

  // 모달에서 삭제 취소 시 실행될 함수
  const cancelDelete = () => {
    setIsModalOpen(false);
    setMemoToDeleteId(null);
  };

  // 메모 제목 업데이트 핸들러
  const handleUpdateMemoTitle = (id, newTitle) => {
    // 제목 중복 방지 (사용자 직접 수정 시)
    let finalTitle = newTitle;
    let counter = 0;
    while (memos.some(memo => memo.id !== id && memo.title === finalTitle)) {
      counter++;
      finalTitle = `${newTitle} (${counter})`;
    }

    setMemos(prevMemos =>
      prevMemos.map(memo =>
        memo.id === id ? { ...memo, title: finalTitle, updatedAt: Date.now() } : memo
      )
    );
    if (selectedMemoId === id) {
      setCurrentMemoTitle(finalTitle);
    }
    showToast('메모 제목이 업데이트되었습니다.', 1000);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans">
      <Header onNewMemo={handleNewMemo} onShowMessage={showToast} />
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
          isListEmpty={memos.length === 0} // ⭐️ 새로 추가된 prop ⭐️
          onNewMemoClick={handleNewMemo} // 새 메모 유도 버튼을 위한 prop
        />
      </div>
      {/* 삭제 확인 모달 */}
      <ConfirmModal
        isOpen={isModalOpen}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        message="정말로 이 메모를 삭제하시겠습니까?"
      />
      {/* ⭐️ 토스트 메시지 컴포넌트 렌더링 ⭐️ */}
      <ToastMessage
        message={toast.message}
        duration={toast.duration}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}
