document.addEventListener("DOMContentLoaded", function () {
  const totalPages = 5; // Adjust this to the actual number of pages
  const itemsPerPage = 10; // Adjust this based on how many items per page
  const cmsContainer = document.getElementById("cms-container");
  const noResultsMessage = document.getElementById("no-results-message");
  const countElement = document.getElementById("count");
  const loadingIndicator = document.getElementById("loading-indicator");
  const searchInput = document.getElementById("search-bar");
  const sortDropdown = document.getElementById("sort-dropdown");
  const paginationContainer = document.getElementById("pagination");

  let cmsItems = []; // Store all CMS items for dynamic updates
  let currentPage = 1; // Default to page 1
  let filteredItems = []; // Items after applying filters/search

  // Fetch items from a page
  async function fetchPageContent(pageNumber) {
    try {
      console.log(`Fetching page /cms-items/page-${pageNumber}`);
      const response = await fetch(`/cms-items/page-${pageNumber}`);
      if (!response.ok) {
        throw new Error(
          `Failed to load page /cms-items/page-${pageNumber}: ${response.status}`
        );
      }
      const pageContent = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(pageContent, "text/html");
      return Array.from(doc.querySelectorAll(".cms-item"));
    } catch (error) {
      console.error(
        `Error fetching page /cms-items/page-${pageNumber}:`,
        error
      );
      return [];
    }
  }

  // Load all CMS items
  async function loadAllPages() {
    for (let i = 1; i <= totalPages; i++) {
      const items = await fetchPageContent(i);
      cmsItems.push(...items);
      items.forEach((item) => {
        cmsContainer.appendChild(item); // Append each item to the container
      });
    }
    filteredItems = [...cmsItems]; // Start with all items
  }

  // Update visible items based on current filters, search, and pagination
  function renderPage() {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const itemsToShow = filteredItems.slice(start, end);

    cmsItems.forEach((item) => {
      // Hide all items
      item.style.display = "none";
      item.style.opacity = "0";
      item.style.transform = "translateY(20px)";
    });

    itemsToShow.forEach((item, index) => {
      // Show and animate only the current page items
      item.style.display = "block";
      setTimeout(() => {
        item.style.opacity = "1";
        item.style.transform = "translateY(0)";
      }, index * 100); // Stagger timing
    });

    renderPaginationControls(filteredItems.length);
  }

  // Render pagination controls
  function renderPaginationControls(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    paginationContainer.innerHTML = ""; // Clear previous controls

    for (let i = 1; i <= totalPages; i++) {
      const button = document.createElement("button");
      button.textContent = i;
      button.classList.add("pagination-button");
      if (i === currentPage) button.classList.add("active");
      button.addEventListener("click", () => {
        currentPage = i;
        renderPage();
      });
      paginationContainer.appendChild(button);
    }
  }

  // Apply sorting
  function applySorting() {
    const sortOrder = sortDropdown.value;

    filteredItems.sort((a, b) => {
      const aText = a.textContent.toLowerCase();
      const bText = b.textContent.toLowerCase();
      return sortOrder === "asc"
        ? aText.localeCompare(bText)
        : bText.localeCompare(aText);
    });
  }

  // Apply filters
  function applyFilters() {
    const searchQuery = searchInput ? searchInput.value.toLowerCase() : "";
    filteredItems = cmsItems.filter((item) => {
      const content = item.textContent.toLowerCase();
      return content.includes(searchQuery);
    });

    applySorting(); // Reapply sorting after filtering

    currentPage = 1; // Reset to the first page
    renderPage();
    countElement.textContent = filteredItems.length;

    noResultsMessage.style.display =
      filteredItems.length > 0 ? "none" : "block";
  }

  // Main function
  async function main() {
    if (!cmsContainer) {
      console.error("CMS container not found");
      return;
    }

    cmsContainer.style.visibility = "hidden";

    console.log("Loading all CMS pages...");
    await loadAllPages();
    console.log("All pages loaded.");

    applyFilters(); // Apply initial filters

    if (loadingIndicator) {
      loadingIndicator.style.display = "none";
    }

    cmsContainer.style.visibility = "visible"; // Ensure the container is visible

    // Add event listeners
    if (searchInput) {
      // Prevent form submission
      searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
        }
      });

      // Update results in real-time
      searchInput.addEventListener("input", applyFilters);
    }

    if (sortDropdown) {
      sortDropdown.addEventListener("change", () => {
        applySorting();
        renderPage(); // Re-render the page after sorting
      });
    }
  }

  main();
});
