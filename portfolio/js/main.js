/* ==========================================================================
   Suraj Sonawane — Portfolio
   Vanilla JS. No libraries. Everything degrades if JS never runs.
   ========================================================================== */
(function () {
    'use strict';

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    /* ------------------------------------------------------------------
       1. Scroll reveal — one shared IntersectionObserver, staggered
       ------------------------------------------------------------------ */
    var revealNodes = [].slice.call(document.querySelectorAll('.reveal'));
    var chartNodes = [].slice.call(document.querySelectorAll(
        '.donut, .bar-fill, .skill-fill, .radar-card'
    ));

    // Seed SVG dash lengths up front so the draw transition has a start value.
    [].slice.call(document.querySelectorAll('.donut-seg')).forEach(function (seg) {
        seg.style.setProperty('--len', seg.dataset.len);
    });

    if (!('IntersectionObserver' in window)) {
        revealNodes.forEach(function (n) { n.classList.add('is-visible'); });
        chartNodes.forEach(function (n) {
            n.classList.add('is-on');
            if (n.classList.contains('donut')) n.classList.add('is-drawn');
        });
    } else {
        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

        revealNodes.forEach(function (node, i) {
            node.style.setProperty('--d', ((i % 6) * 70) + 'ms');
            revealObserver.observe(node);
        });

        var chartObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var node = entry.target;
                chartObserver.unobserve(node);

                if (node.classList.contains('donut')) {
                    requestAnimationFrame(function () { node.classList.add('is-drawn'); });
                } else if (node.classList.contains('radar-card')) {
                    node.classList.add('is-on');
                } else {
                    node.style.setProperty('--lv', node.dataset.level + '%');
                    node.classList.add('is-on');
                }
            });
        }, { threshold: 0.35 });

        chartNodes.forEach(function (node) { chartObserver.observe(node); });
    }

    /* Safety net: IntersectionObserver can exist but never deliver callbacks in
       some embedded webviews / headless contexts. If nothing has revealed by the
       time the user has had a chance to scroll, drop the .io-ok gate so all
       content is guaranteed visible rather than stuck at opacity 0. */
    window.setTimeout(function () {
        if (!document.documentElement.classList.contains('io-ok')) return;
        if (document.querySelector('.reveal.is-visible')) return;
        document.documentElement.classList.remove('io-ok');
        document.querySelectorAll('.reveal').forEach(function (n) {
            n.classList.add('is-visible');
        });
    }, 4000);

    /* ------------------------------------------------------------------
       2. Counters — ease-out cubic on rAF, fires once
       ------------------------------------------------------------------ */
    var counters = [].slice.call(document.querySelectorAll('[data-count]'));
    var easeOut = function (t) { return 1 - Math.pow(1 - t, 3); };

    function formatNum(value, decimals) {
        return value.toLocaleString('en-IN', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    }

    function countUp(node) {
        var target = parseFloat(node.dataset.count);
        var decimals = parseInt(node.dataset.decimals || '0', 10);
        var duration = 1600;
        var start = performance.now();

        function step(now) {
            var p = Math.min((now - start) / duration, 1);
            node.textContent = formatNum(target * easeOut(p), decimals);
            if (p < 1) requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
    }

    if (!('IntersectionObserver' in window)) {
        counters.forEach(countUp);
    } else {
        var counterObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                countUp(entry.target);
                counterObserver.unobserve(entry.target);
            });
        }, { threshold: 0.6 });

        counters.forEach(function (n) { counterObserver.observe(n); });
    }

    /* ------------------------------------------------------------------
       3. Navbar — scrolled state, active section, rAF-throttled
       ------------------------------------------------------------------ */
    var navbar = document.getElementById('navbar');
    var toTop = document.getElementById('toTop');
    var navLinks = [].slice.call(document.querySelectorAll('.nav-link'));
    var sections = navLinks
        .map(function (l) { return document.querySelector(l.getAttribute('href')); })
        .filter(Boolean);

    var scrollTicking = false;

    function onScroll() {
        if (scrollTicking) return;
        scrollTicking = true;
        requestAnimationFrame(function () {
            var y = window.scrollY || window.pageYOffset;
            navbar.classList.toggle('scrolled', y > 40);
            toTop.classList.toggle('is-on', y > 700);

            var current = '';
            for (var i = 0; i < sections.length; i++) {
                if (y >= sections[i].offsetTop - 140) current = '#' + sections[i].id;
            }
            navLinks.forEach(function (l) {
                l.classList.toggle('active', l.getAttribute('href') === current);
            });

            scrollTicking = false;
        });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    toTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });

    /* ------------------------------------------------------------------
       4. Mobile menu
       ------------------------------------------------------------------ */
    var burger = document.getElementById('burger');
    var menu = document.getElementById('navLinks');

    function closeMenu() {
        menu.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
    }

    burger.addEventListener('click', function () {
        var open = menu.classList.toggle('is-open');
        burger.setAttribute('aria-expanded', String(open));
    });

    navLinks.forEach(function (l) { l.addEventListener('click', closeMenu); });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeMenu();
    });

    document.addEventListener('click', function (e) {
        if (!menu.contains(e.target) && !burger.contains(e.target)) closeMenu();
    });

    /* ------------------------------------------------------------------
       5. Theme toggle — persists to localStorage
       ------------------------------------------------------------------ */
    var themeToggle = document.getElementById('themeToggle');
    var root = document.documentElement;
    var stored = null;

    try { stored = localStorage.getItem('ss-theme'); } catch (err) { /* private mode */ }

    if (stored === 'light' || stored === 'dark') root.setAttribute('data-theme', stored);

    themeToggle.addEventListener('click', function () {
        var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        root.setAttribute('data-theme', next);
        try { localStorage.setItem('ss-theme', next); } catch (err) { /* noop */ }
    });

    /* ------------------------------------------------------------------
       6. Spotlight — CSS vars for pointer position, rAF-throttled,
          coarse pointers excluded
       ------------------------------------------------------------------ */
    if (canHover && !reduceMotion) {
        [].slice.call(document.querySelectorAll('[data-spotlight]')).forEach(function (el) {
            var queued = false;
            var x = 0;
            var y = 0;

            function paint() {
                el.style.setProperty('--mx', x + 'px');
                el.style.setProperty('--my', y + 'px');
                queued = false;
            }

            el.addEventListener('pointermove', function (e) {
                var rect = el.getBoundingClientRect();
                x = e.clientX - rect.left;
                y = e.clientY - rect.top;
                if (!queued) {
                    queued = true;
                    requestAnimationFrame(paint);
                }
            }, { passive: true });
        });
    }

    /* ------------------------------------------------------------------
       7. Role rotator in hero
       ------------------------------------------------------------------ */
    var rotator = document.getElementById('roleRotator');
    var words = rotator ? [].slice.call(rotator.querySelectorAll('.role-word')) : [];
    var wordIndex = 0;

    if (words.length && !reduceMotion) {
        setInterval(function () {
            words[wordIndex].classList.remove('active');
            wordIndex = (wordIndex + 1) % words.length;
            words[wordIndex].classList.add('active');
        }, 2800);
    }

    /* ------------------------------------------------------------------
       8. Copy to clipboard — with sparkle burst (the quiet easter egg)
       ------------------------------------------------------------------ */
    var toast = document.getElementById('toast');
    var toastTimer = null;

    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('is-on');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { toast.classList.remove('is-on'); }, 2400);
    }

    function burst(anchor) {
        if (reduceMotion) return;
        var rect = anchor.getBoundingClientRect();
        var ox = rect.left + rect.width / 2;
        var oy = rect.top + rect.height / 2;
        var angles = [-140, -90, -40, 40, 90, 140];

        angles.forEach(function (deg, i) {
            var spark = document.createElement('span');
            var rad = (deg * Math.PI) / 180;
            spark.className = 'spark';
            spark.style.left = ox + 'px';
            spark.style.top = oy + 'px';
            spark.style.setProperty('--dx', Math.cos(rad) * (26 + i * 4) + 'px');
            spark.style.setProperty('--dy', Math.sin(rad) * (26 + i * 4) + 'px');
            spark.style.animationDelay = (i * 22) + 'ms';
            document.body.appendChild(spark);
            (function (node) {
                setTimeout(function () { node.remove(); }, 900);
            })(spark);
        });
    }

    [].slice.call(document.querySelectorAll('[data-copy]')).forEach(function (btn) {
        btn.addEventListener('click', function () {
            var text = btn.dataset.copy;
            var label = btn.querySelector('.cb-body strong');
            var original = label.textContent;

            var done = function () {
                btn.classList.add('is-copied');
                burst(btn);
                showToast(text + ' copied to clipboard');
                label.textContent = 'Copied to clipboard';
                setTimeout(function () {
                    btn.classList.remove('is-copied');
                    label.textContent = original;
                }, 1800);
            };

            var fail = function () {
                showToast('Copy failed — select the text manually');
            };

            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(text).then(done).catch(fail);
            } else {
                try {
                    var ta = document.createElement('textarea');
                    ta.value = text;
                    ta.setAttribute('readonly', '');
                    ta.style.position = 'fixed';
                    ta.style.opacity = '0';
                    document.body.appendChild(ta);
                    ta.select();
                    document.execCommand('copy');
                    ta.remove();
                    done();
                } catch (err) {
                    fail();
                }
            }
        });
    });

    /* ------------------------------------------------------------------
       9. Footer year
       ------------------------------------------------------------------ */
    var yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
})();