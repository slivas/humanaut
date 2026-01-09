document.addEventListener('DOMContentLoaded', () => {

    /*Mobile settings*/
    const MOBILE_BREAKPOINT = 1023;
    const isMobile = () => window.innerWidth <= MOBILE_BREAKPOINT;

    /*Implementation modal*/

    const triggers = document.querySelectorAll('.modal-trigger');

    const closeAllModals = (exceptModal = null) => {
        document.querySelectorAll('.modal.is-open').forEach(modal => {
            if (exceptModal && modal === exceptModal) return;
            modal.classList.remove('is-open');
        });

        if (!document.querySelector('.modal.is-open')) {
            document.body.classList.remove('modal-open');
        }
    };

    const openModal = (modal) => {
        modal.classList.add('is-open');
        document.body.classList.add('modal-open');
    };

    const closeModal = (modal) => {
        modal.classList.remove('is-open');

        if (!document.querySelector('.modal.is-open')) {
            document.body.classList.remove('modal-open');
        }
    };

    triggers.forEach(trigger => {
        const modalId = trigger.dataset.modal;
        const modal = document.getElementById(modalId);
        if (!modal) return;

        const closeBtn = modal.querySelector('.modal-close');

        trigger.addEventListener('click', (e) => {
            if (!isMobile()) return;
            e.preventDefault();
            e.stopPropagation();

            if (modal.classList.contains('is-open')) {
                closeModal(modal);
                return;
            }

            closeAllModals(modal);
            openModal(modal);
        });

        trigger.addEventListener('mouseenter', () => {
            if (isMobile()) return;
            openModal(modal);
        });

        trigger.addEventListener('mouseleave', () => {
            if (isMobile()) return;
            closeModal(modal);
        });

        modal.addEventListener('mouseenter', () => {
            if (isMobile()) return;
            openModal(modal);
        });

        modal.addEventListener('mouseleave', () => {
            if (isMobile()) return;
            closeModal(modal);
        });

        closeBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            closeModal(modal);
        });
    });

    document.addEventListener('click', (e) => {
        if (!isMobile()) return;

        const openModalEl = document.querySelector('.modal.is-open');
        if (!openModalEl) return;

        const content = openModalEl.querySelector('.modal-inner');
        if (!content) return;

        if (
            !content.contains(e.target) &&
            !e.target.closest('.modal-trigger')
        ) {
            closeAllModals();
        }
    });

    window.addEventListener('resize', closeAllModals);

    /*Implementation slider*/
    const section = document.querySelector('.implementation');
    if (!section) return;

    const inner = section.querySelector('.implementation__inner');
    if (!inner) return;

    const btnNext = section.querySelector('.implementation__nav-btn.next');
    const btnPrev = section.querySelector('.implementation__nav-btn.prev');
    const itemNumEl = section.querySelector('.implementation__item-num span');

    const MAX_ITEMS = 4;

    // --- tuning
    const DESKTOP_STOP_OFFSET = 0;   // якщо треба під хедер — став 140 і додай offset у snap (див. нижче)
    const NEARLY_VISIBLE_RATIO = 0.92; // майже 100% (щоб тачпад не "пролітав")
    const TOP_SNAP_MIN = -20;          // px
    const TOP_SNAP_MAX = 160;          // px (чим більше — тим раніше фіксується)
    const WHEEL_THRESHOLD = 70;
    const COOLDOWN_MS = 240;

    // --- state
    let locked = false;
    let wheelCooldown = false;
    let wheelAccum = 0;
    let snappedOnce = false; // щоб не "липло" постійно
    let nearlyVisible = false;

    // ---------- helpers
    const getActiveIndex = () => {
        const cls = inner.className.match(/item-(\d+)-active/);
        const n = cls ? parseInt(cls[1], 10) : 1;
        return Math.min(Math.max(n, 1), MAX_ITEMS);
    };

    const setActiveIndex = (index) => {
        const next = Math.min(Math.max(index, 1), MAX_ITEMS);

        for (let i = 1; i <= MAX_ITEMS; i++) inner.classList.remove(`item-${i}-active`);
        inner.classList.add(`item-${next}-active`);

        if (itemNumEl) itemNumEl.textContent = String(next).padStart(2, '0');

        if (btnPrev) btnPrev.disabled = next === 1;
        if (btnNext) btnNext.disabled = next === MAX_ITEMS;
    };

    const step = (dir) => setActiveIndex(getActiveIndex() + dir);

    // ---------- buttons
    btnNext?.addEventListener('click', (e) => { e.preventDefault(); step(+1); });
    btnPrev?.addEventListener('click', (e) => { e.preventDefault(); step(-1); });

    // ---------- mobile swipe
    let touchStartX = 0;
    let touchStartY = 0;
    const SWIPE_MIN_DIST = 40;
    const SWIPE_MAX_ANGLE = 0.6;

    section.addEventListener('touchstart', (e) => {
        if (!isMobile()) return;
        const t = e.touches[0];
        touchStartX = t.clientX;
        touchStartY = t.clientY;
    }, { passive: true });

    section.addEventListener('touchend', (e) => {
        if (!isMobile()) return;

        const t = e.changedTouches[0];
        const dx = t.clientX - touchStartX;
        const dy = t.clientY - touchStartY;

        if (Math.abs(dx) < SWIPE_MIN_DIST) return;
        if (Math.abs(dy) > Math.abs(dx) * SWIPE_MAX_ANGLE) return;

        if (dx < 0) step(+1);
        else step(-1);
    }, { passive: true });

    // ---------- desktop: track "nearly visible"
    const io = new IntersectionObserver((entries) => {
        const e = entries[0];
        nearlyVisible = e.isIntersecting && e.intersectionRatio >= NEARLY_VISIBLE_RATIO;

        // якщо вийшли з секції — скидаємо, щоб наступного разу знов можна було snap
        if (!e.isIntersecting || e.intersectionRatio < 0.3) {
            snappedOnce = false;
            locked = false;
            wheelAccum = 0;
        }
    }, { threshold: [0, 0.3, NEARLY_VISIBLE_RATIO, 1] });

    io.observe(section);

    // ---------- snap (один раз)
    const snapToTop = () => {
        const rect = section.getBoundingClientRect();
        const targetY = window.scrollY + rect.top - DESKTOP_STOP_OFFSET;
        window.scrollTo({ top: targetY, behavior: 'auto' });
    };

    // секція “стоїть” у верхній частині екрану (готова до lock)
    const isInTopBand = () => {
        const rect = section.getBoundingClientRect();
        return rect.top >= TOP_SNAP_MIN && rect.top <= TOP_SNAP_MAX;
    };

    // lock зона (коли вже підхопили)
    const inLockZone = () => {
        const rect = section.getBoundingClientRect();
        // якщо DESKTOP_STOP_OFFSET=0 — це просто top<=0
        return rect.top <= DESKTOP_STOP_OFFSET + 2 && rect.bottom > (DESKTOP_STOP_OFFSET + 120);
    };

    const onWheel = (e) => {
        if (isMobile()) return;

        const dy = e.deltaY;

        // --- ВХІД: тільки коли секція майже 100% видима і близько до верху
        if (!locked) {
            if (!nearlyVisible) return;
            if (!isInTopBand()) return;

            // робимо snap один раз, щоб вирівняти
            if (!snappedOnce) {
                e.preventDefault();
                snappedOnce = true;
                snapToTop();
                locked = true;
                wheelAccum = 0;
                return;
            }

            locked = true;
        }

        // якщо з якихось причин ми вже не в lock зоні — відпускаємо
        if (!inLockZone()) {
            locked = false;
            return;
        }

        const idx = getActiveIndex();

        // --- ВИХІД: на краях відпускаємо сторінку
        if ((idx === 1 && dy < 0) || (idx === MAX_ITEMS && dy > 0)) {
            locked = false;
            wheelAccum = 0;
            return; // без preventDefault
        }

        // --- ЛИСТАННЯ
        e.preventDefault();
        wheelAccum += dy;

        if (wheelCooldown) return;

        if (wheelAccum >= WHEEL_THRESHOLD) {
            wheelAccum = 0;
            wheelCooldown = true;
            step(+1);
            setTimeout(() => (wheelCooldown = false), COOLDOWN_MS);
        } else if (wheelAccum <= -WHEEL_THRESHOLD) {
            wheelAccum = 0;
            wheelCooldown = true;
            step(-1);
            setTimeout(() => (wheelCooldown = false), COOLDOWN_MS);
        }
    };

    window.addEventListener('wheel', onWheel, { passive: false });

    // init
    setActiveIndex(getActiveIndex());

    window.addEventListener('resize', () => {
        locked = false;
        snappedOnce = false;
        wheelAccum = 0;
        wheelCooldown = false;
    });


/*Show more / less*/
    const list = document.querySelector('.about__list');
    if (!list) return;

// ✅ актуальні items
    const getItems = () => [...list.querySelectorAll('.about__list-item')];

// ✅ зберігаємо початковий DOM-порядок, щоб можна було відкотитись
    const initialOrder = getItems();

// ===== Mobile helpers =====
    function closeDesc(desc) {
        desc.classList.add('is-collapsed');
        desc.style.maxHeight = '0px';
    }

    function openDesc(desc) {
        desc.classList.remove('is-collapsed');
        desc.style.maxHeight = desc.scrollHeight + 'px';
    }

    function resetDesktop(desc) {
        desc.classList.remove('is-collapsed');
        desc.style.removeProperty('max-height');
    }

// ===== Reset states =====
    function resetDesktopClasses() {
        list.classList.remove('is-expanded');
        getItems().forEach(li => li.classList.remove('is-active', 'is-left', 'is-right'));
    }

    function applyMobileState() {
        resetDesktopClasses();

        getItems().forEach(li => {
            const desc = li.querySelector('.about__list-item--description');
            const btn  = li.querySelector('.about__list-item--btn');
            if (!desc || !btn) return;

            btn.style.display = 'inline-block';

            const isOpen = btn.classList.contains('is-open');
            isOpen ? openDesc(desc) : closeDesc(desc);

            btn.textContent = isOpen ? 'Read less' : 'Read more';
        });
    }

    function applyDesktopState() {
        getItems().forEach(li => {
            const desc = li.querySelector('.about__list-item--description');
            const btn  = li.querySelector('.about__list-item--btn');

            if (desc) resetDesktop(desc);

            if (btn) {
                btn.style.display = 'none';
                btn.classList.remove('is-open');
                btn.textContent = '';
            }
        });

        resetDesktopClasses();

        // ✅ повертаємо початковий порядок при переході на десктоп
        initialOrder.forEach(el => list.appendChild(el));
    }

// ===== FLIP =====
    function flipAnimate(container, mutate, duration = 520) {
        const els = Array.from(container.children);

        const first = new Map(els.map(el => [el, el.getBoundingClientRect()]));

        mutate();

        container.getBoundingClientRect(); // force layout

        const last = new Map(els.map(el => [el, el.getBoundingClientRect()]));

        els.forEach(el => {
            const f = first.get(el);
            const l = last.get(el);
            if (!f || !l) return;

            const dx = f.left - l.left;
            const dy = f.top - l.top;

            if (dx || dy) {
                el.style.transform = `translate(${dx}px, ${dy}px)`;
                el.style.transition = 'transform 0s';
            }
        });

        requestAnimationFrame(() => {
            els.forEach(el => {
                if (el.style.transform) {
                    el.style.transition = `transform ${duration}ms ease`;
                    el.style.transform = '';
                }
            });
        });

        setTimeout(() => {
            els.forEach(el => {
                el.style.transition = '';
                el.style.transform = '';
            });
        }, duration + 60);

        return duration;
    }

// ===== Desktop click =====
    list.addEventListener('click', (e) => {
        // ===== MOBILE =====
        if (isMobile()) {
            const btn = e.target.closest('.about__list-item--btn');
            if (!btn) return;

            const li = btn.closest('.about__list-item');
            if (!li) return;

            const desc = li.querySelector('.about__list-item--description');
            if (!desc) return;

            btn.classList.toggle('is-open');
            const nowOpen = btn.classList.contains('is-open');

            nowOpen ? openDesc(desc) : closeDesc(desc);
            btn.textContent = nowOpen ? 'Read less' : 'Read more';
            return;
        }

        // ===== DESKTOP =====
        const img = e.target.closest('.about__list-item--img');
        if (!img) return;

        const activeItem = img.closest('.about__list-item');
        if (!activeItem) return;

        const itemsBefore = getItems();                 // DOM порядок ДО змін
        const activeIndex = itemsBefore.indexOf(activeItem);
        const wasActive = activeItem.classList.contains('is-active');

        // toggle OFF: повертаємо порядок + знімаємо класи (плавно через FLIP)
        if (wasActive) {
            flipAnimate(list, () => {
                resetDesktopClasses();
                initialOrder.forEach(el => list.appendChild(el));
            }, 520);
            return;
        }

        // toggle ON: активний стає першим, інші роз'їжджаються
        flipAnimate(list, () => {
            // reset
            resetDesktopClasses();

            // 1) активний на перше місце
            list.prepend(activeItem);

            // 2) активний клас
            activeItem.classList.add('is-active');

            // 3) хто був ДО активного -> вліво, хто ПІСЛЯ -> вправо
            itemsBefore.forEach((item, i) => {
                if (item === activeItem) return;
                if (i < activeIndex) item.classList.add('is-left');
                else item.classList.add('is-right');
            });

            // 4) вмикаємо роз'їзд (CSS робить translateX для left/right)
            list.classList.add('is-expanded');
        }, 520);
    });

// ===== transitionend тільки для мобільного опису =====
    getItems().forEach(li => {
        const desc = li.querySelector('.about__list-item--description');
        if (!desc) return;

        desc.addEventListener('transitionend', (ev) => {
            if (ev.propertyName !== 'max-height') return;
            if (!isMobile()) return;

            if (!desc.classList.contains('is-collapsed')) {
                desc.style.maxHeight = 'none';
            }
        });
    });

// ===== Init + resize =====
    let lastMode = isMobile() ? 'mobile' : 'desktop';

    function init() {
        const mode = isMobile() ? 'mobile' : 'desktop';
        mode === 'mobile' ? applyMobileState() : applyDesktopState();
        lastMode = mode;
    }

    init();

    window.addEventListener('resize', () => {
        const mode = isMobile() ? 'mobile' : 'desktop';
        if (mode === lastMode) return;
        init();
    });


    /*Logo line*/
    const root = document.querySelector('.logo-line');
    if (!root) return;

    const viewport = root.querySelector('.logo-line__viewport');
    const track = root.querySelector('.logo-line__track');
    const logoList = root.querySelector('.logo-line__list');
    if (!viewport || !track || !logoList) return;

    const SPEED = 80; // px/sec
    let clone = track.querySelector('.logo-line__list[data-clone="1"]');

    // створюємо клон один раз
    if (!clone) {
        clone = logoList.cloneNode(true);
        clone.setAttribute('data-clone', '1');
        track.appendChild(clone);
    }

    const measure = () => {
        const distance = logoList.getBoundingClientRect().width;
        if (!distance) return;

        root.style.setProperty('--marquee-distance', `${distance}px`);
        root.style.setProperty('--marquee-duration', `${distance / SPEED}s`);
    };

    // чекаємо завантаження всіх логотипів
    const imgs = [...root.querySelectorAll('img')];
    const waitImages = Promise.all(
        imgs.map(img =>
            img.complete
                ? Promise.resolve()
                : new Promise(res => {
                    img.addEventListener('load', res, { once: true });
                    img.addEventListener('error', res, { once: true });
                })
        )
    );

    waitImages.then(measure);

    // якщо змінюється ширина (resize / responsive)
    const ro = new ResizeObserver(() => {
        clearTimeout(measure._t);
        measure._t = setTimeout(measure, 120);
    });

    ro.observe(viewport);
    ro.observe(logoList);

    window.addEventListener('resize', () => {
        clearTimeout(measure._t);
        measure._t = setTimeout(measure, 150);
    });

/*Tabs*/
    document.querySelectorAll('.tabs').forEach(tabs => {
        const section = tabs.closest('.how-it-works'); // 👈 секція з фоном
        const buttons = [...tabs.querySelectorAll('[data-tab]')];
        const panels  = [...tabs.querySelectorAll('[data-tab-target]')];

        if (!buttons.length || !panels.length) return;

        const interval = parseInt(tabs.dataset.interval, 10) || 4000;

        const order = buttons.map(btn => btn.dataset.tab);

        let currentIndex = Math.max(
            0,
            buttons.findIndex(btn => btn.classList.contains('is-active'))
        );
        if (currentIndex === -1) currentIndex = 0;

        let timer = null;

        const setBackgroundClass = (name) => {
            if (!section) return;

            // прибираємо всі попередні how-it-works--*
            section.className = section.className
                .split(' ')
                .filter(cls => !cls.startsWith('how-it-works--'))
                .join(' ');

            // додаємо новий
            section.classList.add(`how-it-works--${name}`);
        };

        const activateByName = (name) => {
            buttons.forEach(btn =>
                btn.classList.toggle('is-active', btn.dataset.tab === name)
            );

            panels.forEach(panel =>
                panel.classList.toggle(
                    'is-active',
                    panel.dataset.tabTarget === name
                )
            );

            setBackgroundClass(name);
            currentIndex = order.indexOf(name);
        };

        const next = () => {
            const nextIndex = (currentIndex + 1) % order.length;
            activateByName(order[nextIndex]);
        };

        const start = () => {
            stop();
            timer = setInterval(next, interval);
        };

        const stop = () => {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
        };

        // кліки по табах
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                activateByName(btn.dataset.tab);
                start(); // перезапуск циклу
            });
        });

        // init
        activateByName(order[currentIndex]);
        start();

        // оптимізація: не крутити у неактивній вкладці браузера
        document.addEventListener('visibilitychange', () => {
            document.hidden ? stop() : start();
        });
    });

/*Parallax for CTA*/
    const ctaSection = document.querySelector('.cta');
    if (!ctaSection) return;

    const ctaBg = ctaSection.querySelector('.cta__bg');
    if (!ctaBg) return;

    const DESKTOP_BREAKPOINT = 1024;

    let MAX_OFFSET_PX = 120; // desktop default
    let isTicking = false;
    let isInView = true;

    const applySettings = () => {
        if (window.innerWidth >= DESKTOP_BREAKPOINT) {
            // 🖥 DESKTOP
            MAX_OFFSET_PX = 280;   // можеш збільшити до 160
        } else {
            // 📱 MOBILE
            MAX_OFFSET_PX = 150;    // або 0, якщо не хочеш паралакс на мобілці
        }
    };

    applySettings();

    const updateParallax = () => {
        const rect = ctaSection.getBoundingClientRect();
        const vh = window.innerHeight;

        isInView = rect.bottom > 0 && rect.top < vh;
        if (!isInView) {
            isTicking = false;
            return;
        }

        const progress = (vh - rect.top) / (vh + rect.height);
        const clamped = Math.min(Math.max(progress, 0), 1);

        const translateY = (clamped - 0.5) * MAX_OFFSET_PX * 2;

        ctaBg.style.transform = `translate3d(0, ${translateY}px, 0)`;

        isTicking = false;
    };

    const requestUpdate = () => {
        if (isTicking) return;
        isTicking = true;
        requestAnimationFrame(updateParallax);
    };

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', () => {
        applySettings();
        requestUpdate();
    });

    // старт
    requestUpdate();

/* Accordion */
    const accordion = document.querySelector('.accordion');

    function open(panel, item){
        item.classList.add('is-open');
        panel.style.height = panel.getBoundingClientRect().height + 'px';
        requestAnimationFrame(() => {
            panel.style.height = panel.scrollHeight + 'px';
        });
        const onEnd = (e) => {
            if (e.propertyName !== 'height') return;
            panel.removeEventListener('transitionend', onEnd);
            panel.style.height = 'auto';
        };
        panel.addEventListener('transitionend', onEnd);
    }

    function close(panel, item){
        item.classList.remove('is-open');
        panel.style.height = panel.scrollHeight + 'px';
        requestAnimationFrame(() => {
            panel.style.height = '0px';
        });
    }

    accordion.addEventListener('click', (e) => {
        const btn = e.target.closest('.acc-trigger');
        if (!btn) return;

        const item = btn.parentElement;
        const panel = btn.nextElementSibling;
        const isOpen = item.classList.contains('is-open');

        accordion.querySelectorAll('.acc-item.is-open').forEach(other => {
            const otherPanel = other.querySelector('.acc-panel');
            if (other !== item) close(otherPanel, other);
        });

        if (!isOpen) {
            open(panel, item);
        } else {
            close(panel, item);
        }
    });

    document.querySelectorAll('.acc-item.is-open .acc-panel').forEach(p => p.style.height = 'auto');


/*Reviews read more*/
    const blocks = document.querySelectorAll('.reviews__list-text[data-words]');

    blocks.forEach(block => {
        const wordsLimit = parseInt(block.dataset.words, 10);
        if (!wordsLimit) return;

        const p = block.querySelector('p');
        if (!p) return;

        const fullText = (p.textContent || '').trim();
        const words = fullText.split(/\s+/);
        if (words.length <= wordsLimit) return;

        const shortText = words.slice(0, wordsLimit).join(' ') + '…';

        // wrap text only (button will be outside)
        const inner = document.createElement('div');
        inner.className = 'reviews__list-text-inner';
        block.insertBefore(inner, p);
        inner.appendChild(p);

        // button
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'reviews__read-more';
        block.appendChild(btn);

        let isOpen = false;

        const setBtn = () => (btn.textContent = isOpen ? 'Read less' : 'Read more');

        const setMaxHeightToContent = () => {
            // ставимо конкретну висоту, щоб був slide
            inner.style.maxHeight = inner.scrollHeight + 'px';
        };

        const setClosedHeight = () => {
            // важливо: замір висоти з коротким текстом
            inner.style.maxHeight = inner.scrollHeight + 'px';
        };

        const open = () => {
            // 1) ставимо повний текст
            p.textContent = fullText;

            // 2) скидаємо max-height на 0 і одразу ставимо потрібну (для надійного transition)
            inner.style.maxHeight = '0px';
            inner.getBoundingClientRect(); // force reflow
            setMaxHeightToContent();
        };

        const close = () => {
            // 1) фіксуємо поточну висоту (з fullText)
            inner.style.maxHeight = inner.scrollHeight + 'px';
            inner.getBoundingClientRect(); // force reflow

            // 2) ставимо короткий текст
            p.textContent = shortText;

            // 3) ставимо max-height під короткий текст
            setClosedHeight();
        };

        // після відкриття можна "відпустити" max-height, щоб не різало при responsive
        inner.addEventListener('transitionend', (e) => {
            if (e.propertyName !== 'max-height') return;
            if (isOpen) {
                inner.style.maxHeight = 'none';
            }
        });

        btn.addEventListener('click', () => {
            isOpen = !isOpen;
            setBtn();

            if (isOpen) open();
            else {
                // якщо було none — треба зафіксувати перед анімацією
                if (inner.style.maxHeight === 'none') {
                    inner.style.maxHeight = inner.scrollHeight + 'px';
                    inner.getBoundingClientRect();
                }
                close();
            }
        });

        // init (closed)
        p.textContent = shortText;
        setBtn();
        // виставляємо стартову висоту під короткий текст
        inner.style.maxHeight = inner.scrollHeight + 'px';

        // optional: на ресайзі коригувати, якщо закрито
        const ro = new ResizeObserver(() => {
            if (isOpen) return;
            inner.style.maxHeight = inner.scrollHeight + 'px';
        });
        ro.observe(block);
    });

    const annotationRoot = document.querySelector('.reviews__annotation[data-words]');
    if (!annotationRoot) return;

/*Reviews annotation read more*/
    const annotationLimit = parseInt(annotationRoot.dataset.words, 10);
    if (!annotationLimit) return;

    // Повний текст (усі <p>)
    const annotationFullHTML = annotationRoot.innerHTML;
    const annotationFullText = annotationRoot.textContent
        .trim()
        .replace(/\s+/g, ' ');

    const annotationWords = annotationFullText.split(' ');
    if (annotationWords.length <= annotationLimit) return;

    const annotationShortText =
        annotationWords.slice(0, annotationLimit).join(' ') + '…';

    // Контейнер, який анімуємо
    const annotationInner = document.createElement('div');
    annotationInner.className = 'reviews__annotation-inner';
    annotationInner.innerHTML = `<p>${annotationShortText}</p>`;

    // Кнопка
    const annotationToggle = document.createElement('button');
    annotationToggle.type = 'button';
    annotationToggle.className = 'reviews__annotation-toggle';

    let annotationIsOpen = false;

    const annotationSetButton = () => {
        annotationToggle.textContent = annotationIsOpen
            ? 'Show less'
            : 'Learn more';
    };

    const annotationSetMaxHeight = () => {
        annotationInner.style.maxHeight =
            annotationInner.scrollHeight + 'px';
    };

    const annotationOpen = () => {
        annotationInner.innerHTML = annotationFullHTML;

        annotationInner.style.maxHeight = '0px';
        annotationInner.getBoundingClientRect(); // reflow
        annotationSetMaxHeight();
    };

    const annotationClose = () => {
        if (annotationInner.style.maxHeight === 'none') {
            annotationInner.style.maxHeight =
                annotationInner.scrollHeight + 'px';
            annotationInner.getBoundingClientRect();
        }

        annotationInner.innerHTML = `<p>${annotationShortText}</p>`;
        annotationSetMaxHeight();
    };

    annotationInner.addEventListener('transitionend', (e) => {
        if (e.propertyName !== 'max-height') return;
        if (annotationIsOpen) {
            annotationInner.style.maxHeight = 'none';
        }
    });

    annotationToggle.addEventListener('click', () => {
        annotationIsOpen = !annotationIsOpen;
        annotationSetButton();
        annotationIsOpen ? annotationOpen() : annotationClose();
    });

    // Монтаж
    annotationRoot.innerHTML = '';
    annotationRoot.appendChild(annotationInner);
    annotationRoot.appendChild(annotationToggle);

    // Init
    annotationSetButton();
    annotationSetMaxHeight();

    // Resize safety
    const annotationRO = new ResizeObserver(() => {
        if (!annotationIsOpen) {
            annotationSetMaxHeight();
        }
    });
    annotationRO.observe(annotationRoot);

/*Health optimization scroll*/
    const hoViewport = document.querySelector('.health-optimization__list');
    if (!hoViewport) return;

    const hoTrack = hoViewport.querySelector('.health-optimization__track');
    if (!hoTrack) return;

    const hoMOBILE_BP = 1023;

// position
    let hoX = 0;
    let hoDir = 1;            // 1 → forward, -1 → back (mobile)
    let hoRafId = null;       // mobile RAF
    let hoMode = null;        // 'mobile' | 'desktop'

// smooth wheel (desktop)
    let hoTargetX = 0;
    let hoEaseRafId = null;
    const hoEASE = 0.12;      // 0.08..0.18 (bigger = faster)
    const ho_WHEEL_SENS = 0.9; // wheel sensitivity

    const hoIsMobile = () => window.innerWidth <= hoMOBILE_BP;

    const hoMaxScroll = () => {
        const vw = hoViewport.clientWidth;
        const tw = hoTrack.scrollWidth;
        return Math.max(0, tw - vw);
    };

    const hoClamp = (val, min, max) => Math.max(min, Math.min(val, max));

    const hoSetX = (val) => {
        hoX = val;
        hoTrack.style.transform = `translate3d(${-hoX}px, 0, 0)`;
    };

    /* ===== MOBILE: pendulum auto scroll ===== */
    const hoStartAuto = () => {
        hoStopAuto();

        const hoSpeed = 0.35; // 👈 speed

        const hoTick = () => {
            const max = hoMaxScroll();
            if (max <= 0) {
                hoRafId = requestAnimationFrame(hoTick);
                return;
            }

            hoX += hoSpeed * hoDir;

            if (hoX >= max) {
                hoX = max;
                hoDir = -1;
            } else if (hoX <= 0) {
                hoX = 0;
                hoDir = 1;
            }

            hoSetX(hoX);
            hoRafId = requestAnimationFrame(hoTick);
        };

        hoRafId = requestAnimationFrame(hoTick);
    };

    const hoStopAuto = () => {
        if (hoRafId) cancelAnimationFrame(hoRafId);
        hoRafId = null;
    };

    /* ===== DESKTOP: wheel scroll (smooth inertia) ===== */
    let hoPointerX = null;
    let hoPointerY = null;

    window.addEventListener(
        'mousemove',
        (ev) => {
            hoPointerX = ev.clientX;
            hoPointerY = ev.clientY;
        },
        { passive: true }
    );

    const hoIsPointerOverViewport = () => {
        if (hoPointerX === null || hoPointerY === null) return false;
        const el = document.elementFromPoint(hoPointerX, hoPointerY);
        return !!el && hoViewport.contains(el);
    };

    const hoStopEase = () => {
        if (hoEaseRafId) cancelAnimationFrame(hoEaseRafId);
        hoEaseRafId = null;
    };

    const hoStartEase = () => {
        if (hoEaseRafId) return;

        const step = () => {
            const max = hoMaxScroll();

            hoTargetX = hoClamp(hoTargetX, 0, max);

            const diff = hoTargetX - hoX;

            if (Math.abs(diff) < 0.25) {
                hoSetX(hoTargetX);
                hoEaseRafId = null;
                return;
            }

            hoSetX(hoX + diff * hoEASE);
            hoEaseRafId = requestAnimationFrame(step);
        };

        hoEaseRafId = requestAnimationFrame(step);
    };

    const hoOnWheel = (e) => {
        if (hoMode !== 'desktop') return;

        // ✅ only when pointer is really over the section (no hover bug)
        if (!hoIsPointerOverViewport()) return;

        const max = hoMaxScroll();
        if (max <= 0) return;

        const delta = e.deltaY;

        // if already at edges and trying to go further → let page scroll
        const atStart = hoTargetX <= 0 && delta < 0;
        const atEnd = hoTargetX >= max && delta > 0;
        if (atStart || atEnd) return;

        e.preventDefault();

        hoTargetX += delta * ho_WHEEL_SENS;
        hoTargetX = hoClamp(hoTargetX, 0, max);

        hoStartEase();
    };

    /* ===== MODE SWITCH ===== */
    const hoApplyMode = () => {
        const nextMode = hoIsMobile() ? 'mobile' : 'desktop';
        if (nextMode === hoMode) return;

        hoMode = nextMode;

        // stop everything
        hoStopAuto();
        hoStopEase();

        // reset position
        const max = hoMaxScroll();
        hoX = 0;
        hoTargetX = 0;
        hoDir = 1;
        hoSetX(0);

        if (hoMode === 'mobile') {
            window.removeEventListener('wheel', hoOnWheel);
            hoStartAuto();
        } else {
            window.addEventListener('wheel', hoOnWheel, { passive: false });
            // ensure clamped on desktop
            hoSetX(hoClamp(hoX, 0, max));
        }
    };

    hoApplyMode();

    window.addEventListener('resize', () => {
        hoApplyMode();

        // clamp current values after resize
        const max = hoMaxScroll();
        hoX = hoClamp(hoX, 0, max);
        hoTargetX = hoClamp(hoTargetX, 0, max);
        hoSetX(hoX);
    });
});

document.querySelectorAll('.reviews__annotation[data-words]').length
