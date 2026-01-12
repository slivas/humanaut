document.addEventListener('DOMContentLoaded', () => {
  /*Mobile settings*/
  const MOBILE_BREAKPOINT = 1023;
  const isMobile = () => window.innerWidth <= MOBILE_BREAKPOINT;

  /*Implementation modal*/

  const triggers = document.querySelectorAll('.modal-trigger');

  const closeAllModals = (exceptModal = null) => {
    document.querySelectorAll('.modal.is-open').forEach((modal) => {
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

  triggers.forEach((trigger) => {
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

    if (!content.contains(e.target) && !e.target.closest('.modal-trigger')) {
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

  const MAX_ITEMS = 5;
  let currentIndex = 1;
  let isSticky = false;
  let wheelAccum = 0;
  let canChangeSlide = true; // Cooldown flag
  const WHEEL_THRESHOLD = 30; // Lower threshold for more responsive slide changes
  const SLIDE_COOLDOWN_MS = 200; // Cooldown after slide change

  // Get current slide index
  const getActiveIndex = () => {
    const m = inner.className.match(/item-(\d+)-active/);
    return m ? parseInt(m[1], 10) : 1;
  };

  // Update slide
  const setActiveIndex = (index) => {
    currentIndex = Math.max(1, Math.min(index, MAX_ITEMS));

    for (let i = 1; i <= MAX_ITEMS; i++) {
      inner.classList.remove(`item-${i}-active`);
    }
    inner.classList.add(`item-${currentIndex}-active`);

    if (itemNumEl) itemNumEl.textContent = String(currentIndex).padStart(2, '0');
    if (btnPrev) btnPrev.disabled = currentIndex === 1;
    if (btnNext) btnNext.disabled = currentIndex === MAX_ITEMS;

    // On last slide, remove sticky to allow scrolling past
    if (currentIndex === MAX_ITEMS) {
      section.classList.add('allow-scroll-past');
    } else {
      section.classList.remove('allow-scroll-past');
    }
  };

  // Change slide
  const changeSlide = (dir) => {
    if (!canChangeSlide) return false; // Block if in cooldown

    const newIndex = currentIndex + dir;
    if (newIndex >= 1 && newIndex <= MAX_ITEMS) {
      setActiveIndex(newIndex);

      // Start cooldown
      canChangeSlide = false;
      setTimeout(() => {
        canChangeSlide = true;
      }, SLIDE_COOLDOWN_MS);

      return true;
    }
    return false;
  };

  // Buttons
  btnNext?.addEventListener('click', () => changeSlide(+1));
  btnPrev?.addEventListener('click', () => changeSlide(-1));

  // Mobile swipe
  let touchStartX = 0;
  section.addEventListener(
    'touchstart',
    (e) => {
      if (!isMobile()) return;
      touchStartX = e.touches[0].clientX;
    },
    { passive: true },
  );

  section.addEventListener(
    'touchend',
    (e) => {
      if (!isMobile()) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) {
        changeSlide(dx < 0 ? +1 : -1);
      }
    },
    { passive: true },
  );

  // IntersectionObserver: detect when section is at top (sticky)
  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      const rect = entry.boundingClientRect;
      // Update currentIndex from DOM
      currentIndex = getActiveIndex();
      // Section is sticky when at top (for both forward and backward navigation)
      isSticky = rect.top <= 5 && rect.top >= -5;
    },
    {
      threshold: 0,
      rootMargin: '0px',
    },
  );
  observer.observe(section);

  // Wheel handler: simple and clean
  const handleWheel = (e) => {
    if (isMobile()) return;

    const rect = section.getBoundingClientRect();
    // More lenient detection for backwards scrolling - check if section is near top
    const isAtTop = rect.top <= 10 && rect.top >= -10;
    const isNearTop = rect.top <= 50 && rect.top >= -50; // Wider range for catching

    // Update currentIndex
    currentIndex = getActiveIndex();

    // Update isSticky based on current position
    isSticky = isAtTop;

    // Check if we should handle this (section is sticky and at top)
    // Forward: allow on slides 1-4 (not on last slide)
    // Backward: allow on slides 2-5 (not on first slide)
    const isForward = e.deltaY > 0;
    const isBackward = e.deltaY < 0;
    const canGoForward = currentIndex < MAX_ITEMS;
    const canGoBackward = currentIndex > 1;

    // For backwards scrolling, if section is near top, snap it to top first
    if (isBackward && canGoBackward && isNearTop && !isAtTop) {
      // Snap section to top when scrolling backwards
      const scrollY = window.scrollY;
      const targetY = scrollY + rect.top;
      window.scrollTo({ top: targetY, behavior: 'auto' });
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // Always prevent scroll when section is at top (to keep it locked)
    // Only allow normal scroll on boundaries:
    // - First slide scrolling up (allow normal scroll)
    // - Last slide scrolling down (allow normal scroll)
    const shouldPreventScroll =
      isAtTop && !((currentIndex === 1 && isBackward) || (currentIndex === MAX_ITEMS && isForward));

    if (shouldPreventScroll) {
      // Prevent page scroll to keep section locked
      e.preventDefault();
      e.stopPropagation();

      // Check if we can navigate in this direction
      const canNavigate = (isForward && canGoForward) || (isBackward && canGoBackward);

      if (canNavigate) {
        // If in cooldown, don't accumulate or change slides
        if (!canChangeSlide) {
          wheelAccum = 0; // Reset accumulation during cooldown
          return;
        }

        // Accumulate wheel delta
        wheelAccum += e.deltaY;

        // Change slide when threshold reached
        if (wheelAccum >= WHEEL_THRESHOLD) {
          // Forward (scroll down)
          if (changeSlide(+1)) {
            wheelAccum = 0;
          } else {
            wheelAccum = 0; // Reset if at boundary
          }
        } else if (wheelAccum <= -WHEEL_THRESHOLD) {
          // Backward (scroll up)
          if (changeSlide(-1)) {
            wheelAccum = 0;
          } else {
            wheelAccum = 0; // Reset if at boundary
          }
        }
      } else {
        // Can't navigate in this direction, but still prevent scroll to keep locked
        wheelAccum = 0; // Reset accumulation
      }
    }
  };

  // Also prevent scroll events when sticky
  const handleScroll = (e) => {
    if (isMobile()) return;

    const rect = section.getBoundingClientRect();
    const isAtTop = rect.top <= 5 && rect.top >= -5;
    const isNearTop = rect.top <= 50 && rect.top >= -50;
    currentIndex = getActiveIndex();

    // Update isSticky
    isSticky = isAtTop;

    // If section is near top but not exactly at top, snap it to top
    // This helps catch backwards scrolling
    if (isNearTop && !isAtTop && currentIndex > 1) {
      const scrollY = window.scrollY;
      const targetY = scrollY + rect.top;
      window.scrollTo({ top: targetY, behavior: 'auto' });
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // Prevent scroll when sticky and at top (for both forward and backward)
    // Only allow scroll past on boundaries
    if (isSticky && isAtTop) {
      // On last slide scrolling down, allow scrolling past
      if (currentIndex === MAX_ITEMS) {
        return; // Allow normal scroll
      }

      // On first slide, we'll allow scroll past in wheel handler
      // But here we keep it locked
      e.preventDefault();
      e.stopPropagation();
      // Restore scroll position to keep section at top
      const scrollY = window.scrollY;
      const targetY = scrollY + rect.top;
      if (Math.abs(rect.top) > 1) {
        window.scrollTo({ top: targetY, behavior: 'auto' });
      }
    }
  };

  window.addEventListener('wheel', handleWheel, { passive: false });
  window.addEventListener('scroll', handleScroll, { passive: false });

  // Initialize
  setActiveIndex(getActiveIndex());

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
    getItems().forEach((li) => li.classList.remove('is-active', 'is-left', 'is-right'));
  }

  function applyMobileState() {
    resetDesktopClasses();

    getItems().forEach((li) => {
      const desc = li.querySelector('.about__list-item--description');
      const btn = li.querySelector('.about__list-item--btn');
      if (!desc || !btn) return;

      btn.style.display = 'inline-block';

      const isOpen = btn.classList.contains('is-open');
      isOpen ? openDesc(desc) : closeDesc(desc);

      btn.textContent = isOpen ? 'Read less' : 'Read more';
    });
  }

  function applyDesktopState() {
    getItems().forEach((li) => {
      const desc = li.querySelector('.about__list-item--description');
      const btn = li.querySelector('.about__list-item--btn');

      if (desc) resetDesktop(desc);

      if (btn) {
        btn.style.display = 'none';
        btn.classList.remove('is-open');
        btn.textContent = '';
      }
    });

    resetDesktopClasses();

    // ✅ повертаємо початковий порядок при переході на десктоп
    initialOrder.forEach((el) => list.appendChild(el));
  }

  // ===== FLIP =====
  function flipAnimate(container, mutate, duration = 520) {
    const els = Array.from(container.children);

    const first = new Map(els.map((el) => [el, el.getBoundingClientRect()]));

    mutate();

    container.getBoundingClientRect(); // force layout

    const last = new Map(els.map((el) => [el, el.getBoundingClientRect()]));

    els.forEach((el) => {
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
      els.forEach((el) => {
        if (el.style.transform) {
          el.style.transition = `transform ${duration}ms ease`;
          el.style.transform = '';
        }
      });
    });

    setTimeout(() => {
      els.forEach((el) => {
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

    const itemsBefore = getItems(); // DOM порядок ДО змін
    const activeIndex = itemsBefore.indexOf(activeItem);
    const wasActive = activeItem.classList.contains('is-active');

    // toggle OFF: повертаємо порядок + знімаємо класи (плавно через FLIP)
    if (wasActive) {
      flipAnimate(
        list,
        () => {
          resetDesktopClasses();
          initialOrder.forEach((el) => list.appendChild(el));
        },
        520,
      );
      return;
    }

    // toggle ON: активний стає першим, інші роз'їжджаються
    flipAnimate(
      list,
      () => {
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
      },
      520,
    );
  });

  // ===== transitionend тільки для мобільного опису =====
  getItems().forEach((li) => {
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
    imgs.map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise((res) => {
            img.addEventListener('load', res, { once: true });
            img.addEventListener('error', res, { once: true });
          }),
    ),
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
  document.querySelectorAll('.tabs').forEach((tabs) => {
    const section = tabs.closest('.how-it-works'); // 👈 секція з фоном
    const buttons = [...tabs.querySelectorAll('[data-tab]')];
    const panels = [...tabs.querySelectorAll('[data-tab-target]')];

    if (!buttons.length || !panels.length) return;

    const interval = parseInt(tabs.dataset.interval, 10) || 4000;

    const order = buttons.map((btn) => btn.dataset.tab);

    let currentIndex = Math.max(
      0,
      buttons.findIndex((btn) => btn.classList.contains('is-active')),
    );
    if (currentIndex === -1) currentIndex = 0;

    let timer = null;

    const setBackgroundClass = (name) => {
      if (!section) return;

      // прибираємо всі попередні how-it-works--*
      section.className = section.className
        .split(' ')
        .filter((cls) => !cls.startsWith('how-it-works--'))
        .join(' ');

      // додаємо новий
      section.classList.add(`how-it-works--${name}`);
    };

    const activateByName = (name) => {
      buttons.forEach((btn) => btn.classList.toggle('is-active', btn.dataset.tab === name));

      panels.forEach((panel) =>
        panel.classList.toggle('is-active', panel.dataset.tabTarget === name),
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
    buttons.forEach((btn) => {
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
      MAX_OFFSET_PX = 280; // можеш збільшити до 160
    } else {
      // 📱 MOBILE
      MAX_OFFSET_PX = 150; // або 0, якщо не хочеш паралакс на мобілці
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

  function open(panel, item) {
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

  function close(panel, item) {
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

    accordion.querySelectorAll('.acc-item.is-open').forEach((other) => {
      const otherPanel = other.querySelector('.acc-panel');
      if (other !== item) close(otherPanel, other);
    });

    if (!isOpen) {
      open(panel, item);
    } else {
      close(panel, item);
    }
  });

  document
    .querySelectorAll('.acc-item.is-open .acc-panel')
    .forEach((p) => (p.style.height = 'auto'));

  /*Reviews read more*/
  const blocks = document.querySelectorAll('.reviews__list-text[data-words]');

  blocks.forEach((block) => {
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
  const annotationFullText = annotationRoot.textContent.trim().replace(/\s+/g, ' ');

  const annotationWords = annotationFullText.split(' ');
  if (annotationWords.length <= annotationLimit) return;

  const annotationShortText = annotationWords.slice(0, annotationLimit).join(' ') + '…';

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
    annotationToggle.textContent = annotationIsOpen ? 'Show less' : 'Learn more';
  };

  const annotationSetMaxHeight = () => {
    annotationInner.style.maxHeight = annotationInner.scrollHeight + 'px';
  };

  const annotationOpen = () => {
    annotationInner.innerHTML = annotationFullHTML;

    annotationInner.style.maxHeight = '0px';
    annotationInner.getBoundingClientRect(); // reflow
    annotationSetMaxHeight();
  };

  const annotationClose = () => {
    if (annotationInner.style.maxHeight === 'none') {
      annotationInner.style.maxHeight = annotationInner.scrollHeight + 'px';
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
  let hoDir = 1; // 1 → forward, -1 → back (mobile)
  let hoRafId = null; // mobile RAF
  let hoMode = null; // 'mobile' | 'desktop'

  // smooth wheel (desktop)
  let hoTargetX = 0;
  let hoEaseRafId = null;
  const hoEASE = 0.12; // 0.08..0.18 (bigger = faster)
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
    { passive: true },
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

document.querySelectorAll('.reviews__annotation[data-words]').length;
