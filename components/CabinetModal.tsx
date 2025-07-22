import React, { useState } from "react";

interface CabinetModalProps {
  isOpen: boolean;
  onConfirm: (cabinetName: string, password: string) => void;
  onCancel: () => void;
}

const CabinetModal: React.FC<CabinetModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  const [cabinetName, setCabinetName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!cabinetName.trim()) {
      setError("캐비넷 이름을 입력하세요.");
      return;
    }
    if (cabinetName.length > 6) {
      setError("캐비넷 이름은 최대 6자까지 입력할 수 있습니다.");
      return;
    }
    if (password && !/^[0-9]{4}$/.test(password)) {
      setError("비밀번호는 숫자 4자리로 입력해야 합니다.");
      return;
    }
    setError("");
    onConfirm(cabinetName.trim(), password);
    setCabinetName("");
    setPassword("");
  };

  const handleCancel = () => {
    setCabinetName("");
    setPassword("");
    setError("");
    onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
        <h2 className="text-xl font-bold text-center text-gray-800 dark:text-gray-100 mb-4">
          캐비넷 열기/생성
        </h2>
        <label className="block mb-2 text-gray-700 dark:text-gray-200 text-sm font-semibold">
          캐비넷 이름 (최대 6자)
        </label>
        <input
          type="text"
          maxLength={6}
          value={cabinetName}
          onChange={(e) => setCabinetName(e.target.value)}
          className="w-full mb-4 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
          placeholder="예: mycab"
        />
        <label className="block mb-2 text-gray-700 dark:text-gray-200 text-sm font-semibold">
          비밀번호 (숫자 4자리, 선택)
        </label>
        <input
          type="password"
          value={password}
          maxLength={4}
          pattern="[0-9]{4}"
          inputMode="numeric"
          onChange={(e) => setPassword(e.target.value.replace(/[^0-9]/g, ""))}
          className="w-full mb-4 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
          placeholder="숫자 4자리 (선택)"
        />
        {error && (
          <div className="text-red-500 text-xs mb-2 text-center">{error}</div>
        )}
        <div className="flex justify-around space-x-4 mt-4">
          <button
            onClick={handleCancel}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 dark:bg-green-700 dark:hover:bg-green-800"
          >
            확인
          </button>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-300 mt-4 text-center">
          캐비넷 이름은 최대 6자, 비밀번호는 숫자 4자리만 입력할 수 있습니다.
          <br />
          비밀번호는 입력하지 않아도 되며, 입력 시 반드시 숫자 4자리여야 합니다.
          <br />
          분실 시 복구가 불가합니다.
        </div>
      </div>
    </div>
  );
};

export default CabinetModal;
