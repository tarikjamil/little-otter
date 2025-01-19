document.addEventListener("DOMContentLoaded", function () {
  const totalPages = 5; // Adjust this to the actual number of pages
  const itemsPerPage = 10; // Items per page
  const cmsContainer = document.getElementById("cms-container");
  const noResultsMessage = document.getElementById("no-results-message");
  const countElement = document.getElementById("count");
  const loadingIndicator = document.getElementById("loading-indicator");
  const searchInput = document.getElementById("search-bar");
  const sortDropdown = document.getElementById("sort-dropdown");
  const paginationContainer = document.getElementById("pagination");

  let cmsItems = []; // Store all CMS items
  let filteredItems = []; // Filtered items after search/sort
  let currentPage = 1; // Current page index

  // Fetch items from a single page
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

  // Load all pages and store CMS items
  async function loadAllPages() {
    for (let i = 1; i <= totalPages; i++) {
      const items = await fetchPageContent(i);
      cmsItems.push(...items);
      items.forEach((item) => {
        cmsContainer.appendChild(item); // Append items to the container
      });
    }
    filteredItems = [...cmsItems]; // Start with all items
  }

  // Apply filters based on the search query
  function applyFilters() {
    const queryFromURL =
      new URLSearchParams(window.location.search).get("query") || "";
    const searchQuery = searchInput
      ? searchInput.value.toLowerCase() || queryFromURL.toLowerCase()
      : queryFromURL.toLowerCase();

    console.log("Search Query:", searchQuery);

    // Update the #title content with the search query
    const titleElement = document.getElementById("title");
    if (titleElement) {
      titleElement.textContent = searchQuery
        ? `Search Results for "${searchQuery}"`
        : "All Items"; // Default title if no query
    }

    filteredItems = cmsItems.filter((item) => {
      const content = item.textContent.toLowerCase();
      return content.includes(searchQuery);
    });

    applySorting(); // Sort the filtered items
    updateCount(); // Update the count
    currentPage = 1; // Reset to first page
    renderPage(); // Render the first page
  }

  // Sort the filtered items
  function applySorting() {
    const sortOrder = sortDropdown ? sortDropdown.value : "asc";

    filteredItems.sort((a, b) => {
      const aText = a.textContent.toLowerCase();
      const bText = b.textContent.toLowerCase();
      return sortOrder === "asc"
        ? aText.localeCompare(bText)
        : bText.localeCompare(aText);
    });
  }

  // Render the current page of items
  function renderPage() {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const itemsToShow = filteredItems.slice(start, end);

    cmsItems.forEach((item) => {
      // Hide all items initially
      item.style.display = "none";
      item.style.opacity = "0";
      item.style.transform = "translateY(20px)";
    });

    itemsToShow.forEach((item, index) => {
      // Show and animate visible items
      item.style.display = "block";
      setTimeout(() => {
        item.style.opacity = "1";
        item.style.transform = "translateY(0)";
      }, index * 20); // Stagger animations
    });

    renderPaginationControls(filteredItems.length);
  }

  // Update the count of visible items
  function updateCount() {
    if (countElement) {
      countElement.textContent = filteredItems.length;
    }
    if (noResultsMessage) {
      noResultsMessage.style.display =
        filteredItems.length > 0 ? "none" : "block";
    }
  }

  // Render pagination controls
  function renderPaginationControls(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    paginationContainer.innerHTML = ""; // Clear existing controls

    for (let i = 1; i <= totalPages; i++) {
      const button = document.createElement("button");
      button.textContent = i;
      button.classList.add("pagination--btn");
      if (i === currentPage) button.classList.add("is--active");
      button.addEventListener("click", () => {
        currentPage = i;
        renderPage();
      });
      paginationContainer.appendChild(button);
    }
  }

  // Main function to initialize the script
  async function main() {
    if (!cmsContainer) {
      console.error("CMS container not found");
      return;
    }

    cmsContainer.style.visibility = "hidden";

    console.log("Loading all CMS pages...");
    await loadAllPages();
    console.log("All pages loaded.");

    // Pre-fill search input from URL query
    if (searchInput) {
      const params = new URLSearchParams(window.location.search);
      const queryFromURL = params.get("query") || "";
      searchInput.value = queryFromURL;
    }

    applyFilters(); // Apply initial filters

    if (loadingIndicator) {
      loadingIndicator.style.display = "none";
    }

    cmsContainer.style.visibility = "visible";

    // Add event listeners for real-time filtering and sorting
    if (searchInput) {
      searchInput.addEventListener("input", applyFilters);
    }

    if (sortDropdown) {
      sortDropdown.addEventListener("change", () => {
        applySorting();
        renderPage();
      });
    }
  }

  main();
});
