class SiteNavbar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header class="site-header">
        <a href="index.html" class="logo-link">
          <img id="logo" src="public/images/logo2.png" alt="PathFinder logo" />
        </a>

        <button class="nav-toggle" aria-expanded="false" aria-label="Toggle Menu">
          <span class="hamburger"></span>
        </button>

        <nav class="site-nav" id="primary-navigation">
          <ul>
            <li><a href="index.html">Home</a></li>
            <li><a href="quiz.html">Quiz</a></li>
            <li><a href="programs.html">Programs</a></li>
            <li><a href="roadmap.html">Roadmap</a></li>
            <li><a href="careers.html">Careers</a></li>
            <li><a href="#how">FAQ</a></li>
            <li><a href="#about">About</a></li>
          </ul>
        </nav>
      </header>
    `;
  }
}

customElements.define("site-navbar", SiteNavbar);
