const serviceName = "Vocabulet";

let isSubscribed = false;
let submitCount = 0;
let subscriberEmail = "";

const subscribeForm = document.querySelector("#subscribe-form");
const emailInput = document.querySelector("#email");
const subscribeButton = document.querySelector("#subscribeButton");
const subscribeMessage = document.querySelector("#subscribeMessage");

function makeSubscribeMessage(email, subscribed) {
  if (subscribed) {
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

subscribeForm.addEventListener("submit", handleSubscribe);
