let isSubscribed = false;
let submitCount = 0;
let subscriberEmail = "";

const subscribeForm = document.querySelector("#subscribe-form");
const emailInput = document.querySelector("#email");
const subscribeButton = document.querySelector("#subscribeButton");
const subscribeMessage = document.querySelector("#subscribeMessage");

const requiredChecks = document.querySelectorAll(".agreeCheck[required]");
const agreeChecks = document.querySelectorAll(".agreeCheck");
const agreeMessage = document.querySelector("#agreeMessage");

function setEmailInvalid(invalid) {
  emailInput.setAttribute("aria-invalid", String(invalid));
}

function setSubscribeMessage(text, type) {
  if (subscribeMessage.textContent !== text) {
    subscribeMessage.textContent = text;
  }
  subscribeMessage.classList.remove("is-success", "is-error");
  if (type) subscribeMessage.classList.add("is-" + type);
}

function validateEmail() {
  if (isSubscribed) return;
  if (emailInput.value.trim() === "") {
    setEmailInvalid(true);
    setSubscribeMessage("이메일 입력란을 비워둘 수 없습니다.", "error");
  } else if (emailInput.validity.typeMismatch) {
    setEmailInvalid(true);
    setSubscribeMessage("이메일 형식이 올바르지 않습니다.", "error");
  } else {
    setEmailInvalid(false);
    setSubscribeMessage("", null);
  }
}

function handleEmailBlur() {
  emailInput.dataset.touched = "true";
  validateEmail();
}

function handleEmailInput() {
  if (emailInput.dataset.touched === "true") validateEmail();
}

function makeSubscribeMessage(email) {
  return `감사합니다! ${email}로 ${serviceName}의 리마인더를 받게 됩니다.`;
}

function handleSubscribe(event) {
  event.preventDefault();
  if (isSubscribed) return;

  subscriberEmail = emailInput.value.trim();
  if (subscriberEmail === "" || emailInput.validity.typeMismatch) {
    setEmailInvalid(true);
    setSubscribeMessage(
      subscriberEmail === ""
        ? "이메일을 입력해주세요."
        : "이메일 형식이 올바르지 않습니다.",
      "error",
    );
    emailInput.focus();
    return;
  }

  isSubscribed = true;
  submitCount++;
  setEmailInvalid(false);
  setSubscribeMessage(makeSubscribeMessage(subscriberEmail), "success");

  subscribeButton.textContent = "신청 완료";
  subscribeButton.disabled = true;
}

function handleAgreeChange() {
  if (isSubscribed) return;
  const agreed = Array.from(requiredChecks).every((c) => c.checked);
  subscribeButton.disabled = !agreed;
  agreeMessage.textContent = agreed
    ? "필수 약관에 동의하셨습니다."
    : "필수 약관 동의 후 이메일을 수신할 수 있습니다.";
  agreeMessage.classList.toggle("is-success", agreed);
  agreeMessage.classList.toggle("is-error", !agreed);
}

subscribeForm.addEventListener("submit", handleSubscribe);
emailInput.addEventListener("blur", handleEmailBlur);
emailInput.addEventListener("input", handleEmailInput);
agreeChecks.forEach((checkbox) => {
  checkbox.addEventListener("change", handleAgreeChange);
});
