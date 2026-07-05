const tools = [
  {
    title: "网页活动图片资源下载",
    url: "genshinEventSourceDL/",
    description: "理论上这个工具可以下载任意网站的图片资源，只要对方服务器允许跨域",
    category: "原神",
    icon: "T",
    accent: "#d5aa4c",
    tags: ["资源", "图片"]
  },
  {
    title: "原神祈愿记录导出工具",
    url: "https://github.com/lgou2w/HoYo.Gacha",
    description: "一个非官方的工具，用于管理和分析你的 miHoYo 抽卡记录。",
    category: "原神",
    icon: "R",
    accent: "#4d9f96",
    tags: ["工具"]
  }
];

const allCategory = "全部";
let activeCategory = allCategory;
let query = "";

const tabs = document.querySelector("#tool-tabs");
const searchInput = document.querySelector("#tool-search");
const grid = document.querySelector("#tools-grid");
const title = document.querySelector("#tools-title");
const count = document.querySelector("#tools-count");
const empty = document.querySelector("#tools-empty");

function getCategories() {
  return [allCategory, ...new Set(tools.map((tool) => tool.category))];
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function matchesQuery(tool) {
  const term = normalize(query);

  if (!term) {
    return true;
  }

  return [
    tool.title,
    tool.description,
    tool.category,
    tool.status,
    ...tool.tags
  ].some((value) => normalize(value).includes(term));
}

function getFilteredTools() {
  return tools.filter((tool) => {
    const matchesCategory = activeCategory === allCategory || tool.category === activeCategory;
    return matchesCategory && matchesQuery(tool);
  });
}

function createTab(category) {
  const button = document.createElement("button");
  button.className = "tools-tab";
  button.type = "button";
  button.dataset.category = category;
  button.textContent = category;
  button.classList.toggle("is-active", category === activeCategory);
  button.addEventListener("click", () => {
    activeCategory = category;
    render();
  });
  return button;
}

function createToolCard(tool) {
  const article = document.createElement("article");
  article.className = "tool-card";
  article.style.setProperty("--accent", tool.accent);

  const top = document.createElement("div");
  top.className = "tool-card__top";

  const icon = document.createElement("span");
  icon.className = "tool-icon";
  icon.textContent = tool.icon;

  const status = document.createElement("span");
  status.className = "tool-status";
  status.textContent = tool.status;

  top.append(icon, status);

  const body = document.createElement("div");

  const heading = document.createElement("h3");
  heading.textContent = tool.title;

  const description = document.createElement("p");
  description.textContent = tool.description;

  body.append(heading, description);

  const meta = document.createElement("div");
  meta.className = "tool-card__meta";
  tool.tags.forEach((tag) => {
    const chip = document.createElement("span");
    chip.className = "tool-chip";
    chip.textContent = tag;
    meta.appendChild(chip);
  });

  const actions = document.createElement("div");
  actions.className = "tool-card__actions";

  const category = document.createElement("span");
  category.className = "tool-category";
  category.textContent = tool.category;

  const link = document.createElement("a");
  link.className = "tool-link";
  link.href = tool.url;
  link.textContent = "打开工具";

  actions.append(category, link);
  article.append(top, body, meta, actions);
  return article;
}

function renderTabs() {
  tabs.innerHTML = "";
  getCategories().forEach((category) => {
    tabs.appendChild(createTab(category));
  });
}

function renderCards(filteredTools) {
  grid.innerHTML = "";
  filteredTools.forEach((tool) => {
    grid.appendChild(createToolCard(tool));
  });
}

function renderSummary(filteredTools) {
  title.textContent = activeCategory === allCategory ? "全部工具" : `${activeCategory}工具`;
  count.textContent = `${filteredTools.length} 个入口`;
  empty.hidden = filteredTools.length > 0;
}

function render() {
  const filteredTools = getFilteredTools();
  renderTabs();
  renderCards(filteredTools);
  renderSummary(filteredTools);
}

searchInput.addEventListener("input", (event) => {
  query = event.target.value;
  render();
});

render();
