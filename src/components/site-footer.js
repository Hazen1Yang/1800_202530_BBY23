class SiteFooter extends HTMLElement {
  connectedCallback() {
    const year = new Date().getFullYear();
    this.innerHTML = `
      <footer class="site-footer" role="contentinfo">
        <div class="footer-container">
          <div class="footer-brand">
            <a class="logo-link" href="index.html" aria-label="Pathfinder home">
              <img class="footer-logo" src="images/logo2.png" alt="Pathfinder logo" />
            </a>
          </div>
          <div class="footer-credits">
              <p class="footer-authors">&copy; ${year} Pathfinder — Built by <span>Hazen</span>, <span>Matthew</span> & <span class="melina-trigger">Melina<span class="melina-secret"> (loves using AI)</span></span></p>
          </div>
        </div>
      </footer>
    `;
  }
}

customElements.define("site-footer", SiteFooter);
