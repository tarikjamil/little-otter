document.addEventListener("DOMContentLoaded", async function () {
  const totalPages = 5; // Update to the actual number of pages
  const itemsPerPage = 10;
  const cmsContainer = document.getElementById("cms-container");
  const paginationContainer = document.getElementById("pagination");
  const loadingIndicator = document.getElementById("loading-indicator");
  let cmsItems = []; // Store all items
  let currentPage = 1;

  if (!cmsContainer || !loadingIndicator) {
    console.error("Required elements are missing in the DOM.");
    return;
  }

  // Fetch items from a single page
  async function fetchPageContent(pageNumber) {
    try {
      const response = await fetch(`/blog-items/page-${pageNumber}`);
      if (!response.ok) {
        throw new Error(`Failed to load page: ${response.status}`);
      }
      const pageContent = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(pageContent, "text/html");
      return Array.from(doc.querySelectorAll(".cms-item"));
    } catch (error) {
      console.error(`Error fetching page ${pageNumber}:`, error);
      return [];
    }
  }

  // Load all pages and initialize
  async function loadAllPages() {
    try {
      loadingIndicator.style.display = "block"; // Show loading indicator

      for (let i = 1; i <= totalPages; i++) {
        const items = await fetchPageContent(i);
        if (items.length === 0) {
          console.warn(`No items found on page ${i}`);
        }
        cmsItems.push(...items);
        items.forEach((item) => cmsContainer.appendChild(item)); // Append to DOM
      }

      loadingIndicator.style.display = "none"; // Hide loading indicator
      initializeFiltersAndSorting();
      renderPage();
    } catch (error) {
      console.error("Error loading pages:", error);
      loadingIndicator.textContent = "Failed to load content.";
    }
  }

  // Render current page of items
  function renderPage() {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    cmsItems.forEach((item, index) => {
      item.style.display = index >= start && index < end ? "block" : "none";
    });

    renderPaginationControls();
  }

  // Render pagination controls
  function renderPaginationControls() {
    const totalItems = cmsItems.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    paginationContainer.innerHTML = "";

    // Previous button
    if (currentPage > 1) {
      const prevButton = document.createElement("a");
      prevButton.textContent = "Previous";
      prevButton.className = "w-pagination-previous pagination--btn";
      prevButton.addEventListener("click", () => {
        currentPage--;
        renderPage();
      });
      paginationContainer.appendChild(prevButton);
    }

    // Next button
    if (currentPage < totalPages) {
      const nextButton = document.createElement("a");
      nextButton.textContent = "Next";
      nextButton.className = "w-pagination-next pagination--btn";
      nextButton.addEventListener("click", () => {
        currentPage++;
        renderPage();
      });
      paginationContainer.appendChild(nextButton);
    }
  }

  // Initialize filters and sorting
  function initializeFiltersAndSorting() {
    const filterByTagRadios = document.querySelectorAll(
      ".filters--accordion:nth-child(1) .filter--radio"
    );
    const filterByParentRadios = document.querySelectorAll(
      ".filters--accordion:nth-child(2) .filter--radio"
    );
    const sortOptions = document.querySelectorAll(
      ".filters--accordion:nth-child(3) a"
    );

    let activeTagFilter = null;
    let activeParentFilter = null;
    let activeSortOrder = "asc";

    function applyFiltersAndSort() {
      cmsItems.forEach((item) => {
        const tags = Array.from(item.querySelectorAll(".tag--item")).map(
          (tag) => tag.textContent.trim()
        );
        const parents = Array.from(item.querySelectorAll(".tags--parents")).map(
          (parent) => parent.textContent.trim()
        );

        const matchesTagFilter =
          !activeTagFilter || tags.includes(activeTagFilter);
        const matchesParentFilter =
          !activeParentFilter || parents.includes(activeParentFilter);

        item.style.display =
          matchesTagFilter && matchesParentFilter ? "block" : "none";
      });

      sortCmsItems();
    }

    function sortCmsItems() {
      const container = document.querySelector("#cms-container");
      const visibleItems = Array.from(cmsItems).filter(
        (item) => item.style.display !== "none"
      );

      visibleItems.sort((a, b) => {
        const aText = a.querySelector("h4").textContent.trim().toLowerCase();
        const bText = b.querySelector("h4").textContent.trim().toLowerCase();
        return activeSortOrder === "asc"
          ? aText.localeCompare(bText)
          : bText.localeCompare(aText);
      });

      visibleItems.forEach((item) => container.appendChild(item));
    }

    filterByTagRadios.forEach((radio) => {
      radio.addEventListener("click", () => {
        const label = radio.querySelector(".w-form-label").textContent.trim();
        activeTagFilter = label === activeTagFilter ? null : label;
        applyFiltersAndSort();
      });
    });

    filterByParentRadios.forEach((radio) => {
      radio.addEventListener("click", () => {
        const label = radio.querySelector(".w-form-label").textContent.trim();
        activeParentFilter = label === activeParentFilter ? null : label;
        applyFiltersAndSort();
      });
    });

    sortOptions.forEach((option) => {
      option.addEventListener("click", (event) => {
        event.preventDefault();
        activeSortOrder =
          option.querySelector(".filter--text").textContent.trim() === "A-Z"
            ? "asc"
            : "desc";
        applyFiltersAndSort();
      });
    });

    applyFiltersAndSort();
  }

  // Start loading all pages
  await loadAllPages();
});
