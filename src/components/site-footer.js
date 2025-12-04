class SiteFooter extends HTMLElement {
  connectedCallback() {
    const year = new Date().getFullYear();
    this.innerHTML = `
      <footer class="site-footer" role="contentinfo">
        <div class="footer-container">
          <div class="footer-brand">
            <a class="logo-link" href="index.html" aria-label="Pathfinder home">
              <img class="footer-logo" src="images/logo2.png" alt="Pathfinder logo" />
              <span class="brand-text">Pathfinder</span>
            </a>
            <p class="muted small">&copy; ${year} Pathfinder — Built by Hazen, Matthew & Melina</p>
          </div>

          <nav class="footer-nav" aria-label="Footer">
            <a href="quiz.html">Quiz</a>
            <a href="programs.html">Programs</a>
            <a href="roadmap.html">Roadmap</a>
            <a href="careers.html">Careers</a>
            <a href="goals.html">Goals</a>
          </nav>
        </div>
      </footer>
    `;
  }
}

customElements.define("site-footer", SiteFooter);
