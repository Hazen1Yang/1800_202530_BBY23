// Minimal site module: registers <site-navbar> and <site-footer> and initializes simple UI state.
// Place this file at src/index.js so the import in index.html resolves correctly.

class SiteNavbar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header class="site-navbar" role="banner">
        <nav role="navigation" aria-label="Main navigation">
          <a href="index.html" class="logo">PathFinder</a>
          <button id="menu-toggle" aria-label="Toggle menu">☰</button>
        </nav>
      </header>
    `;
  }
}

class SiteFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer class="site-footer" role="contentinfo">
        <div>© ${new Date().getFullYear()} PathFinder</div>
        <div><a href="privacy.html">Privacy</a> · <a href="terms.html">Terms</a></div>
      </footer>
    `;
  }
}

if (!customElements.get('site-navbar')) {
  customElements.define('site-navbar', SiteNavbar);
}
if (!customElements.get('site-footer')) {
  customElements.define('site-footer', SiteFooter);
}

// Populate name/quote placeholders from localStorage (safe fallback to defaults)
document.addEventListener('DOMContentLoaded', () => {
  try {
    const nameEl = document.getElementById('name-goes-here');
    const quoteEl = document.getElementById('quote-goes-here');
    const storedName = localStorage.getItem('pf_user_name');
    const storedQuote = localStorage.getItem('pf_quote');

    if (nameEl) nameEl.textContent = storedName || 'my friend!';
    if (quoteEl) quoteEl.textContent = storedQuote || 'Join other students like yourself.';
  } catch (err) {
    // Do not break page if anything goes wrong here
    // Log for debugging in dev tools
    // eslint-disable-next-line no-console
    console.error('Initialization error:', err);
  }
});