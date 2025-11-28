// BCIT Programs Page JavaScript
// Handles search and filter functionality for the programs listing

document.addEventListener('DOMContentLoaded', () => {
  initializeFilters();
  initializeSearch();
});

// Initialize category filter buttons
function initializeFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const sections = document.querySelectorAll('.program-category-section');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Update active button
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const filter = button.getAttribute('data-filter');

      // Show/hide sections based on filter
      sections.forEach(section => {
        const category = section.getAttribute('data-category');
        
        if (filter === 'all') {
          section.style.display = 'block';
        } else if (category === filter) {
          section.style.display = 'block';
        } else {
          section.style.display = 'none';
        }
      });

      // Clear search when changing filters
      const searchInput = document.getElementById('programSearch');
      if (searchInput) {
        searchInput.value = '';
        clearSearch();
      }
    });
  });
}

// Initialize search functionality
function initializeSearch() {
  const searchInput = document.getElementById('programSearch');
  
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase().trim();
      
      if (searchTerm === '') {
        clearSearch();
        return;
      }

      searchPrograms(searchTerm);
    });
  }
}

// Search through all program cards
function searchPrograms(searchTerm) {
  const programCards = document.querySelectorAll('.program-card');
  const sections = document.querySelectorAll('.program-category-section');
  let hasVisibleCards = {};

  // First, show all sections when searching
  sections.forEach(section => {
    const category = section.getAttribute('data-category');
    section.style.display = 'block';
    hasVisibleCards[category] = false;
  });

  // Filter program cards based on search term
  programCards.forEach(card => {
    const programName = card.querySelector('.program-name a')?.textContent.toLowerCase() || '';
    const programArea = card.querySelector('.program-area')?.textContent.toLowerCase() || '';
    const programDescription = card.querySelector('.program-description')?.textContent.toLowerCase() || '';
    
    const matchesSearch = 
      programName.includes(searchTerm) || 
      programArea.includes(searchTerm) || 
      programDescription.includes(searchTerm);

    if (matchesSearch) {
      card.style.display = 'block';
      // Track which sections have visible cards
      const section = card.closest('.program-category-section');
      if (section) {
        const category = section.getAttribute('data-category');
        hasVisibleCards[category] = true;
      }
    } else {
      card.style.display = 'none';
    }
  });

  // Hide sections that have no visible cards
  sections.forEach(section => {
    const category = section.getAttribute('data-category');
    if (!hasVisibleCards[category]) {
      section.style.display = 'none';
    }
  });

  // Update filter buttons to show "All Programs" when searching
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => btn.classList.remove('active'));
  const allButton = document.querySelector('.filter-btn[data-filter="all"]');
  if (allButton) {
    allButton.classList.add('active');
  }
}

// Clear search and show all programs
function clearSearch() {
  const programCards = document.querySelectorAll('.program-card');
  const sections = document.querySelectorAll('.program-category-section');
  
  // Show all cards
  programCards.forEach(card => {
    card.style.display = 'block';
  });

  // Respect current filter
  const activeFilter = document.querySelector('.filter-btn.active');
  if (activeFilter) {
    const filter = activeFilter.getAttribute('data-filter');
    
    sections.forEach(section => {
      const category = section.getAttribute('data-category');
      
      if (filter === 'all') {
        section.style.display = 'block';
      } else if (category === filter) {
        section.style.display = 'block';
      } else {
        section.style.display = 'none';
      }
    });
  }
}