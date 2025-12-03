// Minimal, dependency-free navbar toggle script.
// Save as src/scripts/navbar.js and include near the end of <body>:
// <script type="module" src="src/scripts/navbar.js"></script>
document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const nav = document.querySelector('.site-nav');
  const toggle = document.querySelector('.nav-toggle');

  if (!nav || !toggle || !header) return;

  // Initial state
  nav.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', 'primary-navigation');

  // ensure nav has an id for aria-controls
  if (!nav.id) nav.id = 'primary-navigation';

  toggle.addEventListener('click', () => {
    const expanded = nav.getAttribute('aria-expanded') === 'true';
    nav.setAttribute('aria-expanded', String(!expanded));
    toggle.setAttribute('aria-expanded', String(!expanded));
    header.classList.toggle('is-open', !expanded);
  });

  // Close nav on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.getAttribute('aria-expanded') === 'true') {
      nav.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-expanded', 'false');
      header.classList.remove('is-open');
      toggle.focus();
    }
  });
});
