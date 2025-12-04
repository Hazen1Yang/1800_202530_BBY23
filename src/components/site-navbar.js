import { onAuthReady, logoutUser } from "../authentication.js";

console.log("site-navbar.js loaded");

class SiteNavbar extends HTMLElement {
  connectedCallback() {
    this.render();
    this.setupBehaviour();
    this.renderAuthControls();
    this.markActiveLink();
    this.setupScrollEffect();
  }

  disconnectedCallback() {
    this.teardownBehaviour();
  }

  render() {
    this.innerHTML = `
      <header class="site-header" role="banner">
        <div class="container">
          <a class="site-brand logo-link" href="index.html" aria-label="Pathfinder home">
            <img id="logo" src="images/logo2.png" alt="Pathfinder logo" />
          </a>

          <button class="nav-toggle" aria-controls="primary-navigation" aria-expanded="false" aria-label="Toggle menu" type="button">
            <span class="hamburger" aria-hidden="true"></span>
          </button>

          <nav id="primary-navigation" class="site-nav" aria-label="Main navigation" aria-expanded="false">
            <div class="nav-groups">
              <ul class="nav-left" aria-label="Primary links">
                <li><a href="index.html">Home</a></li>
                <li><a href="quiz.html">Quiz</a></li>
                <li><a href="programs.html">Programs</a></li>
                <li><a href="careers.html">Careers</a></li>
                <li><a href="goals.html">Goals</a></li>
                <li><a href="task.html">Tasks</a></li>
                <li><a href="roadmap.html">Roadmap</a></li>

                <li class="nav-label">General</li>
                <li class="compact-row">
                  <a href="faq.html">FAQ</a>
                  <a href="about.html">About</a>
                </li>
              </ul>
              <ul class="nav-right" aria-label="Secondary links">
                <li class="nav-auth"><button id="authBtn" class="btn nav-cta" type="button">Login/Signup</button></li>
              </ul>
            </div>
          </nav>
        </div>
      </header>
    `;
  }

  setupBehaviour() {
    // Wait for DOM to be ready
    requestAnimationFrame(() => {
      this.headerEl = this.querySelector(".site-header");
      this.navEl = this.querySelector(".site-nav");
      this.toggleBtn = this.querySelector(".nav-toggle");

      if (!this.headerEl || !this.navEl || !this.toggleBtn) {
        console.warn("Navbar elements not found, retrying...");
        setTimeout(() => this.setupBehaviour(), 100);
        return;
      }

      this.linkHandlers = [];
      this.setExpanded(false);

      this.toggleHandler = (e) => {
        e.stopPropagation(); // Prevent immediate close
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
      document.addEventListener("click", this.clickOutsideHandler);

      // Focus trap setup for mobile menu
      this.focusTrapHandler = (e) => {
        if (this.toggleBtn.getAttribute("aria-expanded") !== "true") return;
        if (e.key !== "Tab") return;
        const focusables = this.getFocusableElements();
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      };
      document.addEventListener("keydown", this.focusTrapHandler);
    });
  }

  teardownBehaviour() {
    if (this.toggleBtn && this.toggleHandler) {
      this.toggleBtn.removeEventListener("click", this.toggleHandler);
    }
    if (this.escapeHandler) {
      document.removeEventListener("keydown", this.escapeHandler);
    }
    // if (this.resizeHandler) {
    //   window.removeEventListener("resize", this.resizeHandler);
    // }
    if (this.clickOutsideHandler) {
      document.removeEventListener("click", this.clickOutsideHandler);
    }
    if (this.focusTrapHandler) {
      document.removeEventListener("keydown", this.focusTrapHandler);
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

  document.body.classList.toggle("menu-open", isOpen);
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

  markActiveLink() {
    try {
      const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
      const links = this.querySelectorAll('.site-nav a');
      links.forEach((a) => {
        const href = (a.getAttribute('href') || '').toLowerCase();
        if (href === path) {
          a.setAttribute('aria-current', 'page');
        } else {
          a.removeAttribute('aria-current');
        }
      });
    } catch (_) {
      // no-op
    }
  }

  setupScrollEffect() {
    this.scrollHandler = () => {
      if (!this.headerEl) this.headerEl = this.querySelector('.site-header');
      if (!this.headerEl) return;
      const scrolled = window.scrollY > 4;
      this.headerEl.classList.toggle('scrolled', scrolled);
    };
    window.addEventListener('scroll', this.scrollHandler, { passive: true });
    // initialize state
    this.scrollHandler();
  }

  getFocusableElements() {
    return Array.from(this.navEl.querySelectorAll('a[href], button:not([disabled]), [tabindex="0"]'))
      .filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null);
  }
}

customElements.define("site-navbar", SiteNavbar);
