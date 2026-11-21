(function () {
  "use strict";

  const {
    $,
    $$,
    setStatus,
    bindField,
    validators,
    initTabs,
    initPasswordToggles,
    resetPasswordToggles,
  } = UI;

  const loginTab = $("#loginTab");
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
  const capsHint = $("#capsHint");

  const signupForm = $("#signup-form");
  const signupName = $("#signupName");
  const signupEmail = $("#signupEmail");
  const signupPassword = $("#signupPassword");
  const signupPasswordConfirm = $("#signupPasswordConfirm");
  const signupAgree = $(".signupAgree");
  const signupButton = $("#signupButton");
  const signupMessage = $("#signupMessage");
  const goLoginButton = $("#goLoginButton");
  const strengthBar = $("#strengthBar");
  const strengthText = $("#strengthText");
  const ruleItems = $$("#passwordRules li");

  let currentUser = null;
  let signupDone = false;

  const hasNumber = (pw) => /\d/.test(pw);
  const hasLetter = (pw) => /[A-Za-z]/.test(pw);
  const hasSpecial = (pw) => /[^A-Za-z0-9\s]/.test(pw);
  const hasLength = (pw) => pw.length >= 8;
  const isPasswordOk = (pw) => hasLength(pw) && hasLetter(pw) && hasNumber(pw);
  const isConfirmOk = () =>
    signupPasswordConfirm.value !== "" &&
    signupPasswordConfirm.value === signupPassword.value;

  const tabs = initTabs(authTabs);
  initPasswordToggles();

  const signupNameField = bindField({
    input: signupName,
    hint: $("#signupNameHint"),
    validate: validators.minLength(2, "이름은 2자 이상 입력해주세요."),
    showSuccess: false,
    onChange: updateSignupButton,
  });
  const signupEmailField = bindField({
    input: signupEmail,
    hint: $("#signupEmailHint"),
    validate: validators.email,
    onChange: updateSignupButton,
  });
  const confirmField = bindField({
    input: signupPasswordConfirm,
    hint: $("#confirmHint"),
    validate: (input) => {
      if (input.value === "") return { ok: true };
      return isConfirmOk()
        ? { ok: true, message: "비밀번호가 일치합니다." }
        : { ok: false, message: "비밀번호가 일치하지 않습니다." };
    },
    onChange: updateSignupButton,
  });
  const loginEmailField = bindField({
    input: loginEmail,
    hint: $("#loginEmailHint"),
    validate: validators.email,
    onChange: updateLoginButton,
  });

  function renderStrength() {
    const pw = signupPassword.value;
    let level = 0;
    if (pw !== "") level = 1;
    if (isPasswordOk(pw)) level = pw.length >= 12 || hasSpecial(pw) ? 3 : 2;
    strengthBar.dataset.level = level;
    strengthBar.style.width = level * 33.4 + "%";
    strengthText.textContent =
      "비밀번호 강도: " + ["-", "약함", "보통", "강함"][level];

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

  function updateSignupButton() {
    if (signupDone) return;
    signupButton.disabled = !(
      signupName.value.trim().length >= 2 &&
      validators.email(signupEmail).ok &&
      isPasswordOk(signupPassword.value) &&
      isConfirmOk() &&
      signupAgree.checked
    );
  }
  function updateLoginButton() {
    loginButton.disabled = !(
      validators.email(loginEmail).ok && loginPassword.value !== ""
    );
  }

  function renderAuthState() {
    const loggedIn = currentUser !== null;
    authTabs.hidden = loggedIn;
    authStatus.hidden = !loggedIn;
    if (loggedIn) {
      loginPanel.hidden = true;
      signupPanel.hidden = true;
      welcomeMessage.textContent = `로그인되었습니다! ${currentUser.name}님, 오늘도 단어를 복습해볼까요?`;
      welcomeMessage.classList.add("is-success");
    } else {
      welcomeMessage.textContent = "";
      welcomeMessage.classList.remove("is-success");
      tabs.select(loginTab);
    }
  }

  /* ---------- 핸들러 ---------- */
  function handleCapsLock(event) {
    const on = event.getModifierState && event.getModifierState("CapsLock");
    setStatus(
      capsHint,
      on ? "Caps Lock이 켜져 있습니다." : "",
      on ? "error" : null,
    );
  }

  function handleSignup(event) {
    event.preventDefault();
    signupDone = true;
    setStatus(
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
    currentUser = { name: email.split("@")[0], email };
    setStatus(loginMessage, "", null);
    renderAuthState();
    welcomeMessage.focus();
  }

  function handleGoLogin() {
    signupDone = false;
    signupForm.reset();
    [signupNameField, signupEmailField, confirmField].forEach((f) => f.reset());
    setStatus(signupMessage, "", null);
    resetPasswordToggles(signupForm);
    renderStrength();
    signupButton.disabled = true;
    goLoginButton.hidden = true;
    tabs.select(loginTab, true);
  }

  function handleLogout() {
    currentUser = null;
    loginForm.reset();
    loginEmailField.reset();
    setStatus(loginMessage, "", null);
    setStatus(capsHint, "", null);
    resetPasswordToggles(loginForm);
    loginButton.disabled = true;
    renderAuthState();
    loginTab.focus();
  }

  signupPassword.addEventListener("input", () => {
    renderStrength();
    if (signupPasswordConfirm.value !== "") confirmField.check();
    updateSignupButton();
  });
  signupAgree.addEventListener("change", updateSignupButton);
  signupForm.addEventListener("submit", handleSignup);

  loginPassword.addEventListener("input", updateLoginButton);
  loginPassword.addEventListener("keydown", handleCapsLock);
  loginPassword.addEventListener("keyup", handleCapsLock);
  loginPassword.addEventListener("blur", () => setStatus(capsHint, "", null));
  loginForm.addEventListener("submit", handleLogin);

  goLoginButton.addEventListener("click", handleGoLogin);
  logoutButton.addEventListener("click", handleLogout);

  renderStrength();
})();
