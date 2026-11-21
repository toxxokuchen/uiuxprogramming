(function () {
  "use strict";

  const { $, $$, setStatus, bindField, validators, initAgreeGate } = UI;

  const serviceName = "Vocabulet";

  let isSubscribed = false;

  const subscribeForm = $("#subscribe-form");
  const emailInput = $("#email");
  const subscribeButton = $("#subscribeButton");
  const subscribeMessage = $("#subscribeMessage");
  const agreeMessage = $("#agreeMessage");
  const agreeChecks = $$(".agreeCheck");

  function updateSubscribeButton() {
    if (isSubscribed) return;
    const agreed = agreeChecks
      .filter(function (c) {
        return c.required;
      })
      .every(function (c) {
        return c.checked;
      });
    subscribeButton.disabled = !(agreed && validators.email(emailInput).ok);
  }

  const emailField = bindField({
    input: emailInput,
    hint: subscribeMessage,
    validate: validators.email,
    showSuccess: false,
    skip: function () {
      return isSubscribed;
    },
    onChange: updateSubscribeButton,
  });

  initAgreeGate(agreeChecks, function (agreed) {
    if (isSubscribed) return;
    setStatus(
      agreeMessage,
      agreed
        ? "필수 약관에 동의하셨습니다."
        : "필수 약관 동의 후 이메일을 수신할 수 있습니다.",
      agreed ? "success" : "error",
    );
    updateSubscribeButton();
  });

  subscribeForm.addEventListener("submit", function (event) {
    event.preventDefault();
    if (isSubscribed) return;

    if (!emailField.check()) {
      emailInput.focus();
      return;
    }

    isSubscribed = true;
    setStatus(
      subscribeMessage,
      "감사합니다! " +
        emailInput.value.trim() +
        "로 " +
        serviceName +
        "의 리마인더를 받게 됩니다.",
      "success",
    );
    subscribeButton.textContent = "신청 완료";
    subscribeButton.disabled = true;
  });
})();
