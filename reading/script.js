(function() {
    var texts = [];
    var markdownCache = {};
    var storageKey = 'mihoyy-reading-state';
    var allCategory = '全部';
    var favoriteCategory = '收藏';
    var defaultCategory = '书籍';
    var activeCategory = defaultCategory;
    var query = '';
    var currentTextId = '';
    var state = loadState();
    var listRenderTimer = 0;

    var tabs = document.querySelector('#text-tabs');
    var search = document.querySelector('#text-search');
    var list = document.querySelector('#text-list');
    var libraryTitle = document.querySelector('#library-title');
    var libraryCount = document.querySelector('#library-count');
    var empty = document.querySelector('#reading-empty');
    var readerPanel = document.querySelector('.reader-panel');
    var readerTitle = document.querySelector('#reader-title');
    var readerMeta = document.querySelector('#reader-meta');
    var readerSummary = document.querySelector('#reader-summary');
    var readerBody = document.querySelector('#reader-body');
    var bookmarkButton = document.querySelector('#bookmark-button');
    var sizeInput = document.querySelector('#reader-size');
    var widthInput = document.querySelector('#reader-width');
    var lineHeightInput = document.querySelector('#reader-line-height');
    var themeSwitcher = document.querySelector('#theme-switcher');
    var progressBar = document.querySelector('#progress-bar');
    var progressLabel = document.querySelector('#progress-label');

    function loadState() {
        try {
            return JSON.parse(localStorage.getItem(storageKey)) || {};
        } catch (error) {
            return {};
        }
    }

    function saveState() {
        try {
            localStorage.setItem(storageKey, JSON.stringify(state));
        } catch (error) {
            return;
        }
    }

    function getSetting(name, fallback) {
        state.settings = state.settings || {};
        return state.settings[name] || fallback;
    }

    function setSetting(name, value) {
        state.settings = state.settings || {};
        state.settings[name] = value;
        saveState();
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function encodePath(urlPath) {
        return urlPath.split('/').map(encodeURIComponent).join('/');
    }

    function currentText() {
        return texts.find(function(text) {
            return text.id === currentTextId;
        }) || texts[0];
    }

    function categories() {
        var preferred = ['书籍', '角色故事', '武器', '圣遗物'];
        var available = Array.from(new Set(texts.map(function(text) {
            return text.category;
        })));
        var ordered = preferred.filter(function(category) {
            return available.indexOf(category) !== -1;
        }).concat(available.filter(function(category) {
            return preferred.indexOf(category) === -1;
        }));
        return [allCategory].concat(ordered).concat([favoriteCategory]);
    }

    function isFavorite(id) {
        return !!(state.favorites && state.favorites[id]);
    }

    function normalize(value) {
        return value.trim().toLowerCase();
    }

    function searchableText(text) {
        return [
            text.title,
            text.sourceTitle,
            text.category,
            text.region,
            text.path
        ].join(' ').toLowerCase();
    }

    function matches(text) {
        var inCategory = activeCategory === allCategory ||
            text.category === activeCategory ||
            (activeCategory === favoriteCategory && isFavorite(text.id));
        return inCategory && searchableText(text).indexOf(query) !== -1;
    }

    function progressFor(id) {
        var value = state.progress && state.progress[id];
        return Math.max(0, Math.min(100, Math.round(value || 0)));
    }

    function textAccent(text) {
        var accents = {
            '书籍': '#d5aa4c',
            '角色故事': '#6ca5ff',
            '武器': '#4d9f96',
            '圣遗物': '#c36b76'
        };
        return accents[text.category] || '#d5aa4c';
    }

    function renderTabs() {
        tabs.innerHTML = categories().map(function(category) {
            var active = category === activeCategory ? ' is-active' : '';
            return '<button class="tab-button' + active + '" type="button" data-category="' + escapeHtml(category) + '">' + escapeHtml(category) + '</button>';
        }).join('');
    }

    function renderList() {
        var filtered = texts.filter(matches);
        list.innerHTML = filtered.map(function(text) {
            var active = text.id === currentTextId ? ' is-active' : '';
            var favorite = isFavorite(text.id) ? ' · 已收藏' : '';
            var region = text.region ? text.region + ' · ' : '';
            return [
                '<button class="text-card' + active + '" type="button" data-text-id="' + escapeHtml(text.id) + '" style="--accent:' + textAccent(text) + '">',
                '  <h3>' + escapeHtml(text.title) + '</h3>',
                '  <p>' + escapeHtml(region + text.category + ' / ' + text.sourceTitle) + '</p>',
                '  <span class="text-card__meta">',
                '    <span>' + escapeHtml(text.category) + '</span>',
                text.region ? '    <span>' + escapeHtml(text.region) + '</span>' : '',
                '    <span>' + progressFor(text.id) + '%</span>',
                favorite ? '    <span>已收藏</span>' : '',
                '  </span>',
                '</button>'
            ].join('');
        }).join('');

        libraryTitle.textContent = activeCategory === allCategory ? '全部文本' : activeCategory + '文本';
        libraryCount.textContent = filtered.length + ' / ' + texts.length + ' 篇';
        empty.hidden = filtered.length > 0;
    }

    function applyInlineMarkdown(html, item) {
        html = html.replace(/\*\*([\s\S]+?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
        html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, function(match, alt, src) {
            return '<img src="' + escapeHtml(resolveAssetPath(src, item)) + '" alt="' + escapeHtml(alt) + '">';
        });
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
        return html;
    }

    function inlineMarkdown(value, item) {
        return applyInlineMarkdown(escapeHtml(value), item);
    }

    function resolveAssetPath(src, item) {
        if (/^https?:\/\//.test(src) || src.charAt(0) === '/') {
            return src;
        }

        var base = item.path.split('/').slice(0, -1).join('/');
        return encodePath(base + '/' + src);
    }

    function parseMarkdown(markdown) {
        var lines = markdown.replace(/\r\n/g, '\n').split('\n');
        var title = '';
        var bodyLines = [];

        lines.forEach(function(line, index) {
            if (/^#\s+/.test(line) && !title) {
                title = line.replace(/^#\s+/, '').trim();
                return;
            }

            if (!title && !line.trim() && index === 0) {
                return;
            }

            bodyLines.push(line);
        });

        return {
            title: title,
            lines: bodyLines
        };
    }

    function renderMarkdownLines(lines, item) {
        var html = [];
        var paragraph = [];

        function flushParagraph() {
            if (!paragraph.length) {
                return;
            }

            var content = paragraph.map(function(segment, index) {
                var line = escapeHtml(segment.text);
                var next = paragraph[index + 1];
                var separator = next ? (segment.hardBreak ? '<br>' : ' ') : '';
                return line + separator;
            }).join('');

            html.push('<p>' + applyInlineMarkdown(content, item) + '</p>');
            paragraph = [];
        }

        lines.forEach(function(line) {
            var hardBreak = /\s{2,}$/.test(line);
            var trimmed = line.trim();

            if (!trimmed) {
                flushParagraph();
                return;
            }

            if (/^##\s+/.test(trimmed)) {
                flushParagraph();
                html.push('<h3>' + inlineMarkdown(trimmed.replace(/^##\s+/, ''), item) + '</h3>');
                return;
            }

            if (/^#{3,6}\s+/.test(trimmed)) {
                flushParagraph();
                html.push('<h4>' + inlineMarkdown(trimmed.replace(/^#{3,6}\s+/, ''), item) + '</h4>');
                return;
            }

            if (/^>\s?/.test(trimmed)) {
                flushParagraph();
                html.push('<blockquote>' + inlineMarkdown(trimmed.replace(/^>\s?/, ''), item) + '</blockquote>');
                return;
            }

            if (/^[-*]\s+/.test(trimmed)) {
                flushParagraph();
                html.push('<p class="reader-list-item">' + inlineMarkdown(trimmed.replace(/^[-*]\s+/, ''), item) + '</p>');
                return;
            }

            paragraph.push({
                text: trimmed.replace(/\s{2,}$/, ''),
                hardBreak: hardBreak
            });
        });

        flushParagraph();
        return html.join('');
    }

    async function fetchMarkdown(item) {
        if (markdownCache[item.id]) {
            return markdownCache[item.id];
        }

        var response = await fetch(encodePath(item.path));
        if (!response.ok) {
            throw new Error('无法读取 ' + item.path);
        }

        var markdown = await response.text();
        var parsed = parseMarkdown(markdown);
        markdownCache[item.id] = {
            markdown: markdown,
            title: parsed.title || item.title,
            lines: parsed.lines
        };
        return markdownCache[item.id];
    }

    async function renderReader() {
        var item = currentText();
        if (!item) {
            readerTitle.textContent = '暂无文本';
            readerMeta.textContent = '';
            readerSummary.textContent = '没有找到可阅读的 Markdown 文件。';
            readerBody.innerHTML = '';
            return;
        }

        readerTitle.textContent = item.title;
        readerMeta.textContent = [item.category, item.region, item.sourceTitle].filter(Boolean).join(' · ');
        readerSummary.textContent = '正在读取文本内容。';
        readerBody.innerHTML = '<p class="reader-loading">正在加载 Markdown 文本...</p>';
        renderBookmark();
        applySettings();

        try {
            var data = await fetchMarkdown(item);
            readerTitle.textContent = data.title;
            readerSummary.textContent = [item.category, item.region].filter(Boolean).join(' · ');
            readerBody.innerHTML = renderMarkdownLines(data.lines, item);
            restoreProgress();
        } catch (error) {
            readerSummary.textContent = '读取失败';
            readerBody.innerHTML = '<p class="reader-error">' + escapeHtml(error.message) + '</p>';
        }
    }

    function renderBookmark() {
        var active = isFavorite(currentTextId);
        bookmarkButton.classList.toggle('is-active', active);
        bookmarkButton.setAttribute('aria-pressed', active ? 'true' : 'false');
        bookmarkButton.innerHTML = '<i class="fa ' + (active ? 'fa-star' : 'fa-star-o') + '" aria-hidden="true"></i>';
    }

    function applySettings() {
        var size = getSetting('size', 19);
        var width = getSetting('width', 760);
        var lineHeight = getSetting('lineHeight', 1.75);
        var theme = getSetting('theme', 'night');

        readerBody.style.setProperty('--reader-size', size + 'px');
        readerBody.style.setProperty('--reader-width', width + 'px');
        readerBody.style.setProperty('--reader-line-height', lineHeight);
        sizeInput.value = size;
        widthInput.value = width;
        lineHeightInput.value = lineHeight;

        readerPanel.classList.remove('theme-night', 'theme-paper', 'theme-clear');
        readerPanel.classList.add('theme-' + theme);
        Array.from(themeSwitcher.querySelectorAll('button')).forEach(function(button) {
            button.classList.toggle('is-active', button.dataset.theme === theme);
        });
    }

    function restoreProgress() {
        setProgress(progressFor(currentTextId));
    }

    function setProgress(value) {
        var progress = Math.max(0, Math.min(100, Math.round(value || 0)));
        progressBar.style.width = progress + '%';
        progressLabel.textContent = progress + '%';
    }

    function scheduleListRender() {
        if (listRenderTimer) {
            return;
        }

        listRenderTimer = window.setTimeout(function() {
            listRenderTimer = 0;
            renderList();
        }, 250);
    }

    function updateProgress() {
        if (!currentTextId) {
            return;
        }

        var rect = readerBody.getBoundingClientRect();
        var viewport = window.innerHeight || document.documentElement.clientHeight;
        var total = Math.max(1, readerBody.offsetHeight - Math.min(rect.height, viewport * .7));
        var read = Math.max(0, Math.min(total, viewport * .55 - rect.top));
        var progress = Math.round(read / total * 100);
        state.progress = state.progress || {};
        state.progress[currentTextId] = progress;
        setProgress(progress);
        saveState();
        scheduleListRender();
    }

    function selectText(id) {
        currentTextId = id;
        state.lastTextId = id;
        saveState();
        renderList();
        renderReader();
    }

    async function loadCatalog() {
        readerTitle.textContent = '正在加载文本库';
        readerSummary.textContent = '正在读取文本索引。';
        readerBody.innerHTML = '<p class="reader-loading">正在加载文本目录...</p>';

        var response = await fetch('catalog.json');
        if (!response.ok) {
            throw new Error('无法读取 reading/catalog.json');
        }

        var catalog = await response.json();
        texts = catalog.items || [];
        if (!texts.some(function(text) {
            return text.category === activeCategory;
        })) {
            activeCategory = allCategory;
        }
        var initialText = texts.find(function(text) {
            return text.category === activeCategory;
        }) || texts[0];
        currentTextId = initialText && initialText.id;
    }

    tabs.addEventListener('click', function(event) {
        var button = event.target.closest('button[data-category]');
        if (!button) {
            return;
        }
        activeCategory = button.dataset.category;
        renderTabs();
        renderList();
    });

    search.addEventListener('input', function(event) {
        query = normalize(event.target.value);
        renderList();
    });

    list.addEventListener('click', function(event) {
        var card = event.target.closest('button[data-text-id]');
        if (!card) {
            return;
        }
        selectText(card.dataset.textId);
    });

    bookmarkButton.addEventListener('click', function() {
        if (!currentTextId) {
            return;
        }

        state.favorites = state.favorites || {};
        state.favorites[currentTextId] = !state.favorites[currentTextId];
        if (!state.favorites[currentTextId]) {
            delete state.favorites[currentTextId];
        }
        saveState();
        renderBookmark();
        renderList();
    });

    sizeInput.addEventListener('input', function(event) {
        setSetting('size', Number(event.target.value));
        applySettings();
    });

    widthInput.addEventListener('input', function(event) {
        setSetting('width', Number(event.target.value));
        applySettings();
    });

    lineHeightInput.addEventListener('input', function(event) {
        setSetting('lineHeight', Number(event.target.value));
        applySettings();
    });

    themeSwitcher.addEventListener('click', function(event) {
        var button = event.target.closest('button[data-theme]');
        if (!button) {
            return;
        }
        setSetting('theme', button.dataset.theme);
        applySettings();
    });

    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);

    loadCatalog()
        .then(function() {
            renderTabs();
            renderList();
            renderReader();
        })
        .catch(function(error) {
            readerTitle.textContent = '文本库加载失败';
            readerSummary.textContent = '请确认 reading/catalog.json 已生成。';
            readerBody.innerHTML = '<p class="reader-error">' + escapeHtml(error.message) + '</p>';
        });
})();
