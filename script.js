const serviceName = "Vocabulet";

let isSubscribed = false;
let submitCount = 0;
let subscriberEmail = "";

const subscribeForm = document.querySelector("#subscribe-form");
const emailInput = document.querySelector("#email");
const subscribeButton = document.querySelector("#subscribeButton");
const subscribeMessage = document.querySelector("#subscribeMessage");

const themeButton = document.querySelector("#themeButton");

const agreeRow = document.querySelector("#agreeRow");
const agreeChecks = document.querySelectorAll(".agreeCheck");
const agreeMessage = document.querySelector("#agreeMessage");

function resetAgreeCheck() {
  subscribeButton.classList.add("disabled");
}

function activateAgreeCheck(clickedCheckbox) {
  clickedCheckbox.classList.add("is-active");
  clickedCheckbox.setAttribute("aria-selected", "true");
}

function handleEmailInput() {
  if (isSubscribed) return;
  if (emailInput.value === "") {
    subscribeMessage.classList.add("is-error");
    subscribeMessage.textContent = "이메일 입력란을 비워둘 수 없습니다.";
    emailInput.focus();
  } else {
    subscribeMessage.classList.remove("is-error");
    subscribeMessage.textContent = "";
  }
}

function makeSubscribeMessage(email, subscribed) {
  if (subscribed) {
    subscribeMessage.classList.remove("is-error");
    subscribeMessage.classList.add("is-success");
    return `감사합니다! ${email}로 ${serviceName}의 리마인더를 받게 됩니다.`;
  } else {
    subscribeMessage.classList.add("is-error");
    return "이메일을 입력한 뒤 신청해주세요.";
  }
}

function handleSubscribe(event) {
  event.preventDefault();
  subscriberEmail = emailInput.value.trim();
  if (subscriberEmail === "") {
    subscribeMessage.classList.add("is-error");
    subscribeMessage.textContent = "이메일을 입력해주세요.";
    emailInput.focus();
    return;
  }
  isSubscribed = true;
  submitCount++;

  subscribeMessage.textContent = makeSubscribeMessage(
    subscriberEmail,
    isSubscribed,
  );
  subscribeMessage.classList.add("is-success");

  subscribeButton.textContent = "신청 완료";
  subscribeButton.disabled = true;

  return;
}

function handleAgreeChange() {
  const agreed = Array.from(agreeChecks).every((checkbox) => checkbox.checked);
  subscribeButton.disabled = !agreed;
  agreeMessage.textContent = agreed
    ? "모든 약관에 동의하셨습니다."
    : "동의 후 이메일을 수신할 수 있습니다.";

  if (agreed) {
    agreeMessage.classList.remove("is-error");
    agreeMessage.classList.add("is-success");
  } else {
    agreeMessage.classList.remove("is-success");
    agreeMessage.classList.add("is-error");
  }
}

function handleThemeClick() {
  const isDark = document.body.classList.toggle("dark");
  themeButton.textContent = isDark
    ? "라이트 테마로 바꾸기"
    : "다크 테마로 바꾸기";
}

subscribeForm.addEventListener("submit", handleSubscribe);
emailInput.addEventListener("input", handleEmailInput);
themeButton.addEventListener("click", handleThemeClick);
agreeChecks.forEach((checkbox) => {
  checkbox.addEventListener("change", handleAgreeChange);
});
