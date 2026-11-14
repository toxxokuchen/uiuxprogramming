const serviceName = "Vocabulet";

const themeButton = document.querySelector("#themeButton");
const navLinks = document.querySelectorAll(".site-nav a");
const menuButton = document.querySelector("#menuButton");
const mainNav = document.querySelector("#mainNav");

function handleThemeClick() {
  const isDark = document.body.classList.toggle("dark");
  themeButton.setAttribute("aria-pressed", String(isDark));
}

function updateCurrentNav() {
  const hash = window.location.hash;
  navLinks.forEach((link) => {
    const current = hash
      ? link.getAttribute("href") === hash
      : link === navLinks[0];
    link.classList.toggle("is-current", current);
    if (current) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
}

function setMenu(open, restoreFocus = false) {
  mainNav.classList.toggle("is-open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  if (!open && restoreFocus) menuButton.focus();
}

menuButton.addEventListener("click", () => {
  setMenu(!mainNav.classList.contains("is-open"));
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && mainNav.classList.contains("is-open")) {
    setMenu(false, true);
  }
});

window.addEventListener("hashchange", updateCurrentNav);
themeButton.addEventListener("click", handleThemeClick);
updateCurrentNav();
