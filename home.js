(function () {
  "use strict";

  const { $, el, announce, setStatus, initToggleGroup } = UI;

  const LANGUAGES = [
    { name: "영어", code: "en" },
    { name: "일본어", code: "ja" },
    { name: "중국어", code: "zh" },
    { name: "스페인어", code: "es" },
    { name: "프랑스어", code: "fr" },
    { name: "독일어", code: "de" },
  ];

  const FILTER_LABELS = {
    all: "전체",
    known: "알고 있는 단어",
    unknown: "모르는 단어",
  };

  const SAMPLE_WORDS = [
    {
      language: "영어",
      word: "resilient",
      meaning: "회복력 있는",
      example: "She is a resilient person.",
    },
    {
      language: "영어",
      word: "ubiquitous",
      meaning: "어디에나 있는",
      example: "Smartphones are ubiquitous.",
    },
    {
      language: "일본어",
      word: "勉強",
      meaning: "공부",
      example: "毎日日本語を勉強します。",
    },
    {
      language: "중국어",
      word: "学习",
      meaning: "학습하다",
      example: "我每天学习汉语。",
    },
    {
      language: "스페인어",
      word: "aprender",
      meaning: "배우다",
      example: "Quiero aprender español.",
    },
    {
      language: "프랑스어",
      word: "bonjour",
      meaning: "안녕하세요",
      example: "",
    },
  ];

  const flashCard = $("#flashCard");
  const cardFront = $("#cardFront");
  const cardBack = $("#cardBack");
  const flipButton = $("#flipButton");
  const knowButton = $("#knowButton");
  const unknownButton = $("#unknownButton");
  const reviewActions = $("#reviewActions");
  const reviewProgress = $(".review-progress");
  const reviewEmpty = $("#reviewEmpty");
  const loadSamplesButton = $("#loadSamples");

  const wordForm = $("#word-form");
  const wordLanguage = $("#wordLanguage");
  const wordInput = $("#wordInput");
  const meaningInput = $("#meaningInput");
  const exampleInput = $("#exampleInput");
  const wordMessage = $("#wordMessage");
  const wordSubmit = $("#wordSubmit");
  const editCancel = $("#editCancel");

  const wordList = $("#wordList");
  const wordCount = $("#wordCount");
  const wordbookTitle = $("#wordbook-title");
  const wordFilters = $(".word-filters");
  const languageFilter = $("#languageFilter");

  const words = [];
  let nextId = 1;
  let editingId = null;
  let currentIndex = -1;
  let currentWord = null;
  let currentFilter = "all"; // all | known | unknown
  let currentLanguage = "all"; // all | LANGUAGES[].name

  function langCode(name) {
    const found = LANGUAGES.find(function (item) {
      return item.name === name;
    });
    return found ? found.code : "";
  }

  function setLang(element, language) {
    const code = langCode(language);
    if (code) element.lang = code;
    else element.removeAttribute("lang");
  }

  function fillLanguageSelect(select, withAll) {
    if (withAll) {
      const all = el("option", null, "모든 언어");
      all.value = "all";
      select.append(all);
    }
    LANGUAGES.forEach(function (item) {
      const option = el("option", null, item.name);
      option.value = item.name;
      select.append(option);
    });
  }

  function addSampleWords() {
    SAMPLE_WORDS.forEach(function (sample) {
      words.push({
        id: nextId++,
        language: sample.language,
        word: sample.word,
        meaning: sample.meaning,
        example: sample.example,
        reviewCount: 0,
        known: false,
      });
    });
  }

  function getFilteredWords() {
    return words.filter(function (item) {
      const statusOk =
        currentFilter === "all" ||
        (currentFilter === "known" ? item.known : !item.known);
      const languageOk =
        currentLanguage === "all" || item.language === currentLanguage;
      return statusOk && languageOk;
    });
  }

  function countLabel(count) {
    const prefix = currentLanguage === "all" ? "" : currentLanguage + " · ";
    return prefix + FILTER_LABELS[currentFilter] + " " + count + "개";
  }

  function updateProgress() {
    const empty = words.length === 0;
    flashCard.hidden = empty;
    reviewActions.hidden = empty;
    reviewProgress.hidden = empty;
    reviewEmpty.hidden = !empty;
    reviewProgress.textContent = empty
      ? ""
      : currentIndex + 1 + " / " + words.length;
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
          ? "뜻: " + currentWord.meaning + ". 예문: " + currentWord.example
          : "뜻: " + currentWord.meaning + ".",
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

  function showCurrent(shouldAnnounce, prefix) {
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
        (prefix || "") +
          (currentIndex + 1) +
          " / " +
          words.length +
          ". " +
          currentWord.language +
          " 단어: " +
          currentWord.word,
      );
    }
  }

  function handleFlipClick() {
    setFlipped(!flashCard.classList.contains("is-flipped"));
  }

  function handleReviewClick(event) {
    if (words.length === 0) {
      showCurrent(false);
      return;
    }
    let prefix = "";
    if (currentWord) {
      const known = event.currentTarget === knowButton;
      currentWord.known = known;
      if (known) currentWord.reviewCount++;
      prefix = known
        ? "알고 있어요로 기록했습니다. "
        : "모르겠어요로 기록했습니다. ";
      renderWordList();
    }
    currentIndex = (currentIndex + 1) % words.length;
    showCurrent(true, prefix);
  }

  function handleLoadSamples() {
    const wasEmpty = words.length === 0;
    addSampleWords();
    if (wasEmpty) {
      currentIndex = 0;
      showCurrent(false);
    } else {
      updateProgress();
    }
    renderWordList();
    announce("예시 단어 " + SAMPLE_WORDS.length + "개를 불러왔습니다.");
    flipButton.focus(); // 눌렀던 버튼이 사라지므로 포커스 이동
  }

  function createWordCard(item) {
    const li = el("li", "card card--interactive word-card");
    li.dataset.id = item.id;
    if (item.id === editingId) {
      li.classList.add("is-editing");
      li.setAttribute("aria-current", "true");
    }

    const wordText = el("h3", "word-text", item.word);
    setLang(wordText, item.language);
    const example = el("p", "word-example", item.example);
    setLang(example, item.language);

    const meta = el("p", "word-meta");
    meta.append(
      el("span", "chip chip--tag", item.language),
      " 복습 ",
      el("span", "review-count", item.reviewCount),
      "회",
    );

    const actions = el("div", "card-actions");
    const editButton = el(
      "button",
      "btn btn--outline btn--sm edit-button",
      "수정",
    );
    editButton.type = "button";
    editButton.setAttribute("aria-label", item.word + " 수정");
    const deleteButton = el(
      "button",
      "btn btn--danger btn--sm delete-button",
      "삭제",
    );
    deleteButton.type = "button";
    deleteButton.setAttribute("aria-label", item.word + " 삭제");
    actions.append(editButton, deleteButton);

    li.append(
      wordText,
      el("p", "word-meaning", item.meaning),
      example,
      meta,
      actions,
    );
    return li;
  }

  function renderWordList() {
    const filtered = getFilteredWords();
    wordCount.textContent = countLabel(filtered.length);

    if (filtered.length === 0) {
      const emptyText =
        words.length === 0
          ? "등록된 단어가 없습니다. 위의 '새로운 단어 등록'에서 단어를 추가해 보세요."
          : "조건에 맞는 단어가 없습니다. 필터를 바꿔 보세요.";
      wordList.replaceChildren(el("li", "word-list-empty", emptyText));
      return;
    }
    wordList.replaceChildren(...filtered.map(createWordCard));
  }

  function focusEditButton(id) {
    const button = wordList.querySelector(
      '.word-card[data-id="' + id + '"] .edit-button',
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
      setStatus(wordMessage, "단어와 뜻을 모두 입력해주세요.", "error");
      return;
    }

    const fields = {
      language: wordLanguage.value,
      word: word,
      meaning: meaning,
      example: exampleInput.value.trim(),
    };
    const isEdit = editingId !== null;
    const editedId = editingId;

    if (isEdit) {
      const target = words.find(function (w) {
        return w.id === editingId;
      });
      Object.assign(target, fields);
      if (target === currentWord) showInFlashCard(target);
    } else {
      words.push(
        Object.assign({ id: nextId++, reviewCount: 0, known: false }, fields),
      );
      if (words.length === 1) {
        currentIndex = 0;
        showCurrent(false);
      } else {
        updateProgress();
      }
    }

    resetWordForm();
    renderWordList();
    setStatus(
      wordMessage,
      "'" + word + "' 단어를 " + (isEdit ? "수정" : "등록") + "했습니다.",
      "success",
    );

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
    const target = words.find(function (w) {
      return w.id === id;
    });
    editingId = id;
    renderWordList();

    wordLanguage.value = target.language;
    wordInput.value = target.word;
    meaningInput.value = target.meaning;
    exampleInput.value = target.example;

    handleWordInput();
    wordSubmit.textContent = "단어 수정";
    editCancel.hidden = false;
    setStatus(wordMessage, "", null);

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    $("#add-word").scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
    });
    wordInput.focus();
  }

  function handleEditCancel() {
    const id = editingId;
    resetWordForm();
    setStatus(wordMessage, "", null);
    if (id !== null && !focusEditButton(id)) wordbookTitle.focus();
  }

  function handleDeleteClick(event) {
    const button = event.target.closest(".delete-button");
    if (!button) return;

    const id = Number(button.closest(".word-card").dataset.id);
    const index = words.findIndex(function (w) {
      return w.id === id;
    });
    const removedWord = words[index].word;
    if (!confirm("'" + removedWord + "' 단어를 정말로 삭제하시겠습니까?"))
      return;

    const visibleIndex = getFilteredWords().findIndex(function (w) {
      return w.id === id;
    });
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
    const next =
      deleteButtons[Math.min(visibleIndex, deleteButtons.length - 1)];
    (next || wordbookTitle).focus();
    announce(
      "'" + removedWord + "' 단어를 삭제했습니다. " + wordCount.textContent,
    );
  }

  fillLanguageSelect(wordLanguage, false);
  fillLanguageSelect(languageFilter, true);

  flipButton.addEventListener("click", handleFlipClick);
  flashCard.addEventListener("click", handleFlipClick);
  knowButton.addEventListener("click", handleReviewClick);
  unknownButton.addEventListener("click", handleReviewClick);
  loadSamplesButton.addEventListener("click", handleLoadSamples);

  wordForm.addEventListener("submit", handleWordSubmit);
  wordInput.addEventListener("input", handleWordInput);
  meaningInput.addEventListener("input", handleWordInput);
  editCancel.addEventListener("click", handleEditCancel);
  wordList.addEventListener("click", handleEditClick);
  wordList.addEventListener("click", handleDeleteClick);

  initToggleGroup(wordFilters, function (button) {
    currentFilter = button.dataset.filter;
    renderWordList();
    announce(wordCount.textContent);
  });
  languageFilter.addEventListener("change", function () {
    currentLanguage = languageFilter.value;
    renderWordList();
    announce(wordCount.textContent);
  });

  addSampleWords();
  currentIndex = 0;
  showCurrent(false);
  renderWordList();
  handleWordInput();
})();
