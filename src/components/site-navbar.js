import { onAuthReady, logoutUser } from "../authentication.js";

class SiteNavbar extends HTMLElement {
  connectedCallback() {
    this.renderNavbar();
    this.renderAuthControls();
  }

  renderNavbar() {
    this.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Pacifico&display=swap');

        :host { display: block; width: 100%; }

        nav {
          background: var(--secondary-color);
          color: #f1faee;
          padding: clamp(0.5rem, 1.2vw, 0.9rem) clamp(0.75rem, 2vw, 1.25rem);
          position: relative;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          transition: all 0.3s ease;
          min-height: clamp(56px, 8vw, 72px);
          box-sizing: border-box;
        }

        .hamburger {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: clamp(34px, 6vw, 42px);
          height: clamp(34px, 6vw, 42px);
          cursor: pointer;
          gap: clamp(4px, .9vw, 6px);
          z-index: 1101;
        }
        .bar {
          width: clamp(20px, 4vw, 26px);
          height: 3px;
          background-color: #f1faee;
          border-radius: 2px;
        }

        .side-menu {
          position: fixed;
          top: 0; left: 0;
          width: 260px; height: 100vh;
          background: #2E294E;
          transform: translateX(-100%);
          transition: .3s ease-in-out;
          padding: 80px 24px;
          z-index: 1100;
        }
        .side-menu.open { transform: translateX(0); }

        .menu-logo {
          font-family: 'Pacifico', cursive;
          font-size: 32px;
          color: #fff;
          margin-bottom: 20px;
        }

        .side-menu a {
          color: #fff;
          text-decoration: none;
          padding: 12px 0;
        }

        .overlay {
          position: fixed;
          width: 100vw; height: 100vh;
          background: rgba(0,0,0,.4);
          opacity: 0;
          pointer-events: none;
          transition: .3s ease;
          z-index: 1099;
        }
        .overlay.show { opacity: 1; pointer-events: auto; }

        .site-brand {
          font-family: 'Pacifico', cursive;
          color: #fff;
          font-size: 32px;
        }

        #authBtn {
          padding: 8px 14px;
        }
      </style>

      <nav>
        <div class="hamburger" id="hamburger">
          <div class="bar"></div>
          <div class="bar"></div>
          <div class="bar"></div>
        </div>

        <div class="side-menu" id="sideMenu">
          <div class="menu-logo">Pathfinder</div>
          <a href="main.html">App</a>
          <a href="quiz.html">Quiz</a>
          <a href="programs.html">Programs</a>
          <a href="profile.html">Profile</a>
          <a href="goals.html">Goals</a>
          <a href="task.html">Tasks</a>
          <a href="index.html#about">About</a>
        </div>

        <div class="overlay" id="overlay"></div>

        <div class="right-section">
          <button id="authBtn" class="btn" type="button">Login/Signup</button>
          <a href="index.html"><span class="site-brand">Pathfinder</span></a>
        </div>
      </nav>
    `;

    const hamburger = this.querySelector("#hamburger");
    const sideMenu = this.querySelector("#sideMenu");
    const overlay = this.querySelector("#overlay");

    hamburger.addEventListener("click", () => {
      const open = sideMenu.classList.toggle("open");
      overlay.classList.toggle("show", open);
    });

    overlay.addEventListener("click", () => {
      sideMenu.classList.remove("open");
      overlay.classList.remove("show");
    });
  }

  renderAuthControls() {
    const authBtn = this.querySelector("#authBtn");

    onAuthReady((user) => {
      const loggedIn = !!user;
      authBtn.textContent = loggedIn ? "Logout" : "Login/Signup";

      authBtn.onclick = () => {
        if (loggedIn) logoutUser();
        else window.location.href = "login.html";
      };
    });
  }
}

customElements.define("site-navbar", SiteNavbar);
