(() => {
  class AccordionSection {
    constructor(root) {
      this.root = root;
      this.items = Array.from(root.querySelectorAll('.accordion'));
      this.onClick = this.onClick.bind(this);
      this.onResize = this.onResize.bind(this);
    }

    init() {
      if (!this.items.length) return;

      this.items.forEach((item) => {
        const btn = item.querySelector('.question');
        if (!btn) return;
        btn.addEventListener('click', this.onClick);
      });

      this.updateHeights();
      window.addEventListener('resize', this.onResize);
    }

    onClick(e) {
      const btn = e.currentTarget;
      const item = btn.closest('.accordion');
      if (!item) return;

      const isOpen = item.classList.contains('open');

      this.items.forEach((el) => {
        el.classList.remove('open');
        const b = el.querySelector('.question');
        if (b) b.setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }

      this.updateHeights();
    }

    onResize() {
      this.updateHeights();
    }

    updateHeights() {
      this.items.forEach((item) => {
        const inner = item.querySelector('.answer-inner');
        if (!inner) return;

        item.style.setProperty(
          '--accordion-content-height',
          `${inner.scrollHeight + 1}px`
        );
      });
    }

    static initAll(scope = document) {
      const roots = scope.querySelectorAll('.accordion-section');
      roots.forEach((root) => new AccordionSection(root).init());
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    AccordionSection.initAll(document);
  });

  document.addEventListener('shopify:section:load', (e) => {
    AccordionSection.initAll(e.target);
  });
})();
