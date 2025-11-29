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

        /* Host */
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
          min-height: clamp(56px, 8vw, 72px); /* responsive navbar height */
          box-sizing: border-box;
          overflow: visible; /* avoid clipping tall brand font */
        }

        .hamburger {
          display: flex; flex-direction: column; justify-content: center; align-items: center;
          width: clamp(34px, 6vw, 42px); height: clamp(34px, 6vw, 42px);
          cursor: pointer; gap: clamp(4px, 0.9vw, 6px); transition: opacity 0.3s ease; z-index: 1101;
          flex: 0 0 auto;
        }
        .hamburger:hover { opacity: 0.8; }
        .bar { width: clamp(20px, 4vw, 26px); height: 3px; background-color: #f1faee; border-radius: 2px; transition: background-color 0.3s ease; }
        .hamburger:hover .bar { background-color: black; }

        .side-menu {
          position: fixed; top: 0; left: 0; width: 260px; max-width: 80vw; height: 100%;
          background: #2E294E; transform: translateX(-100%); transition: transform 0.3s ease-in-out;
          display: flex; flex-direction: column; align-items: center; padding: 80px 24px; box-shadow: 3px 0 10px rgba(0,0,0,0.3); z-index: 1100;
        }
        .side-menu.open { transform: translateX(0); }

        .menu-logo {
          font-family: 'Pacifico', cursive; font-size: clamp(28px, 6vw, 42px); color: #f1faee; margin-bottom: 20px; text-align: center; user-select: none; pointer-events: none;
        }
        .menu-logo::after {
          content: ""; display: block; width: 80%; height: 1px; background-color: rgba(255, 255, 255, 0.3); margin: 20px auto 30px;
        }

        .side-menu a {
          color: #f1faee; text-decoration: none; padding: 12px 0; font-size: clamp(16px, 3.5vw, 18px); transition: color 0.3s ease; width: 100%; text-align: center;
        }
        .side-menu a:hover { color: #878ed8ff; }

        .overlay {
          position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.4);
          opacity: 0; pointer-events: none; transition: opacity 0.3s ease; z-index: 1099;
        }
        .overlay.show { opacity: 1; pointer-events: auto; }

        .right-section { display: flex; align-items: center; gap: 1rem; flex: 1; justify-content: flex-end; min-width: 0; }

        /* 🔧 NEW: rename to avoid global ".brand" collisions */
        .site-brand {
          font-family: 'Pacifico', cursive;
          font-size: clamp(22px, 4.5vw, 32px);
          color: #f1faee;
          transition: color 0.3s ease, opacity 0.3s ease;
          white-space: nowrap;
          line-height: 1;          /* no vertical wobble */
          position: static;         /* ensure normal flow */
          transform: none;          /* cancel any global transforms */
          margin: 0;
          flex: 0 0 auto;
        }
        .site-brand:hover { color: #878ed8ff; }

        /* Responsive sizing for the auth button inside the navbar */
        #authBtn {
          padding: clamp(6px, 0.9vw, 10px) clamp(10px, 1.8vw, 16px);
          font-size: clamp(13px, 1.9vw, 15px);
        }

        .search-container { position: relative; display: flex; align-items: center; transition: all 0.3s ease; flex: 0 1 auto; }

        input[type="search"] {
          background: #ffffff; color: #000; border: 1px solid #ccc; border-radius: 4px;
          height: clamp(34px, 5.5vw, 38px);
          padding: 0 40px 0 12px;
          width: clamp(140px, 22vw, 220px);         /* responsive default width */
          transition: width 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
          box-sizing: border-box;
        }
        input[type="search"]:focus {
          outline: none;
          width: min(44vw, 420px);                  /* responsive focus width */
          border-color: #878ed8ff;
          box-shadow: 0 0 0 2px rgba(135,142,216,0.3);
          background: #ffffff;
        }

        button.search-btn {
          position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
          background: transparent; border: none; cursor: pointer; width: 24px; height: 24px; padding: 0;
          display: flex; align-items: center; justify-content: center;
        }
        button.search-btn svg { width: 18px; height: 18px; fill: #555; transition: fill 0.2s ease; }
        button.search-btn:hover svg { fill: #000; }

        /* ===== Mobile (≤768px) ===== */
        @media (max-width: 768px) {
          nav {
            flex-direction: row; align-items: center; justify-content: space-between; gap: 0.5rem;
          }

          /* [hamburger] [brand] [search] in one line */
          .hamburger { order: 1; flex-shrink: 0; }
          .site-brand { order: 2; flex-shrink: 0; }
          .right-section { order: 3; flex: 1; display: flex; justify-content: flex-end; align-items: center; }

          .search-container { margin-left: auto; max-width: 60%; }

          /* Always-open input on mobile (no width animation) */
          input[type="search"] {
            width: 100%; min-width: 0;
            padding-left: 12px; padding-right: 36px;
            transition: border-color 150ms ease, box-shadow 150ms ease; /* no width transition */
          }
          input[type="search"]:focus {
            width: 100%;
            border-color: #878ed8ff; box-shadow: 0 0 0 2px rgba(135,142,216,0.3); outline: none;
          }

          button.search-btn { right: 10px; }
        }
      </style>

      <nav>
        <div class="hamburger" id="hamburger" aria-label="Open menu" tabindex="0">
          <div class="bar"></div>
          <div class="bar"></div>
          <div class="bar"></div>
        </div>

        <div class="side-menu" id="sideMenu" aria-hidden="true">
          <a href="index.html"><div class="menu-logo">Pathfinder</div></a>
            <a href="main.html">App</a>
            <a href="quiz.html">Surveys</a>
            <a href="programs.html">Programs</a>
            <a href="#profile.html">Profile</a>
            <a href="#careers">Careers</a>
            <a href="goals.html">Goals</a>
            <a href="task.html">Tasks</a>
            <a href="index.html#slim">About Us</a>
            <a href="index.html#bcit">BCIT</a>
        </div>

        <div class="overlay" id="overlay"></div>

        <div class="right-section">
        <button
          id="authBtn"
          class="btn"
          type="button"
        >
          Login/Signup
        </button>
          <div class="search-container">
            <input type="search" id="navSearch" placeholder="Search News" aria-label="Search News">
            <button type="button" class="search-btn" aria-label="Search">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001l3.85 3.85a1 1 0 0 0 1.415-1.415l-3.867-3.833zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
              </svg>
            </button>
          </div>
          <a href="index.html">
          <span class="site-brand">Pathfinder</span>
          </a>
        </div>
      </nav>
    `;

    const hamburger = this.querySelector("#hamburger");
    const sideMenu = this.querySelector("#sideMenu");
    const overlay = this.querySelector("#overlay");

    const closeMenu = () => {
      sideMenu.classList.remove("open");
      overlay.classList.remove("show");
    };
    hamburger.addEventListener("click", () => {
      const open = sideMenu.classList.toggle("open");
      overlay.classList.toggle("show", open);
    });
    overlay.addEventListener("click", closeMenu);
  }

  renderAuthControls() {
    const authBtn = this.querySelector("#authBtn");

    function updateGlobalAuthButtons(isLoggedIn) {
      // Update any plain page buttons that say exactly "Login/Signup"
      document.querySelectorAll("button").forEach((btn) => {
        const txt = (btn.textContent || "").trim();
        if (txt === "Login/Signup" || txt === "Logout") {
          btn.textContent = isLoggedIn ? "Logout" : "Login/Signup";
        }
      });
      // Attach click handler once to those buttons to provide immediate logout
      document.querySelectorAll("button").forEach((btn) => {
        const txt = (btn.textContent || "").trim();
        if (txt === "Login/Signup" || txt === "Logout") {
          // remove inline navigation attribute to avoid double action
          try {
            btn.removeAttribute("onclick");
          } catch (e) {}
          if (!btn.dataset.authHandler) {
            btn.addEventListener("click", (e) => {
              // Decide action based on current button text at click time
              e.preventDefault();
              const now = (btn.textContent || "").trim();
              if (now === "Logout") {
                // Immediately sign out and rely on logoutUser's redirect
                logoutUser().catch((err) =>
                  console.error("Logout failed", err)
                );
              } else {
                // Navigate to login page for signin/signup
                window.location.href = "login.html";
              }
            });
            btn.dataset.authHandler = "1";
          }
        }
      });
    }

    onAuthReady((user) => {
      const isLoggedIn = !!user;
      if (authBtn) authBtn.textContent = isLoggedIn ? "Logout" : "Login/Signup";
      updateGlobalAuthButtons(isLoggedIn);
    });
  }
}

customElements.define("site-navbar", SiteNavbar);
