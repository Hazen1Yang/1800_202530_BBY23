class SiteFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <!-- Bottom Navigation Bar -->
      <nav class="bottombar" role="navigation" aria-label="Bottom navigation">
        <img
          src="https://www.svgrepo.com/show/343466/news-feed.svg"
          class="icon left-icon"
          alt="news"
        />

        <div class="home-pill" aria-hidden="false">
          <a href="index.html" aria-label="Home">
            <img
              class="home-button"
              src="https://www.svgrepo.com/show/521703/home.svg"
              alt="home"
            />
          </a>
        </div>

        <img
          src="https://www.svgrepo.com/show/512737/question-1445.svg"
          class="icon right-icon"
          alt="help"
        />
      </nav>

      <!-- Real Page Footer -->
      <footer class="page-footer" role="contentinfo" style="padding:1rem;text-align:center;">
        <h3 class="footer-title">Pathfinder</h3>
        <p class="footer-team">Created by Hazen, Matthew & Melina</p>
      </footer>
    `;
  }
}

customElements.define('site-footer', SiteFooter);