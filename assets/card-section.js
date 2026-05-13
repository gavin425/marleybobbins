(() => {
    class CardSectionVideo {
        constructor(root) {
            this.root = root;

            this.wrap = root.querySelector('[data-video-wrap]');
            this.video = root.querySelector('[data-video]');
            this.playBtn = root.querySelector('[data-video-play]');

            this.onPlayClick = this.onPlayClick.bind(this);
            this.onEnded = this.onEnded.bind(this);
        }

        init() {
            if (!this.wrap || !this.video || !this.playBtn) return;

            if (this.root.dataset.videoInited === 'true') return;
            this.root.dataset.videoInited = 'true';

            this.playBtn.addEventListener('click', this.onPlayClick);
            this.video.addEventListener('ended', this.onEnded);
        }

        onPlayClick() {
            this.playBtn.classList.add('hidden');

            const playPromise = this.video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(() => {
                    this.playBtn.classList.remove('hidden');
                });
            }
        }

        onEnded() {
            this.playBtn.classList.remove('hidden');

            try {
                this.video.currentTime = 0;
            } catch (e) {}
        }

        static initAll(scope = document) {
            scope.querySelectorAll('.card-section').forEach((root) => {
                const instance = new CardSectionVideo(root);
                instance.init();
            });
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        CardSectionVideo.initAll(document);
    });

    document.addEventListener('shopify:section:load', (e) => {
        CardSectionVideo.initAll(e.target);
    });
})();
