// =============================================
// Google Apps Script — Google Sheets 연동
// =============================================
// 사용법:
//   1. https://script.google.com 에서 새 프로젝트 생성
//   2. 이 파일 전체를 붙여넣고 저장
//   3. 아래 SHEET_ID를 본인의 스프레드시트 ID로 변경
//   4. [배포] → [새 배포] → 웹 앱으로 배포
//      - 실행 계정: 나
//      - 액세스 권한: 모든 사용자
//   5. 발급된 URL을 script.js의 CONFIG.SCRIPT_URL에 붙여넣기
// =============================================

// ── 스프레드시트 설정 ──────────────────────────────────────────
var SHEET_ID   = 'YOUR_GOOGLE_SHEET_ID'; // 스프레드시트 URL에서 /d/ 뒤 문자열
var SHEET_NAME = '고객문의';

// 헤더 정의 (시트 첫 행)
var HEADERS = ['제출일시', '이름', '전화번호', '이메일', '관심 제품/수업', '문의사항', '동의여부'];

// ── POST 요청 처리 ─────────────────────────────────────────────
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var ss    = SpreadsheetApp.openById(SHEET_ID);
    var sheet = getOrCreateSheet(ss);
    var p     = e.parameter; // application/x-www-form-urlencoded 파싱 결과

    var now     = new Date();
    var dateStr = Utilities.formatDate(now, 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');

    sheet.appendRow([
      dateStr,
      sanitize(p.name),
      sanitize(p.phone),
      sanitize(p.email),
      sanitize(p.product),
      sanitize(p.inquiry),
      p.consent === 'true' ? '동의' : '미동의',
    ]);

    sheet.autoResizeColumns(1, HEADERS.length);

    return jsonResponse({ success: true });

  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  } finally {
    lock.releaseLock();
  }
}

// ── GET 헬스체크 ───────────────────────────────────────────────
function doGet() {
  return jsonResponse({ status: 'ok', message: 'Google Apps Script is running.' });
}

// ── 헬퍼 함수 ─────────────────────────────────────────────────
function getOrCreateSheet(ss) {
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);

    // 헤더 행 스타일 적용
    var headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setValues([HEADERS]);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#2563eb');
    headerRange.setFontColor('#ffffff');
    headerRange.setHorizontalAlignment('center');
    sheet.setFrozenRows(1);

    // 기본 열 너비 설정
    sheet.setColumnWidth(1, 160); // 제출일시
    sheet.setColumnWidth(2, 100); // 이름
    sheet.setColumnWidth(3, 130); // 전화번호
    sheet.setColumnWidth(4, 180); // 이메일
    sheet.setColumnWidth(5, 160); // 관심 제품/수업
    sheet.setColumnWidth(6, 240); // 문의사항
    sheet.setColumnWidth(7, 80);  // 동의여부
  }
  return sheet;
}

function sanitize(value) {
  if (!value) return '';
  // 수식 주입 방지: = + - @ 으로 시작하면 앞에 공백 추가
  var str = String(value).trim();
  if (/^[=+\-@]/.test(str)) str = ' ' + str;
  return str;
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
