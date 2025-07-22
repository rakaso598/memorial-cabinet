// src/app/page.js
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import { v4 as uuidv4 } from "uuid";
import MemoList from "../components/MemoList";
import MemoEditor from "../components/MemoEditor";
import Header from "../components/Header";
import ConfirmModal from "../components/ConfirmModal";
import ToastMessage from "../components/ToastMessage";

interface Memo {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

interface Toast {
  message: string;
  duration: number;
  isVisible: boolean;
}

const getFormattedDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function HomePage() {
  const [memos, setMemos] = useLocalStorage<Memo[]>("my-browser-memos", []);
  const [selectedMemoId, setSelectedMemoId] = useState<string | null>(null);
  const [currentMemoContent, setCurrentMemoContent] = useState<string>("");
  const [currentMemoTitle, setCurrentMemoTitle] = useState<string>("");

  const [searchQuery, setSearchQuery] = useState<string>("");

  const [isDarkMode, setIsDarkMode] = useLocalStorage<boolean>(
    "dark-mode",
    false
  );

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [memoToDeleteId, setMemoToDeleteId] = useState<string | null>(null);

  const [isConfirmAllModalOpen, setIsConfirmAllModalOpen] =
    useState<boolean>(false);

  const [toast, setToast] = useState<Toast>({
    message: "",
    duration: 0,
    isVisible: false,
  });

  const showToast = useCallback((message: string, duration: number = 1000) => {
    // 기본 duration을 1000ms로 변경
    setToast({ message, duration, isVisible: true });
  }, []);

  const handleNewMemo = useCallback(() => {
    let newTitleBase = "새 메모";
    let newTitle = newTitleBase;
    let counter = 0;
    while (memos.some((memo: Memo) => memo.title === newTitle)) {
      counter++;
      newTitle = `${newTitleBase} (${counter})`;
    }

    const newMemo: Memo = {
      id: uuidv4(),
      title: newTitle,
      content: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setMemos((prevMemos: Memo[]) => [newMemo, ...prevMemos]);
    setSelectedMemoId(newMemo.id);
    setCurrentMemoContent(newMemo.content);
    setCurrentMemoTitle(newMemo.title);

    showToast("새 메모가 리스트에 추가되었습니다.", 1000); // 1초로 변경
  }, [memos, setMemos, showToast]);

  useEffect(() => {
    const memo = memos.find((m: Memo) => m.id === selectedMemoId);
    if (memo) {
      setCurrentMemoContent(memo.content);
      setCurrentMemoTitle(memo.title);
    } else {
      setCurrentMemoContent("");
      setCurrentMemoTitle("새 메모");
    }
  }, [selectedMemoId, memos]);

  useEffect(() => {
    if (selectedMemoId === null && memos.length > 0) {
      const latestMemo = memos.reduce((prev: Memo, current: Memo) =>
        prev.updatedAt > current.updatedAt ? prev : current
      );
      setSelectedMemoId(latestMemo.id);
      setCurrentMemoContent(latestMemo.content);
      setCurrentMemoTitle(latestMemo.title);
    }
  }, [memos, selectedMemoId]);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [isDarkMode]);

  const saveCurrentMemo = useCallback(() => {
    if (!currentMemoContent.trim() && !currentMemoTitle.trim()) {
      showToast("저장할 내용이나 제목이 없습니다.", 1000); // 1초로 변경
      return;
    }

    if (selectedMemoId) {
      setMemos((prevMemos: Memo[]) =>
        prevMemos.map((memo: Memo) =>
          memo.id === selectedMemoId
            ? {
                ...memo,
                content: currentMemoContent,
                title: currentMemoTitle,
                updatedAt: Date.now(),
              }
            : memo
        )
      );
      showToast("메모가 업데이트되었습니다!", 1000); // 1초로 변경
    } else {
      let newTitleBase = "새 메모";
      let newTitle = currentMemoTitle.trim() || newTitleBase;
      let counter = 0;
      while (memos.some((memo: Memo) => memo.title === newTitle)) {
        counter++;
        const baseTitle =
          currentMemoTitle.trim().replace(/\s*\(\d+\)$/, "") || newTitleBase;
        newTitle = `${baseTitle} (${counter})`;
      }

      const newMemo: Memo = {
        id: uuidv4(),
        title: newTitle,
        content: currentMemoContent,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setMemos((prevMemos: Memo[]) => [newMemo, ...prevMemos]);
      setSelectedMemoId(newMemo.id);
      showToast("새 메모가 성공적으로 저장되었습니다!", 1000); // 1초로 변경
    }
  }, [
    selectedMemoId,
    currentMemoContent,
    currentMemoTitle,
    memos,
    setMemos,
    showToast,
  ]);

  const handleSelectMemo = (id: string) => {
    setSelectedMemoId(id);
  };

  const handleDeleteMemo = (id: string) => {
    setMemoToDeleteId(id);
    setIsModalOpen(true);
  };

  const confirmDelete = () => {
    setMemos((prevMemos: Memo[]) => {
      const updatedMemos = prevMemos.filter(
        (memo: Memo) => memo.id !== memoToDeleteId
      );
      if (selectedMemoId === memoToDeleteId) {
        setSelectedMemoId(null);
        setCurrentMemoContent("");
        setCurrentMemoTitle("새 메모");
      }
      return updatedMemos;
    });

    setIsModalOpen(false);
    setMemoToDeleteId(null);
    showToast("메모가 삭제되었습니다.", 1000); // 1초로 변경
  };

  const cancelDelete = () => {
    setIsModalOpen(false);
    setMemoToDeleteId(null);
  };

  const handleDeleteAllMemos = useCallback(() => {
    if (memos.length === 0) {
      showToast("삭제할 메모가 없습니다.", 1000); // 1초로 변경
      return;
    }
    setIsConfirmAllModalOpen(true);
  }, [memos, showToast]);

  const confirmDeleteAll = useCallback(() => {
    setMemos([]);
    setSelectedMemoId(null);
    setCurrentMemoContent("");
    setCurrentMemoTitle("새 메모");
    setIsConfirmAllModalOpen(false);
    showToast("모든 메모가 삭제되었습니다!", 1000); // 1초로 변경
  }, [setMemos, showToast]);

  const cancelDeleteAll = useCallback(() => {
    setIsConfirmAllModalOpen(false);
  }, []);

  const handleUpdateMemoTitle = (id: string, newTitle: string) => {
    let finalTitle = newTitle;
    let counter = 0;
    while (
      memos.some((memo: Memo) => memo.id !== id && memo.title === finalTitle)
    ) {
      counter++;
      finalTitle = `${newTitle} (${counter})`;
    }

    setMemos((prevMemos: Memo[]) =>
      prevMemos.map((memo: Memo) =>
        memo.id === id
          ? { ...memo, title: finalTitle, updatedAt: Date.now() }
          : memo
      )
    );
    if (selectedMemoId === id) {
      setCurrentMemoTitle(finalTitle);
    }
    showToast("메모 제목이 업데이트되었습니다.", 1000); // 1초로 변경
  };

  const handleExportMemosToCsv = useCallback(() => {
    if (memos.length === 0) {
      showToast("내보낼 메모가 없습니다.", 1000); // 1초로 변경
      return;
    }

    const headers = ["ID", "제목", "내용", "생성일", "수정일"];

    const escapeCsvField = (field: string | number | null | undefined) => {
      if (field === null || typeof field === "undefined") return "";
      const stringField = String(field);
      if (
        stringField.includes(",") ||
        stringField.includes('"') ||
        stringField.includes("\n")
      ) {
        return `"${stringField.replace(/"/g, '""')}"`;
      }
      return stringField;
    };

    const csvRows = memos.map((memo: Memo) => {
      const createdAtFormatted = new Date(memo.createdAt).toISOString();
      const updatedAtFormatted = new Date(memo.updatedAt).toISOString();

      return [
        escapeCsvField(memo.id),
        escapeCsvField(memo.title),
        escapeCsvField(memo.content),
        escapeCsvField(createdAtFormatted),
        escapeCsvField(updatedAtFormatted),
      ].join(",");
    });

    const csvContent = [headers.join(","), ...csvRows].join("\n");

    const blob = new Blob(["\ufeff", csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `memo_backup_${getFormattedDate()}.csv`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast("메모가 CSV 파일로 내보내졌습니다!", 1000); // 1초로 변경
  }, [memos, showToast]);

  const handleImportMemosFromCsv = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        const csvText = event.target?.result as string;
        const lines = csvText.split("\n").filter((line) => line.trim() !== "");

        if (lines.length <= 1) {
          showToast("가져올 메모 내용이 없습니다.", 1000); // 1초로 변경
          return;
        }

        const newMemos: Memo[] = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

          if (parts.length >= 5) {
            const title = parts[1].replace(/^"|"$/g, "").replace(/""/g, '"');
            const content = parts[2].replace(/^"|"$/g, "").replace(/""/g, '"');
            const createdAt = new Date(parts[3]).getTime();
            const updatedAt = new Date(parts[4]).getTime();

            let uniqueId = uuidv4();
            while (
              memos.some((m: Memo) => m.id === uniqueId) ||
              newMemos.some((m: Memo) => m.id === uniqueId)
            ) {
              uniqueId = uuidv4();
            }

            let finalTitle = title;
            let counter = 0;
            while (
              memos.some((memo: Memo) => memo.title === finalTitle) ||
              newMemos.some((memo: Memo) => memo.title === finalTitle)
            ) {
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
          setMemos((prevMemos: Memo[]) => [...newMemos, ...prevMemos]);
          showToast(
            `${newMemos.length}개의 메모를 성공적으로 가져왔습니다!`,
            1000
          ); // 1초로 변경
        } else {
          showToast("가져올 수 있는 유효한 메모가 없습니다.", 1000); // 1초로 변경
        }
      };
      reader.onerror = () => {
        showToast("파일을 읽는 중 오류가 발생했습니다.", 1000); // 1초로 변경
      };
      reader.readAsText(file, "UTF-8");
    },
    [memos, setMemos, showToast]
  );

  const handleToggleDarkMode = useCallback(() => {
    setIsDarkMode((prevMode: boolean) => !prevMode);
  }, [setIsDarkMode]);

  const filteredMemos = memos.filter(
    (memo: Memo) =>
      memo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      memo.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className={`flex flex-col h-screen ${isDarkMode ? "dark" : ""} font-sans`}
    >
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
      <ConfirmModal
        isOpen={isModalOpen}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        message="정말로 이 메모를 삭제하시겠습니까?"
      />
      <ConfirmModal
        isOpen={isConfirmAllModalOpen}
        onConfirm={confirmDeleteAll}
        onCancel={cancelDeleteAll}
        message="정말로 모든 메모를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다!"
      />
      <ToastMessage
        message={toast.message}
        duration={toast.duration}
        isVisible={toast.isVisible}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}
