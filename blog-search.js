document.addEventListener("DOMContentLoaded", function () {
  const totalPages = 5; // Adjust this to the actual number of pages
  const itemsPerPage = 4; // Items per page
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
      console.log(`Fetching page /blog-items/page-${pageNumber}`);
      const response = await fetch(`/blog-items/page-${pageNumber}`);
      if (!response.ok) {
        throw new Error(
          `Failed to load page /blog-items/page-${pageNumber}: ${response.status}`
        );
      }
      const pageContent = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(pageContent, "text/html");
      return Array.from(doc.querySelectorAll(".cms-item"));
    } catch (error) {
      console.error(
        `Error fetching page /blog-items/page-${pageNumber}:`,
        error
      );
      return [];
    }
  }

  // Fetch additional data for each CMS item
  async function fetchAdditionalData(cmsItem) {
    const link = cmsItem.querySelector("a").href; // Assuming the item contains a link
    try {
      console.log(`Fetching article categories from: ${link}`);
      const response = await fetch(link);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${link}: ${response.status}`);
      }
      const pageContent = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(pageContent, "text/html");
      const categories = doc.querySelector(".article--categories-list");

      if (categories) {
        const categoriesParent = cmsItem.querySelector(".categories-parents");
        if (categoriesParent) {
          categoriesParent.innerHTML = categories.innerHTML; // Append fetched content
        }
      }
    } catch (error) {
      console.error(`Error fetching additional data for ${link}:`, error);
    }
  }

  // Load all pages and fetch additional data
  async function loadAllPages() {
    for (let i = 1; i <= totalPages; i++) {
      const items = await fetchPageContent(i);
      cmsItems.push(...items);
      items.forEach((item) => {
        cmsContainer.appendChild(item); // Append items to the container
      });
    }

    // Fetch additional data for each item
    await Promise.all(cmsItems.map(fetchAdditionalData));

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
    console.log("All pages loaded and categories appended.");

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
