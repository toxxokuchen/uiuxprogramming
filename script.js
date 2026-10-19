const serviceName = "Vocabulet";

const themeButton = document.querySelector("#themeButton");

function handleThemeClick() {
  const isDark = document.body.classList.toggle("dark");
  themeButton.textContent = isDark
    ? "라이트 테마로 바꾸기"
    : "다크 테마로 바꾸기";
}

themeButton.addEventListener("click", handleThemeClick);
