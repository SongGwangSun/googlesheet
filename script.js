// =============================================
// 설정 — 이 부분을 먼저 수정하세요
// =============================================
const CONFIG = {
  // 1) Google Apps Script 웹 앱 배포 후 발급받은 URL
  SCRIPT_URL: 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL',

  // 2) 회사 정보 (개인정보 고지 및 로고에 표시)
  COMPANY_NAME:   '(주)회사명',
  CONTACT_PHONE:  '02-1234-5678',
  CONTACT_EMAIL:  'info@example.com',

  // 3) 관심 제품/수업 목록 — 필요에 따라 수정·추가하세요
  //    마지막 항목 '기타 (직접 입력)'은 텍스트 입력 칸을 열어줍니다.
  PRODUCTS: [
    '기초 영어 회화반',
    '비즈니스 영어반',
    '토익 준비반',
    'IELTS 준비반',
    '1:1 개인 레슨',
    '기타 (직접 입력)',
  ],
};
// =============================================

document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
  applyCompanyInfo();
  populateProducts();
  document.getElementById('footer-year').textContent = new Date().getFullYear();

  setupPhoneFormatting();
  setupProductSelect();
  setupCharCounter();
  document.getElementById('contact-form').addEventListener('submit', handleSubmit);
  document.getElementById('another-btn').addEventListener('click', resetToForm);
}

// ── 회사 정보 주입 ──────────────────────────────────────────────
function applyCompanyInfo() {
  document.querySelectorAll('.dyn-company').forEach(el => {
    el.textContent = CONFIG.COMPANY_NAME;
  });
  document.querySelectorAll('.dyn-phone').forEach(el => {
    el.textContent = CONFIG.CONTACT_PHONE;
  });
  document.querySelectorAll('.dyn-email').forEach(el => {
    el.textContent = CONFIG.CONTACT_EMAIL;
  });
  document.getElementById('logo-text').textContent = CONFIG.COMPANY_NAME;
  document.title = `추가 정보 신청 | ${CONFIG.COMPANY_NAME}`;
}

// ── 제품 드롭다운 생성 ──────────────────────────────────────────
function populateProducts() {
  const select = document.getElementById('product');
  CONFIG.PRODUCTS.forEach(name => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    select.appendChild(opt);
  });
}

// ── 전화번호 자동 서식 (숫자 입력 → 010-XXXX-XXXX) ──────────────
function setupPhoneFormatting() {
  document.getElementById('phone').addEventListener('input', e => {
    let digits = e.target.value.replace(/\D/g, '').slice(0, 11);
    if (digits.length > 7) {
      digits = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
    } else if (digits.length > 3) {
      digits = `${digits.slice(0, 3)}-${digits.slice(3)}`;
    }
    e.target.value = digits;
  });
}

// ── 기타 선택 시 직접 입력 칸 표시 ────────────────────────────────
function setupProductSelect() {
  const select = document.getElementById('product');
  const custom = document.getElementById('product-custom');

  select.addEventListener('change', () => {
    const isCustom = select.value === '기타 (직접 입력)';
    custom.style.display = isCustom ? 'block' : 'none';
    custom.required = isCustom;
    if (isCustom) custom.focus();
    else custom.value = '';
  });
}

// ── 문의사항 글자 수 카운터 ─────────────────────────────────────
function setupCharCounter() {
  const ta = document.getElementById('inquiry');
  const counter = document.getElementById('inquiry-count');
  ta.addEventListener('input', () => {
    counter.textContent = ta.value.length;
  });
}

// ── 폼 제출 처리 ────────────────────────────────────────────────
async function handleSubmit(e) {
  e.preventDefault();

  // 허니팟: 봇이 숨겨진 필드를 채우면 조용히 무시
  if (document.getElementById('website').value) return;

  if (!validate()) return;

  // 로딩 상태
  const btn = document.getElementById('submit-btn');
  btn.disabled = true;
  btn.querySelector('.btn-text').style.display = 'none';
  btn.querySelector('.btn-loading').style.display = 'flex';

  const productSelect = document.getElementById('product');
  const productValue =
    productSelect.value === '기타 (직접 입력)'
      ? document.getElementById('product-custom').value.trim()
      : productSelect.value;

  const payload = new URLSearchParams({
    name:    document.getElementById('name').value.trim(),
    phone:   document.getElementById('phone').value.trim(),
    email:   document.getElementById('email').value.trim(),
    product: productValue,
    inquiry: document.getElementById('inquiry').value.trim(),
    consent: 'true',
  });

  // 개발 중 URL 미설정 시 경고
  if (CONFIG.SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
    console.warn(
      '[설정 필요] script.js 상단의 CONFIG.SCRIPT_URL에 Google Apps Script 웹 앱 URL을 입력해주세요.'
    );
    // 개발 편의를 위해 UI는 성공으로 처리
    showSuccess();
    return;
  }

  try {
    // Google Apps Script는 CORS preflight 없이 form-encoded POST 지원
    // mode: 'no-cors' → 요청은 정상 전송, 응답 본문은 읽을 수 없음 (정상 동작)
    await fetch(CONFIG.SCRIPT_URL, {
      method:  'POST',
      mode:    'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    payload.toString(),
    });
    showSuccess();
  } catch {
    alert('네트워크 오류가 발생했습니다.\n인터넷 연결을 확인한 후 다시 시도해주세요.');
    btn.disabled = false;
    btn.querySelector('.btn-text').style.display = '';
    btn.querySelector('.btn-loading').style.display = 'none';
  }
}

// ── 유효성 검사 ─────────────────────────────────────────────────
function validate() {
  // 이전 오류 초기화
  document.querySelectorAll('.error-msg').forEach(el => (el.textContent = ''));
  document.querySelectorAll('.is-error').forEach(el => el.classList.remove('is-error'));

  let ok = true;

  // 이름
  const name = document.getElementById('name');
  if (!name.value.trim()) {
    markError(name, 'name-error', '이름을 입력해주세요.');
    ok = false;
  }

  // 전화번호
  const phone = document.getElementById('phone');
  const phoneDigits = phone.value.replace(/\D/g, '');
  if (!phoneDigits) {
    markError(phone, 'phone-error', '전화번호를 입력해주세요.');
    ok = false;
  } else if (!/^010\d{8}$/.test(phoneDigits)) {
    markError(phone, 'phone-error', '올바른 형식을 입력해주세요. (예: 010-1234-5678)');
    ok = false;
  }

  // 이메일 (선택, 형식만 검사)
  const email = document.getElementById('email');
  if (email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    markError(email, 'email-error', '올바른 이메일 형식을 입력해주세요.');
    ok = false;
  }

  // 관심 제품/수업
  const product = document.getElementById('product');
  const productCustom = document.getElementById('product-custom');
  if (!product.value) {
    markError(product, 'product-error', '관심 제품/수업을 선택해주세요.');
    ok = false;
  } else if (product.value === '기타 (직접 입력)' && !productCustom.value.trim()) {
    markError(productCustom, 'product-error', '관심 제품/수업명을 직접 입력해주세요.');
    ok = false;
  }

  // 개인정보 동의
  const consent = document.getElementById('consent');
  if (!consent.checked) {
    document.getElementById('consent-error').textContent =
      '개인정보 수집·이용에 동의해주세요.';
    ok = false;
  }

  // 첫 번째 오류 필드로 스크롤
  if (!ok) {
    const firstError = document.querySelector('.is-error');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstError.focus();
    }
  }

  return ok;
}

function markError(input, errorId, msg) {
  input.classList.add('is-error');
  document.getElementById(errorId).textContent = msg;
}

// ── 성공 화면 표시 ──────────────────────────────────────────────
function showSuccess() {
  document.getElementById('form-section').style.display = 'none';
  document.getElementById('success-section').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── 폼 초기화 및 복귀 ──────────────────────────────────────────
function resetToForm() {
  const form = document.getElementById('contact-form');
  form.reset();

  document.getElementById('product-custom').style.display = 'none';
  document.getElementById('inquiry-count').textContent = '0';
  document.querySelectorAll('.error-msg').forEach(el => (el.textContent = ''));
  document.querySelectorAll('.is-error').forEach(el => el.classList.remove('is-error'));

  const btn = document.getElementById('submit-btn');
  btn.disabled = false;
  btn.querySelector('.btn-text').style.display = '';
  btn.querySelector('.btn-loading').style.display = 'none';

  document.getElementById('success-section').style.display = 'none';
  document.getElementById('form-section').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
