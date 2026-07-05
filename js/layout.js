(function() {
    var brandName = '米游相关导航站';
    var brandPrefix = '米乎';
    var languageStorageKey = 'mihoyy-site-language';
    var languageFontStorageKey = 'mihoyy-site-language-font';
    var currentLanguage = localStorage.getItem(languageStorageKey) === 'en' ? 'en' : 'zh';
    var fullBrand = brandPrefix + brandName;
    var currentPath = window.location.pathname;
    var isHome = currentPath === '/' || /\/index\.html$/.test(currentPath);
    var basePath = document.querySelector('link[href^="../"]') ? '../' : '';
    var backgroundImages = [
        '/imgs/001.webp',
        '/imgs/002.webp',
        '/imgs/003.webp',
        '/imgs/004.webp',
        '/imgs/005.webp',
        '/imgs/006.webp'
    ];
    var fallbackFonts = [
        { name: 'Teyvat Black', path: '/fonts/Genshin-Impact/TeyvatBlack-Regular.woff2' },
        { name: 'Fontaine Ainee', path: '/fonts/Genshin-Impact/FontAinee-Regular.woff2' },
        { name: 'Deshret Inscription', path: '/fonts/Genshin-Impact/DeshretInscription-Regular.woff2' },
        { name: 'Inazuma Brush', path: '/fonts/Genshin-Impact/InazumaBrush-Regular.woff2' },
        { name: 'Khaenriah Sun', path: '/fonts/Genshin-Impact/KhaenriahSun-Regular.woff2' },
        { name: 'Sumeru Scribe', path: '/fonts/Genshin-Impact/SumeruScribe-Regular.woff2' },
        { name: 'Star Rail Neue Sans Regular', path: '/fonts/Honkai-Star-Rail/StarRailNeue-Sans-Regular.woff2' },
        { name: 'Xianzhou Seal Regular', path: '/fonts/Honkai-Star-Rail/XianzhouSeal-Regular.woff2' },
        { name: 'ZZZ System Regular', path: '/fonts/Zenless-Zone-Zero/ZZZSystem-Regular.woff2' },
        { name: 'ZZZ A Regular', path: '/fonts/Zenless-Zone-Zero/ZZZA-Regular.woff2' }
    ];
    var textMap = {
        '米乎': 'Mihoyo Hub',
        '米游相关导航站': 'Mihoyo Resource Hub',
        '导航': 'Nav',
        '翻译': 'Translator',
        '阅读': 'Reading',
        '工具': 'Tools',
        '下载': 'Downloads',
        '关于': 'About',
        '联系': 'Contact',
        '连接导航、翻译、阅读、工具与资源下载的轻量站点。': 'A lightweight portal for navigation, translation, reading, tools, and downloads.',
        '关于米乎': 'About Mihoyo Hub',
        '关于与联系': 'About & Contact',
        '米乎网站用于整理常用导航、阅读资料、实用工具和资源入口，让访问路径更清晰。': 'Mihoyo Hub organizes useful links, reading material, tools, and resource entries into clearer routes.',
        '这里会持续收纳常用页面、轻量工具和文本资料，方便快速到达需要的内容。': 'It will keep collecting useful pages, lightweight tools, and text archives so you can reach them quickly.',
        '工具集合': 'Toolbox',
        '阅读与资源': 'Reading & Resources',
        '阅读区整理文本资料，下载区提供字体资源归档，也可以先到翻译页查看不同游戏文字的实际效果。': 'The reading area collects text archives, while downloads provide font resources. You can preview each game script on the translator page.',
        '阅读模块': 'Reading',
        '文字翻译': 'Translator',
        '资源下载': 'Downloads',
        '如果你有站点内容、工具或资源入口建议，可以通过邮件联系。': 'Send suggestions for site content, tools, or resource links by email.',
        '搜索网站、描述或标签': 'Search sites, descriptions, or tags',
        '分类': 'Categories',
        '全部导航': 'All Links',
        '网站导航卡片': 'Site navigation cards',
        '没有找到对应入口': 'No matching entry',
        '换个关键词，或切回“全部”再试一次。': 'Try another keyword, or switch back to All.',
        '下载字体': 'Download Font',
        '字号': 'Size',
        '全部': 'All',
        '搜索': 'Search'
    };

    function homeHref(hash) {
        return isHome ? hash : '/' + hash;
    }

    function navLink(href, text, className, attributes) {
        var classAttr = className ? ' class="' + className + '"' : '';
        var attributeText = attributes ? ' ' + attributes : '';
        return '<li><a' + classAttr + attributeText + ' href="' + href + '">' + translateText(text) + '</a></li>';
    }

    function translateText(text) {
        return currentLanguage === 'en' && textMap[text] ? textMap[text] : text;
    }

    function languageLinkLabel() {
        return currentLanguage === 'en' ? '中文' : 'EN';
    }

    function renderNavbar() {
        var brandHref = isHome ? '#page-top' : '/';
        var brandClass = isHome ? 'navbar-brand page-scroll' : 'navbar-brand';
        var languageTitle = currentLanguage === 'en' ? 'Switch to Chinese' : '切换到英文';
        return [
            '<nav class="navbar navbar-custom navbar-fixed-top" role="navigation">',
            '    <div class="container">',
            '        <div class="navbar-header">',
            '            <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-main-collapse">',
            '                <i class="fa fa-bars"></i>',
            '            </button>',
            '            <a class="' + brandClass + '" href="' + brandHref + '">',
            '                <i class="fa fa-play-circle"></i> <span class="light">' + translateText(brandPrefix) + '</span> ' + translateText(brandName),
            '            </a>',
            '        </div>',
            '        <div class="collapse navbar-collapse navbar-right navbar-main-collapse">',
        '            <ul class="nav navbar-nav">',
        '                <li class="hidden"><a href="#page-top"></a></li>',
        navLink('/navigation/', '导航'),
        navLink('/translator/', '翻译'),
        navLink('/reading/', '阅读'),
        navLink('/tools/', '工具'),
        navLink('/download/', '下载'),
        navLink(homeHref('#about'), '关于', isHome ? 'page-scroll' : ''),            
        navLink('#', languageLinkLabel(), 'language-switch', 'data-language-switch title="' + languageTitle + '" aria-label="' + languageTitle + '"'),
        '            </ul>',
            '        </div>',
            '    </div>',
            '</nav>'
        ].join('\n');
    }

    function renderFooter() {
        return [
            '<footer>',
            '    <div class="container text-center">',
            '        <p>Copyright &copy; ' + (currentLanguage === 'en' ? translateText(brandPrefix) + ' ' + translateText(brandName) : fullBrand) + '</p>',
            '    </div>',
            '</footer>'
        ].join('\n');
    }

    function mount(selector, html) {
        var target = document.querySelector(selector);
        if (target) {
            target.outerHTML = html;
        }
    }

    function flattenFonts() {
        var catalog = window.MihoyyFontCatalog;

        if (!catalog || !catalog.length) {
            return fallbackFonts.slice();
        }

        return catalog.reduce(function(fonts, group) {
            return fonts.concat(group.fonts || []);
        }, []);
    }

    function fontId(font) {
        return 'mihoyy-language-' + font.path.replace(/[^a-z0-9]/gi, '-');
    }

    function randomFont(fonts) {
        return fonts[Math.floor(Math.random() * fonts.length)];
    }

    function injectLanguageFont(font) {
        var style = document.querySelector('#mihoyy-language-font-face');
        var family = fontId(font);

        if (!style) {
            style = document.createElement('style');
            style.id = 'mihoyy-language-font-face';
            document.head.appendChild(style);
        }

        style.textContent = "@font-face{font-family:'" + family + "';src:url('" + font.path + "') format('woff2');font-display:swap;}";
        document.documentElement.style.setProperty('--language-font-family', "'" + family + "', Montserrat, 'Helvetica Neue', Helvetica, Arial, sans-serif");
        localStorage.setItem(languageFontStorageKey, JSON.stringify({ name: font.name, path: font.path }));
    }

    function chooseAndApplyLanguageFont(forceRandom) {
        var fonts = flattenFonts();
        var storedFont = null;

        try {
            storedFont = JSON.parse(localStorage.getItem(languageFontStorageKey));
        } catch (error) {
            storedFont = null;
        }

        if (!forceRandom && storedFont && storedFont.path) {
            injectLanguageFont(storedFont);
            return;
        }

        if (fonts.length) {
            injectLanguageFont(randomFont(fonts));
        }
    }

    function ensureFontCatalog(callback) {
        if (window.MihoyyFontCatalog) {
            callback();
            return;
        }

        var script = document.createElement('script');
        script.src = basePath + 'js/font-data.js?v=20260627-font-desc';
        script.onload = callback;
        script.onerror = callback;
        document.head.appendChild(script);
    }

    function applyStaticTranslations() {
        var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
            acceptNode: function(node) {
                var parent = node.parentElement;

                if (!parent || /^(SCRIPT|STYLE|TEXTAREA)$/i.test(parent.tagName)) {
                    return NodeFilter.FILTER_REJECT;
                }

                return NodeFilter.FILTER_ACCEPT;
            }
        });
        var nodes = [];
        var node;

        while ((node = walker.nextNode())) {
            nodes.push(node);
        }

        nodes.forEach(function(textNode) {
            var trimmed = textNode.nodeValue.trim();

            if (!trimmed) {
                return;
            }

            if (!textNode._mihoyyOriginalText) {
                textNode._mihoyyOriginalText = trimmed;
            }

            var original = textNode._mihoyyOriginalText;
            var replacement = currentLanguage === 'en' && textMap[original] ? textMap[original] : original;

            if (trimmed !== replacement) {
                textNode.nodeValue = textNode.nodeValue.replace(trimmed, replacement);
            }
        });

        Array.prototype.forEach.call(document.querySelectorAll('[placeholder], [aria-label], [title]'), function(element) {
            ['placeholder', 'aria-label', 'title'].forEach(function(attribute) {
                var value = element.getAttribute(attribute);
                var originalAttribute = 'data-mihoyy-original-' + attribute;
                var original = element.getAttribute(originalAttribute);

                if (value && !original) {
                    original = value;
                    element.setAttribute(originalAttribute, original);
                }

                if (original && textMap[original]) {
                    element.setAttribute(attribute, currentLanguage === 'en' ? textMap[original] : original);
                }
            });
        });
    }

    function setLanguage(language, forceRandomFont) {
        currentLanguage = language === 'en' ? 'en' : 'zh';
        localStorage.setItem(languageStorageKey, currentLanguage);
        document.documentElement.lang = currentLanguage === 'en' ? 'en' : 'zh-CN';
        document.body.classList.toggle('mihoyy-language-en', currentLanguage === 'en');
        document.body.classList.toggle('mihoyy-language-zh', currentLanguage !== 'en');
        mount('[data-layout="navbar"], .navbar-custom', renderNavbar());
        mount('[data-layout="footer"], footer', renderFooter());
        bindLanguageSwitch();

        if (currentLanguage === 'en') {
            ensureFontCatalog(function() {
                chooseAndApplyLanguageFont(forceRandomFont);
            });
        }

        applyStaticTranslations();
    }

    function bindLanguageSwitch() {
        var button = document.querySelector('[data-language-switch]');

        if (!button) {
            return;
        }

        button.addEventListener('click', function(event) {
            event.preventDefault();
            setLanguage(currentLanguage === 'en' ? 'zh' : 'en', true);
        });
    }

    function observeLateContent() {
        var observer = new MutationObserver(function() {
            if (currentLanguage === 'en') {
                applyStaticTranslations();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    function renderSiteBackground() {
        return [
            '<div class="site-background" aria-hidden="true">',
            backgroundImages.map(function(src, index) {
                var active = index === 0 ? ' is-active' : '';
                return '    <div class="site-background__layer' + active + '" data-bg-index="' + index + '" style="background-image: url(' + src + ');"></div>';
            }).join('\n'),
            '    <div class="site-background__shade"></div>',
            '</div>'
        ].join('\n');
    }

    function mountSiteBackground() {
        if (document.querySelector('.site-background')) {
            return;
        }

        document.body.insertAdjacentHTML('afterbegin', renderSiteBackground());
    }

    function getScrollProgress() {
        var documentElement = document.documentElement;
        var scrollable = Math.max(1, documentElement.scrollHeight - window.innerHeight);
        return Math.min(1, Math.max(0, window.pageYOffset / scrollable));
    }

    function updateSiteBackground() {
        var index = Math.min(backgroundImages.length - 1, Math.floor(getScrollProgress() * backgroundImages.length));
        var layers = document.querySelectorAll('.site-background__layer');

        for (var i = 0; i < layers.length; i += 1) {
            layers[i].classList.toggle('is-active', i === index);
        }
    }

    function bindSiteBackground() {
        var ticking = false;

        function requestUpdate() {
            if (ticking) {
                return;
            }

            ticking = true;
            window.requestAnimationFrame(function() {
                updateSiteBackground();
                ticking = false;
            });
        }

        updateSiteBackground();
        window.addEventListener('scroll', requestUpdate, { passive: true });
        window.addEventListener('resize', requestUpdate);
    }

    mountSiteBackground();
    mount('[data-layout="navbar"]', renderNavbar());
    mount('[data-layout="footer"]', renderFooter());
    setLanguage(currentLanguage, false);
    observeLateContent();
    bindSiteBackground();
})();
