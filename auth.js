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

const signupForm = $("#signup-form");
const signupName = $("#signupName");
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

const toggleButtons = document.querySelectorAll(".toggle-password");

let currentUser = null;
let signupDone = false;

function showMessage(element, text, type) {
  element.textContent = text;
  element.classList.remove("is-success", "is-error");
  if (type) element.classList.add("is-" + type);
}

// 판별
function isEmpty(input) {
  return input.value.trim() === "";
}
function isEmailValid(input) {
  return !isEmpty(input) && !input.validity.typeMismatch;
}
function isPasswordOk(pw) {
  return pw.length >= 8 && hasNumber(pw);
}
function hasNumber(pw) {
  return [...pw].some(function (c) {
    return c >= "0" && c <= "9";
  });
}
function isConfirmOk() {
  return (
    signupPasswordConfirm.value !== "" &&
    signupPasswordConfirm.value === signupPassword.value
  );
}

// 피드백
function checkEmail(input, hint) {
  if (isEmpty(input)) {
    showMessage(hint, "이메일 입력란을 비워둘 수 없습니다.", "error");
  } else if (input.validity.typeMismatch) {
    showMessage(hint, "이메일 형식이 올바르지 않습니다.", "error");
  } else {
    showMessage(hint, "올바른 이메일 형식입니다.", "success");
  }
}

function renderStrength() {
  const pw = signupPassword.value;
  let level = 0;
  if (pw !== "") level = 1;
  if (isPasswordOk(pw)) level = pw.length >= 12 ? 3 : 2;
  strengthBar.dataset.level = level;
  strengthBar.style.width = level * 33.4 + "%";
  strengthText.textContent =
    "비밀번호 강도: " + ["-", "약함", "보통", "강함"][level];
}

function checkConfirm() {
  if (signupPasswordConfirm.value === "") {
    showMessage(confirmHint, "", null);
  } else if (isConfirmOk()) {
    showMessage(confirmHint, "비밀번호가 일치합니다.", "success");
  } else {
    showMessage(confirmHint, "비밀번호가 일치하지 않습니다.", "error");
  }
}

function updateSignupButton() {
  if (signupDone) return;
  signupButton.disabled = !(
    signupName.value.trim().length >= 2 &&
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

function switchAuthTab(target) {
  const isLogin = target === "login";
  loginPanel.classList.toggle("is-hidden", !isLogin);
  signupPanel.classList.toggle("is-hidden", isLogin);
  loginTab.classList.toggle("is-active", isLogin);
  signupTab.classList.toggle("is-active", !isLogin);
  loginTab.setAttribute("aria-selected", String(isLogin));
  signupTab.setAttribute("aria-selected", String(!isLogin));
}

function renderAuthState() {
  const loggedIn = currentUser !== null;
  loginPanel.classList.toggle("is-hidden", loggedIn);
  signupPanel.classList.add("is-hidden");
  authTabs.classList.toggle("is-hidden", loggedIn);
  authStatus.classList.toggle("is-hidden", !loggedIn);
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
function handleLoginTabClick() {
  switchAuthTab("login");
}
function handleSignupTabClick() {
  switchAuthTab("signup");
}
function handleSignupNameInput() {
  updateSignupButton();
}
function handleSignupEmailInput() {
  checkEmail(signupEmail, signupEmailHint);
  updateSignupButton();
}
function handleSignupPasswordInput() {
  renderStrength();
  checkConfirm();
  updateSignupButton();
}
function handleSignupConfirmInput() {
  checkConfirm();
  updateSignupButton();
}
function handleSignupAgreeChange() {
  updateSignupButton();
}
function handleLoginEmailInput() {
  checkEmail(loginEmail, loginEmailHint);
  updateLoginButton();
}
function handleLoginPasswordInput() {
  updateLoginButton();
}

function handleTogglePassword(event) {
  const button = event.currentTarget;
  const target = $("#" + button.dataset.target);
  const show = target.type === "password";
  target.type = show ? "text" : "password";
  button.textContent = show ? "숨김" : "표시";
}

function handleSignup(event) {
  event.preventDefault();
  signupDone = true;
  showMessage(
    signupMessage,
    signupName.value.trim() + "님, 가입이 완료되었습니다!",
    "success",
  );
  goLoginButton.classList.remove("is-hidden");
  signupButton.disabled = true;
}

function handleLogin(event) {
  event.preventDefault();
  const email = loginEmail.value.trim();
  currentUser = {
    name: email.split("@")[0],
    email: email,
  };

  showMessage(loginMessage, "", null);
  renderAuthState();
}

function handleGoLogin() {
  signupDone = false;
  signupForm.reset();
  showMessage(signupEmailHint, "", null);
  showMessage(confirmHint, "", null);
  showMessage(signupMessage, "", null);
  renderStrength();
  signupButton.disabled = true;
  goLoginButton.classList.add("is-hidden");
  switchAuthTab("login");
}

function handleLogout() {
  currentUser = null;
  loginForm.reset();
  showMessage(loginEmailHint, "", null);
  showMessage(loginMessage, "", null);
  loginButton.disabled = true;
  renderAuthState();
  switchAuthTab("login");
}
loginTab.addEventListener("click", handleLoginTabClick);
signupTab.addEventListener("click", handleSignupTabClick);

signupName.addEventListener("input", handleSignupNameInput);
signupEmail.addEventListener("input", handleSignupEmailInput);
signupPassword.addEventListener("input", handleSignupPasswordInput);
signupPasswordConfirm.addEventListener("input", handleSignupConfirmInput);
signupAgree.addEventListener("change", handleSignupAgreeChange);
signupForm.addEventListener("submit", handleSignup);

loginEmail.addEventListener("input", handleLoginEmailInput);
loginPassword.addEventListener("input", handleLoginPasswordInput);
loginForm.addEventListener("submit", handleLogin);

goLoginButton.addEventListener("click", handleGoLogin);
logoutButton.addEventListener("click", handleLogout);

toggleButtons.forEach(function (button) {
  button.addEventListener("click", handleTogglePassword);
});
