document.addEventListener("DOMContentLoaded", function () {
  const totalPages = 5; // Adjust based on actual number of pages
  const itemsPerPage = 10; // Items per page
  const cmsContainer = document.getElementById("cms-container");
  const paginationContainer = document.getElementById("pagination");
  let cmsItems = []; // Store all loaded CMS items
  let currentPage = 1;

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

  // Load all pages and initialize items
  async function loadAllPages() {
    for (let i = 1; i <= totalPages; i++) {
      const items = await fetchPageContent(i);
      cmsItems.push(...items);
      items.forEach((item) => cmsContainer.appendChild(item));
    }
    initializeFiltersAndSorting();
  }

  // Render the current page of items
  function renderPage() {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const itemsToShow = cmsItems.slice(start, end);

    cmsItems.forEach((item) => {
      item.style.display = "none"; // Hide all items
    });

    itemsToShow.forEach((item) => {
      item.style.display = "block"; // Show items for the current page
    });

    renderPaginationControls();
  }

  // Render pagination controls
  function renderPaginationControls() {
    const totalItems = cmsItems.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    paginationContainer.innerHTML = "";

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

  // Initialize filtering and sorting logic
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

    // Apply the current filters and sort
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

        if (matchesTagFilter && matchesParentFilter) {
          item.style.display = "block";
        } else {
          item.style.display = "none";
        }
      });

      sortCmsItems();
    }

    // Sort the CMS items
    function sortCmsItems() {
      const container = document.querySelector("#cms-container");
      const itemsArray = Array.from(cmsItems).filter(
        (item) => item.style.display !== "none"
      );

      itemsArray.sort((a, b) => {
        const aText = a.querySelector("h4").textContent.trim().toLowerCase();
        const bText = b.querySelector("h4").textContent.trim().toLowerCase();

        return activeSortOrder === "asc"
          ? aText.localeCompare(bText)
          : bText.localeCompare(aText);
      });

      itemsArray.forEach((item) => container.appendChild(item));
    }

    // Add event listeners
    filterByTagRadios.forEach((radio) => {
      radio.addEventListener("click", () => {
        const label = radio.querySelector(".w-form-label").textContent.trim();
        activeTagFilter = label === activeTagFilter ? null : label; // Toggle filter
        applyFiltersAndSort();
      });
    });

    filterByParentRadios.forEach((radio) => {
      radio.addEventListener("click", () => {
        const label = radio.querySelector(".w-form-label").textContent.trim();
        activeParentFilter = label === activeParentFilter ? null : label; // Toggle filter
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

  // Load all items and initialize
  loadAllPages();
});
