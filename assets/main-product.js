(() => {
  class StickyBars {
    constructor(root = document) {
      this.root = root;

      this.footerEl = null;

      this.main = null;
      this.promo = null;

      this.onScroll = this.onScroll.bind(this);

      this.mainObserver = null;
      this.mainSyncScheduled = false;
    }

    init() {
      this.footerEl = document.querySelector('footer.theme-footer');

      this.main = this.buildMain();
      this.promo = this.buildPromo();

      window.addEventListener('scroll', this.onScroll, { passive: true });
      window.addEventListener('resize', this.onScroll);

      if (this.main) {
        this.initMain();
      } else if (this.promo) {
        this.initPromo();
      }

      this.update();
    }

    buildMain() {
      const productInfo = document.querySelector('product-info[data-section]');
      if (!productInfo) return null;

      const stickyEl = productInfo.querySelector(
        '[data-product-sticky][data-sticky-scope="main-product"]'
      );
      if (!stickyEl) return null;

      const stickyPurchaseEl = stickyEl.querySelector('[data-product-sticky-purchase]');
      const stickyCtaEl = stickyEl.querySelector('[data-product-sticky-cta]');

      const sourcePurchaseEl = productInfo.querySelector('.product-purchase');
      const productEl = productInfo.querySelector('.product.theme-product');

      if (!stickyCtaEl || !sourcePurchaseEl || !productEl) return null;

      return {
        productInfo,
        stickyEl,
        stickyPurchaseEl,
        stickyCtaEl,
        sourcePurchaseEl,
        productEl,
        initialized: productInfo.dataset.mainStickyInitialized === 'true'
      };
    }

    buildPromo() {
      if (document.querySelector('[data-product-sticky][data-sticky-scope="main-product"]')) return null;

      const firstPromoSection = document.querySelector('section.product-promo-section');
      if (!firstPromoSection) return null;

      const stickyEl = firstPromoSection.querySelector(
        '[data-product-sticky][data-sticky-scope="product-promo"]'
      );
      if (!stickyEl) return null;

      const stickyPurchaseEl = stickyEl.querySelector('[data-product-sticky-purchase]');
      const stickyCtaEl = stickyEl.querySelector('[data-product-sticky-cta]');
      const sourcePriceStockEl = firstPromoSection.querySelector('.product-promo__price-stock');

      if (!stickyCtaEl) return null;
      if (!sourcePriceStockEl && stickyPurchaseEl) return null;

      return {
        sectionEl: firstPromoSection,
        stickyEl,
        stickyPurchaseEl,
        stickyCtaEl,
        sourcePriceStockEl,
        initialized: firstPromoSection.dataset.promoStickyInitialized === 'true'
      };
    }

    initMain() {
      if (this.main.initialized) return;
      this.main.productInfo.dataset.mainStickyInitialized = 'true';

      const onCtaClick = () => {
        const mainBtn =
          this.main.sourcePurchaseEl.querySelector('[name="add"]') ||
          this.main.sourcePurchaseEl.querySelector('button[type="submit"]') ||
          this.main.sourcePurchaseEl.querySelector('[data-add-to-cart]');

        if (!mainBtn) return;

        this.main.sourcePurchaseEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

        window.setTimeout(() => {
          mainBtn.click();
        }, 150);
      };

      this.main.stickyCtaEl.addEventListener('click', onCtaClick);

      this.mainObserver = new MutationObserver(() => this.scheduleMainSync());
      this.mainObserver.observe(this.main.sourcePurchaseEl, {
        childList: true,
        subtree: true,
        attributes: true
      });

      this.syncMain();
      this.hidePromoIfExists();
    }

    initPromo() {
      if (this.promo.initialized) return;
      this.promo.sectionEl.dataset.promoStickyInitialized = 'true';

      this.syncPromo();
    }

    scheduleMainSync() {
      if (this.mainSyncScheduled) return;
      this.mainSyncScheduled = true;

      requestAnimationFrame(() => {
        this.mainSyncScheduled = false;
        this.syncMain();
        this.update();
      });
    }

    syncMain() {
      if (this.main.stickyPurchaseEl) {
        const pricePart = this.main.sourcePurchaseEl.querySelector('.purchase-price');
        if (pricePart) {
          const clone = pricePart.cloneNode(true);
          clone.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));

          this.main.stickyPurchaseEl.innerHTML = '';
          this.main.stickyPurchaseEl.appendChild(clone);
        }
      }

      const mainBtn =
        this.main.sourcePurchaseEl.querySelector('[name="add"]') ||
        this.main.sourcePurchaseEl.querySelector('button[type="submit"]') ||
        this.main.sourcePurchaseEl.querySelector('[data-add-to-cart]');

      if (!mainBtn) return;

      const isDisabled =
        mainBtn.hasAttribute('disabled') || mainBtn.getAttribute('aria-disabled') === 'true';

      if (isDisabled) this.main.stickyCtaEl.setAttribute('disabled', 'disabled');
      else this.main.stickyCtaEl.removeAttribute('disabled');

      const btnText = (mainBtn.textContent || '').trim();
      if (btnText) this.main.stickyCtaEl.textContent = btnText;
    }

    syncPromo() {
      if (!this.promo.stickyPurchaseEl) return;
      if (!this.promo.sourcePriceStockEl) return;

      const clone = this.promo.sourcePriceStockEl.cloneNode(true);
      clone.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));

      this.promo.stickyPurchaseEl.innerHTML = '';
      this.promo.stickyPurchaseEl.appendChild(clone);
    }

    onScroll() {
      this.update();
    }

    footerReachedFor(stickyEl) {
      if (!this.footerEl) return false;

      const footerRect = this.footerEl.getBoundingClientRect();
      const stickyHeight = stickyEl ? (stickyEl.getBoundingClientRect().height || 0) : 0;

      return footerRect.top <= (window.innerHeight - stickyHeight);
    }

    update() {
      if (this.main) {
        const footerReached = this.footerReachedFor(this.main.stickyEl);

        const productRect = this.main.productEl.getBoundingClientRect();
        const shouldShow = productRect.bottom <= 0 && !footerReached;

        this.main.stickyEl.classList.toggle('active', shouldShow);
        this.main.stickyEl.setAttribute('aria-hidden', shouldShow ? 'false' : 'true');

        this.hidePromoIfExists();
        return;
      }

      if (this.promo) {
        const footerReached = this.footerReachedFor(this.promo.stickyEl);
        const shouldShow = window.scrollY >= window.innerHeight && !footerReached;

        this.promo.stickyEl.classList.toggle('active', shouldShow);
        this.promo.stickyEl.setAttribute('aria-hidden', shouldShow ? 'false' : 'true');
      }
    }

    hidePromoIfExists() {
      document
        .querySelectorAll('[data-product-sticky][data-sticky-scope="product-promo"]')
        .forEach((el) => {
          el.classList.remove('active');
          el.setAttribute('aria-hidden', 'true');
        });
    }

    static initAll() {
      if (document.documentElement.dataset.stickyBarsInitialized === 'true') return;
      document.documentElement.dataset.stickyBarsInitialized = 'true';
      new StickyBars(document).init();
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    StickyBars.initAll();
  });

  document.addEventListener('shopify:section:load', () => {
    document.documentElement.dataset.stickyBarsInitialized = 'false';
    StickyBars.initAll();
  });
})();