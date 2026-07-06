const sites = [
  {
    title: "米哈游官网新闻检索",
    url: "https://news-eo.amarea.cn/",
    description: "一个用于检索米哈游旗下游戏官网新闻的小工具",
    category: "综合",
    tag: "文档"
  },
  {
    title: "影像档案馆",
    url: "https://hoyo-video.trrw.tech/",
    description: "mihoyo官方视频资源库",
    category: "综合",
    tag: "视频"
  },
  {
    title: "HOYO-MiX Online",
    url: "https://hoyomix.amarea.cn/",
    description: "一个 HOYO-MiX 音乐信息收集网站",
    category: "综合",
    tag: "音乐"
  },
    {
    title: "日月全事",
    url: "https://genshinlore.cn/main",
    description: "原神世界观手册",
    category: "原神",
    tag: "文档"
  },
   {
    title: "原神中英日辞典",
    url: "https://genshin-dictionary.com/zh-CN",
    description: "一个在线的中日英三语词典，收录了《原神》中使用的专有词汇。",
    category: "原神",
    tag: "工具"
  },
  {
    title: "崩坏三漫画",
    url: "https://bh3comic.xrysnow.xyz/pages/index.html",
    description: "崩坏三漫画增强版",
    category: "崩坏三",
    tag: "漫画"
  },
   {
    title: "homodgcat",
    url: "https://homodgcat.wiki/",
    description: "A Genshin Leakflow project",
    category: "原神",
    tag: "文档"
  },  

  {
    title: "光锥编辑器",
    url: "https://light.shenmedouyou.top/",
    description: "崩坏:星穹铁道光锥生成网站",
    category: "星穹铁道",
    tag: "工具"
  },
  {
    title: "短信生成器",
    url: "https://sr.shenmedouyou.top/",
    description: "崩坏:星穹铁道短信生成网站",
    category: "星穹铁道",
    tag: "工具"
  },
   {
    title: "绝区零聊天生成器",
    url: "https://zenless.tools/zh",
    description: "zenless.tools 是一个兴趣项目，包含多个免费的工具，适用于绝区零",
    category: "绝区零",
    tag: "工具"
  },
  {
    title: "米哈游导航站",
    url: "https://hoyo.tools/",
    description: "这是一个收录米哈游游戏相关项目的导航站",
    category: "综合",
    tag: "工具"
  },

  
     {
    title: "Hilipedia 丘丘百科",
    url: "https://speedyorc-c.github.io/Hilipedia/",
    description: "丘丘语语料库与词典 Hilichurlian Corpus and Dictionary",
    category: "原神",
    tag: "文本"
  },
  {
    title: "圣遗物副词条数便捷计算器",
    url: "http://spongem.com/ajglz/ys/ys.html",
    description: "圣遗物副词条数便捷计算器",
    category: "原神",
    tag: "工具"
  },
  {
    title: "智慧宫",
    url: "https://agent.zlb.ink/",
    description: "米游角色酒馆",
    category: "综合",
    tag: "工具"
  },
 
];

const accents = {
  "常用": "#c79a3a",
  "学习": "#5d80d6",
  "工具": "#4d9f96",
  "娱乐": "#c36b76",
  "开发": "#7563b8",
  "原神": "#b9852d",
  "崩坏三": "#c36b76",
  "星穹铁道": "#5d80d6",
  "绝区零": "#7563b8",
  "综合": "#4d9f96"
};

function navTranslate(text) {
  return typeof mihoyyTranslate === 'function' ? mihoyyTranslate(text) : text;
}

const allCategory = "全部";
let activeCategory = allCategory;
let query = "";

const landing = document.querySelector("#landing");
const mainSite = document.querySelector("#main-site");
const enterButton = document.querySelector("#enter-site");
const themeToggle = document.querySelector("#theme-toggle");
const cardGrid = document.querySelector("#card-grid");
const tabs = document.querySelector("#category-tabs");
const searchInput = document.querySelector("#site-search");
const resultTitle = document.querySelector("#result-title");
const resultCount = document.querySelector("#result-count");
const emptyState = document.querySelector("#empty-state");
const themeStorageKey = "teyvat-nav-theme";
let isEntering = false;

function applyTheme(theme) {
  const isDark = theme === "dark";
  document.body.classList.toggle("is-dark", isDark);

  if (themeToggle) {
    themeToggle.checked = isDark;
  }
}

function getStoredTheme() {
  try {
    return localStorage.getItem(themeStorageKey);
  } catch (error) {
    return null;
  }
}

function storeTheme(theme) {
  try {
    localStorage.setItem(themeStorageKey, theme);
  } catch (error) {
    return;
  }
}

function showMainSite() {
  if (isEntering) {
    return;
  }

  isEntering = true;
  mainSite.classList.remove("is-hidden");
  landing.classList.add("is-opening");
  window.scrollTo({ top: 0, behavior: "auto" });

  window.setTimeout(() => {
    landing.classList.add("is-hidden");
    searchInput.focus({ preventScroll: true });
  }, 1050);
}

function getCategories() {
  return [allCategory, ...new Set(sites.map((site) => site.category))];
}

function normalize(value) {
  return value.trim().toLowerCase();
}

function matchesSite(site) {
  const inCategory = activeCategory === allCategory || site.category === activeCategory;
  const text = `${site.title} ${site.description} ${site.category} ${site.tag}`.toLowerCase();
  return inCategory && text.includes(query);
}

function getInitials(title) {
  return title
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function renderTabs() {
  tabs.innerHTML = getCategories()
    .map((category) => {
      const active = category === activeCategory ? " is-active" : "";
      return `<button class="tab-button${active}" type="button" data-category="${category}">${category}</button>`;
    })
    .join("");
}

function renderCards() {
  const filteredSites = sites.filter(matchesSite);

  cardGrid.innerHTML = filteredSites
    .map((site, index) => {
      const accent = accents[site.category] || "#c79a3a";
      const direction = index % 2 === 0 ? "bottom_to_top" : "top_to_bottom";
      return `
        <article class="site-card ih-item square colored effect3 ${direction}" style="--accent: ${accent}">
          <a href="${site.url}" target="_blank" rel="noopener noreferrer" aria-label="${navTranslate('访问网站')} ${site.title}">
            <div class="img">
              <div class="card-face">
                <div class="card-top">
                  <span class="site-icon" aria-hidden="true">${getInitials(site.title)}</span>
                  <span class="tag">${site.tag}</span>
                </div>
                <h3>${site.title}</h3>
                <div class="category-name">${site.category}</div>
              </div>
            </div>
            <div class="info">
              <h3>${site.title}</h3>
              <p>${site.description}</p>
              <span class="visit-label">${navTranslate('访问网站')}</span>
            </div>
          </a>
        </article>
      `;
    })
    .join("");

  const title = activeCategory === allCategory ? navTranslate("全部导航") : activeCategory + " " + navTranslate("导航");
  resultTitle.textContent = query ? navTranslate("搜索：") + searchInput.value.trim() : title;
  resultCount.textContent = filteredSites.length + navTranslate("个入口");
  emptyState.hidden = filteredSites.length > 0;
}

function updateView() {
  renderTabs();
  renderCards();
}

tabs.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-category]");
  if (!button) {
    return;
  }

  activeCategory = button.dataset.category;
  updateView();
});

searchInput.addEventListener("input", (event) => {
  query = normalize(event.target.value);
  renderCards();
});

if (enterButton) {
  enterButton.addEventListener("click", showMainSite);
}

if (themeToggle) {
  themeToggle.addEventListener("change", (event) => {
    const theme = event.target.checked ? "dark" : "light";
    applyTheme(theme);
    storeTheme(theme);
  });
}

applyTheme(getStoredTheme());
updateView();
