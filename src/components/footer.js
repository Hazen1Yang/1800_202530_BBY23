class SiteFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <!-- Bottom Navigation Bar -->
      <nav class="bottombar" role="navigation" aria-label="Bottom navigation"></nav>

      <!-- Real Page Footer -->
      <footer class="page-footer" role="contentinfo" style="padding:1rem;text-align:center;">
        <h3 class="footer-title">Pathfinder</h3>
        <p class="footer-team">Created by Hazen, Matthew & Melina</p>
      </footer>
    `;
  }
}

customElements.define('site-footer', SiteFooter);