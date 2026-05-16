const state = {
  cards: [],
  rawIndexCount: 0,
  selectedId: null,
  query: "",
  flipped: false,
  dailySize: 20,
  alpha: "all",
};

if (window.location.protocol === "file:") {
  window.location.replace("http://localhost:4174/app/");
}

const els = {
  totalCount: document.querySelector("#totalCount"),
  indexCount: document.querySelector("#indexCount"),
  dailyLabel: document.querySelector("#dailyLabel"),
  visibleCount: document.querySelector("#visibleCount"),
  searchInput: document.querySelector("#searchInput"),
  randomBtn: document.querySelector("#randomBtn"),
  knownBtn: document.querySelector("#knownBtn"),
  flashcardBtn: document.querySelector("#flashcardBtn"),
  dailyButtons: document.querySelectorAll("[data-daily-size]"),
  alphaButtons: document.querySelectorAll("[data-alpha]"),
  wordList: document.querySelector("#wordList"),
  cardView: document.querySelector("#cardView"),
  sideView: document.querySelector("#sideView"),
};

const fallbackAntonyms = {
  abate: ["intensify", "increase"],
  abdicate: ["claim", "retain"],
  aberration: ["norm", "standard"],
  abhor: ["admire", "cherish"],
  abject: ["dignified", "proud"],
  abstain: ["indulge", "participate"],
  abstruse: ["clear", "obvious"],
  accede: ["refuse", "reject"],
  acclaim: ["criticism", "disapproval"],
  acrimony: ["harmony", "goodwill"],
  acumen: ["obtuseness", "naivete"],
  adamant: ["flexible", "yielding"],
  admonish: ["praise", "approve"],
  adverse: ["favorable", "beneficial"],
  advocate: ["oppose", "criticize"],
  affable: ["aloof", "hostile"],
  affinity: ["aversion", "distance"],
  affluent: ["poor", "impoverished"],
  alleviate: ["aggravate", "worsen"],
  ambiguous: ["clear", "explicit"],
  amenable: ["resistant", "unwilling"],
  anomaly: ["regularity", "standard"],
  appease: ["provoke", "inflame"],
  arbitrary: ["reasoned", "consistent"],
  arduous: ["easy", "effortless"],
  articulate: ["inarticulate", "unclear"],
  ascertain: ["guess", "overlook"],
  assiduous: ["lazy", "negligent"],
  austere: ["ornate", "indulgent"],
  benevolent: ["cruel", "malevolent"],
};

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.status}`);
  }
  return response.json();
}

async function init() {
  try {
    const [cards, rawIndex] = await Promise.all([
      loadJson("../sources/normalized/sample_cards.json"),
      loadJson("../sources/normalized/raw_word_index.json"),
    ]);
    state.cards = cards.map(normalizeCard);
    state.rawIndexCount = rawIndex.length;
    state.selectedId = state.cards[0]?.id || null;
    render();
  } catch (error) {
    els.cardView.innerHTML = `<p class="empty-state">${escapeHtml(error.message)}</p>`;
  }
}

function normalizeCard(card) {
  const examples = card.examples || [card.example].filter(Boolean);
  const secondExample = makeSecondExample(card.word);
  return {
    ...card,
    examples: secondExample ? [...examples, secondExample].slice(0, 2) : examples.slice(0, 2),
    antonyms: card.antonyms || fallbackAntonyms[card.word] || [],
  };
}

function filteredCards() {
  const query = state.query.trim().toLowerCase();
  const alphaFiltered = state.cards.filter((card) => {
    return state.alpha === "all" || card.word.toLowerCase().startsWith(state.alpha);
  });
  const queryFiltered = !query
    ? alphaFiltered
    : alphaFiltered.filter((card) => {
        const haystack = [
          card.word,
          card.pronunciation,
          card.pos,
          card.core_meaning_ko,
          ...card.examples.map((example) => `${example.en} ${example.ko}`),
          card.memory_hook_ko,
          card.visual_prompt_ko,
          ...(card.synonyms || []),
          ...(card.antonyms || []),
          ...(card.roots || []).map((root) => `${root.part} ${root.meaning}`),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(query);
      });

  return query ? queryFiltered : queryFiltered.slice(0, state.dailySize);
}

function selectedCard() {
  const filtered = filteredCards();
  return (
    filtered.find((card) => card.id === state.selectedId) ||
    filtered[0] ||
    state.cards.find((card) => card.id === state.selectedId) ||
    state.cards[0] ||
    null
  );
}

function render() {
  const cards = filteredCards();
  const selected = selectedCard();
  els.totalCount.textContent = state.cards.length;
  els.indexCount.textContent = state.rawIndexCount.toLocaleString();
  els.dailyLabel.textContent = `Daily ${state.dailySize}`;
  els.visibleCount.textContent = `${cards.length} shown`;
  els.dailyButtons.forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.dailySize) === state.dailySize);
  });
  els.alphaButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.alpha === state.alpha);
  });
  renderList(cards);
  renderFocusCard(selected);
  renderSideView(selected);
}

function renderList(cards) {
  els.wordList.innerHTML = "";

  if (!cards.length) {
    els.wordList.innerHTML = `<p class="empty-state">검색 결과가 없습니다.</p>`;
    return;
  }

  cards.forEach((card) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `word-row${card.id === state.selectedId ? " active" : ""}`;
    button.innerHTML = `
      <strong>${escapeHtml(card.word)}</strong>
      <span>${escapeHtml(card.core_meaning_ko)}</span>
    `;
    button.addEventListener("click", () => {
      state.selectedId = card.id;
      state.flipped = false;
      render();
    });
    els.wordList.append(button);
  });
}

function renderFocusCard(card) {
  if (!card) {
    els.cardView.innerHTML = `<p class="empty-state">카드 데이터가 없습니다.</p>`;
    return;
  }

  const visibleCards = filteredCards();
  const ordinal = Math.max(visibleCards.findIndex((item) => item.id === card.id) + 1, 1);
  const roots = card.roots.map(renderRoot).join("");

  if (state.flipped) {
    els.cardView.innerHTML = `
      <div class="flashcard-back">
        <span class="deck-code">meaning side</span>
        <div>
          <strong>${escapeHtml(card.core_meaning_ko)}</strong>
          ${card.examples
            .slice(0, 2)
            .map(
              (example) => `
                <p>${escapeHtml(example.en)}</p>
                <p>${escapeHtml(example.ko)}</p>
              `,
            )
            .join("")}
        </div>
      </div>
    `;
    return;
  }

  els.cardView.innerHTML = `
    <div class="card-topline">
      <span class="pill">card ${ordinal}/${visibleCards.length || state.dailySize}</span>
      <span class="pill">${escapeHtml(card.pos)} · ${escapeHtml(card.content_status)}</span>
    </div>
    <div class="word-stage">
      <h3>${renderHighlightedWord(card)}</h3>
      <p class="pronunciation">${escapeHtml(card.pronunciation)}</p>
      <p class="meaning-chip">${escapeHtml(card.core_meaning_ko)}</p>
    </div>
    <div class="root-strip">
      <span class="micro-label">root</span>
      <div class="chip-row">${roots}</div>
    </div>
    <div class="image-placeholder">
      <span>visual cue</span>
      <strong>${escapeHtml(card.visual_prompt_ko)}</strong>
    </div>
  `;
}

function renderSideView(card) {
  if (!card) {
    els.sideView.innerHTML = "";
    return;
  }

  els.sideView.innerHTML = `
    <section class="insight-block">
      <h3>Living examples</h3>
      <div class="example-stack">${card.examples.slice(0, 2).map(renderExample).join("")}</div>
    </section>
    <section class="insight-block">
      <h3>Root map</h3>
      <div class="chip-row">${card.roots.map(renderRoot).join("")}</div>
    </section>
    <section class="insight-block">
      <h3>Synonyms</h3>
      <div class="chip-row">${card.synonyms.map((word) => renderChip(word)).join("")}</div>
    </section>
    <section class="insight-block">
      <h3>Antonyms</h3>
      <div class="chip-row">${card.antonyms.map((word) => renderChip(word, "antonym")).join("")}</div>
    </section>
    <section class="insight-block">
      <h3>Memory hook</h3>
      <p>${escapeHtml(card.memory_hook_ko)}</p>
    </section>
  `;
}

function renderExample(example, index) {
  return `
    <div class="example-line">
      <span>${index + 1}</span>
      <p>${escapeHtml(example.en)}<br /><small>${escapeHtml(example.ko)}</small></p>
    </div>
  `;
}

function renderRoot(root) {
  return `<span class="word-chip root-row"><mark>${escapeHtml(root.part)}</mark>${escapeHtml(root.meaning)}</span>`;
}

function renderChip(word, type = "") {
  return `<span class="word-chip ${type}">${escapeHtml(word)}</span>`;
}

function renderHighlightedWord(card) {
  const word = card.word;
  const needles = card.roots
    .flatMap((root) => root.part.split("/"))
    .map((part) => part.replace(/[^a-zA-Z]/g, "").toLowerCase())
    .filter((part) => part.length > 1)
    .sort((a, b) => b.length - a.length);
  const match = needles.find((part) => word.toLowerCase().startsWith(part));
  if (!match) return escapeHtml(word);
  return `<span class="root-hit">${escapeHtml(word.slice(0, match.length))}</span>${escapeHtml(word.slice(match.length))}`;
}

function pickRandomCard() {
  const cards = filteredCards();
  if (!cards.length) return;
  const next = cards[Math.floor(Math.random() * cards.length)];
  state.selectedId = next.id;
  state.flipped = false;
  render();
}

function makeSecondExample(word) {
  const examples = {
    abate: {
      en: "Interest in the issue did not abate after the hearing.",
      ko: "그 사안에 대한 관심은 청문회 이후에도 줄어들지 않았다.",
    },
    abdicate: {
      en: "A manager cannot abdicate every difficult decision.",
      ko: "관리자가 모든 어려운 결정을 회피할 수는 없다.",
    },
    ambiguous: {
      en: "The word was ambiguous without the surrounding sentence.",
      ko: "그 단어는 주변 문장이 없으면 애매했다.",
    },
    advocate: {
      en: "Many parents advocate more reading time at school.",
      ko: "많은 학부모는 학교에서 더 많은 독서 시간을 지지한다.",
    },
    benevolent: {
      en: "The policy looked strict, but its purpose was benevolent.",
      ko: "그 정책은 엄격해 보였지만 목적은 선의에 가까웠다.",
    },
  };
  return examples[word] || null;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => {
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

els.searchInput.addEventListener("input", (event) => {
  state.query = event.target.value;
  state.flipped = false;
  render();
});

els.randomBtn.addEventListener("click", pickRandomCard);
els.knownBtn.addEventListener("click", pickRandomCard);

els.flashcardBtn.addEventListener("click", () => {
  if (!selectedCard()) return;
  state.flipped = !state.flipped;
  renderFocusCard(selectedCard());
});

els.dailyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.dailySize = Number(button.dataset.dailySize);
    state.selectedId = null;
    state.flipped = false;
    render();
  });
});

els.alphaButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.alpha = button.dataset.alpha;
    state.selectedId = null;
    state.flipped = false;
    render();
  });
});

init();
