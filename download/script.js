(function() {
    var catalog = window.MihoyyFontCatalog || [];
    var allCategory = '全部';
    var activeCategory = allCategory;
    var query = '';
    var resources = [];

    var tabs = document.querySelector('#download-tabs');
    var search = document.querySelector('#download-search');
    var grid = document.querySelector('#resource-grid');
    var count = document.querySelector('#download-count');
    var title = document.querySelector('#download-title');
    var empty = document.querySelector('#download-empty');

    function fontId(font) {
        return font.path.replace(/[^a-z0-9]/gi, '-');
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function(character) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[character];
        });
    }

    function injectFontFaces() {
        var css = resources.map(function(resource) {
            return "@font-face{font-family:'" + resource.id + "';src:url('" + resource.path + "') format('woff2');font-display:swap;}";
        }).join('');
        var style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    }

    function flattenCatalog() {
        resources = catalog.reduce(function(items, group) {
            return items.concat(group.fonts.map(function(font) {
                return Object.assign({}, font, {
                    game: group.game,
                    accent: group.accent,
                    format: 'WOFF2',
                    size: font.size || '',
                    id: fontId(font)
                });
            }));
        }, []);
    }

    function categories() {
        return [allCategory].concat(catalog.map(function(group) {
            return group.game;
        }));
    }

    function normalize(value) {
        return value.trim().toLowerCase();
    }

    function matches(resource) {
        var inCategory = activeCategory === allCategory || resource.game === activeCategory;
        var text = [resource.name, resource.description, resource.file, resource.game, resource.sample].join(' ').toLowerCase();
        return inCategory && text.indexOf(query) !== -1;
    }

    function renderTabs() {
        tabs.innerHTML = categories().map(function(category) {
            var active = category === activeCategory ? ' is-active' : '';
            return '<button class="download-tab' + active + '" type="button" data-category="' + category + '">' + category + '</button>';
        }).join('');
    }

    function renderResources() {
        var filtered = resources.filter(matches);
        grid.innerHTML = filtered.map(function(resource, index) {
            var direction = index % 2 === 0 ? 'bottom_to_top' : 'top_to_bottom';
            return [
                '<article class="resource-card ih-item square colored effect3 ' + direction + '" tabindex="0" aria-label="' + escapeHtml(resource.name) + ' 字体下载详情" style="--accent:' + escapeHtml(resource.accent) + '">',
                '  <div class="img">',
                '    <div class="resource-face">',
                '      <div>',
                '        <p class="resource-font">' + escapeHtml(resource.name) + '</p>',
                '        <p class="resource-description">' + escapeHtml(resource.description || '游戏内自创文字字体') + '</p>',
                '      </div>',
                '      <p class="resource-sample" style="font-family:\'' + escapeHtml(resource.id) + '\', Lora, serif">' + escapeHtml(resource.sample) + '</p>',
                '    </div>',
                '  </div>',
                '  <div class="info">',
                '    <div class="resource-detail">',
                '      <h3>' + escapeHtml(resource.game) + '</h3>',
                '      <dl class="resource-meta">',
                '        <div><dt>格式</dt><dd>' + escapeHtml(resource.format) + '</dd></div>',
                '        <div><dt>大小</dt><dd>' + escapeHtml(resource.size) + '</dd></div>',
                '        <div><dt>文件</dt><dd>' + escapeHtml(resource.file) + '</dd></div>',
                '      </dl>',
                '      <a class="primary-action" href="' + escapeHtml(resource.path) + '" download="' + escapeHtml(resource.file) + '">下载字体</a>',
                '    </div>',
                '  </div>',
                '</article>'
            ].join('');
        }).join('');

        title.textContent = activeCategory === allCategory ? '全部字体' : activeCategory + '字体';
        count.textContent = filtered.length + ' 个资源';
        empty.hidden = filtered.length > 0;
    }

    function update() {
        renderTabs();
        renderResources();
    }

    tabs.addEventListener('click', function(event) {
        var button = event.target.closest('button[data-category]');
        if (!button) {
            return;
        }

        activeCategory = button.dataset.category;
        update();
    });

    search.addEventListener('input', function(event) {
        query = normalize(event.target.value);
        renderResources();
    });

    flattenCatalog();
    injectFontFaces();
    update();
})();
