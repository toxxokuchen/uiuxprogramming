/* =========================================================
   components.js  -  공용 UI 헬퍼 + 커스텀 엘리먼트
   로드 순서: components.js → (페이지 스크립트)
   기존 script.js는 이 파일로 흡수되므로 삭제한다.
   ========================================================= */
(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [
    ...root.querySelectorAll(selector),
  ];

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  /* ---------- 스크린리더 안내 (aria-live) ---------- */
  function announce(message) {
    let live = $("#liveStatus");
    if (!live) {
      live = el("div", "sr-only");
      live.id = "liveStatus";
      live.setAttribute("role", "status");
      live.setAttribute("aria-live", "polite");
      document.body.prepend(live);
    }
    live.textContent = "";
    setTimeout(() => {
      live.textContent = message;
    }, 50);
  }

  /* ---------- 상태 메시지: type = "success" | "error" | null ---------- */
  function setStatus(target, text, type) {
    if (target.textContent !== text) target.textContent = text;
    target.classList.remove("is-success", "is-error");
    if (type) target.classList.add(`is-${type}`);
  }

  /* ---------- 검증기: (input) => { ok, message } ---------- */
  const validators = {
    email(input) {
      if (input.value.trim() === "")
        return { ok: false, message: "이메일 입력란을 비워둘 수 없습니다." };
      if (input.validity.typeMismatch)
        return { ok: false, message: "이메일 형식이 올바르지 않습니다." };
      return { ok: true, message: "올바른 이메일 형식입니다." };
    },
    minLength: (min, message) => (input) => ({
      ok: input.value.trim().length >= min,
      message,
    }),
  };

  /* ---------- 폼 필드: touched 후 실시간 검증 + aria-invalid ---------- */
  function bindField({
    input,
    hint,
    validate,
    showSuccess = true,
    skip = () => false,
    onChange = () => {},
  }) {
    function check() {
      if (skip()) return true;
      const { ok, message = "" } = validate(input);
      input.setAttribute("aria-invalid", String(!ok));
      if (!ok) setStatus(hint, message, "error");
      else if (showSuccess && message) setStatus(hint, message, "success");
      else setStatus(hint, "", null);
      return ok;
    }
    function reset() {
      input.removeAttribute("aria-invalid");
      delete input.dataset.touched;
      setStatus(hint, "", null);
    }
    input.addEventListener("blur", () => {
      input.dataset.touched = "true";
      check();
      onChange();
    });
    input.addEventListener("input", () => {
      if (input.dataset.touched === "true") check();
      onChange();
    });
    return { check, reset };
  }

  /* ---------- 비밀번호 표시/숨김 ---------- */
  function setPasswordVisible(button, show) {
    const target = document.getElementById(button.dataset.target);
    target.type = show ? "text" : "password";
    button.textContent = show ? "숨김" : "표시";
    button.setAttribute(
      "aria-label",
      button.dataset.name + (show ? " 숨김" : " 표시"),
    );
  }
  function initPasswordToggles(root = document) {
    $$(".toggle-password", root).forEach((button) =>
      button.addEventListener("click", () => {
        const target = document.getElementById(button.dataset.target);
        setPasswordVisible(button, target.type === "password");
      }),
    );
  }
  function resetPasswordToggles(root = document) {
    $$(".toggle-password", root).forEach((b) => setPasswordVisible(b, false));
  }

  /* ---------- 필수 약관 게이트 ---------- */
  function initAgreeGate(checks, onChange) {
    const evaluate = () =>
      onChange(checks.filter((c) => c.required).every((c) => c.checked));
    checks.forEach((c) => c.addEventListener("change", evaluate));
  }

  /* ---------- 탭 (WAI-ARIA, 자동 활성화) ---------- */
  function initTabs(tablist, { onSelect = () => {} } = {}) {
    const tabs = $$('[role="tab"]', tablist);
    const panelOf = (tab) =>
      document.getElementById(tab.getAttribute("aria-controls"));

    function select(tab, moveFocus = false) {
      tabs.forEach((t) => {
        const active = t === tab;
        t.setAttribute("aria-selected", String(active));
        t.tabIndex = active ? 0 : -1;
        panelOf(t).hidden = !active;
      });
      if (moveFocus) tab.focus();
      onSelect(tab);
    }

    tablist.addEventListener("click", (event) => {
      const tab = event.target.closest('[role="tab"]');
      if (tab) select(tab);
    });
    tablist.addEventListener("keydown", (event) => {
      const i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      const last = tabs.length - 1;
      const next = {
        ArrowRight: i === last ? 0 : i + 1,
        ArrowLeft: i === 0 ? last : i - 1,
        Home: 0,
        End: last,
      }[event.key];
      if (next === undefined) return;
      event.preventDefault();
      select(tabs[next], true);
    });
    return { tabs, select };
  }

  /* ---------- aria-pressed 토글 그룹 (필터 등, 단일 선택) ---------- */
  function initToggleGroup(group, onChange) {
    group.addEventListener("click", (event) => {
      const button = event.target.closest("[aria-pressed]");
      if (!button || !group.contains(button)) return;
      $$("[aria-pressed]", group).forEach((b) =>
        b.setAttribute("aria-pressed", String(b === button)),
      );
      onChange(button);
    });
  }

  /* ---------- aria-expanded 디스클로저 (모바일 메뉴 등) ---------- */
  function initDisclosure(button, panel) {
    const isOpen = () => button.getAttribute("aria-expanded") === "true";
    function set(open, restoreFocus = false) {
      panel.classList.toggle("is-open", open);
      button.setAttribute("aria-expanded", String(open));
      if (!open && restoreFocus) button.focus();
    }
    button.addEventListener("click", () => set(!isOpen()));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && isOpen()) set(false, true);
    });
    return { set };
  }

  window.UI = {
    $,
    $$,
    el,
    announce,
    setStatus,
    validators,
    bindField,
    initPasswordToggles,
    resetPasswordToggles,
    initAgreeGate,
    initTabs,
    initToggleGroup,
    initDisclosure,
  };

  class SiteHeader extends HTMLElement {
    connectedCallback() {
      if (this.dataset.ready) return;
      this.dataset.ready = "true";

      const links = $$(":scope > a", this).map((a) => ({
        href: a.getAttribute("href"),
        text: a.textContent.trim(),
      }));

      const skip = el("a", "skip-link", "본문 바로가기");
      skip.href = "#top";

      const header = el("header", "site-header");
      const logo = el("a", null, "Vocabulet");
      logo.id = "site-logo";
      logo.href = "index.html";
      const h1 = el("h1");
      h1.append(logo);
      header.append(h1);

      const subtitle = this.getAttribute("subtitle");
      const description = this.getAttribute("description");
      if (subtitle) header.append(el("p", "header-subtitle", subtitle));
      if (description)
        header.append(el("p", "header-description", description));

      const menuButton = el("button", "btn btn--secondary menu-button", "메뉴");
      menuButton.type = "button";
      menuButton.id = "menuButton";
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-controls", "mainNav");

      const nav = el("nav", "site-nav");
      nav.id = "mainNav";
      nav.setAttribute("aria-label", "주요 메뉴");
      links.forEach(({ href, text }) => {
        const a = el("a", null, text);
        a.href = href;
        nav.append(a);
      });

      header.append(menuButton, nav);
      this.replaceChildren(skip, header);

      const menu = initDisclosure(menuButton, nav);
      const navLinks = $$("a", nav);
      navLinks.forEach((a) =>
        a.addEventListener("click", () => menu.set(false)),
      );

      const updateCurrent = () => {
        const hash = window.location.hash;
        navLinks.forEach((link, i) => {
          const current = hash ? link.getAttribute("href") === hash : i === 0;
          link.classList.toggle("is-current", current);
          if (current) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      };
      window.addEventListener("hashchange", updateCurrent);
      updateCurrent();
    }
  }

  class SiteFooter extends HTMLElement {
    connectedCallback() {
      this.replaceChildren(
        el(
          "footer",
          "site-footer",
          "ⓒ 2026 외국어 단어 학습 서비스 Vocabulet.",
        ),
      );
    }
  }

  class ThemeCard extends HTMLElement {
    connectedCallback() {
      const KEY = "vocabulet-theme";
      this.innerHTML = `
        <section id="config" class="card card--section" aria-labelledby="config-title">
          <h2 id="config-title">화면 테마</h2>
          <button id="themeButton" class="btn btn--secondary" type="button">
            다크 테마 사용
          </button>
        </section>`;
      const button = $("#themeButton", this);

      const apply = (dark) => {
        document.body.classList.toggle("dark", dark);
        button.textContent = dark ? "라이트 테마 사용" : "다크 테마 사용";
      };
      let saved = null;
      try {
        saved = localStorage.getItem(KEY);
      } catch (e) {}
      apply(saved === "dark");

      button.addEventListener("click", () => {
        const dark = !document.body.classList.contains("dark");
        apply(dark);
        try {
          localStorage.setItem(KEY, dark ? "dark" : "light");
        } catch (e) {}
      });
    }
  }

  function defineComponents() {
    customElements.define("site-header", SiteHeader);
    customElements.define("site-footer", SiteFooter);
    customElements.define("theme-card", ThemeCard);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", defineComponents);
  } else {
    defineComponents();
  }
})();
