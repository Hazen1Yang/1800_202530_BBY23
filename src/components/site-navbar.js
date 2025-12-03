// src/components/site-navbar.js
// Simple, no-Firebase, no-toggle navbar so it always renders.

class SiteNavbar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header class="main-header">
        <a href="index.html" class="logo-link">
          <img id="logo" src="public/images/logo2.png" alt="PathFinder logo" />
        </a>

        <nav class="main-nav">
          <ul>
            <li><a href="index.html">Home</a></li>
            <li><a href="quiz.html">Quiz</a></li>
            <li><a href="programs.html">Programs</a></li>
            <li><a href="roadmap.html">Roadmap</a></li>
            <li><a href="profile.html">Profile</a></li>
            <li><a href="#careers">Careers</a></li>
            <li><a href="#how">FAQ</a></li>
            <li><a href="#about">About</a></li>
          </ul>
        </nav>
      </header>
    `;
  }
}

customElements.define("site-navbar", SiteNavbar);
