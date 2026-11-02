const flashCard = document.querySelector("#flashCard");
const flipButton = document.querySelector("#flipButton");
const knowButton = document.querySelector("#knowButton");
const unknownButton = document.querySelector("#unknownButton");
const reviewProgress = document.querySelector(".review-progress");

const wordForm = document.querySelector("#word-form");
const wordLanguage = document.querySelector("#wordLanguage");
const wordInput = document.querySelector("#wordInput");
const meaningInput = document.querySelector("#meaningInput");
const exampleInput = document.querySelector("#exampleInput");
const wordMessage = document.querySelector("#wordMessage");
const wordSubmit = document.querySelector("#wordSubmit");
const editCancel = document.querySelector("#editCancel");

const wordList = document.querySelector("#wordList");
const filterButtons = document.querySelectorAll(".filter-button");

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
currentFilter = "all";

function getFilteredWords() {
  if (currentFilter === "known") return words.filter((w) => w.known);
  if (currentFilter === "unknown") return words.filter((w) => !w.known);
  return words;
}

function updateProgress() {
  flashCard.hidden = words.length === 0;
  reviewProgress.textContent =
    words.length === 0
      ? "등록된 단어가 없습니다."
      : `${currentIndex + 1} / ${words.length}`;
}

function showCurrent() {
  if (words.length === 0) {
    currentIndex = -1;
    currentWord = null;
    updateProgress();
    return;
  }
  currentWord = words[currentIndex];
  flashCard.classList.remove("is-flipped");
  showInFlashCard(currentWord);
  updateProgress();
}

function showInFlashCard(item) {
  flashCard.querySelector(".word-language").textContent = item.language;
  flashCard.querySelector(".word-text").textContent = item.word;
  flashCard.querySelector(".word-meaning").textContent = item.meaning;
  flashCard.querySelector(".word-example").textContent = item.example;
}

//
function handleFlipClick() {
  flashCard.classList.toggle("is-flipped");
}

function handleReviewClick(event) {
  if (words.length === 0) {
    showCurrent();
    return;
  }

  if (currentWord) {
    if (event.currentTarget === knowButton) {
      currentWord.known = true;
      currentWord.reviewCount++;
    } else {
      currentWord.known = false;
    }
    renderWordList();
  }

  currentIndex = (currentIndex + 1) % words.length;
  showCurrent();
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
}

//
function createElement(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}

function createWordCard(item) {
  const li = createElement("li", "word-card");
  li.dataset.id = item.id;
  if (item.id === editingId) li.classList.add("is-editing");

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
  const deleteButton = createElement("button", "delete-button", "삭제");
  deleteButton.type = "button";
  actions.append(editButton, deleteButton);

  li.append(
    createElement("h3", "word-text", item.word),
    createElement("p", "word-meaning", item.meaning),
    createElement("p", "word-example", item.example),
    meta,
    actions,
  );
  return li;
}

function renderWordList() {
  const filtered = getFilteredWords();
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

  if (isEdit) {
    const target = words.find((w) => w.id === editingId);
    Object.assign(target, fields);
    if (target === currentWord) showInFlashCard(target);
  } else {
    words.push({ id: nextId++, reviewCount: 0, ...fields });
    if (words.length === 1) {
      currentIndex = 0;
      showCurrent();
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
  document.querySelector("#add-word").scrollIntoView({ behavior: "smooth" });
  wordInput.focus();
}

function handleEditCancel() {
  resetWordForm();
  wordMessage.textContent = "";
}

function handleDeleteClick(event) {
  const button = event.target.closest(".delete-button");
  if (!button) return;

  const id = Number(button.closest(".word-card").dataset.id);
  const index = words.findIndex((w) => w.id === id);
  if (!confirm(`'${words[index].word}' 단어를 정말로 삭제하시겠습니까?`))
    return;

  if (id === editingId) resetWordForm();
  words.splice(index, 1);

  if (index < currentIndex) {
    currentIndex--; //
    updateProgress();
  } else if (index === currentIndex) {
    currentIndex = Math.min(currentIndex, words.length - 1); //
    showCurrent();
  } else {
    updateProgress();
  }
  renderWordList();
}

flipButton.addEventListener("click", handleFlipClick);
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
showCurrent();
renderWordList();
