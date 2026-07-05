(function() {
    var catalog = window.MihoyyFontCatalog || [];
    var defaultText = 'Ad astra abyssosque.\nPer aspera ad astra.';
    var examples = [
        'May this journey lead us starward.',
        'Per aspera ad astra.',
        'Gnothi seauton.',
        'Khaire, o xene.'
    ];
    var state = {
        gameKey: '',
        fontFamily: '',
        fontSize: 52,
        letterSpacing: 1,
        lineHeight: 1.35,
        align: 'center'
    };

    var input = document.querySelector('#preview-input');
    var gameSelect = document.querySelector('#game-select');
    var fontSelect = document.querySelector('#font-select');
    var output = document.querySelector('#preview-output');
    var fontTitle = document.querySelector('#font-title');
    var fontGame = document.querySelector('#font-game');
    var downloadLink = document.querySelector('#font-download');
    var exampleList = document.querySelector('#example-list');
    var sizeInput = document.querySelector('#font-size');
    var spacingInput = document.querySelector('#letter-spacing');
    var lineHeightInput = document.querySelector('#line-height');
    var sizeValue = document.querySelector('#font-size-value');
    var spacingValue = document.querySelector('#letter-spacing-value');
    var lineHeightValue = document.querySelector('#line-height-value');
    var alignToggle = document.querySelector('#align-toggle');
    var saveImageButton = document.querySelector('#save-image');
    var fontLookup = {};

    function fontId(font) {
        return font.path.replace(/[^a-z0-9]/gi, '-');
    }

    function getAllFonts() {
        return catalog.reduce(function(fonts, group) {
            return fonts.concat(group.fonts.map(function(font) {
                return Object.assign({}, font, {
                    game: group.game,
                    gameKey: group.key,
                    accent: group.accent,
                    id: fontId(font)
                });
            }));
        }, []);
    }

    function injectFontFaces(fonts) {
        var css = fonts.map(function(font) {
            return "@font-face{font-family:'" + font.id + "';src:url('" + font.path + "') format('woff2');font-display:swap;}";
        }).join('');
        var style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    }

    function renderGameOptions() {
        gameSelect.innerHTML = catalog.map(function(group) {
            return '<option value="' + group.key + '">' + group.game + '</option>';
        }).join('');
    }

    function fontsForCurrentGame() {
        return Object.keys(fontLookup).map(function(key) {
            return fontLookup[key];
        }).filter(function(font) {
            return font.gameKey === state.gameKey;
        });
    }

    function renderFontOptions() {
        fontSelect.innerHTML = fontsForCurrentGame().map(function(font) {
            return '<option value="' + font.id + '">' + font.name + '</option>';
        }).join('');
    }

    function selectFirstFontInGame() {
        var fonts = fontsForCurrentGame();
        state.fontFamily = fonts.length ? fonts[0].id : '';
    }

    function renderExamples() {
        exampleList.innerHTML = examples.map(function(text) {
            return '<button class="chip-button" type="button" data-example="' + text + '">' + text + '</button>';
        }).join('');
    }

    function currentFont() {
        return fontLookup[state.fontFamily];
    }

    function updateRangeLabels() {
        sizeValue.textContent = state.fontSize + 'px';
        spacingValue.textContent = state.letterSpacing + 'px';
        lineHeightValue.textContent = state.lineHeight.toFixed(2);
    }

    function measureText(ctx, text, spacing) {
        var letters = Array.from(text);
        var width = letters.reduce(function(total, letter) {
            return total + ctx.measureText(letter).width;
        }, 0);
        return width + Math.max(letters.length - 1, 0) * spacing;
    }

    function breakLongWord(ctx, word, maxWidth, spacing) {
        var lines = [];
        var current = '';
        Array.from(word).forEach(function(letter) {
            var next = current + letter;
            if (current && measureText(ctx, next, spacing) > maxWidth) {
                lines.push(current);
                current = letter;
                return;
            }
            current = next;
        });

        if (current) {
            lines.push(current);
        }
        return lines;
    }

    function wrapLine(ctx, line, maxWidth, spacing) {
        if (!line) {
            return [''];
        }

        var lines = [];
        var current = '';
        var tokens = line.split(/(\s+)/).filter(function(token) {
            return token.length > 0;
        });

        tokens.forEach(function(token) {
            var next = current + token;
            if (measureText(ctx, next.trimEnd(), spacing) <= maxWidth) {
                current = next;
                return;
            }

            if (current.trim()) {
                lines.push(current.trimEnd());
                current = '';
            }

            if (measureText(ctx, token.trim(), spacing) > maxWidth) {
                lines = lines.concat(breakLongWord(ctx, token.trim(), maxWidth, spacing));
                return;
            }

            current = token.trimStart();
        });

        if (current.trim() || !lines.length) {
            lines.push(current.trimEnd());
        }
        return lines;
    }

    function drawSpacedText(ctx, text, x, y, spacing) {
        if (!spacing) {
            ctx.fillText(text, x, y);
            return;
        }

        Array.from(text).forEach(function(letter) {
            ctx.fillText(letter, x, y);
            x += ctx.measureText(letter).width + spacing;
        });
    }

    function downloadCanvas(canvas, filename) {
        var link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function safeFilename(value) {
        return value.replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, '-').toLowerCase();
    }

    function saveImage() {
        var font = currentFont();
        var text = input.value || defaultText;
        var padding = 48;
        var dpr = Math.max(window.devicePixelRatio || 1, 2);
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        var fontSpec = state.fontSize + "px '" + state.fontFamily + "', Lora, serif";
        var maxTextWidth = Math.max(320, Math.round(output.clientWidth || 640) - padding * 2);
        var lineHeightPx = state.fontSize * state.lineHeight;
        var spacing = state.letterSpacing;

        ctx.font = fontSpec;
        var lines = text.split(/\r?\n/).reduce(function(allLines, line) {
            return allLines.concat(wrapLine(ctx, line, maxTextWidth, spacing));
        }, []);

        var canvasWidth = maxTextWidth + padding * 2;
        var canvasHeight = Math.ceil(lines.length * lineHeightPx + padding * 2);
        canvas.width = Math.ceil(canvasWidth * dpr);
        canvas.height = Math.ceil(canvasHeight * dpr);
        canvas.style.width = canvasWidth + 'px';
        canvas.style.height = canvasHeight + 'px';

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.font = fontSpec;
        ctx.fillStyle = '#ffffff';
        ctx.textBaseline = 'alphabetic';

        lines.forEach(function(line, index) {
            var lineWidth = measureText(ctx, line, spacing);
            var x = padding;
            if (state.align === 'center') {
                x = (canvasWidth - lineWidth) / 2;
            } else if (state.align === 'right') {
                x = canvasWidth - padding - lineWidth;
            }

            var y = padding + state.fontSize + index * lineHeightPx;
            drawSpacedText(ctx, line, x, y, spacing);
        });

        downloadCanvas(canvas, safeFilename(font.name || 'translated-text') + '.png');
    }

    function saveImageWhenReady() {
        var fontLoad = document.fonts && document.fonts.load ? document.fonts.load(state.fontSize + "px '" + state.fontFamily + "'") : Promise.resolve();
        var buttonText = saveImageButton.textContent;
        saveImageButton.disabled = true;
        saveImageButton.textContent = '保存中';
        Promise.resolve(fontLoad).then(function() {
            saveImage();
        }).catch(function(error) {
            window.console.error(error);
        }).finally(function() {
            saveImageButton.disabled = false;
            saveImageButton.textContent = buttonText;
        });
    }

    function renderPreview() {
        var font = currentFont();
        output.textContent = input.value || defaultText;
        output.style.fontFamily = "'" + state.fontFamily + "', Lora, serif";
        output.style.fontSize = state.fontSize + 'px';
        output.style.letterSpacing = state.letterSpacing + 'px';
        output.style.lineHeight = state.lineHeight;
        output.style.textAlign = state.align;
        fontTitle.textContent = font.name;
        fontGame.textContent = font.game + ' · ' + (font.description || font.file);
        downloadLink.href = font.path;
        downloadLink.setAttribute('download', font.file);
        document.documentElement.style.setProperty('--preview-accent', font.accent);
        updateRangeLabels();
    }

    function setActiveAlign() {
        var buttons = alignToggle.querySelectorAll('button[data-align]');
        for (var i = 0; i < buttons.length; i += 1) {
            buttons[i].classList.toggle('is-active', buttons[i].dataset.align === state.align);
        }
    }

    function init() {
        var fonts = getAllFonts();
        if (!fonts.length) {
            return;
        }

        fonts.forEach(function(font) {
            fontLookup[font.id] = font;
        });
        state.gameKey = catalog[0].key;
        selectFirstFontInGame();

        injectFontFaces(fonts);
        renderGameOptions();
        renderFontOptions();
        renderExamples();

        input.value = defaultText;
        gameSelect.value = state.gameKey;
        fontSelect.value = state.fontFamily;
        sizeInput.value = state.fontSize;
        spacingInput.value = state.letterSpacing;
        lineHeightInput.value = state.lineHeight;
        setActiveAlign();
        renderPreview();
    }

    gameSelect.addEventListener('change', function(event) {
        state.gameKey = event.target.value;
        selectFirstFontInGame();
        renderFontOptions();
        fontSelect.value = state.fontFamily;
        renderPreview();
    });

    fontSelect.addEventListener('change', function(event) {
        state.fontFamily = event.target.value;
        renderPreview();
    });

    input.addEventListener('input', renderPreview);

    exampleList.addEventListener('click', function(event) {
        var button = event.target.closest('button[data-example]');
        if (!button) {
            return;
        }

        input.value = button.dataset.example;
        renderPreview();
    });

    sizeInput.addEventListener('input', function(event) {
        state.fontSize = Number(event.target.value);
        renderPreview();
    });

    spacingInput.addEventListener('input', function(event) {
        state.letterSpacing = Number(event.target.value);
        renderPreview();
    });

    lineHeightInput.addEventListener('input', function(event) {
        state.lineHeight = Number(event.target.value);
        renderPreview();
    });

    alignToggle.addEventListener('click', function(event) {
        var button = event.target.closest('button[data-align]');
        if (!button) {
            return;
        }

        state.align = button.dataset.align;
        setActiveAlign();
        renderPreview();
    });

    saveImageButton.addEventListener('click', saveImageWhenReady);

    init();
})();
