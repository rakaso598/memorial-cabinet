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

  // ⭐️⭐️⭐️ 검색 쿼리 상태 추가 ⭐️⭐️⭐️
  const [searchQuery, setSearchQuery] = useState('');

  // ⭐️⭐️⭐️ 다크 모드 상태 추가 ⭐️⭐️⭐️
  const [isDarkMode, setIsDarkMode] = useLocalStorage('dark-mode', false);

  // 자동 저장을 위한 타이머 참조 (현재는 사용하지 않음)
  const autoSaveTimerRef = useRef(null);

  // 삭제 확인 모달 관련 상태 (개별 삭제용)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [memoToDeleteId, setMemoToDeleteId] = useState(null);

  // ⭐️⭐️⭐️ 전체 삭제 확인 모달 관련 상태 ⭐️⭐️⭐️
  const [isConfirmAllModalOpen, setIsConfirmAllModalOpen] = useState(false);

  // ⭐️ 토스트 메시지 상태 ⭐️
  const [toast, setToast] = useState({ message: '', duration: 0, isVisible: false });

  // 토스트 메시지를 표시하는 함수
  const showToast = useCallback((message, duration = 1500) => {
    setToast({ message, duration, isVisible: true });
  }, []);

  // ⭐️⭐️⭐️ 새 메모 생성 핸들러 (중복 제목 방지 로직 포함) ⭐️⭐️⭐️
  const handleNewMemo = useCallback(() => {
    let newTitle = getFormattedDate();
    let counter = 0;
    while (memos.some(memo => memo.title === newTitle)) {
      counter++;
      newTitle = `${getFormattedDate()} (${counter})`;
    }

    const newMemo = {
      id: uuidv4(),
      title: newTitle,
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setMemos(prevMemos => [newMemo, ...prevMemos]);
    setSelectedMemoId(newMemo.id);
    setCurrentMemoContent(newMemo.content);
    setCurrentMemoTitle(newMemo.title);

    showToast('새 메모가 리스트에 추가되었습니다.', 1500);
  }, [memos, setMemos, showToast]);

  // 선택된 메모가 변경될 때마다 내용을 에디터에 로드
  useEffect(() => {
    const memo = memos.find(m => m.id === selectedMemoId);
    if (memo) {
      setCurrentMemoContent(memo.content);
      setCurrentMemoTitle(memo.title);
    } else {
      setCurrentMemoContent('');
      setCurrentMemoTitle(getFormattedDate());
    }
  }, [selectedMemoId, memos]);

  // ⭐️⭐️⭐️ 초기 메모 처리 로직 (페이지 로드 시) ⭐️⭐️⭐️
  useEffect(() => {
    if (selectedMemoId === null && memos.length > 0) {
      const latestMemo = memos.reduce((prev, current) =>
        (prev.updatedAt > current.updatedAt) ? prev : current
      );
      setSelectedMemoId(latestMemo.id);
      setCurrentMemoContent(latestMemo.content);
      setCurrentMemoTitle(latestMemo.title);
    }
  }, [memos, selectedMemoId]);

  // ⭐️⭐️⭐️ 다크 모드 클래스 적용 ⭐️⭐️⭐️
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  // 메모 저장 로직 (수동 저장 버튼에 연결)
  const saveCurrentMemo = useCallback(() => {
    if (!currentMemoContent.trim() && !currentMemoTitle.trim()) {
      showToast('저장할 내용이나 제목이 없습니다.', 1500);
      return;
    }

    if (selectedMemoId) {
      setMemos(prevMemos =>
        prevMemos.map(memo =>
          memo.id === selectedMemoId
            ? { ...memo, content: currentMemoContent, title: currentMemoTitle, updatedAt: Date.now() }
            : memo
        )
      );
      showToast('메모가 업데이트되었습니다!', 1500);
    } else {
      let newTitle = currentMemoTitle.trim() || getFormattedDate();
      let counter = 0;
      while (memos.some(memo => memo.title === newTitle)) {
        counter++;
        if (newTitle.startsWith(getFormattedDate())) {
          newTitle = `${getFormattedDate()} (${counter})`;
        } else {
          const baseTitle = newTitle.replace(/\s*\(\d+\)$/, '');
          newTitle = `${baseTitle} (${counter})`;
        }
      }

      const newMemo = {
        id: uuidv4(),
        title: newTitle,
        content: currentMemoContent,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setMemos(prevMemos => [newMemo, ...prevMemos]);
      setSelectedMemoId(newMemo.id);
      showToast('새 메모가 성공적으로 저장되었습니다!', 1500);
    }
  }, [selectedMemoId, currentMemoContent, currentMemoTitle, memos, setMemos, showToast]);

  // 메모 선택 핸들러
  const handleSelectMemo = (id) => {
    setSelectedMemoId(id);
  };

  // 메모 개별 삭제 핸들러 (모달 열기)
  const handleDeleteMemo = (id) => {
    setMemoToDeleteId(id);
    setIsModalOpen(true);
  };

  // 모달에서 개별 삭제 확정 시 실행될 함수
  const confirmDelete = () => {
    setMemos(prevMemos => {
      const updatedMemos = prevMemos.filter(memo => memo.id !== memoToDeleteId);
      if (selectedMemoId === memoToDeleteId) {
        setSelectedMemoId(null);
        setCurrentMemoContent('');
        setCurrentMemoTitle(getFormattedDate());
      }
      return updatedMemos;
    });

    setIsModalOpen(false);
    setMemoToDeleteId(null);
    showToast('메모가 삭제되었습니다.', 1500);
  };

  // 모달에서 개별 삭제 취소 시 실행될 함수
  const cancelDelete = () => {
    setIsModalOpen(false);
    setMemoToDeleteId(null);
  };

  // ⭐️⭐️⭐️ 전체 메모 삭제 핸들러 (모달 열기) ⭐️⭐️⭐️
  const handleDeleteAllMemos = useCallback(() => {
    if (memos.length === 0) {
      showToast('삭제할 메모가 없습니다.', 1500);
      return;
    }
    setIsConfirmAllModalOpen(true);
  }, [memos, showToast]);

  // ⭐️⭐️⭐️ 모달에서 전체 삭제 확정 시 실행될 함수 ⭐️⭐️⭐️
  const confirmDeleteAll = useCallback(() => {
    setMemos([]); // 모든 메모 삭제
    setSelectedMemoId(null); // 선택된 메모 초기화
    setCurrentMemoContent(''); // 현재 내용 초기화
    setCurrentMemoTitle(getFormattedDate()); // 현재 제목 초기화
    setIsConfirmAllModalOpen(false); // 모달 닫기
    showToast('모든 메모가 삭제되었습니다!', 1500);
  }, [setMemos, showToast]);

  // ⭐️⭐️⭐️ 모달에서 전체 삭제 취소 시 실행될 함수 ⭐️⭐️⭐️
  const cancelDeleteAll = useCallback(() => {
    setIsConfirmAllModalOpen(false);
  }, []);

  // 메모 제목 업데이트 핸들러
  const handleUpdateMemoTitle = (id, newTitle) => {
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

  // ⭐️⭐️⭐️ 메모 전체를 CSV로 내보내는 함수 ⭐️⭐️⭐️
  const handleExportMemosToCsv = useCallback(() => {
    if (memos.length === 0) {
      showToast('내보낼 메모가 없습니다.', 1500);
      return;
    }

    const headers = ['ID', '제목', '내용', '생성일', '수정일'];

    const escapeCsvField = (field) => {
      if (field === null || typeof field === 'undefined') return '';
      const stringField = String(field);
      if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
        return `"${stringField.replace(/"/g, '""')}"`;
      }
      return stringField;
    };

    const csvRows = memos.map(memo => {
      const createdAtFormatted = new Date(memo.createdAt).toISOString();
      const updatedAtFormatted = new Date(memo.updatedAt).toISOString();

      return [
        escapeCsvField(memo.id),
        escapeCsvField(memo.title),
        escapeCsvField(memo.content),
        escapeCsvField(createdAtFormatted),
        escapeCsvField(updatedAtFormatted)
      ].join(',');
    });

    const csvContent = [
      headers.join(','),
      ...csvRows
    ].join('\n');

    const blob = new Blob(['\ufeff', csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `memo_backup_${getFormattedDate()}.csv`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('메모가 CSV 파일로 내보내졌습니다!', 1500);
  }, [memos, showToast]);

  // ⭐️⭐️⭐️ CSV 파일을 읽어 메모를 가져오는 함수 ⭐️⭐️⭐️
  const handleImportMemosFromCsv = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const csvText = event.target.result;
      const lines = csvText.split('\n').filter(line => line.trim() !== '');

      if (lines.length <= 1) {
        showToast('가져올 메모 내용이 없습니다.', 2000);
        return;
      }

      const newMemos = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

        if (parts.length >= 5) {
          const title = parts[1].replace(/^"|"$/g, '').replace(/""/g, '"');
          const content = parts[2].replace(/^"|"$/g, '').replace(/""/g, '"');
          const createdAt = new Date(parts[3]).getTime();
          const updatedAt = new Date(parts[4]).getTime();

          let uniqueId = uuidv4();
          while (memos.some(m => m.id === uniqueId) || newMemos.some(m => m.id === uniqueId)) {
            uniqueId = uuidv4();
          }

          let finalTitle = title;
          let counter = 0;
          while (memos.some(memo => memo.title === finalTitle) || newMemos.some(memo => memo.title === finalTitle)) {
            counter++;
            finalTitle = `${title} (${counter})`;
          }

          newMemos.push({
            id: uniqueId,
            title: finalTitle,
            content: content,
            createdAt: isNaN(createdAt) ? Date.now() : createdAt,
            updatedAt: isNaN(updatedAt) ? Date.now() : updatedAt,
          });
        }
      }

      if (newMemos.length > 0) {
        setMemos(prevMemos => [...newMemos, ...prevMemos]);
        showToast(`${newMemos.length}개의 메모를 성공적으로 가져왔습니다!`, 2500);
      } else {
        showToast('가져올 수 있는 유효한 메모가 없습니다.', 2500);
      }
    };
    reader.onerror = () => {
      showToast('파일을 읽는 중 오류가 발생했습니다.', 2500);
    };
    reader.readAsText(file, 'UTF-8');
  }, [memos, setMemos, showToast]);

  // ⭐️⭐️⭐️ 다크 모드 토글 함수 ⭐️⭐️⭐️
  const handleToggleDarkMode = useCallback(() => {
    setIsDarkMode(prevMode => !prevMode);
  }, [setIsDarkMode]);

  // ⭐️⭐️⭐️ MemoList에 전달할 필터링된 메모 목록 ⭐️⭐️⭐️
  const filteredMemos = memos.filter(memo =>
    memo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    memo.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`flex flex-col h-screen ${isDarkMode ? 'dark' : ''} font-sans`}>
      <Header
        onNewMemo={handleNewMemo}
        onShowMessage={showToast}
        onExportMemos={handleExportMemosToCsv}
        onImportMemos={handleImportMemosFromCsv}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onDeleteAllMemos={handleDeleteAllMemos}
      />
      <div className="flex flex-grow overflow-hidden">
        <MemoList
          memos={filteredMemos}
          selectedMemoId={selectedMemoId}
          onSelectMemo={handleSelectMemo}
          onDeleteMemo={handleDeleteMemo}
          onUpdateMemoTitle={handleUpdateMemoTitle}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <MemoEditor
          content={currentMemoContent}
          onContentChange={setCurrentMemoContent}
          title={currentMemoTitle}
          onTitleChange={setCurrentMemoTitle}
          onSaveMemo={saveCurrentMemo}
          isListEmpty={memos.length === 0}
          onNewMemoClick={handleNewMemo}
        />
      </div>
      {/* 개별 삭제 확인 모달 */}
      <ConfirmModal
        isOpen={isModalOpen}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        message="정말로 이 메모를 삭제하시겠습니까?"
      />
      {/* ⭐️⭐️⭐️ 전체 삭제 확인 모달 ⭐️⭐️⭐️ */}
      <ConfirmModal
        isOpen={isConfirmAllModalOpen}
        onConfirm={confirmDeleteAll}
        onCancel={cancelDeleteAll}
        message="정말로 모든 메모를 삭제하시겠습니까?"
      />
      <ToastMessage
        message={toast.message}
        duration={toast.duration}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}
