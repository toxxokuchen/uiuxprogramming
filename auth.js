const $ = (selector) => document.querySelector(selector);

const loginTab = $("#loginTab");
const signupTab = $("#signupTab");
const loginPanel = $("#loginPanel");
const signupPanel = $("#signupPanel");
const authTabs = $(".auth-tabs");
const authStatus = $("#authStatus");
const welcomeMessage = $("#welcomeMessage");
const logoutButton = $("#logoutButton");

const loginForm = $("#login-form");
const loginEmail = $("#loginEmail");
const loginPassword = $("#loginPassword");
const loginButton = $("#loginButton");
const loginMessage = $("#loginMessage");
const loginEmailHint = $("#loginEmailHint");
const capsHint = $("#capsHint");

const signupForm = $("#signup-form");
const signupName = $("#signupName");
const signupNameHint = $("#signupNameHint");
const signupEmail = $("#signupEmail");
const signupEmailHint = $("#signupEmailHint");
const signupPassword = $("#signupPassword");
const signupPasswordConfirm = $("#signupPasswordConfirm");
const confirmHint = $("#confirmHint");
const signupAgree = $(".signupAgree");
const signupButton = $("#signupButton");
const signupMessage = $("#signupMessage");
const goLoginButton = $("#goLoginButton");
const strengthBar = $("#strengthBar");
const strengthText = $("#strengthText");
const ruleItems = document.querySelectorAll("#passwordRules li");

const toggleButtons = document.querySelectorAll(".toggle-password");

let currentUser = null;
let signupDone = false;

function showMessage(element, text, type) {
  if (element.textContent !== text) element.textContent = text;
  element.classList.remove("is-success", "is-error");
  if (type) element.classList.add("is-" + type);
}

function setInvalid(input, invalid) {
  input.setAttribute("aria-invalid", String(invalid));
}

function markTouched(input) {
  input.dataset.touched = "true";
}
function isTouched(input) {
  return input.dataset.touched === "true";
}

function isEmpty(input) {
  return input.value.trim() === "";
}
function isEmailValid(input) {
  return !isEmpty(input) && !input.validity.typeMismatch;
}
const hasNumber = (pw) => /\d/.test(pw);
const hasLetter = (pw) => /[A-Za-z]/.test(pw);
const hasSpecial = (pw) => /[^A-Za-z0-9\s]/.test(pw);
const hasLength = (pw) => pw.length >= 8;

function isPasswordOk(pw) {
  return hasLength(pw) && hasLetter(pw) && hasNumber(pw);
}
function isConfirmOk() {
  return (
    signupPasswordConfirm.value !== "" &&
    signupPasswordConfirm.value === signupPassword.value
  );
}
function isNameOk() {
  return signupName.value.trim().length >= 2;
}

/* ---------- 피드백 ---------- */
function checkEmail(input, hint) {
  if (isEmpty(input)) {
    setInvalid(input, true);
    showMessage(hint, "이메일 입력란을 비워둘 수 없습니다.", "error");
  } else if (input.validity.typeMismatch) {
    setInvalid(input, true);
    showMessage(hint, "이메일 형식이 올바르지 않습니다.", "error");
  } else {
    setInvalid(input, false);
    showMessage(hint, "올바른 이메일 형식입니다.", "success");
  }
}

function checkName() {
  if (isNameOk()) {
    setInvalid(signupName, false);
    showMessage(signupNameHint, "", null);
  } else {
    setInvalid(signupName, true);
    showMessage(signupNameHint, "이름은 2자 이상 입력해주세요.", "error");
  }
}

function renderRules() {
  const pw = signupPassword.value;
  const rules = {
    length: ["8자 이상", hasLength(pw)],
    letter: ["영문 포함", hasLetter(pw)],
    number: ["숫자 포함", hasNumber(pw)],
    special: ["특수문자 포함 (강도 상승)", hasSpecial(pw)],
  };
  ruleItems.forEach((li) => {
    const [label, met] = rules[li.dataset.rule];
    // 색에만 의존하지 않도록 기호와 텍스트를 함께 표시
    li.textContent = `${met ? "✓" : "✗"} ${label} - ${met ? "충족" : "미충족"}`;
    li.classList.toggle("is-met", met);
  });
}

function renderStrength() {
  const pw = signupPassword.value;
  let level = 0;
  if (pw !== "") level = 1;
  if (isPasswordOk(pw)) level = pw.length >= 12 || hasSpecial(pw) ? 3 : 2;
  strengthBar.dataset.level = level;
  strengthBar.style.width = level * 33.4 + "%";
  strengthText.textContent =
    "비밀번호 강도: " + ["-", "약함", "보통", "강함"][level];
  renderRules();
}

function checkConfirm() {
  if (signupPasswordConfirm.value === "") {
    setInvalid(signupPasswordConfirm, false);
    showMessage(confirmHint, "", null);
  } else if (isConfirmOk()) {
    setInvalid(signupPasswordConfirm, false);
    showMessage(confirmHint, "비밀번호가 일치합니다.", "success");
  } else {
    setInvalid(signupPasswordConfirm, true);
    showMessage(confirmHint, "비밀번호가 일치하지 않습니다.", "error");
  }
}

function updateSignupButton() {
  if (signupDone) return;
  signupButton.disabled = !(
    isNameOk() &&
    isEmailValid(signupEmail) &&
    isPasswordOk(signupPassword.value) &&
    isConfirmOk() &&
    signupAgree.checked
  );
}
function updateLoginButton() {
  loginButton.disabled = !(
    isEmailValid(loginEmail) && loginPassword.value !== ""
  );
}

function switchAuthTab(target, moveFocus = false) {
  const isLogin = target === "login";
  [
    [loginTab, loginPanel, isLogin],
    [signupTab, signupPanel, !isLogin],
  ].forEach(([tab, panel, active]) => {
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
    panel.hidden = !active;
  });
  if (moveFocus) (isLogin ? loginTab : signupTab).focus();
}

function handleTabKeydown(event) {
  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
  event.preventDefault();
  let next;
  if (event.key === "Home") next = "login";
  else if (event.key === "End") next = "signup";
  else
    next =
      loginTab.getAttribute("aria-selected") === "true" ? "signup" : "login";
  switchAuthTab(next, true);
}

function renderAuthState() {
  const loggedIn = currentUser !== null;
  loginPanel.hidden = loggedIn;
  signupPanel.hidden = true;
  authTabs.hidden = loggedIn;
  authStatus.hidden = !loggedIn;
  if (loggedIn) {
    welcomeMessage.textContent =
      "로그인되었습니다! " +
      currentUser.name +
      "님, 오늘도 단어를 복습해볼까요?";
    welcomeMessage.classList.add("is-success");
  } else {
    welcomeMessage.textContent = "";
    welcomeMessage.classList.remove("is-success");
  }
}

function resetPasswordToggles() {
  toggleButtons.forEach((button) => {
    const target = $("#" + button.dataset.target);
    target.type = "password";
    button.textContent = "표시";
    button.setAttribute("aria-label", button.dataset.name + " 표시");
  });
}

function resetField(input) {
  input.removeAttribute("aria-invalid");
  delete input.dataset.touched;
}

function handleSignupNameBlur() {
  markTouched(signupName);
  checkName();
  updateSignupButton();
}
function handleSignupNameInput() {
  if (isTouched(signupName)) checkName();
  updateSignupButton();
}
function handleSignupEmailBlur() {
  markTouched(signupEmail);
  checkEmail(signupEmail, signupEmailHint);
}
function handleSignupEmailInput() {
  if (isTouched(signupEmail)) checkEmail(signupEmail, signupEmailHint);
  updateSignupButton();
}
function handleSignupPasswordInput() {
  renderStrength();
  if (signupPasswordConfirm.value !== "") checkConfirm();
  updateSignupButton();
}
function handleSignupConfirmBlur() {
  markTouched(signupPasswordConfirm);
  checkConfirm();
}
function handleSignupConfirmInput() {
  if (isTouched(signupPasswordConfirm)) checkConfirm();
  updateSignupButton();
}
function handleLoginEmailBlur() {
  markTouched(loginEmail);
  checkEmail(loginEmail, loginEmailHint);
}
function handleLoginEmailInput() {
  if (isTouched(loginEmail)) checkEmail(loginEmail, loginEmailHint);
  updateLoginButton();
}
function handleLoginPasswordInput() {
  updateLoginButton();
}

function handleCapsLock(event) {
  const on = event.getModifierState && event.getModifierState("CapsLock");
  showMessage(
    capsHint,
    on ? "Caps Lock이 켜져 있습니다." : "",
    on ? "error" : null,
  );
}

function handleTogglePassword(event) {
  const button = event.currentTarget;
  const target = $("#" + button.dataset.target);
  const show = target.type === "password";
  target.type = show ? "text" : "password";
  button.textContent = show ? "숨김" : "표시";
  button.setAttribute(
    "aria-label",
    button.dataset.name + (show ? " 숨김" : " 표시"),
  );
}

function handleSignup(event) {
  event.preventDefault();
  signupDone = true;
  showMessage(
    signupMessage,
    signupName.value.trim() + "님, 가입이 완료되었습니다!",
    "success",
  );
  goLoginButton.hidden = false;
  signupButton.disabled = true;
  goLoginButton.focus();
}

function handleLogin(event) {
  event.preventDefault();
  const email = loginEmail.value.trim();
  currentUser = { name: email.split("@")[0], email: email };

  showMessage(loginMessage, "", null);
  renderAuthState();
  welcomeMessage.focus();
}

function handleGoLogin() {
  signupDone = false;
  signupForm.reset();
  [signupName, signupEmail, signupPassword, signupPasswordConfirm].forEach(
    resetField,
  );
  showMessage(signupNameHint, "", null);
  showMessage(signupEmailHint, "", null);
  showMessage(confirmHint, "", null);
  showMessage(signupMessage, "", null);
  resetPasswordToggles();
  renderStrength();
  signupButton.disabled = true;
  goLoginButton.hidden = true;
  switchAuthTab("login", true);
}

function handleLogout() {
  currentUser = null;
  loginForm.reset();
  [loginEmail, loginPassword].forEach(resetField);
  showMessage(loginEmailHint, "", null);
  showMessage(loginMessage, "", null);
  showMessage(capsHint, "", null);
  resetPasswordToggles();
  loginButton.disabled = true;
  renderAuthState();
  switchAuthTab("login", true);
}

loginTab.addEventListener("click", () => switchAuthTab("login"));
signupTab.addEventListener("click", () => switchAuthTab("signup"));
authTabs.addEventListener("keydown", handleTabKeydown);

signupName.addEventListener("blur", handleSignupNameBlur);
signupName.addEventListener("input", handleSignupNameInput);
signupEmail.addEventListener("blur", handleSignupEmailBlur);
signupEmail.addEventListener("input", handleSignupEmailInput);
signupPassword.addEventListener("input", handleSignupPasswordInput);
signupPasswordConfirm.addEventListener("blur", handleSignupConfirmBlur);
signupPasswordConfirm.addEventListener("input", handleSignupConfirmInput);
signupAgree.addEventListener("change", updateSignupButton);
signupForm.addEventListener("submit", handleSignup);

loginEmail.addEventListener("blur", handleLoginEmailBlur);
loginEmail.addEventListener("input", handleLoginEmailInput);
loginPassword.addEventListener("input", handleLoginPasswordInput);
loginPassword.addEventListener("keydown", handleCapsLock);
loginPassword.addEventListener("keyup", handleCapsLock);
loginPassword.addEventListener("blur", () => showMessage(capsHint, "", null));
loginForm.addEventListener("submit", handleLogin);

goLoginButton.addEventListener("click", handleGoLogin);
logoutButton.addEventListener("click", handleLogout);
toggleButtons.forEach((button) =>
  button.addEventListener("click", handleTogglePassword),
);

renderStrength();
