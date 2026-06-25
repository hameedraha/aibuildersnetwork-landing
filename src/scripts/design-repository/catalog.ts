const STORAGE_KEY = 'design-repo-view';

export function initDesignRepoCatalog(): void {
  const root = document.querySelector<HTMLElement>('[data-design-repo-catalog]');
  if (!root) return;

  const viewButtons = root.querySelectorAll<HTMLButtonElement>('[data-view]');
  const searchInput = root.querySelector<HTMLInputElement>('[data-design-repo-search]');
  const countEl = root.querySelector<HTMLElement>('[data-design-repo-count]');
  const panels = root.querySelectorAll<HTMLElement>('[data-design-repo-panel]');
  const items = root.querySelectorAll<HTMLElement>('[data-design-repo-item]');
  const sections = root.querySelectorAll<HTMLElement>('[data-design-repo-section]');

  let activeView = (sessionStorage.getItem(STORAGE_KEY) as string) || 'cards';
  if (!['cards', 'list', 'colors', 'brands'].includes(activeView)) {
    activeView = 'cards';
  }

  function setView(view: string) {
    activeView = view;
    sessionStorage.setItem(STORAGE_KEY, view);

    viewButtons.forEach((btn) => {
      const isActive = btn.dataset.view === view;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
    });

    panels.forEach((panel) => {
      panel.hidden = panel.dataset.designRepoPanel !== view;
    });
  }

  function applySearch() {
    const query = (searchInput?.value ?? '').trim().toLowerCase();
    let visible = 0;

    items.forEach((item) => {
      const haystack = item.dataset.search ?? '';
      const show = !query || haystack.includes(query);
      item.style.display = show ? '' : 'none';
      if (show) visible += 1;
    });

    sections.forEach((section) => {
      const sectionItems = section.querySelectorAll<HTMLElement>('[data-design-repo-item]');
      const anyVisible = Array.from(sectionItems).some((el) => el.style.display !== 'none');
      section.style.display = anyVisible ? '' : 'none';
    });

    if (countEl) {
      countEl.textContent = query ? `${visible} matching` : `${items.length} systems`;
    }
  }

  viewButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.dataset.view) setView(btn.dataset.view);
    });
  });

  searchInput?.addEventListener('input', applySearch);

  setView(activeView);
  applySearch();
}

initDesignRepoCatalog();
document.addEventListener('astro:page-load', initDesignRepoCatalog);
