interface StarterOption {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  content: string;
}

interface ShowcaseEntry {
  slug: string;
  name: string;
  category: string;
  color: string;
  logo: string | null;
  colors: string[];
}

export function initStarterPickers(): void {
  document.querySelectorAll<HTMLElement>('[data-starter-picker]').forEach((root) => {
    if (root.dataset.starterInit === 'true') return;
    root.dataset.starterInit = 'true';

    const raw = root.dataset.starterOptions;
    if (!raw) return;

    const options: StarterOption[] = JSON.parse(raw);
    const contentEl = root.querySelector<HTMLElement>('[data-starter-content]');
    const copyBtn = root.querySelector<HTMLButtonElement>('[data-starter-copy]');
    const typeBtns = root.querySelectorAll<HTMLButtonElement>('[data-starter-type]');

    function select(index: number) {
      const option = options[index];
      if (!option || !contentEl || !copyBtn) return;

      typeBtns.forEach((btn, i) => {
        const active = i === index;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-checked', String(active));
      });

      contentEl.textContent = option.content;
      copyBtn.dataset.promptContent = option.content;
    }

    typeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const index = Number(btn.dataset.starterIndex);
        if (!Number.isNaN(index)) select(index);
      });
    });
  });
}

export function initDesignShowcases(): void {
  document.querySelectorAll<HTMLElement>('[data-design-showcase]').forEach((root) => {
    if (root.dataset.showcaseInit === 'true') return;
    root.dataset.showcaseInit = 'true';

    const raw = root.dataset.showcaseEntries;
    if (!raw) return;

    const entries: ShowcaseEntry[] = JSON.parse(raw);
    if (entries.length === 0) return;

    const preview = root.querySelector<HTMLElement>('[data-showcase-preview]');
    const nameEl = root.querySelector<HTMLElement>('[data-showcase-name]');
    const titleEl = root.querySelector<HTMLElement>('[data-showcase-title]');
    const categoryEl = root.querySelector<HTMLElement>('[data-showcase-category]');
    const chipsEl = root.querySelector<HTMLElement>('[data-showcase-chips]');
    const logoWrap = root.querySelector<HTMLElement>('[data-showcase-logo-wrap]');
    const ticks = root.querySelectorAll<HTMLElement>('[data-tick-index]');

    let index = 0;
    let timer: ReturnType<typeof setInterval> | null = null;

    function render(entry: ShowcaseEntry, animate = true) {
      if (!preview || !nameEl || !titleEl || !categoryEl || !chipsEl) return;

      if (animate) preview.classList.add('is-transitioning');

      preview.style.setProperty('--ds-primary', entry.color);
      nameEl.textContent = entry.name;
      titleEl.textContent = entry.name;
      categoryEl.textContent = entry.category;

      chipsEl.innerHTML = entry.colors
        .map((hex) => `<span class="design-showcase__chip" style="background:${hex}"></span>`)
        .join('');

      if (logoWrap) {
        if (entry.logo) {
          logoWrap.innerHTML = `<img src="${entry.logo}" alt="" class="design-showcase__logo" width="40" height="40" />`;
        } else {
          logoWrap.innerHTML = `<span class="design-showcase__logo-fallback">${entry.name.charAt(0)}</span>`;
        }
      }

      ticks.forEach((tick, i) => {
        tick.classList.toggle('is-active', i === index);
      });

      if (animate) {
        window.setTimeout(() => preview.classList.remove('is-transitioning'), 400);
      }
    }

    function next() {
      index = (index + 1) % entries.length;
      render(entries[index]);
    }

    function start() {
      if (timer) clearInterval(timer);
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      timer = setInterval(next, 2800);
    }

    root.addEventListener('mouseenter', () => {
      if (timer) clearInterval(timer);
    });
    root.addEventListener('mouseleave', start);

    render(entries[0], false);
    start();
  });
}

export function initWorkshopAccordions(): void {
  initStarterPickers();
  initDesignShowcases();
}
