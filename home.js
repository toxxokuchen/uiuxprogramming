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
let editingCard = null;

const wordList = document.querySelector(".word-list");

let currentIndex = -1;
let currentCard = null;

function handleFlipClick() {
  flashCard.classList.toggle("is-flipped");
}

function handleReviewClick(event) {
  const cards = document.querySelectorAll(".word-card:not([hidden])");

  flashCard.hidden = cards.length === 0;
  if (cards.length === 0) {
    reviewProgress.textContent = "등록된 단어가 없습니다.";
    return;
  }

  if (event.currentTarget === knowButton && currentCard) {
    const count = currentCard.querySelector(".review-count");
    count.textContent = Number(count.textContent) + 1;
  }

  currentIndex = (currentIndex + 1) % cards.length;
  currentCard = cards[currentIndex];

  flashCard.classList.remove("is-flipped");
  showInFlashCard(currentCard);
  reviewProgress.textContent = `${currentIndex + 1} / ${cards.length}`;
}

function showInFlashCard(card) {
  flashCard.querySelector(".word-language").textContent =
    card.querySelector(".word-language").textContent;
  flashCard.querySelector(".word-text").textContent =
    card.querySelector(".word-text").textContent;
  flashCard.querySelector(".word-meaning").textContent =
    card.querySelector(".word-meaning").textContent;
  flashCard.querySelector(".word-example").textContent =
    card.querySelector(".word-example").textContent;
}

function handleWordInput() {
  wordSubmit.disabled =
    wordInput.value.trim() === "" || meaningInput.value.trim() === "";
}
function resetWordForm() {
  if (editingCard) editingCard.classList.remove("is-editing");
  editingCard = null;
  wordForm.reset();
  handleWordInput();
  wordSubmit.textContent = "단어 등록";
  editCancel.hidden = true;
}

function handleWordSubmit(event) {
  event.preventDefault();
  const word = wordInput.value.trim();
  const meaning = meaningInput.value.trim();
  const isEdit = editingCard !== null;
  const card = isEdit
    ? editingCard
    : document.querySelector(".word-card[hidden]");

  if (word === "" || meaning === "") {
    wordMessage.classList.add("is-error");
    wordMessage.textContent = "단어와 뜻을 모두 입력해주세요.";
    return;
  }
  if (!card) {
    wordMessage.classList.add("is-error");
    wordMessage.textContent = "더 이상 등록할 수 없습니다.";
    return;
  }

  card.querySelector(".word-text").textContent = word;
  card.querySelector(".word-meaning").textContent = meaning;
  card.querySelector(".word-example").textContent = exampleInput.value.trim();
  card.querySelector(".word-language").textContent = wordLanguage.value;

  if (!isEdit) {
    card.querySelector(".review-count").textContent = "0";
    card.hidden = false;
  }

  if (card === currentCard) showInFlashCard(card);

  resetWordForm();
  wordMessage.classList.remove("is-error");
  wordMessage.textContent = isEdit
    ? `'${word}' 단어를 수정했습니다.`
    : `'${word}' 단어를 등록했습니다.`;
}
function handleEditClick(event) {
  const button = event.target.closest(".edit-button");
  if (!button) return;

  if (editingCard) editingCard.classList.remove("is-editing");
  editingCard = button.closest(".word-card");
  editingCard.classList.add("is-editing");

  wordLanguage.value = editingCard.querySelector(".word-language").textContent;
  wordInput.value = editingCard.querySelector(".word-text").textContent;
  meaningInput.value = editingCard.querySelector(".word-meaning").textContent;
  exampleInput.value = editingCard.querySelector(".word-example").textContent;

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

  const card = button.closest(".word-card");
  const word = card.querySelector(".word-text").textContent;

  if (!confirm(`'${word}' 단어를 정말로 삭제하시겠습니까?`)) return;

  if (card === editingCard) resetWordForm();
  card.hidden = true;
}

flipButton.addEventListener("click", handleFlipClick);
knowButton.addEventListener("click", handleReviewClick);
unknownButton.addEventListener("click", handleReviewClick);
wordForm.addEventListener("submit", handleWordSubmit);
wordList.addEventListener("click", handleDeleteClick);

wordInput.addEventListener("input", handleWordInput);
meaningInput.addEventListener("input", handleWordInput);
wordList.addEventListener("click", handleEditClick);
editCancel.addEventListener("click", handleEditCancel);

unknownButton.click();
