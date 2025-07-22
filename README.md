# Memorial Cabinet

## 프로젝트 목표

**Memorial Cabinet**은 누구나 쉽게 사용할 수 있는 웹 기반 메모장 & 공유 캐비넷 서비스입니다. 개인의 브라우저(로컬)에서 빠르게 메모를 작성/관리할 수 있고, 필요시 "캐비넷"이라는 공유 공간을 만들어 여러 사람이 협업하거나, 여러 기기에서 동일한 메모를 안전하게 관리할 수 있습니다.

- **로컬 모드**: 내 브라우저에만 저장, 빠르고 간편하게 메모 관리
- **캐비넷 모드**: 이름(최대 6자)과 숫자 4자리 비밀번호(선택)를 입력해 DB에 안전하게 메모 저장/공유
- **QR코드**: 모바일 등에서 바로 접속 가능
- **간단한 UX**: 초보자도 쉽게 사용할 수 있도록 직관적인 UI/가이드 제공

---

## 주요 기능

- **로컬스토리지 기반 메모 CRUD**
- **캐비넷(공유 저장소) 생성/입장/보안**
  - 이름(최대 6자) + 숫자 4자리 비밀번호(선택, 입력 시 4자리 필수)
  - 비밀번호 미설정 시 누구나 접근 가능, 설정 시 비밀번호 필요
  - 캐비넷마다 고유 ID(cuid) 부여, 일부만 노출
- **DB 연동**: Prisma + PostgreSQL
- **QR코드**: 각 캐비넷/사이트 접속용 QR코드 자동 생성
- **반응형 UI/UX**: 모바일, 데스크탑 모두 최적화
- **가이드/툴팁**: 좌상단 'i' 아이콘에 사용법 안내
- **다크모드 지원**

---

## 사용 스택

- **Next.js 15 (app router)**
- **TypeScript**
- **Prisma ORM**
- **PostgreSQL**
- **Tailwind CSS**
- **qrcode.react** (QR코드 생성)
- **Vercel** (배포)

---

## 프로젝트 구조

```
memorial-cabinet/
├── app/
│   ├── page.tsx           # 메인 페이지(로컬/캐비넷 모드 UI)
│   ├── layout.tsx         # 전체 레이아웃
│   └── api/
│       ├── cabinet/route.ts # 캐비넷 생성/입장 API
│       └── memo/route.ts    # 메모 CRUD API
├── components/
│   ├── Header.tsx         # 상단 헤더/로고/가이드/캐비넷 정보
│   ├── MemoList.tsx       # 메모 목록
│   ├── MemoEditor.tsx     # 메모 작성/수정
│   ├── CabinetModal.tsx   # 캐비넷 생성/입장 모달
│   ├── ConfirmModal.tsx   # 삭제 등 확인 모달
│   ├── ToastMessage.tsx   # 알림 메시지
│   └── MarkdownPreview.tsx# 마크다운 미리보기
├── hooks/
│   └── useLocalStorage.ts # 로컬스토리지 커스텀 훅
├── prisma/
│   └── schema.prisma      # Prisma 스키마(Cabinet, Memo)
├── public/                # 정적 파일/아이콘
├── package.json           # 의존성/스크립트
├── README.md              # 프로젝트 설명
└── ...
```

---

## 핵심 구현 방법

### 1. 로컬/캐비넷 모드 분기

- **로컬 모드**: useLocalStorage 훅으로 브라우저에 메모 저장
- **캐비넷 모드**: API 호출로 DB에 메모 저장/불러오기, 동기화
- **모드 전환**: 헤더에서 "캐비넷 열기"/"나가기"로 전환

### 2. 캐비넷 생성/입장

- 이름(최대 6자)과 비밀번호(숫자 4자리, 선택) 입력
- 비밀번호 미설정 시 누구나 접근 가능, 설정 시 비밀번호 필요
- Prisma + PostgreSQL로 Cabinet, Memo 테이블 관리
- cuid로 고유 캐비넷 ID 생성, 일부만 노출

### 3. QR코드

- qrcode.react로 각 캐비넷/사이트 접속용 QR코드 생성
- 로컬 모드: 사이트 주소, 캐비넷 모드: 해당 캐비넷 고유 URL

### 4. UX/가이드

- 좌상단 'i' 아이콘에 마우스 오버 시 사용법 안내 툴팁
- 모든 알림 메시지는 하단 중앙에 fade-in-up 애니메이션, 1.5초 고정
- 모달 배경은 블러+투명 처리

---

## 배포/실행 방법

### 1. 로컬 개발

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

- `.env`에 `DATABASE_URL` 반드시 설정

### 2. Vercel 배포

- `DATABASE_URL` 환경변수 Vercel 대시보드에 등록
- `package.json`에 `postinstall`/`build`에 `prisma generate` 포함
- `qrcode.react` 등 모든 의존성 `dependencies`에 포함

---

## 복구/재구현 가이드

1. **DB 스키마**: `prisma/schema.prisma` 참고, Cabinet(이름, 비밀번호, cuid), Memo(내용, cabinetId)
2. **API**: Next.js app router의 `app/api/cabinet/route.ts`, `app/api/memo/route.ts` 참고
3. **로컬/DB 분기**: 메인 페이지에서 상태로 분기, useLocalStorage 훅 활용
4. **UI/UX**: Tailwind CSS, 컴포넌트 구조 참고
5. **QR코드**: qrcode.react 사용, 동적 import로 SSR 대응
6. **알림/모달/가이드**: ToastMessage, ConfirmModal, Header의 GuideTooltip 참고

---

## 기타 참고

- Prisma + Vercel 배포시 반드시 `prisma generate`가 빌드에 포함되어야 함
- 모든 주요 기능은 README와 코드 구조만으로 복구 가능하도록 설계
- 문의/이슈: [프로젝트 깃허브](https://github.com/rakaso598/memorial-cabinet)
