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
import CabinetModal from "../components/CabinetModal";
import dynamic from "next/dynamic";
const QRCode = dynamic(
  () => import("qrcode.react").then((mod) => mod.QRCodeCanvas),
  { ssr: false }
);

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
  const [localMemos, setLocalMemos] = useLocalStorage<Memo[]>(
    "my-browser-memos",
    []
  );
  const [memos, setMemos] = useState<Memo[]>(localMemos);
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

  const showToast = useCallback((message: string) => {
    setToast({ message, duration: 1500, isVisible: true });
  }, []);

  const [isCabinetModalOpen, setIsCabinetModalOpen] = useState<boolean>(false); // 캐비넷 모달 상태
  const [cabinetInfo, setCabinetInfo] = useState<null | {
    id: string;
    name: string;
    hasPassword: boolean;
  }>(null);
  const [isCabinetLoading, setIsCabinetLoading] = useState(false);
  const [isMemoSaving, setIsMemoSaving] = useState(false);
  const [isCabinetDataLoading, setIsCabinetDataLoading] = useState(false);

  // 캐비넷 모드일 때 DB에서 메모 불러오기
  useEffect(() => {
    if (cabinetInfo) {
      setIsCabinetDataLoading(true);
      // DB에서 메모 불러오기
      fetch(`/api/memo?cabinetId=${cabinetInfo.id}`)
        .then((res) => res.json())
        .then((data) => {
          // DB 메모는 createdAt/updatedAt이 string이므로 number로 변환
          setMemos(
            data.map((m: any) => ({
              ...m,
              createdAt: new Date(m.createdAt).getTime(),
              updatedAt: new Date(m.updatedAt).getTime(),
            }))
          );
          if (data.length > 0) {
            setSelectedMemoId(data[0].id);
            setCurrentMemoContent(data[0].content);
            setCurrentMemoTitle(data[0].title);
          } else {
            setSelectedMemoId(null);
            setCurrentMemoContent("");
            setCurrentMemoTitle("새 메모");
          }
        })
        .finally(() => setIsCabinetDataLoading(false));
    } else {
      // 캐비넷에서 나가면 로컬스토리지 데이터 복원
      setMemos(localMemos);
      if (localMemos.length > 0) {
        setSelectedMemoId(localMemos[0].id);
        setCurrentMemoContent(localMemos[0].content);
        setCurrentMemoTitle(localMemos[0].title);
      } else {
        setSelectedMemoId(null);
        setCurrentMemoContent("");
        setCurrentMemoTitle("새 메모");
      }
    }
  }, [cabinetInfo]);

  // 로컬 모드에서만 setMemos와 setLocalMemos를 동기화하는 헬퍼
  const updateLocalMemos = (updater: (prev: Memo[]) => Memo[]) => {
    setMemos((prev) => {
      const next = updater(prev);
      setLocalMemos(next);
      return next;
    });
  };

  // 메모 추가/수정/삭제 분기
  const handleNewMemo = useCallback(async () => {
    let newTitleBase = "새 메모";
    let newTitle = newTitleBase;
    let counter = 0;
    while (memos.some((memo: Memo) => memo.title === newTitle)) {
      counter++;
      newTitle = `${newTitleBase} (${counter})`;
    }
    if (cabinetInfo) {
      // DB 저장
      const res = await fetch("/api/memo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cabinetId: cabinetInfo.id,
          title: newTitle,
          content: "",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMemos((prev) => [
          {
            ...data,
            createdAt: new Date(data.createdAt).getTime(),
            updatedAt: new Date(data.updatedAt).getTime(),
          },
          ...prev,
        ]);
        setSelectedMemoId(data.id);
        setCurrentMemoContent("");
        setCurrentMemoTitle(newTitle);
        showToast("새 메모가 리스트에 추가되었습니다.");
      } else {
        showToast(data.error || "메모 생성 실패");
      }
    } else {
      // 로컬 저장
      const newMemo: Memo = {
        id: uuidv4(),
        title: newTitle,
        content: "",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      updateLocalMemos((prevMemos: Memo[]) => [newMemo, ...prevMemos]);
      setSelectedMemoId(newMemo.id);
      setCurrentMemoContent(newMemo.content);
      setCurrentMemoTitle(newMemo.title);
      showToast("새 메모가 리스트에 추가되었습니다.");
    }
  }, [memos, cabinetInfo]);

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

  const saveCurrentMemo = useCallback(async () => {
    if (!currentMemoContent.trim() && !currentMemoTitle.trim()) {
      showToast("저장할 내용이나 제목이 없습니다.");
      return;
    }
    if (selectedMemoId) {
      if (cabinetInfo) {
        // DB 수정
        const res = await fetch("/api/memo", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: selectedMemoId,
            title: currentMemoTitle,
            content: currentMemoContent,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setMemos((prev) =>
            prev.map((memo) =>
              memo.id === selectedMemoId
                ? {
                    ...memo,
                    title: currentMemoTitle,
                    content: currentMemoContent,
                    updatedAt: new Date(data.updatedAt).getTime(),
                  }
                : memo
            )
          );
          showToast("메모가 업데이트되었습니다!");
        } else {
          showToast(data.error || "메모 수정 실패");
        }
      } else {
        // 로컬 수정
        updateLocalMemos((prevMemos: Memo[]) =>
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
        showToast("메모가 업데이트되었습니다!");
      }
    } else {
      // 새 메모 저장
      handleNewMemo();
    }
  }, [
    selectedMemoId,
    currentMemoContent,
    currentMemoTitle,
    memos,
    cabinetInfo,
    handleNewMemo,
  ]);

  const handleSelectMemo = (id: string) => {
    setSelectedMemoId(id);
  };

  const handleDeleteMemo = async (id: string) => {
    setMemoToDeleteId(id);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (cabinetInfo) {
      // DB 삭제
      const res = await fetch("/api/memo", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: memoToDeleteId }),
      });
      if (res.ok) {
        setMemos((prev) => prev.filter((memo) => memo.id !== memoToDeleteId));
        if (selectedMemoId === memoToDeleteId) {
          setSelectedMemoId(null);
          setCurrentMemoContent("");
          setCurrentMemoTitle("새 메모");
        }
        showToast("메모가 삭제되었습니다.");
      } else {
        showToast("메모 삭제 실패");
      }
    } else {
      // 로컬 삭제
      updateLocalMemos((prevMemos: Memo[]) => {
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
      showToast("메모가 삭제되었습니다.");
    }
    setIsModalOpen(false);
    setMemoToDeleteId(null);
  };

  const cancelDelete = () => {
    setIsModalOpen(false);
    setMemoToDeleteId(null);
  };

  const handleDeleteAllMemos = useCallback(() => {
    if (memos.length === 0) {
      showToast("삭제할 메모가 없습니다.");
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
    showToast("모든 메모가 삭제되었습니다!");
  }, [setMemos, showToast]);

  const cancelDeleteAll = useCallback(() => {
    setIsConfirmAllModalOpen(false);
  }, []);

  const handleUpdateMemoTitle = async (id: string, newTitle: string) => {
    let finalTitle = newTitle;
    let counter = 0;
    while (
      memos.some((memo: Memo) => memo.id !== id && memo.title === finalTitle)
    ) {
      counter++;
      finalTitle = `${newTitle} (${counter})`;
    }
    if (cabinetInfo) {
      // DB 수정
      const res = await fetch("/api/memo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          title: finalTitle,
          content: memos.find((m) => m.id === id)?.content || "",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMemos((prev) =>
          prev.map((memo) =>
            memo.id === id
              ? {
                  ...memo,
                  title: finalTitle,
                  updatedAt: new Date(data.updatedAt).getTime(),
                }
              : memo
          )
        );
        if (selectedMemoId === id) {
          setCurrentMemoTitle(finalTitle);
        }
        showToast("메모 제목이 업데이트되었습니다.");
      } else {
        showToast(data.error || "제목 수정 실패");
      }
    } else {
      // 로컬 수정
      updateLocalMemos((prevMemos: Memo[]) =>
        prevMemos.map((memo: Memo) =>
          memo.id === id
            ? { ...memo, title: finalTitle, updatedAt: Date.now() }
            : memo
        )
      );
      if (selectedMemoId === id) {
        setCurrentMemoTitle(finalTitle);
      }
      showToast("메모 제목이 업데이트되었습니다.");
    }
  };

  const handleExportMemosToCsv = useCallback(() => {
    if (memos.length === 0) {
      showToast("내보낼 메모가 없습니다.");
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

    showToast("메모가 CSV 파일로 내보내졌습니다!");
  }, [memos, showToast]);

  const handleImportMemosFromCsv = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        const csvText = event.target?.result as string;
        const lines = csvText.split("\n").filter((line) => line.trim() !== "");

        if (lines.length <= 1) {
          showToast("가져올 메모 내용이 없습니다.");
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
          showToast(`${newMemos.length}개의 메모를 성공적으로 가져왔습니다!`);
        } else {
          showToast("가져올 수 있는 유효한 메모가 없습니다.");
        }
      };
      reader.onerror = () => {
        showToast("파일을 읽는 중 오류가 발생했습니다.");
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
        onOpenCabinetMenu={() => setIsCabinetModalOpen(true)}
        cabinetInfo={
          cabinetInfo
            ? { ...cabinetInfo, id: cabinetInfo.id.slice(0, 6) }
            : null
        }
        onExitCabinet={() => {
          setCabinetInfo(null);
          showToast("로컬 모드로 전환되었습니다.");
        }}
      />
      <div className="flex flex-grow overflow-hidden">
        {isCabinetDataLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-40">
            <span className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></span>
          </div>
        ) : (
          <>
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
              onSaveMemo={async () => {
                setIsMemoSaving(true);
                await saveCurrentMemo();
                setIsMemoSaving(false);
              }}
              isListEmpty={memos.length === 0}
              onNewMemoClick={handleNewMemo}
              isSaving={isMemoSaving}
            />
          </>
        )}
      </div>
      <div className="fixed bottom-6 left-6 z-50">
        {/* QR코드 표시 (캐비넷 모드: 해당 캐비넷 URL, 로컬 모드: 사이트 기본 주소) */}
        <div className="w-28 h-28 bg-gray-200 dark:bg-gray-700 rounded-xl flex flex-col items-center justify-center shadow-lg border border-gray-300 dark:border-gray-600">
          {cabinetInfo ? (
            <QRCode
              value={
                typeof window !== "undefined"
                  ? `${window.location.origin}/?cabinet=${cabinetInfo.id}`
                  : ""
              }
              size={80}
            />
          ) : (
            <QRCode
              value={
                typeof window !== "undefined" ? window.location.origin : ""
              }
              size={80}
            />
          )}
        </div>
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
      <CabinetModal
        isOpen={isCabinetModalOpen}
        onConfirm={async (cabinetName, password) => {
          setIsCabinetLoading(true);
          try {
            // 캐비넷 입장/생성 API 호출
            const res = await fetch("/api/cabinet", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: cabinetName, password }),
            });
            const data = await res.json();
            if (!res.ok) {
              showToast(data.error || "캐비넷 입장/생성 실패");
              return;
            }
            setCabinetInfo({
              id: data.id,
              name: data.name,
              hasPassword: data.hasPassword,
            });
            showToast(
              data.created
                ? "새 캐비넷이 생성되었습니다. (공유 주의)"
                : "캐비넷에 입장했습니다."
            );
            setIsCabinetModalOpen(false);
          } catch (e) {
            showToast("서버 오류: 캐비넷 입장/생성 실패");
          } finally {
            setIsCabinetLoading(false);
          }
        }}
        onCancel={() => setIsCabinetModalOpen(false)}
        isLoading={isCabinetLoading}
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
