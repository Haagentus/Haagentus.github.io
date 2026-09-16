(function () {
    'use strict';
    var intro = document.querySelector('.lunar-intro');
    var loader = document.querySelector('.lunar-loader');
    if (!intro || !loader) return;
    var readout = loader.querySelector('.lunar-percentage');
    var sweep = loader.querySelector('#lunar-sweep');
    var center = loader.querySelector('#lunar-center-reveal');
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var progress = 0;
    var target = 35;
    var started = performance.now();
    var duration = 6000;
    var ready = false;
    intro.classList.add('is-loading');

    // Readiness milestones, rather than a claimed byte-download percentage.
    var pageReady = new Promise(function (resolve) {
        if (document.readyState === 'complete') resolve();
        else window.addEventListener('load', resolve, { once: true });
    });
    var fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    fontsReady.then(function () { target = Math.max(target, 70); });
    Promise.all([pageReady, fontsReady]).then(function () { target = 100; });
    // Slow optional third-party resources must never trap visitors at the entrance.
    var fallback = window.setTimeout(function () { target = 100; }, 8000);

    function frame(now) {
        progress = reducedMotion ? target : Math.min(target, (now - started) / duration * 100);
        var value = Math.floor(progress);
        readout.textContent = value + '%';
        loader.setAttribute('aria-valuenow', value);
        var angle = value / 100 * Math.PI * 2;
        var x = 160 + 230 * Math.sin(angle);
        var y = 160 - 230 * Math.cos(angle);
        sweep.setAttribute('d', value === 100 ? 'M 0 0 H 320 V 320 H 0 Z' :
            'M 160 160 L 160 -70 A 230 230 0 ' + (value > 50 ? 1 : 0) + ' 1 ' + x + ' ' + y + ' Z');
        center.setAttribute('opacity', Math.pow(value / 100, 3));
        if (value < 100) window.requestAnimationFrame(frame);
        else {
            window.clearTimeout(fallback);
            ready = true;
            intro.classList.remove('is-loading');
            loader.setAttribute('aria-label', '页面已就绪');
        }
    }
    // The entire entrance is clickable once the sequence has completed.
    intro.addEventListener('click', function (event) {
        if (!ready) {
            event.preventDefault();
            return;
        }
        if (!event.target.closest('a')) window.location.assign('/navigation/');
    });
    window.requestAnimationFrame(frame);
})();
