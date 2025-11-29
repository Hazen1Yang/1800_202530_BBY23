class SiteFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
    <nav class="bottombar">
      <img
        src="https://www.svgrepo.com/show/343466/news-feed.svg"
        class="icon left-icon"
        alt="news"
      />

      <div class="home-pill">
        <a href="index.html">
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
        `;
    }
}

customElements.define('site-footer', SiteFooter);