import { onAuthReady, logoutUser } from "../authentication.js";

console.log("site-navbar.js loaded");

class SiteNavbar extends HTMLElement {
  connectedCallback() {
    this.render();
    this.setupBehaviour();
    this.renderAuthControls();
  }

  disconnectedCallback() {
    this.teardownBehaviour();
  }

  render() {
    this.innerHTML = `
      <header class="site-header" role="banner">
        <div class="container">
          <a class="site-brand logo-link" href="index.html" aria-label="Pathfinder home">
            <img id="logo" src="public/images/logo2.png" alt="Pathfinder logo" />
            <span class="brand-text">Pathfinder</span>
          </a>

          <button class="nav-toggle" aria-controls="primary-navigation" aria-expanded="false" aria-label="Toggle menu" type="button">
            <span class="hamburger" aria-hidden="true"></span>
          </button>

          <nav id="primary-navigation" class="site-nav" aria-label="Main navigation" aria-expanded="false">
            <ul>
              <li><a href="index.html">Home</a></li>
              <li><a href="quiz.html">Quiz</a></li>
              <li><a href="programs.html">Programs</a></li>
              <li><a href="roadmap.html">Roadmap</a></li>
              <li><a href="careers.html">Careers</a></li>
              <li><a href="goals.html">Goals</a></li>
              <li><a href="task.html">Tasks</a></li>
              <li><a href="main.html">App</a></li>
              <li class="nav-auth"><button id="authBtn" class="btn nav-cta" type="button">Login/Signup</button></li>
            </ul>
          </nav>
        </div>
      </header>
    `;
  }

  setupBehaviour() {
    this.headerEl = this.querySelector(".site-header");
    this.navEl = this.querySelector(".site-nav");
    this.toggleBtn = this.querySelector(".nav-toggle");

    if (!this.headerEl || !this.navEl || !this.toggleBtn) {
      return;
    }

    this.linkHandlers = [];
    this.setExpanded(false);

    this.toggleHandler = () => {
      const nextState = this.toggleBtn.getAttribute("aria-expanded") !== "true";
      this.setExpanded(nextState);
      if (nextState) {
        const focusable = this.navEl.querySelector("a, button");
        if (focusable) focusable.focus();
      }
    };

    this.escapeHandler = (event) => {
      if (event.key === "Escape" && this.toggleBtn.getAttribute("aria-expanded") === "true") {
        this.setExpanded(false);
        this.toggleBtn.focus();
      }
    };

    this.resizeHandler = () => {
      if (window.innerWidth > 880 && this.toggleBtn.getAttribute("aria-expanded") === "true") {
        this.setExpanded(false);
      }
    };

    this.clickOutsideHandler = (event) => {
      if (this.toggleBtn.getAttribute("aria-expanded") !== "true") return;
      if (this.contains(event.target)) return;
      this.setExpanded(false);
    };

    this.linkHandlers = Array.from(this.navEl.querySelectorAll("a, button"))
      .filter((el) => el.id !== "authBtn")
      .map((el) => {
        const handler = () => {
          if (this.toggleBtn.getAttribute("aria-expanded") === "true") {
            this.setExpanded(false);
          }
        };
        el.addEventListener("click", handler);
        return { element: el, handler };
      });

    this.toggleBtn.addEventListener("click", this.toggleHandler);
    document.addEventListener("keydown", this.escapeHandler);
    window.addEventListener("resize", this.resizeHandler);
    document.addEventListener("click", this.clickOutsideHandler);
  }

  teardownBehaviour() {
    if (this.toggleBtn && this.toggleHandler) {
      this.toggleBtn.removeEventListener("click", this.toggleHandler);
    }
    if (this.escapeHandler) {
      document.removeEventListener("keydown", this.escapeHandler);
    }
    if (this.resizeHandler) {
      window.removeEventListener("resize", this.resizeHandler);
    }
    if (this.clickOutsideHandler) {
      document.removeEventListener("click", this.clickOutsideHandler);
    }
    if (this.linkHandlers) {
      this.linkHandlers.forEach(({ element, handler }) => element.removeEventListener("click", handler));
    }
  }

  setExpanded(isOpen) {
    const expanded = String(!!isOpen);
    if (this.navEl) this.navEl.setAttribute("aria-expanded", expanded);
    if (this.toggleBtn) this.toggleBtn.setAttribute("aria-expanded", expanded);
    if (this.headerEl) this.headerEl.classList.toggle("is-open", isOpen);
  }

  renderAuthControls() {
    const authBtn = this.querySelector("#authBtn");
    if (!authBtn) return;

    onAuthReady((user) => {
      const loggedIn = Boolean(user);
      authBtn.textContent = loggedIn ? "Logout" : "Login/Signup";

      authBtn.onclick = () => {
        if (this.toggleBtn && this.toggleBtn.getAttribute("aria-expanded") === "true") {
          this.setExpanded(false);
        }
        if (loggedIn) {
          logoutUser();
        } else {
          window.location.href = "login.html";
        }
      };
    });
  }
}

customElements.define("site-navbar", SiteNavbar);