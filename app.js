const STORAGE_KEY = "wordroom.words";

const sampleWords = [
  {
    id: crypto.randomUUID(),
    word: "resilient",
    meaning: "회복력이 있는",
    example: "The team stayed resilient after the first failed launch.",
    tag: "daily",
    learned: false,
  },
  {
    id: crypto.randomUUID(),
    word: "concise",
    meaning: "간결한",
    example: "Keep your answer concise and specific.",
    tag: "writing",
    learned: false,
  },
  {
    id: crypto.randomUUID(),
    word: "infer",
    meaning: "추론하다",
    example: "Readers can infer the speaker's attitude from the final line.",
    tag: "reading",
    learned: true,
  },
];

const state = {
  words: loadWords(),
  view: "list",
  query: "",
  cardIndex: 0,
  cardFlipped: false,
  quizIndex: 0,
  quizAnswered: false,
};

const els = {
  form: document.querySelector("#wordForm"),
  wordInput: document.querySelector("#wordInput"),
  meaningInput: document.querySelector("#meaningInput"),
  exampleInput: document.querySelector("#exampleInput"),
  tagInput: document.querySelector("#tagInput"),
  totalCount: document.querySelector("#totalCount"),
  learnedCount: document.querySelector("#learnedCount"),
  dueCount: document.querySelector("#dueCount"),
  progressFill: document.querySelector("#progressFill"),
  shownCount: document.querySelector("#shownCount"),
  focusWord: document.querySelector("#focusWord"),
  focusMeaning: document.querySelector("#focusMeaning"),
  seedBtn: document.querySelector("#seedBtn"),
  searchInput: document.querySelector("#searchInput"),
  wordList: document.querySelector("#wordList"),
  emptyState: document.querySelector("#emptyState"),
  railLinks: document.querySelectorAll(".rail-link"),
  tabs: document.querySelectorAll(".tab"),
  views: document.querySelectorAll(".view"),
  flashcard: document.querySelector("#flashcard"),
  cardLabel: document.querySelector("#cardLabel"),
  cardWord: document.querySelector("#cardWord"),
  cardHint: document.querySelector("#cardHint"),
  prevCardBtn: document.querySelector("#prevCardBtn"),
  nextCardBtn: document.querySelector("#nextCardBtn"),
  knowBtn: document.querySelector("#knowBtn"),
  quizProgress: document.querySelector("#quizProgress"),
  quizWord: document.querySelector("#quizWord"),
  quizOptions: document.querySelector("#quizOptions"),
  quizResult: document.querySelector("#quizResult"),
};

els.form.addEventListener("submit", (event) => {
  event.preventDefault();

  const word = els.wordInput.value.trim();
  const meaning = els.meaningInput.value.trim();

  if (!word || !meaning) return;

  state.words.unshift({
    id: crypto.randomUUID(),
    word,
    meaning,
    example: els.exampleInput.value.trim(),
    tag: els.tagInput.value.trim(),
    learned: false,
  });

  els.form.reset();
  state.cardIndex = 0;
  state.cardFlipped = false;
  state.quizIndex = 0;
  saveWords();
  render();
});

els.seedBtn.addEventListener("click", () => {
  const existing = new Set(state.words.map((item) => item.word.toLowerCase()));
  const nextWords = sampleWords.filter((item) => !existing.has(item.word.toLowerCase()));
  state.words = [...nextWords, ...state.words];
  saveWords();
  render();
});

els.searchInput.addEventListener("input", (event) => {
  state.query = event.target.value.trim().toLowerCase();
  renderList();
});

els.tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    state.view = tab.dataset.view;
    state.cardFlipped = false;
    state.quizAnswered = false;
    render();
  });
});

els.railLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    state.view = link.dataset.view;
    state.cardFlipped = false;
    state.quizAnswered = false;
    render();
  });
});

els.flashcard.addEventListener("click", () => {
  if (!state.words.length) return;
  state.cardFlipped = !state.cardFlipped;
  renderCard();
});

els.prevCardBtn.addEventListener("click", () => {
  moveCard(-1);
});

els.nextCardBtn.addEventListener("click", () => {
  moveCard(1);
});

els.knowBtn.addEventListener("click", () => {
  const word = currentCard();
  if (!word) return;
  word.learned = true;
  saveWords();
  moveCard(1);
});

function loadWords() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveWords() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.words));
}

function render() {
  renderStats();
  renderTabs();
  renderList();
  renderCard();
  renderQuiz();
}

function renderStats() {
  const learned = state.words.filter((item) => item.learned).length;
  els.totalCount.textContent = state.words.length;
  els.learnedCount.textContent = learned;
  els.dueCount.textContent = state.words.filter((item) => !item.learned).length;
  els.progressFill.style.width = state.words.length ? `${Math.round((learned / state.words.length) * 100)}%` : "0%";

  const focus = currentCard();
  els.focusWord.textContent = focus ? focus.word : "No word yet";
  els.focusMeaning.textContent = focus ? focus.meaning : "단어를 추가하면 오늘의 카드가 표시됩니다.";
}

function renderTabs() {
  els.tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.view === state.view);
  });
  els.railLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.view === state.view);
  });
  els.views.forEach((view) => {
    view.classList.toggle("active", view.id === `${state.view}View`);
  });
}

function renderList() {
  const words = filteredWords();
  els.wordList.innerHTML = "";
  els.shownCount.textContent = words.length;
  els.emptyState.classList.toggle("visible", words.length === 0);
  els.emptyState.textContent = state.words.length
    ? "검색 결과가 없습니다."
    : "아직 단어가 없습니다. 왼쪽에서 첫 단어를 추가해보세요.";

  words.forEach((item) => {
    const row = document.createElement("article");
    row.className = `word-item${item.learned ? " learned" : ""}`;
    row.innerHTML = `
      <div class="word-main">
        <strong>${escapeHtml(item.word)}</strong>
        <p>${escapeHtml(item.meaning)}</p>
        <div class="word-meta">
          ${item.tag ? `<span class="tag">${escapeHtml(item.tag)}</span>` : ""}
          ${item.example ? `<span>${escapeHtml(item.example)}</span>` : ""}
        </div>
      </div>
      <div class="word-actions">
        <button class="icon-btn done" type="button" aria-label="암기 상태 바꾸기">${item.learned ? "✓" : "○"}</button>
        <button class="icon-btn delete" type="button" aria-label="삭제">×</button>
      </div>
    `;

    row.querySelector(".done").addEventListener("click", () => {
      item.learned = !item.learned;
      saveWords();
      render();
    });

    row.querySelector(".delete").addEventListener("click", () => {
      state.words = state.words.filter((word) => word.id !== item.id);
      state.cardIndex = Math.min(state.cardIndex, Math.max(state.words.length - 1, 0));
      state.quizIndex = 0;
      saveWords();
      render();
    });

    els.wordList.append(row);
  });
}

function renderCard() {
  const item = currentCard();

  if (!item) {
    els.cardLabel.textContent = "empty";
    els.cardWord.textContent = "단어 없음";
    els.cardHint.textContent = "단어를 추가하면 카드가 시작됩니다.";
    return;
  }

  els.cardLabel.textContent = state.cardFlipped ? "meaning" : `card ${state.cardIndex + 1} / ${state.words.length}`;
  els.cardWord.textContent = state.cardFlipped ? item.meaning : item.word;
  els.cardHint.textContent = state.cardFlipped
    ? item.example || "예문이 없어요. 목록에서 예문을 추가해두면 더 오래 기억됩니다."
    : "눌러서 뜻 보기";
}

function renderQuiz() {
  els.quizOptions.innerHTML = "";

  if (state.words.length < 2) {
    els.quizProgress.textContent = `${state.words.length} / 2`;
    els.quizWord.textContent = "단어가 더 필요합니다";
    els.quizResult.textContent = "퀴즈는 최소 2개 단어부터 시작됩니다.";
    return;
  }

  const item = state.words[state.quizIndex % state.words.length];
  const options = buildOptions(item);
  els.quizProgress.textContent = `${state.quizIndex + 1} / ${state.words.length}`;
  els.quizWord.textContent = item.word;
  els.quizResult.textContent = state.quizAnswered ? els.quizResult.textContent : "";

  options.forEach((option) => {
    const button = document.createElement("button");
    button.className = "option-btn";
    button.type = "button";
    button.textContent = option.meaning;
    button.addEventListener("click", () => answerQuiz(button, option.id === item.id));
    els.quizOptions.append(button);
  });
}

function answerQuiz(button, isCorrect) {
  if (state.quizAnswered) return;

  state.quizAnswered = true;
  button.classList.add(isCorrect ? "correct" : "wrong");
  els.quizResult.textContent = isCorrect ? "정답입니다." : "아쉬워요. 다시 보면 금방 잡힙니다.";

  setTimeout(() => {
    state.quizIndex = (state.quizIndex + 1) % state.words.length;
    state.quizAnswered = false;
    renderQuiz();
  }, 850);
}

function buildOptions(answer) {
  const others = state.words.filter((item) => item.id !== answer.id);
  const shuffled = shuffle(others).slice(0, 3);
  return shuffle([answer, ...shuffled]);
}

function filteredWords() {
  if (!state.query) return state.words;

  return state.words.filter((item) => {
    const haystack = `${item.word} ${item.meaning} ${item.example} ${item.tag}`.toLowerCase();
    return haystack.includes(state.query);
  });
}

function currentCard() {
  return state.words[state.cardIndex] || null;
}

function moveCard(direction) {
  if (!state.words.length) return;
  state.cardIndex = (state.cardIndex + direction + state.words.length) % state.words.length;
  state.cardFlipped = false;
  render();
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return entities[char];
  });
}

render();
