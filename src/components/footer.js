class SiteFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer>
       ${new Date().getFullYear()}
       <a 
         href="https://github.com/wei-hao-chu/1800_202530_BBY23" 
         target="_blank" 
         style="color: var(--white);"
       >
         Pathfinder BBY-23 (Matthew, Melina, Hazen, Vincent)
       </a>
     </footer>
    `;
  }
}

customElements.define("site-footer", SiteFooter);
