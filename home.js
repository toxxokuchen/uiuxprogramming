const flashCard = document.querySelector("#flashCard");
const cardFront = document.querySelector("#cardFront");
const cardBack = document.querySelector("#cardBack");
const flipButton = document.querySelector("#flipButton");
const knowButton = document.querySelector("#knowButton");
const unknownButton = document.querySelector("#unknownButton");
const reviewActions = document.querySelector("#reviewActions");
const reviewProgress = document.querySelector(".review-progress");
const liveStatus = document.querySelector("#liveStatus");

const wordForm = document.querySelector("#word-form");
const wordLanguage = document.querySelector("#wordLanguage");
const wordInput = document.querySelector("#wordInput");
const meaningInput = document.querySelector("#meaningInput");
const exampleInput = document.querySelector("#exampleInput");
const wordMessage = document.querySelector("#wordMessage");
const wordSubmit = document.querySelector("#wordSubmit");
const editCancel = document.querySelector("#editCancel");

const wordList = document.querySelector("#wordList");
const wordCount = document.querySelector("#wordCount");
const wordbookTitle = document.querySelector("#wordbook-title");
const filterButtons = document.querySelectorAll(".filter-button");

const LANG_CODES = {
  영어: "en",
  일본어: "ja",
  중국어: "zh",
  스페인어: "es",
  프랑스어: "fr",
};
const FILTER_LABELS = {
  all: "전체",
  known: "알고 있는 단어",
  unknown: "모르는 단어",
};
const langOf = (language) => LANG_CODES[language] || "";

const words = [
  {
    id: 1,
    language: "영어",
    word: "resilient",
    meaning: "회복력 있는",
    example: "She is a resilient person.",
    reviewCount: 0,
    known: false,
  },
  {
    id: 2,
    language: "일본어",
    word: "勉強",
    meaning: "공부",
    example: "",
    reviewCount: 0,
    known: false,
  },
];

let nextId = 3;
let editingId = null;
let currentIndex = -1;
let currentWord = null;
let currentFilter = "all";

function announce(message) {
  liveStatus.textContent = "";
  setTimeout(() => {
    liveStatus.textContent = message;
  }, 50);
}

function setLang(element, language) {
  const code = langOf(language);
  if (code) element.lang = code;
  else element.removeAttribute("lang");
}

function getFilteredWords() {
  if (currentFilter === "known") return words.filter((w) => w.known);
  if (currentFilter === "unknown") return words.filter((w) => !w.known);
  return words;
}

function updateProgress() {
  const empty = words.length === 0;
  flashCard.hidden = empty;
  reviewActions.hidden = empty;
  reviewProgress.textContent = empty
    ? "등록된 단어가 없습니다."
    : `${currentIndex + 1} / ${words.length}`;
}

function setFlipped(flipped) {
  flashCard.classList.toggle("is-flipped", flipped);
  flipButton.setAttribute("aria-expanded", String(flipped));
  cardFront.toggleAttribute("inert", flipped);
  cardFront.setAttribute("aria-hidden", String(flipped));
  cardBack.toggleAttribute("inert", !flipped);
  cardBack.setAttribute("aria-hidden", String(!flipped));
  if (flipped && currentWord) {
    announce(
      currentWord.example
        ? `뜻: ${currentWord.meaning}. 예문: ${currentWord.example}`
        : `뜻: ${currentWord.meaning}.`,
    );
  }
}

function showCurrent(shouldAnnounce = true, prefix = "") {
  if (words.length === 0) {
    currentIndex = -1;
    currentWord = null;
    setFlipped(false);
    updateProgress();
    return;
  }
  currentWord = words[currentIndex];
  setFlipped(false);
  showInFlashCard(currentWord);
  updateProgress();
  if (shouldAnnounce) {
    announce(
      `${prefix}${currentIndex + 1} / ${words.length}. ` +
        `${currentWord.language} 단어: ${currentWord.word}`,
    );
  }
}

function showInFlashCard(item) {
  const text = flashCard.querySelector(".word-text");
  const example = flashCard.querySelector(".word-example");
  flashCard.querySelector(".word-language").textContent = item.language;
  text.textContent = item.word;
  flashCard.querySelector(".word-meaning").textContent = item.meaning;
  example.textContent = item.example;
  setLang(text, item.language);
  setLang(example, item.language);
}

function handleFlipClick() {
  setFlipped(!flashCard.classList.contains("is-flipped"));
}

function handleReviewClick(event) {
  if (words.length === 0) {
    showCurrent();
    return;
  }

  let prefix = "";
  if (currentWord) {
    const known = event.currentTarget === knowButton;
    if (known) {
      currentWord.known = true;
      currentWord.reviewCount++;
    } else {
      currentWord.known = false;
    }
    prefix = known
      ? "알고 있어요로 기록했습니다. "
      : "모르겠어요로 기록했습니다. ";
    renderWordList();
  }

  currentIndex = (currentIndex + 1) % words.length;
  showCurrent(true, prefix);
}

function handleFilterClick(event) {
  const button = event.target.closest(".filter-button");
  if (!button) return;

  currentFilter = button.dataset.filter;
  filterButtons.forEach((btn) => {
    const active = btn === button;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-pressed", String(active));
  });
  renderWordList();
  announce(wordCount.textContent);
}

function createElement(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}

function createWordCard(item) {
  const li = createElement("li", "word-card");
  li.dataset.id = item.id;
  if (item.id === editingId) {
    li.classList.add("is-editing");
    li.setAttribute("aria-current", "true");
  }

  const wordText = createElement("h3", "word-text", item.word);
  setLang(wordText, item.language);
  const example = createElement("p", "word-example", item.example);
  setLang(example, item.language);

  const meta = createElement("p", "word-meta");
  meta.append(
    createElement("span", "word-language", item.language),
    " 복습 ",
    createElement("span", "review-count", item.reviewCount),
    "회",
  );

  const actions = createElement("div", "card-actions");
  const editButton = createElement("button", "edit-button", "수정");
  editButton.type = "button";
  editButton.setAttribute("aria-label", `${item.word} 수정`);
  const deleteButton = createElement("button", "delete-button", "삭제");
  deleteButton.type = "button";
  deleteButton.setAttribute("aria-label", `${item.word} 삭제`);
  actions.append(editButton, deleteButton);

  li.append(
    wordText,
    createElement("p", "word-meaning", item.meaning),
    example,
    meta,
    actions,
  );
  return li;
}

function renderWordList() {
  const filtered = getFilteredWords();
  wordCount.textContent = `${FILTER_LABELS[currentFilter]} ${filtered.length}개`;
  if (filtered.length === 0) {
    const emptyText =
      words.length === 0
        ? "등록된 단어가 없습니다."
        : "해당하는 단어가 없습니다.";
    wordList.replaceChildren(createElement("li", "word-list-empty", emptyText));
    return;
  }
  wordList.replaceChildren(...filtered.map(createWordCard));
}

function focusEditButton(id) {
  const button = wordList.querySelector(
    `.word-card[data-id="${id}"] .edit-button`,
  );
  if (button) {
    button.focus();
    return true;
  }
  return false;
}

function handleWordInput() {
  wordSubmit.disabled =
    wordInput.value.trim() === "" || meaningInput.value.trim() === "";
}

function resetWordForm() {
  const wasEditing = editingId !== null;
  editingId = null;
  wordForm.reset();
  handleWordInput();
  wordSubmit.textContent = "단어 등록";
  editCancel.hidden = true;
  if (wasEditing) renderWordList();
}

function handleWordSubmit(event) {
  event.preventDefault();
  const word = wordInput.value.trim();
  const meaning = meaningInput.value.trim();

  if (word === "" || meaning === "") {
    wordMessage.classList.add("is-error");
    wordMessage.textContent = "단어와 뜻을 모두 입력해주세요.";
    return;
  }

  const fields = {
    language: wordLanguage.value,
    word,
    meaning,
    example: exampleInput.value.trim(),
  };
  const isEdit = editingId !== null;
  const editedId = editingId;

  if (isEdit) {
    const target = words.find((w) => w.id === editingId);
    Object.assign(target, fields);
    if (target === currentWord) showInFlashCard(target);
  } else {
    words.push({ id: nextId++, reviewCount: 0, ...fields, known: false });
    if (words.length === 1) {
      currentIndex = 0;
      showCurrent(false);
    } else {
      updateProgress();
    }
  }

  resetWordForm();
  renderWordList();
  wordMessage.classList.remove("is-error");
  wordMessage.textContent = isEdit
    ? `'${word}' 단어를 수정했습니다.`
    : `'${word}' 단어를 등록했습니다.`;

  if (isEdit) {
    if (!focusEditButton(editedId)) wordInput.focus();
  } else {
    wordInput.focus();
  }
}

function handleEditClick(event) {
  const button = event.target.closest(".edit-button");
  if (!button) return;

  const id = Number(button.closest(".word-card").dataset.id);
  const target = words.find((w) => w.id === id);
  editingId = id;
  renderWordList();

  wordLanguage.value = target.language;
  wordInput.value = target.word;
  meaningInput.value = target.meaning;
  exampleInput.value = target.example;

  handleWordInput();
  wordSubmit.textContent = "단어 수정";
  editCancel.hidden = false;
  wordMessage.textContent = "";

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  document
    .querySelector("#add-word")
    .scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  wordInput.focus();
}

function handleEditCancel() {
  const id = editingId;
  resetWordForm();
  wordMessage.textContent = "";
  if (id !== null && !focusEditButton(id)) wordbookTitle.focus();
}

function handleDeleteClick(event) {
  const button = event.target.closest(".delete-button");
  if (!button) return;

  const id = Number(button.closest(".word-card").dataset.id);
  const index = words.findIndex((w) => w.id === id);
  const removedWord = words[index].word;
  if (!confirm(`'${removedWord}' 단어를 정말로 삭제하시겠습니까?`)) return;

  const visibleIndex = getFilteredWords().findIndex((w) => w.id === id);
  if (id === editingId) resetWordForm();
  words.splice(index, 1);

  if (index < currentIndex) {
    currentIndex--;
    updateProgress();
  } else if (index === currentIndex) {
    currentIndex = Math.min(currentIndex, words.length - 1);
    showCurrent(false);
  } else {
    updateProgress();
  }
  renderWordList();

  const deleteButtons = wordList.querySelectorAll(".delete-button");
  const next = deleteButtons[Math.min(visibleIndex, deleteButtons.length - 1)];
  (next || wordbookTitle).focus();
  announce(`'${removedWord}' 단어를 삭제했습니다. ${wordCount.textContent}`);
}

flipButton.addEventListener("click", handleFlipClick);
flashCard.addEventListener("click", handleFlipClick);
knowButton.addEventListener("click", handleReviewClick);
unknownButton.addEventListener("click", handleReviewClick);
wordForm.addEventListener("submit", handleWordSubmit);
wordInput.addEventListener("input", handleWordInput);
meaningInput.addEventListener("input", handleWordInput);
wordList.addEventListener("click", handleEditClick);
wordList.addEventListener("click", handleDeleteClick);
editCancel.addEventListener("click", handleEditCancel);
filterButtons.forEach((btn) =>
  btn.addEventListener("click", handleFilterClick),
);

currentIndex = 0;
showCurrent(false);
renderWordList();
