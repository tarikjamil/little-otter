document.addEventListener("DOMContentLoaded", async function () {
  const totalPages = 5; // Adjust to your needs
  const itemsPerPage = 10;
  const cmsContainer = document.getElementById("cms-container");
  const paginationContainer = document.getElementById("pagination");
  const loadingIndicator = document.getElementById("loading-indicator");
  let cmsItems = []; // Store all loaded items
  let currentPage = 1;

  if (!cmsContainer || !loadingIndicator) {
    console.error("Required elements are missing in the DOM.");
    return;
  }

  console.log("Starting script...");

  // Fetch items from a single page
  async function fetchPageContent(pageNumber) {
    try {
      console.log(`Fetching page: /blog-items/page-${pageNumber}`);
      const response = await fetch(`/blog-items/page-${pageNumber}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch page: ${response.status}`);
      }
      const pageContent = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(pageContent, "text/html");
      const items = Array.from(doc.querySelectorAll(".cms-item"));
      console.log(`Fetched ${items.length} items from page ${pageNumber}`);
      return items;
    } catch (error) {
      console.error(`Error fetching page ${pageNumber}:`, error);
      return [];
    }
  }

  // Load all pages
  async function loadAllPages() {
    try {
      console.log("Loading all pages...");
      loadingIndicator.style.display = "block";

      for (let i = 1; i <= totalPages; i++) {
        const items = await fetchPageContent(i);
        if (items.length === 0) {
          console.warn(`No items found on page ${i}`);
        }
        cmsItems.push(...items);
        items.forEach((item) => cmsContainer.appendChild(item));
      }

      console.log(`Total items loaded: ${cmsItems.length}`);
      loadingIndicator.style.display = "none";

      if (cmsItems.length === 0) {
        loadingIndicator.textContent = "No items found.";
      }

      initializeFiltersAndSorting();
      renderPage();
    } catch (error) {
      console.error("Error loading all pages:", error);
      loadingIndicator.textContent = "Failed to load content.";
    }
  }

  // Render current page of items
  function renderPage() {
    console.log(`Rendering page ${currentPage}`);
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    cmsItems.forEach((item, index) => {
      if (index >= start && index < end) {
        // Make items visible with animation
        item.style.display = "block";
        setTimeout(() => {
          item.style.opacity = "1";
          item.style.transform = "translateY(0)";
        }, index * 50); // Staggered animation (50ms per item)
      } else {
        // Hide items outside the current page
        item.style.opacity = "0";
        item.style.transform = "translateY(20rem)";
        setTimeout(() => {
          item.style.display = "none";
        }, 300); // Allow time for animation to complete
      }
    });

    renderPaginationControls();
  }

  // Render pagination controls
  function renderPaginationControls() {
    console.log("Rendering pagination controls...");
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

  // Initialize filters and sorting
  function initializeFiltersAndSorting() {
    console.log("Initializing filters and sorting...");
    const filterByTagRadios = document.querySelectorAll(
      ".filters--accordion:nth-child(1) .filter--radio"
    );
    const filterByParentRadios = document.querySelectorAll(
      ".filters--accordion:nth-child(2) .filter--radio"
    );
    const sortOptions = document.querySelectorAll(
      ".filters--accordion:nth-child(3) a"
    );

    if (!filterByTagRadios.length || !filterByParentRadios.length) {
      console.warn("No filters found in the DOM.");
    }

    let activeTagFilter = null;
    let activeParentFilter = null;
    let activeSortOrder = "asc";

    function applyFiltersAndSort() {
      console.log("Applying filters and sorting...");
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
      console.log("Sorting items...");
      const container = document.querySelector("#cms-container");
      const visibleItems = Array.from(cmsItems).filter(
        (item) => item.style.display !== "none"
      );

      visibleItems.sort((a, b) => {
        const aH4 = a.querySelector("h4");
        const bH4 = b.querySelector("h4");

        const aText = aH4 ? aH4.textContent.trim().toLowerCase() : "";
        const bText = bH4 ? bH4.textContent.trim().toLowerCase() : "";

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

  // Start the process
  await loadAllPages();
});
