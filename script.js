/**
 * SS GAMES — Official Client-side Architecture & Core Logic
 * Handles: Reusable Game Card System, Dynamic Gallery Filtering,
 * Live Search, Mobile Navigation, and Future Ads Readiness.
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initGamesSystem();
});

/**
 * Mobile Drawer / Navigation Toggle
 */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobileMenuToggle');
  const navLinks = document.getElementById('navLinks');

  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('nav-open');
      toggleBtn.setAttribute('aria-expanded', isOpen);
    });

    // Close when clicking any link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('nav-open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }
}

/**
 * Game Card Template Generator
 * Builds reusable, accessible game cards with clear Play / Coming Soon handling.
 */
function createGameCardHTML(game, isInsideGamesDir = false) {
  const pathPrefix = isInsideGamesDir ? '../' : '';
  const thumbSrc = pathPrefix + (game.thumbnail || 'assets/images/ss-games-logo.png');
  const playUrl = game.route || game.playUrl;
  const isPlayable = game.status === 'playable' || game.isPlayable === true || !!playUrl;
  
  let actionButton = '';
  if (isPlayable && playUrl) {
    const playHref = pathPrefix + playUrl;
    actionButton = `
      <a href="${playHref}" class="btn btn-primary btn-sm" aria-label="Play ${game.title} now">
        <span>Play Now</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
      </a>
    `;
  } else {
    actionButton = `
      <button class="btn btn-disabled btn-sm" disabled aria-disabled="true" title="Under active development">
        <span>Coming Soon</span>
      </button>
    `;
  }

  const badgeText = game.badge || (isPlayable ? 'Playable' : 'Coming Soon');
  const badgeClass = isPlayable ? 'badge-playable' : 'badge-coming';
  const tagline = game.tagline || (game.category + ' Challenge');

  return `
    <article class="game-card" data-category="${game.category}" data-id="${game.id}">
      <div class="game-card-thumb-wrapper">
        <img src="${thumbSrc}" alt="${game.title} preview" class="game-card-thumb" loading="lazy">
        <span class="game-badge ${badgeClass}">${badgeText}</span>
        <span class="game-category-tag">${game.category}</span>
      </div>
      <div class="game-card-body">
        <h3 class="game-card-title">${game.title}</h3>
        <p class="game-card-tagline">${tagline}</p>
        <p class="game-card-desc">${game.description}</p>
        <div class="game-card-footer">
          <span style="font-size: 0.8rem; color: #64748b;">${isPlayable ? 'HTML5 Canvas' : 'In Dev'}</span>
          ${actionButton}
        </div>
      </div>
    </article>
  `;
}

/**
 * Initializes Game Galleries (Homepage Featured, New Releases, or All Games Gallery)
 */
function initGamesSystem() {
  if (typeof SS_GAMES_DATABASE === 'undefined') {
    return;
  }

  const featuredContainer = document.getElementById('featuredGamesContainer');
  const newReleasesContainer = document.getElementById('newReleasesContainer');
  const allGamesContainer = document.getElementById('allGamesContainer');
  const searchInput = document.getElementById('gameSearchInput');
  const filterButtons = document.querySelectorAll('.filter-btn');

  // 1. Render Featured Games (if container exists)
  if (featuredContainer) {
    const featuredGames = SS_GAMES_DATABASE.filter(g => g.featured);
    if (featuredGames.length === 0) {
      featuredContainer.innerHTML = `
        <div class="no-games-found" style="grid-column: 1 / -1;">
          <h3>New Titles Incoming</h3>
          <p style="color: #94a3b8; margin-top: 0.5rem;">SS GAMES original titles are currently in development. Stay tuned!</p>
        </div>
      `;
    } else {
      featuredContainer.innerHTML = featuredGames.map(g => createGameCardHTML(g)).join('');
    }
  }

  // 2. Render New Releases (if container exists)
  if (newReleasesContainer) {
    const newReleases = SS_GAMES_DATABASE.filter(g => g.newRelease);
    if (newReleases.length === 0) {
      newReleasesContainer.innerHTML = `
        <div class="no-games-found" style="grid-column: 1 / -1;">
          <h3>New Releases Underway</h3>
          <p style="color: #94a3b8; margin-top: 0.5rem;">Fresh original browser games will appear right here soon.</p>
        </div>
      `;
    } else {
      newReleasesContainer.innerHTML = newReleases.map(g => createGameCardHTML(g)).join('');
    }
  }

  // 3. Render All Games Gallery with Search & Filter
  if (allGamesContainer) {
    let currentCategory = 'all';
    let currentSearch = '';

    const renderFilteredGames = () => {
      const filtered = SS_GAMES_DATABASE.filter(game => {
        const matchesCategory = (currentCategory === 'all') || (game.category.toLowerCase() === currentCategory.toLowerCase());
        const query = currentSearch.toLowerCase().trim();
        const matchesSearch = !query || 
          game.title.toLowerCase().includes(query) ||
          game.description.toLowerCase().includes(query) ||
          game.category.toLowerCase().includes(query);

        return matchesCategory && matchesSearch;
      });

      if (filtered.length === 0) {
        allGamesContainer.innerHTML = `
          <div class="no-games-found">
            <h3>No Games Found</h3>
            <p style="color: #94a3b8; margin-top: 0.5rem;">Try adjusting your search query or selecting a different category.</p>
          </div>
        `;
      } else {
        allGamesContainer.innerHTML = filtered.map(g => createGameCardHTML(g)).join('');
      }
    };

    // Initial Render
    renderFilteredGames();

    // Category button clicks
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.getAttribute('data-category') || 'all';
        renderFilteredGames();
      });
    });

    // Search bar input
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value;
        renderFilteredGames();
      });
    }
  }
}
