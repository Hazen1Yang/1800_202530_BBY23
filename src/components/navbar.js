class SiteNavbar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header class="site-header" role="banner">
        <div class="container" style="display:flex;align-items:center;gap:1rem;">
          <a class="site-brand" href="index.html" aria-label="Pathfinder home" style="display:flex;align-items:center;gap:0.6rem;text-decoration:none;color:inherit;">
            <img id="logo" src="public/images/logo2.png" alt="Pathfinder logo" style="width:48px;height:auto;" />
            <span class="brand-text">Pathfinder</span>
          </a>

          <button class="nav-toggle" aria-controls="primary-navigation" aria-expanded="false" aria-label="Toggle menu" type="button" style="margin-left:auto;">
            <span class="hamburger" aria-hidden="true"></span>
          </button>

          <nav id="primary-navigation" class="site-nav" aria-label="Main navigation" aria-expanded="false">
            <a href="index.html">Home</a>
            <a href="quiz.html">Quiz</a>
            <a href="programs.html">Programs</a>
            <a href="roadmap.html">Roadmap</a>
            <a href="profile.html">Profile</a>
            <a href="#careers">Careers</a>
            <a href="#how">FAQ</a>
            <a href="#about">About</a>
          </nav>
        </div>
      </header>
    `;

    // Attach behaviour: toggle open/close, update aria attributes, Escape to close, click outside to close
    const header = this.querySelector('.site-header');
    const nav = this.querySelector('.site-nav');
    const toggle = this.querySelector('.nav-toggle');

    if (!nav || !toggle || !header) return;

    // ensure nav has id for aria-controls
    if (!nav.id) nav.id = 'primary-navigation';

    function setExpanded(isOpen) {
      nav.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-expanded', String(isOpen));
      header.classList.toggle('is-open', isOpen);
    }

    // initial state
    setExpanded(false);

    toggle.addEventListener('click', (e) => {
      const expanded = nav.getAttribute('aria-expanded') === 'true';
      setExpanded(!expanded);
      // if opening, focus the first link for accessibility
      if (!expanded) {
        const firstLink = nav.querySelector('a');
        if (firstLink) firstLink.focus();
      }
    });

    // Close on Escape
    this._escHandler = (e) => {
      if (e.key === 'Escape' && nav.getAttribute('aria-expanded') === 'true') {
        setExpanded(false);
        toggle.focus();
      }
    };
    document.addEventListener('keydown', this._escHandler);

    // Close when clicking outside the header (for mobile)
    this._clickOutside = (e) => {
      if (nav.getAttribute('aria-expanded') !== 'true') return;
      // If click target is inside header, ignore
      if (header.contains(e.target)) return;
      setExpanded(false);
    };
    document.addEventListener('click', this._clickOutside);

    // Cleanup when element removed
    this._cleanup = () => {
      document.removeEventListener('keydown', this._escHandler);
      document.removeEventListener('click', this._clickOutside);
    };
  }

  disconnectedCallback() {
    if (this._cleanup) this._cleanup();
  }
}

customElements.define('site-navbar', SiteNavbar);