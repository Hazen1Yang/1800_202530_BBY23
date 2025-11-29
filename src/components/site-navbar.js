// Import specific functions from the Firebase Auth SDK
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "/src/firebaseConfig.js";
import { logoutUser } from "/src/authentication.js";

class SiteNavbar extends HTMLElement {
  constructor() {
    super();
    this.renderNavbar();
    this.renderAuthControls();
  }

  renderNavbar() {
    this.innerHTML = `
    <!-- Navbar: single source of truth -->
    <div class="topbar">
      <div class="topbar-inner">
        <a href="app_index.html">
          <img
            src="https://www.svgrepo.com/show/532195/menu.svg"
            class="icon menu-icon"
            alt="menu"
          />
        </a>
        <input class="search" type="search" placeholder="Search" />
        <button
          class="btn btn-outline-light d-none d-sm-inline-block"
          type="submit"
          aria-label="Search"
        >
          <!-- magnifying glass icon (inline SVG) -->

        <img
          src="https://www.svgrepo.com/show/486229/magnifying-glass-backup.svg"
          class="icon right-icon"
          alt="help"
        />
        </button>

        <img
          src="https://www.svgrepo.com/show/512690/profile-1335.svg"
          class="icon profile-icon"
          alt="profile"
        />
        <div
          id="authControls"
          class="auth-controls d-flex align-items-center gap-2 my-2 my-lg-0"
        >
          <!-- populated by JS -->
        </div>
      </div>
      <h1 class="brand">PathFinder</h1>
    </div>
        `;
  }
  renderAuthControls() {
    const authControls = this.querySelector("#authControls");

    // Initialize with invisible placeholder to maintain layout space
    authControls.innerHTML = `<div class="btn btn-outline-light" style="visibility: hidden; min-width: 80px;">Log out</div>`;

    // Check if Firebase auth is available
    if (!auth) {
      // If Firebase is not configured, show login button as fallback
      console.warn("Firebase auth not configured. Showing login button.");
      authControls.innerHTML = `<a class="btn btn-outline-light" id="loginBtn" href="/login.html" style="min-width: 80px;">Log in</a>`;
      return;
    }

    // Wrap Firebase auth logic in try-catch to handle runtime errors gracefully
    try {
      onAuthStateChanged(auth, (user) => {
        let updatedAuthControl;
        if (user) {
          updatedAuthControl = `<button class="btn btn-outline-light" id="signOutBtn" type="button" style="min-width: 80px;">Log out</button>`;
          authControls.innerHTML = updatedAuthControl;
          const signOutBtn = authControls.querySelector("#signOutBtn");
          signOutBtn?.addEventListener("click", logoutUser);
        } else {
          updatedAuthControl = `<a class="btn btn-outline-light" id="loginBtn" href="/login.html" style="min-width: 80px;">Log in</a>`;
          authControls.innerHTML = updatedAuthControl;
        }
      });
    } catch (error) {
      // If Firebase encounters an error, show login button as fallback
      console.warn("Firebase auth error:", error);
      authControls.innerHTML = `<a class="btn btn-outline-light" id="loginBtn" href="/login.html" style="min-width: 80px;">Log in</a>`;
    }
  }
}

customElements.define("site-navbar", SiteNavbar);