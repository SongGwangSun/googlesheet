# 고객 DB 수집 웹 프로그램

관심 고객의 연락처를 수집하여 Google Sheets에 자동으로 기록하는 웹 폼입니다.

## 파일 구조

```
project/
├── index.html        — 메인 폼 페이지
├── style.css         — 스타일시트 (반응형)
├── script.js         — 폼 로직 + Google Sheets 연동
├── apps-script.gs    — Google Apps Script 코드 (시트 연동 백엔드)
├── .env.example      — 환경변수 예시 (Node.js 방식 전환 시)
└── README.md
```

---

## 1단계 — Google Sheets 준비

1. [Google Sheets](https://sheets.google.com)에서 새 스프레드시트 생성
2. URL에서 스프레드시트 ID 복사

   ```
   https://docs.google.com/spreadsheets/d/[여기가_ID]/edit
   ```

---

## 2단계 — Google Apps Script 배포

1. [Google Apps Script](https://script.google.com)에서 **새 프로젝트** 생성
2. `apps-script.gs` 파일 내용을 전체 복사하여 에디터에 붙여넣기
3. 상단의 `SHEET_ID` 값을 1단계에서 복사한 ID로 교체

   ```javascript
   var SHEET_ID = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms';
   ```

4. **배포** → **새 배포** 클릭
5. 유형: **웹 앱** 선택
6. 설정:
   - 설명: (자유롭게 입력)
   - 다음 사용자로 실행: **나**
   - 액세스 권한: **모든 사용자**
7. **배포** 클릭 → Google 계정으로 권한 허용
8. 생성된 **웹 앱 URL** 복사

---

## 3단계 — script.js 설정

`script.js` 상단의 `CONFIG` 객체를 수정합니다.

```javascript
const CONFIG = {
  SCRIPT_URL:     '배포 후 받은 웹 앱 URL',   // 2단계에서 복사한 URL
  COMPANY_NAME:   '(주)우리회사',
  CONTACT_PHONE:  '02-1234-5678',
  CONTACT_EMAIL:  'info@example.com',
  PRODUCTS: [
    '기초 영어 회화반',
    '비즈니스 영어반',
    '기타 (직접 입력)',   // 이 항목을 유지하면 직접 입력 칸이 표시됩니다
  ],
};
```

---

## 4단계 — 배포 (무료 호스팅)

### GitHub Pages (권장)

```bash
# 저장소 생성 후
git init
git add .
git commit -m "init"
git branch -M main
git remote add origin https://github.com/[계정명]/[저장소명].git
git push -u origin main
```

GitHub 저장소 → Settings → Pages → Branch: main → Save

배포 URL: `https://[계정명].github.io/[저장소명]/`

### Netlify (드래그 앤 드롭)

1. [netlify.com](https://netlify.com) 회원가입
2. "Sites" 탭 → 프로젝트 폴더 전체를 드래그 앤 드롭
3. 자동으로 HTTPS URL 생성

---

## Google Sheets 출력 형식

시트가 처음 생성될 때 아래 헤더가 자동으로 만들어집니다.

| 제출일시 | 이름 | 전화번호 | 이메일 | 관심 제품/수업 | 문의사항 | 동의여부 |
|---------|------|---------|-------|--------------|--------|--------|
| 2025-06-01 14:30:00 | 홍길동 | 010-1234-5678 | hong@example.com | 기초 영어 회화반 | 문의 내용 | 동의 |

---

## 보안 사항

| 항목 | 처리 방식 |
|-----|---------|
| API 키 노출 | 없음 (Apps Script가 서버 역할) |
| 스팸 방지 | 허니팟 필드 (숨겨진 입력 칸) |
| 수식 주입(CSV Injection) | Apps Script에서 `=`, `+`, `-`, `@` 시작 값 앞에 공백 추가 |
| HTTPS | GitHub Pages / Netlify 기본 제공 |
| 중복 제출 | 버튼 비활성화 (로딩 중) |

---

## 자주 묻는 질문

**Q. 제출해도 시트에 데이터가 안 들어와요.**  
A. Apps Script 배포 시 "액세스 권한: 모든 사용자"로 설정했는지 확인하세요.  
   코드 수정 후에는 반드시 **새 배포** (버전 업데이트)를 해야 반영됩니다.

**Q. 관심 제품/수업 목록을 바꾸고 싶어요.**  
A. `script.js`의 `CONFIG.PRODUCTS` 배열만 수정하면 됩니다. Apps Script는 건드릴 필요 없습니다.

**Q. 제출 결과(성공/실패)를 구분할 수 있나요?**  
A. `mode: 'no-cors'` 방식 특성상 응답 본문을 읽을 수 없습니다.  
   정확한 성공/실패 분리가 필요하다면 Node.js + Google Sheets API v4 서버 방식으로 전환하세요.

---

## 개인정보 처리방침 (템플릿)

서비스 운영 시 별도 개인정보 처리방침 페이지를 게시하는 것이 법적으로 권장됩니다.  
아래 항목을 포함하여 작성하세요.

- 개인정보 수집·이용 목적
- 수집하는 개인정보 항목
- 개인정보 보유·이용 기간
- 개인정보 제3자 제공 여부
- 개인정보 처리 위탁
- 이용자의 권리와 행사 방법
- 개인정보 보호책임자 정보
- 개인정보 처리방침 변경 고지 방법
