const serviceName = "Vocabulet";

const themeButton = document.querySelector("#themeButton");

const navLinks = document.querySelectorAll(".site-nav a");
const menuToggle = document.querySelector("#menuToggle");

function handleThemeClick() {
  const isDark = document.body.classList.toggle("dark");
  themeButton.textContent = isDark
    ? "라이트 테마로 바꾸기"
    : "다크 테마로 바꾸기";
}

function updateCurrentNav() {
  const hash = window.location.hash;
  navLinks.forEach((link) => {
    const current = hash
      ? link.getAttribute("href") === hash
      : link === navLinks[0];
    link.classList.toggle("is-current", current);
    if (current) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}

window.addEventListener("hashchange", updateCurrentNav);
themeButton.addEventListener("click", handleThemeClick);

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.classList.toggle("is-open");
  menuToggle.textContent = isOpen ? "메뉴 닫기" : "메뉴 열기";
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

updateCurrentNav();
