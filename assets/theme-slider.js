(() => {
  class ThemeSlider {
    constructor(swiperEl) {
      this.swiperEl = swiperEl;
      this.root = swiperEl.closest('.theme-slider-wrap') || swiperEl.parentElement;
      this.swiper = null;

      this.onRootClick = this.onRootClick.bind(this);
      this.onResize = this.onResize.bind(this);

      this.progressEl = null;
      this.progressBar = null;
      this.hasNextButton = false;
    }

    init() {
      if (!this.swiperEl) return;
      if (!this.swiperEl.hasAttribute('data-theme-slider')) return;
      if (!window.Swiper) return;

      if (this.swiperEl.dataset.sliderInitialized === 'true') return;
      this.swiperEl.dataset.sliderInitialized = 'true';

      this.cacheUI();
      this.createSwiper();
      this.bindUI();
      this.updateAllUI();
    }

    cacheUI() {
      if (!this.root) return;

      this.hasNextButton = !!this.root.querySelector('[data-swiper-next]');

      this.progressEl = this.root.querySelector('[data-swiper-progress]') || null;
      this.progressBar = this.root.querySelector('[data-swiper-progress-bar]') || null;
    }

    bindUI() {
      if (this.root) {
        this.root.addEventListener('click', this.onRootClick);
      }

      window.addEventListener('resize', this.onResize);
    }

    onRootClick(e) {
      const nextBtn = e.target.closest('[data-swiper-next]');
      if (!nextBtn) return;

      e.preventDefault();
      this.onNextClick();
    }

    createSwiper() {
      const allowScroll = !this.hasNextButton;

      this.swiper = new Swiper(this.swiperEl, {
        slidesPerView: 'auto',
        loop: true,

        allowTouchMove: allowScroll,
        simulateTouch: allowScroll,
        grabCursor: allowScroll,

        keyboard: { enabled: allowScroll },
        mousewheel: allowScroll
          ? { enabled: true, forceToAxis: true, releaseOnEdges: false }
          : { enabled: false },

        freeMode: false,

        on: {
          init: () => {
            this.updateAllUI();
          },
          resize: () => {
            this.updateAllUI();
          },
          slideChange: () => {
            this.updateProgress();
          }
        }
      });
    }

    onNextClick() {
      if (!this.swiper) return;
      this.swiper.slideNext();
    }

    onResize() {
      if (!this.swiper) return;
      this.updateAllUI();
    }

    updateAllUI() {
      this.updateNavigationVisibility();
      this.updateProgress();
    }

    getOriginalSlides() {
      const all = Array.from(this.swiperEl.querySelectorAll('.swiper-slide'));
      const originals = all.filter((el) => !el.classList.contains('swiper-slide-duplicate'));
      return originals.length ? originals : all;
    }

    calcOriginalSlidesWidth() {
      const slides = this.getOriginalSlides();
      let total = 0;

      slides.forEach((slide) => {
        const styles = window.getComputedStyle(slide);
        const ml = parseFloat(styles.marginLeft) || 0;
        const mr = parseFloat(styles.marginRight) || 0;
        total += slide.getBoundingClientRect().width + ml + mr;
      });

      return total;
    }

    updateNavigationVisibility() {
      if (!this.root || !this.swiper) return;

      const nextBtns = Array.from(this.root.querySelectorAll('[data-swiper-next]'));
      if (!nextBtns.length) return;

      const containerWidth = this.swiperEl.getBoundingClientRect().width;
      const slidesWidth = this.calcOriginalSlidesWidth();

      const needsScroll = slidesWidth > containerWidth + 1;

      if (!needsScroll) {
        nextBtns.forEach((btn) => btn.classList.add('is-hidden'));

        if (typeof this.swiper.loopDestroy === 'function') {
          this.swiper.loopDestroy();
          this.swiper.update();
        }
      } else {
        nextBtns.forEach((btn) => btn.classList.remove('is-hidden'));
      }
    }

    updateProgress() {
      if (!this.swiper || !this.progressEl || !this.progressBar) return;

      const total = this.getOriginalSlides().length;
      if (!total) return;

      const current = (typeof this.swiper.realIndex === 'number' ? this.swiper.realIndex : 0) + 1;

      let percent = 0;
      if (total <= 1) {
        percent = 100;
      } else {
        percent = (current / total) * 100;
      }

      const clamped = Math.max(0, Math.min(100, percent));

      this.progressBar.style.width = `${clamped}%`;
      this.progressEl.setAttribute('aria-valuenow', String(Math.round(clamped)));
    }

    static initAll(scope = document) {
      const sliders = scope.querySelectorAll('.theme-slider[data-theme-slider]');
      sliders.forEach((swiperEl) => new ThemeSlider(swiperEl).init());
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    ThemeSlider.initAll(document);
  });

  document.addEventListener('shopify:section:load', (e) => {
    ThemeSlider.initAll(e.target);
  });
})();
