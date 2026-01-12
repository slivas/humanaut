const header = $('.header');
const menu = $('#menu');
const moda_bcg = $('#modal-bcg');
const info_modal = $('.info-modal');
const project_map_btn = $('.project-map__nav .tab-btn');
const project_pan_btn = $('.project-plan__tab-wrap .tab-btn');
const project_pan_img = $('.project-plan__img');
const gallery_slider = $('.gallery_slider');

// Header state start
if (!header.hasClass('static')) {
  $(document).on('scroll', function () {
    const scroll_position = window.scrollY;
    if (scroll_position > 250) {
      header_state(true);
    }

    if (scroll_position <= 20) {
      header_state(false);
    }
  });

  function header_state(state) {
    if (state) {
      header.addClass('collapse');
    } else {
      header.removeClass('collapse');
    }
  }
}
// Header state end

// Home page - main slider start

const state_slider = new Swiper('.state-slider', {
  pagination: {
    el: '.project-state-slider .swiper-pagination',
    type: 'fraction',
    allowTouchMove: false,

    renderFraction: function (currentClass, totalClass, swiper) {
      return (
        '<div class="my-current-class ' +
        currentClass +
        '"></div>' +
        '<div class="progress-bar-wrap"><div class="progress-bar"></div></div>' +
        '<div class="my-total-class ' +
        totalClass +
        '"></div>'
      );
    },
  },
  navigation: {
    nextEl: '.swiper-next',
    prevEl: '.swiper-prev',
  },
  effect: 'fade',
  speed: 1500,
  on: {
    init: function () {
      // const progressBarWidth = (this.activeIndex + 1) / this.slides.length * 100;
      // document.querySelector('.project-state-slider .progress-bar').style.width = progressBarWidth + '%';
      change_slider_number_style('.project-state-slider');
    },
    slideChange: function () {
      // const progressBarWidth = (this.activeIndex + 1) / this.slides.length * 100;
      // document.querySelector('.project-state-slider .progress-bar').style.width = progressBarWidth + '%';
      change_slider_number_style('.project-state-slider');
    },
  },
  autoplay: {
    delay: 10000,
    disableOnInteraction: false,
  },
});

const descrtiption_slider = new Swiper('.description-slider', {
  pagination: {
    el: '.project-description .swiper-pagination',
    type: 'fraction',

    renderFraction: function (currentClass, totalClass, swiper) {
      return (
        '<div class="my-current-class ' +
        currentClass +
        '"></div>' +
        '<div class="progress-bar-wrap"><div class="progress-bar"></div></div>' +
        '<div class="my-total-class ' +
        totalClass +
        '"></div>'
      );
    },
  },
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
  effect: 'fade',
  speed: 1500,
  on: {
    init: function () {
      // const progressBarWidth = (this.activeIndex + 1) / this.slides.length * 100;
      // document.querySelector('.project-description.big-slider .progress-bar').style.width = progressBarWidth + '%';
      change_slider_number_style('.project-description');
    },
    slideChange: function () {
      // const progressBarWidth = (this.activeIndex + 1) / this.slides.length * 100;
      // document.querySelector('.project-description .progress-bar').style.width = progressBarWidth + '%';
      change_slider_number_style('.project-description');
    },
  },
  // autoplay: {
  //   // delay: 10000,
  //   disableOnInteraction: false,
  // },
});

function change_slider_number_style(element) {
  const total_block = $(`${element} .my-total-class`);
  const current_block = $(`${element} .my-current-class`);
  const total_slide = '0' + total_block.html();
  const current_slide = '0' + current_block.html();

  total_block.html(total_slide);
  current_block.html(current_slide);
}

let timeout1, timeout2;

// Home page - main slider end

// Home photo slider start
const photoSlider = new Swiper('.photoSlider', {
  slidesPerView: 'auto',
  spaceBetween: 30,

  breakpoints: {
    320: {
      slidesPerView: 1.2,
    },
    750: {
      slidesPerView: 'auto',
    },
  },
});
// Home photo slider end

//Header Menu start
$('.header__menu').on('click', function () {
  menu.addClass('active');
  moda_bcg.addClass('active');
  moda_bcg.attr('data-modal', 'menu');
});

$('.menu__close-btn').on('click', function () {
  closeMenu();
});

$('.info-modal__close-btn').on('click', function () {
  closeInfoModal();
});

function closeMenu() {
  menu.addClass('hide');

  setTimeout(() => {
    menu.removeClass('active hide');
    moda_bcg.removeClass('active');
  }, 700);
}

function closeMap() {
  $('.projects-map').fadeOut();
  moda_bcg.removeClass('active');
}

function closeInfoModal() {
  info_modal.fadeOut();

  setTimeout(() => {
    moda_bcg.hide();
  }, 500);
}

moda_bcg.on('click', function () {
  const modal_window = $(this).data('modal');
  if (modal_window === 'menu') {
    closeMenu();
  }

  if (modal_window === 'info-modal') {
    closeInfoModal();
  }

  if (modal_window === 'slider') {
    closeSlider();
  }

  if (modal_window == 'map') {
    closeMap();
  }

  $('.detail-contact-modal').fadeOut();
  moda_bcg.fadeOut();
});

$('.gallery_slider__close').on('click', function () {
  closeSlider();
});

$('.projects-map__close').on('click', function () {
  closeMap();
});

$('.mySwiperZoom .swiper-slide').on('click', function (e) {
  if (e.target.classList.contains('swiper-slide-active')) {
    closeSlider();
  }
});

function closeSlider() {
  gallery_slider.css('opacity', 0);
  $('gallery_slider__close').css('opacity', 0);

  setTimeout(() => {
    gallery_slider.hide();
    moda_bcg.fadeOut();
    moda_bcg.removeClass('active');
    $('.gallery_slider img').css({
      backgroundColor: 'transparent',
    });
  }, 700);
}

if (window.location.pathname == '/') {
  $('.menu__link:nth-child(1)').hide();
}

$('.menu__link').on('click', function () {
  closeMenu();
});

$('.home-contact__label input').on({
  focus: function () {
    $(this).addClass('focus').removeClass('error error-phone');
  },
  blur: function () {
    if ($(this).val().length == 0 || $(this).val().includes('+380(__)___-__-__')) {
      $(this).removeClass('focus');
    }
  },
});

$('form.ajax').submit(function (e) {
  e.preventDefault();
  const form = $(this);
  const url = form.attr('action');
  const name = form.find('input[name=name]');

  const phone = form.find('input[name=phone]');
  const phonePattern = /^\+380\(\d{2}\)\d{3}-\d{2}-\d{2}$/;

  if (name.val().length < 2) {
    name.addClass('error');
  }

  if (!phonePattern.test(phone.value)) {
    if (phone.val().includes('+380(')) {
      phone.addClass('error');
    } else {
      phone.addClass('error-phone');
    }
  }

  if (url && name.val().length >= 2 && phonePattern.test(phone.val())) {
    $.ajax({
      type: 'POST',
      url: url,
      data: form.serialize(),

      success: function (res) {
        console.log(res);

        info_modal.find('.info-modal__text').html(res.success);
        info_modal.fadeIn();
        moda_bcg.show().attr('data-modal', 'info-modal');
        form.find('input').removeClass('focus error error-phone');
        $('.detail-contact-modal').hide();
      },
      error: function (err) {
        console.log(err);

        e.preventDefault();
        $('#ajaxFormResult p').html(
          'Помилка! Спробуйте ще раз або зателефонуйте за номером на сайті',
        );
        $('#ajaxFormResult').addClass('show');
      },
    });
    return false;
  }
});

//project tab-btn start
project_map_btn.on('click', function () {
  project_map_btn.removeClass('active');
  $(this).addClass('active');
  $('.project-map__img').stop().fadeOut();
  $(`.project-map__${$(this).attr('id')}`)
    .stop()
    .fadeIn();
});
//project tab-btn end

$(project_pan_btn).on('click', function () {
  project_pan_btn.removeClass('active');
  $(this).addClass('active');

  project_pan_img.stop().fadeOut();
  $(`.${$(this).attr('id')}`)
    .stop()
    .fadeIn();
});

// animation for detal page start
let observer = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  },
  {
    threshold: 0.5,
  },
);

// Вибір цільового елемента
let targetElement = document.querySelector('.project-calendar__wrap');
if (targetElement) {
  observer.observe(targetElement);
}

const observer_calendar = new IntersectionObserver((entry) => {
  if (entry.isIntersecting) {
    entry.target.classList.add('active');
  }
});

const calendar_wrap = document.querySelector('.project-calendar__wrap');
if (calendar_wrap !== null) {
  observer.observe(calendar_wrap);
}

let home_main_slider = null;

if (window.location.pathname == '/' || window.location.pathname === '/en') {
  if (window.innerWidth <= 750) {
    $('.big-slider__info').append($('.big-slider__button'));

    $('.home-project__wrap').after($('.home-project__header .orange-btn'));
  }

  function startPage() {
    init_home_main_slider();
    $('.home-main-start-section').hide();
    $('body').removeClass('no-scroll');
  }
}

function getOS() {
  let userAgent = window.navigator.userAgent;
  let platform = window.navigator.platform;
  let macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
  let windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
  let iosPlatforms = ['iPhone', 'iPad', 'iPod'];
  let os = null;

  if (macosPlatforms.includes(platform)) {
    os = 'macOS';
    return '#2e3f50';
  } else if (iosPlatforms.includes(platform)) {
    os = 'iOS';
  } else if (windowsPlatforms.includes(platform)) {
    os = 'Windows';
    return '#243747';
  } else if (/Android/.test(userAgent)) {
    os = 'Android';
  } else if (!os && /Linux/.test(platform)) {
    os = 'Linux';
  }
}

// loader start

$(document).ready(function () {
  if (document.cookie.indexOf('first_visit=') === -1) {
    console.log(getOS());
    console.log($('.kredo-loader'));

    $('.kredo-loader').css('background-color', `${getOS()}`);
    setTimeout(() => {
      $('.kredo-loader').fadeOut();
    }, 4700);

    setTimeout(() => {
      startPage();
      const d = new Date();
      d.setTime(d.getTime() + 30 * 24 * 60 * 60 * 1000);
      const expires = 'expires=' + d.toUTCString();
      document.cookie = 'first_visit=1;' + expires + ';path=/';

      header.addClass('animation');
    }, 5000);
  } else {
    if (window.location.pathname === '/' || window.location.pathname === '/en') {
      init_home_main_slider();
    }
    $('.home-main-start-section, .kredo-loader').hide();
    $('body').removeClass('no-scroll');
    setTimeout(() => {
      header.addClass('animation');
    }, 500);
  }
});

// loader end

function init_home_main_slider() {
  if (home_main_slider == null) {
    home_main_slider = new Swiper('.home-main-slider', {
      pagination: {
        el: '.big-slider__pagination .swiper-pagination',
        type: 'fraction',

        renderFraction: function (currentClass, totalClass, swiper) {
          return (
            '<div class="my-current-class ' +
            currentClass +
            '"></div>' +
            '<div class="progress-bar-wrap"><div class="progress-bar"></div></div>' +
            '<div class="my-total-class ' +
            totalClass +
            '"></div>'
          );
        },
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      effect: 'fade',
      speed: 1500,
      loop: true,
      touch: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
      },
      simulateTouch: true, // Додайте цю опцію
      touchRatio: 1,
      touchAngle: 45,
      on: {
        init: function () {
          // const progressBarWidth = (this.activeIndex + 1) / this.slides.length * 100;
          // document.querySelector('.progress-bar').style.width = progressBarWidth + '%';
          change_slider_number_style('.home-main');
        },
        slideChange: function () {
          // const progressBarWidth = (this.activeIndex + 1) / this.slides.length * 100;
          // document.querySelector('.progress-bar').style.width = progressBarWidth + '%';
          change_slider_number_style('.home-main');
        },
      },
    });
  }
}

let detal_main_slider = '';

function init_detal_main_slider() {
  detal_main_slider = new Swiper('.project-detail-swiper', {
    pagination: {
      el: '.project-detail__main  .swiper-pagination',
      type: 'fraction',

      renderFraction: function (currentClass, totalClass, swiper) {
        return (
          '<div class="my-current-class ' +
          currentClass +
          '"></div>' +
          '<div class="progress-bar-wrap"><div class="progress-bar"></div></div>' +
          '<div class="my-total-class ' +
          totalClass +
          '"></div>'
        );
      },
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    effect: 'fade',
    speed: 1500,
    loop: true,
    touch: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    simulateTouch: true, // Додайте цю опцію
    touchRatio: 1,
    touchAngle: 45,
    on: {
      init: function () {
        // const progressBarWidth = (this.activeIndex + 1) / this.slides.length * 100;
        // document.querySelector('.progress-bar').style.width = progressBarWidth + '%';
        change_slider_number_style('.project-detail__main');
      },
      slideChange: function () {
        // const progressBarWidth = (this.activeIndex + 1) / this.slides.length * 100;
        // document.querySelector('.progress-bar').style.width = progressBarWidth + '%';
        change_slider_number_style('.project-detail__main ');
      },
    },
  });
}

// animation for detal page end

var mySwiperZoom = new Swiper('.mySwiperZoom', {
  navigation: {
    nextEl: '.swiper-prev',
    prevEl: '.swiper-next',
  },
  pagination: {
    el: '.mySwiperZoom .swiper-pagination',
  },
  slidesPerView: 'auto',
  spaceBetween: 20,
});

$('.photoSlider .swiper-slide, .new-detal__img-wrap img').on('click', function () {
  const viewportOffset = this.getBoundingClientRect();
  const top = viewportOffset.top;
  const left = viewportOffset.left;
  const width_padding = window.innerWidth <= 750 ? 30 : 90;
  const window_width = window.innerWidth;
  const slider_width = window_width <= 750 ? window_width - 30 : window_width - 90;
  const scroll_bar_width = window_width <= 750 ? 0 : 16;

  gallery_slider.css({
    left: `${left}px`,
    top: `${top}px`,
    width: `${this.clientWidth}`,
    height: `${this.clientHeight}`,
    display: `block`,
  });
  const element_index =
    $(this).parents('.grid-item').length == 0
      ? $(this).index()
      : $(this).parents('.grid-item').index();

  mySwiperZoom.slideTo(element_index);

  setTimeout(() => {
    gallery_slider.css('opacity', `1`);
  }, 100);

  setTimeout(() => {
    gallery_slider.css({
      left: `${(window.innerWidth - slider_width - scroll_bar_width) / 2}px`,
      top: '40px',
      width: `${slider_width}px`,
      height: '80vh',
      marginTop: '6vh',
    });
  }, 300);

  setTimeout(() => {
    moda_bcg.show().addClass('active').attr('data-modal', 'slider');
    $('.gallery_slider__close').css('opacity', 1);
  }, 1000);
});

var newsSlider = new Swiper('.newsSlider', {
  slidesPerView: 1,
  spaceBetween: 10,
  breakpoints: {
    340: {
      slidesPerView: 1.2,
      spaceBetween: 12,
    },
    750: {
      slidesPerView: 3,
      spaceBetween: 20,
    },
  },
});

$('.swiper.home-main-slider, .state-slider, .project-detail__main').mousemove(function (e) {
  if (e.currentTarget.classList.contains('single')) {
    return;
  }
  const left_coordinates = 150;
  const right_coordinates = window.innerWidth - left_coordinates;

  if (e.pageX < right_coordinates && e.pageX > left_coordinates) {
    $('body').removeClass('cursor-left cursor-right');
  }

  if (e.pageX > right_coordinates) {
    $('body').removeClass('cursor-left').addClass('cursor-right');
  }

  if (e.pageX < left_coordinates) {
    $('body').removeClass('cursor-right').addClass('cursor-left');
  }
});

$('.swiper.home-main-slider, .state-slider, .project-detail__main').mouseleave(function () {
  $('body').removeClass('cursor-left cursor-right');
});

function newsSliderChangeNumber(element) {
  const total_block = $(`${element} .my-total-class`);
  const current_block = $(`${element} .my-current-class`);

  const total_slide = total_block.html();
  const current_slide = current_block.html();
  total_block.html(total_slide);
  current_block.html(current_slide);
}

var newsSwiper = new Swiper('.newsSwiper', {
  slidesPerView: 1.8,
  spaceBetween: 6,
  pagination: {
    el: '.news-main .swiper-pagination',
    type: 'fraction',
    allowTouchMove: false,

    renderFraction: function (currentClass, totalClass, swiper) {
      return (
        '<div class="pag-wrap"><span>0</span><div class="my-current-class ' +
        currentClass +
        '"></div></div>' +
        '<div class="progress-bar-wrap"><div class="progress-bar"></div></div>' +
        '<div class="pag-wrap"><span>0</span><div class="my-total-class ' +
        totalClass +
        '"></div></div>'
      );
    },
  },
  navigation: {
    nextEl: '.swiper-next',
    prevEl: '.swiper-prev',
  },

  on: {
    init: function () {
      const progressBarWidth = ((this.activeIndex + 1) / this.slides.length) * 100;
      document.querySelector('.news-main .progress-bar').style.width = progressBarWidth + '%';
      newsSliderChangeNumber('.news-main');
    },
    slideChange: function () {
      const progressBarWidth = ((this.activeIndex + 1) / this.slides.length) * 100;
      document.querySelector('.news-main .progress-bar').style.width = progressBarWidth + '%';
      newsSliderChangeNumber('.news-main');
    },

    transitionEnd: function () {
      if (newsSwiper.isEnd) {
        document.querySelector('.news-main .progress-bar').style.width = '100%';
      }
    },

    setTranslate: function (translate) {
      const progressBarWidth = ((this.activeIndex + 1) / this.slides.length) * 100;
      document.querySelector('.news-main .progress-bar').style.width = progressBarWidth + '%';
    },
  },
  autoplay: {
    delay: 7000,
    disableOnInteraction: false,
  },
});

// project photo animation

function imgAnimation() {
  const scaleAmount = 0.4;
  const $image = $('.home-desctiption__decor-img');
  const rect = $image[0].getBoundingClientRect();
  const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

  if (isVisible) {
    const scrollPosition = $(window).scrollTop();
    const scale = 1 + (scrollPosition * scaleAmount) / 1000;
    $image.css('transform', `scale(${scale})`);
  }
}
// анімація тексту на сайті
// const elements = $('.text-animation');

// const observerOptions = {
//   root: null,
//   rootMargin: '0px',
//   threshold: 0.1
// };

// function observerCallback(entries, observer) {
//   entries.forEach(entry => {
//     if (entry.isIntersecting) {
//       entry.target.classList.add('show-text');
//     } else {
//       entry.target.classList.remove('show-text');
//     }
//   });
// }

// const observerElements = new IntersectionObserver(observerCallback, observerOptions);
// elements.each(function () {
//   observerElements.observe($(this)[0]);
// });

$('.project, .home-news__item, .news__item').on('mousemove', function (e) {
  const { left, top, bottom, width } = $(this)[0].getBoundingClientRect();
  const { clientX, clientY } = e;

  const button = $(this).find('.orange-btn');
  const_text_1 = button.data('text-1');
  const_text_2 = button.data('text-2');
  const new_left_position = clientX - left + 40;
  const new_top_position = clientY - top;
  let side = -10;

  if (clientY > top && clientY < bottom) {
    if (left + width / 2 < clientX && $(this).hasClass('swiper-slide')) {
      side = -180;
    } else {
      side = -10;
    }

    if (e.target.classList.contains('apartment')) {
      button.html(const_text_2);
    } else {
      button.html(const_text_1);
    }

    button.css({
      left: `${new_left_position + side}px`,
      top: `${new_top_position}px`,
    });
  }
});

// $('.news__item').on('mousemove', function (e) {
//   const { left, top, bottom, width } = $(this)[0].getBoundingClientRect();
//   const { clientX, clientY } = e;

//   const button = $(this).find('.orange-btn');
//   const new_left_position = clientX - left + 40;
//   const new_top_position = clientY - top;
//   console.log(clientX);
//   button.css({
//     left: `${clientX}px`,
//     top: `${clientY}px`
//   })
// })

$('.project').hover(
  function () {
    $(this)
      .find('.project__name, .project__status, .project__type, .project__address')
      .stop()
      .css('opacity', 0);
    $(this).find('.project__short-text').stop().css('opacity', 1);
  },
  function () {
    $(this)
      .find('.project__name, .project__status, .project__type, .project__address')
      .stop()
      .css('opacity', 1);
    $(this).find('.project__short-text').stop().css('opacity', 0);
  },
);

$('.show-projects-map').on('click', function () {
  $('.projects-map').fadeIn();
  moda_bcg.addClass('active');
  moda_bcg.attr('data-modal', 'map');
});

$('.swiper.home-main-slider, .project-state-slider, .project-detail__main').on(
  'click touchstart',
  function (e) {
    if (e.currentTarget.classList.contains('single')) {
      return;
    }

    const left_coordinates = 150;
    const right_coordinates = window.innerWidth - left_coordinates;

    if (e.pageX > right_coordinates) {
      if (home_main_slider) {
        home_main_slider.slideNext();
      }

      if (typeof detal_slider !== 'undefined') {
        detal_slider.slideNext();
      }

      if (state_slider && $('.project-state-slider').hasClass('zoom')) {
        state_slider.slideNext();
      }

      if (detal_main_slider) {
        detal_main_slider.slideNext();
      }
    }

    if (e.pageX < left_coordinates) {
      if (home_main_slider) {
        home_main_slider.slidePrev();
      }

      if (detal_main_slider) {
        detal_main_slider.slidePrev();
      }

      if (typeof detal_slider !== 'undefined') {
        detal_slider.slidePrev();
      }

      if (state_slider && $('.project-state-slider').hasClass('zoom')) {
        state_slider.slidePrev();
      }
    }
  },
);

$('.project__apartment').on('click', function (e) {
  e.preventDefault();
  // let apartment_link = $(this).data('link');
  // window.g_widget_open(25481)
  // window.open(apartment_link, '_blank');
});

// main block animation start
const block =
  document.querySelector('.home-description__bcg') || document.querySelector('.news__bcg-wrap');
const img_block = $('.home-description__img-wrap');
const img_block_max_width = img_block.width();
const img_block_min_width = 260;
let img_block_new_width = img_block_max_width;
let img_block_step = 10;

let decor_img_block = $('.home-description__decor');
const decor_img_block_max_width = 250;
const decor_img_block_min_width = decor_img_block.width();
let decor_img_block_new_width = decor_img_block_min_width;
let decor_img_block_step = 4;

let text_block = $('.home-description__text-wrap');

let lastScrollTop = window.scrollY;
let isAnimated = true;
let origin_text = text_block.html();

let bcg_block = $('.home-description__imgs img, .news__bcg-wrap img');
let transform_position_block_1 = 0;
let transform_position_block_2 = 0;
let transform_position_block_3 = 0;
let transform_position_top_block_3 = 0;
let transform_position_block_4 = 0;
let small_logo = $('.home-description__text-logo');

const path = window.location.pathname.replace(/^\/[a-z]{2}(\/|$)/, '/');
const isValidPath = ['/', '/news', '/contacts'].includes(path) && window.innerWidth > 800;

if (isValidPath) {
  document.addEventListener('scroll', function () {
    const block_position = block.getBoundingClientRect().top;
    let scrollTop = window.scrollY;
    if (block_position == 0) {
      if (scrollTop > lastScrollTop) {
        if (transform_position_block_1 >= -600) {
          transform_position_block_1 -= 14;
          transform_position_block_2 -= 12;
          transform_position_block_3 += 7;
          transform_position_top_block_3 += 3;
          $(bcg_block[0]).css('transform', `translate(${transform_position_block_1}px, 0px`);
          $(bcg_block[1]).css('transform', `translate(${transform_position_block_2}px, 0px`);
          $(bcg_block[2]).css(
            'transform',
            `translate(${transform_position_block_3}px, ${-transform_position_top_block_3}px`,
          );
          $(bcg_block[3]).css(
            'transform',
            `translate(${transform_position_block_3}px, ${transform_position_top_block_3}px`,
          );
        }

        if (img_block_new_width >= img_block_min_width) {
          img_block_new_width -= img_block_step;
          img_block.css('width', `${img_block_new_width}px`);
        }

        if (decor_img_block_new_width < decor_img_block_max_width) {
          decor_img_block_new_width += decor_img_block_step;
          decor_img_block.css('width', `${decor_img_block_new_width}px`);
        }
        write_text();

        if (window.innerWidth < 1500) {
          write_text();
        }

        if (decor_img_block_new_width >= decor_img_block_max_width) {
          text_block.css('opacity', '1');
          small_logo.addClass('disactive');
        }
      } else {
        delete_text();

        if (transform_position_block_1 <= 0) {
          transform_position_block_1 += 14;
          transform_position_block_2 += 12;
          transform_position_top_block_3 -= 3;
          transform_position_block_3 -= 7;
          $(bcg_block[0]).css('transform', `translate(${transform_position_block_1}px, 0px`);
          $(bcg_block[1]).css('transform', `translate(${transform_position_block_2}px, 0px`);
          $(bcg_block[2]).css(
            'transform',
            `translate(${transform_position_block_3}px, ${-transform_position_top_block_3}px`,
          );
          $(bcg_block[3]).css(
            'transform',
            `translate(${transform_position_block_3}px, ${transform_position_top_block_3}px`,
          );
        }

        if (img_block_new_width < img_block_max_width) {
          img_block_new_width += img_block_step;
          img_block.css('width', `${img_block_new_width}px`);
        }

        if (decor_img_block_new_width > decor_img_block_min_width) {
          decor_img_block_new_width -= decor_img_block_step;
          decor_img_block.css('width', `${decor_img_block_new_width}px`);
        }
      }
    }

    lastScrollTop = window.scrollY;
  });
}

let text = $('.home-description__text-animation').html();
$('.home-description__text-animation').html('');

let write_index = 0;

if (window.innerWidth <= 800) {
  text_block.find('span').html(text);
}

function write_text() {
  if (write_index < text.length) {
    text_block.find('span').html(text.slice(0, write_index));
    ++write_index;
    text_block.find('span').html(text.slice(0, write_index));
    ++write_index;
  }
}

function delete_text() {
  if (write_index > 0) {
    --write_index;
    text_block.find('span').html(text.slice(0, write_index));
    --write_index;
    text_block.find('span').html(text.slice(0, write_index));
  }

  if (write_index < 20) {
    text_block.css('opacity', '0');
    small_logo.removeClass('disactive');
  }
}

$('.home-drop-down__title.def').on('click', function () {
  let parent = $(this).parents('.home-drop-down__item');
  close_first_block();

  if (parent.hasClass('active')) {
    $(this).parents('.home-drop-down__item').removeClass('active');
    $(this).nextAll('.home-drop-down__item-content').stop().slideUp(500);
    parent.find('.home-drop-down__item-img, .home-drop-down__item-text').css('opacity', '0');
    return;
  }

  $('.home-drop-down__item').removeClass('active');
  $('.home-drop-down__item-content').stop().slideUp();
  $('.img-dif').css('opacity', 0);

  setTimeout(() => {
    $('.img-dif').css('height', 0);
  }, 300);

  parent.addClass('active');
  $(this).nextAll('.home-drop-down__item-content').stop().slideDown(500);
  setTimeout(() => {
    parent.find('.home-drop-down__item-img').css('opacity', '1');
    parent.find('.home-drop-down__item-text').css('opacity', '1');
  }, 500);
});

$('.home-drop-down__title.dif').on('click', function () {
  close_first_block();
  let parent = $(this).parents('.home-drop-down__item');
  let img = parent.find('.home-drop-down__item-img');
  let content = parent.find('.home-drop-down__item-content');
  if (parent.hasClass('active')) {
    img.css('opacity', 0);
    content.hide();
    setTimeout(() => {
      img.css('height', '0');
      parent.removeClass('active');
    }, 300);
    return;
  }
  $('.home-drop-down__item').removeClass('active');
  $('.home-drop-down__item-content').stop().slideUp();
  $('.home-drop-down__item-img, .home-drop-down__item-text').css('opacity', '0');

  parent.addClass('active');
  img.css('height', '400px');

  setTimeout(() => {
    img.css('opacity', '1');
    parent.find('.home-drop-down__item-text').css('opacity', '1');
    content.show();
  }, 600);
});

$('.first-item').on('click', function () {
  if ($(this).hasClass('active-first')) {
    close_first_block();
  } else {
    $('.first-item__title-img-wrap').slideDown();
    $('.first-item__bcg').fadeIn();
    $(this).addClass('active-first');

    $('.home-drop-down__item').removeClass('active');
    $('.home-drop-down__item-content').stop().slideUp();
    $('.img-dif, .home-drop-down__item-text, .home-drop-down__item-img').css('opacity', 0);

    setTimeout(() => {
      $('.img-dif').css('height', 0);
    }, 300);

    setTimeout(() => {
      $('.first-item__title-img').css('opacity', 1);
      $('.first-item__text').fadeIn();
    }, 400);
  }
});

function close_first_block() {
  $('.first-item__text').fadeOut(10);
  $('.first-item__title-img').css('opacity', 0);
  $('.first-item__title-img-wrap').slideUp(400);
  $('.first-item__bcg').fadeOut();
  setTimeout(() => {
    $('.first-item').removeClass('active-first');
  }, 500);
}
//===========bcg animation
// const bcgElement = document.querySelector('.home-project__bcg');
// const bcgObserverOptions = {
//   root: null,
//   rootMargin: '0px',
//   threshold: 0.4
// };

// const observerCallback = (entries, bcgObserver) => {
//   entries.forEach(entry => {
//     if (entry.isIntersecting) {
//       bcgElement.classList.add('active')
//     }
//     else {
//       bcgElement.classList.remove('active')
//     }
//   });
// };

// const bcgObserver = new IntersectionObserver(observerCallback, bcgObserverOptions);
// bcgObserver.observe(bcgElement);
if (window.location.pathname == '/') {
  let color = 255;
  let news_block = $('.home-news');
  let btn_all_projects = $('.home-project__all');
  let projects_block = $('.home-project');
  let color_step = 1.2;
  let last_scroll_position = window.scrollY;

  window.addEventListener('scroll', function () {
    let el_postioion = btn_all_projects[0].getBoundingClientRect().bottom - window.innerHeight;
    let scrollTop = window.scrollY;

    if (scrollTop > last_scroll_position) {
      if (el_postioion < 300) {
        if (color > 210) {
          color -= color_step;
        }
      }
    } else {
      if (el_postioion > -700) {
        if (color < 255) {
          color += color_step;
        }
      }
    }

    last_scroll_position = window.scrollY;
    projects_block.css('background-color', `rgb(${color}, ${color}, ${color})`);
    news_block.css('background-color', `rgb(${color}, ${color}, ${color})`);
  });
}

let body_height = $('body').height() / 2;
window.addEventListener('scroll', function () {
  if (window.scrollY > body_height) {
    $('.arrow-to-top').fadeIn().css('display', 'flex');
  } else {
    $('.arrow-to-top').fadeOut();
  }
});

$('.arrow-to-top').on('click', function () {
  window.scrollTo({
    top: 0,
    behavior: 'smooth', // 'smooth' для плавної прокрутки, 'auto' для миттєвої
  });
});

setTimeout(() => {
  $(document).find('.rngst_phone_icon').click();
}, 20000);
// function onIntersection(entries, observer) {
//   entries.forEach(entry => {
//     if (entry.isIntersecting) {
//       console.log('Entry:', entry);
//       console.log('Is intersecting:', entry.isIntersecting);
//       entry.target.classList.add('animation-title');
//       observer.unobserve(entry.target); // Перестати спостерігати за елементом після додавання класу
//     }
//   });
// }

// const options = {
//   root: null,
//   rootMargin: '200px 0px 0px 0px', // Зміщення viewport
//   threshold: 1
// };

// const observerAnimation = new IntersectionObserver(onIntersection, options);

// const elements = document.querySelectorAll('.home-drop-down__title');
// elements.forEach(element => {
//   observerAnimation.observe(element);
// });
var popapSwiper = new Swiper('.popapSwiper', {
  pagination: {
    el: '.swiper-pagination',
    dynamicBullets: true,
  },
  // loop: true,

  // autoplay: {
  //     delay: 5000,
  // },
});

$('.show-contact-modal, .home-contact__close').on('click', function () {
  $('.detail-contact-modal').fadeToggle();
  $('.modal-bcg').fadeToggle();
});
