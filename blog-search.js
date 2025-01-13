document.addEventListener("DOMContentLoaded", async function () {
  const totalPages = 5; // Adjust to the actual number of pages
  const itemsPerPage = 4;
  const cmsContainer = document.getElementById("cms-container");
  const paginationContainer = document.getElementById("pagination");
  const loadingIndicator = document.getElementById("loading-indicator");
  const categoryFilters = document.querySelectorAll(
    ".filters--accordion:nth-child(1) .filter--radio"
  );
  const tagFilters = document.querySelectorAll(
    ".filters--accordion:nth-child(2) .filter--radio"
  );
  const sortFilters = document.querySelectorAll(
    ".filters--accordion:nth-child(3) .filter--radio"
  );

  let cmsItems = [];
  let activeCategoryFilter = null;
  let activeTagFilter = null;
  let sortType = null; // Store the current sort type
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
        throw new Error(`Failed to fetch page: ${response.status}`);
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

  // Fetch additional data for each CMS item
  async function fetchAdditionalData(cmsItem) {
    const link = cmsItem.querySelector("a").href;
    try {
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
          categoriesParent.innerHTML = categories.innerHTML;
        }
      }
    } catch (error) {
      console.error(`Error fetching additional data for ${link}:`, error);
    }
  }

  // Load all pages and initialize
  async function loadAllPages() {
    try {
      loadingIndicator.style.display = "block";
      for (let i = 1; i <= totalPages; i++) {
        const items = await fetchPageContent(i);
        cmsItems.push(...items);
        items.forEach((item) => cmsContainer.appendChild(item));
      }
      await Promise.all(cmsItems.map(fetchAdditionalData));
      loadingIndicator.style.display = "none";
      applyFilters(); // Apply filters after loading
      applySorting(sortType); // Apply sorting if already selected
      renderPage(); // Render the first page
    } catch (error) {
      console.error("Error loading all pages:", error);
    }
  }

  // Apply filters to items
  function applyFilters() {
    cmsItems.forEach((item) => {
      const categories = Array.from(
        item.querySelectorAll(".categories-parents .tag--item.is--regular")
      ).map((el) => el.textContent.trim());

      const tags = Array.from(
        item.querySelectorAll("[fs-cmsfilter-field='tag']")
      ).map((el) => el.textContent.trim());

      const matchesCategoryFilter =
        !activeCategoryFilter || categories.includes(activeCategoryFilter);
      const matchesTagFilter =
        !activeTagFilter || tags.includes(activeTagFilter);

      item.style.display =
        matchesCategoryFilter && matchesTagFilter ? "block" : "none";
    });
  }

  // Apply sorting to items
  function applySorting(sortType) {
    if (!sortType) return;
    const container = cmsContainer;
    const visibleItems = cmsItems.filter(
      (item) => item.style.display !== "none"
    );

    visibleItems.sort((a, b) => {
      if (sortType === "A-Z" || sortType === "Z-A") {
        const nameA = a
          .querySelector("[fs-cmssort-field='name']")
          ?.textContent.trim()
          .toLowerCase();
        const nameB = b
          .querySelector("[fs-cmssort-field='name']")
          ?.textContent.trim()
          .toLowerCase();
        return sortType === "A-Z"
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      } else if (sortType === "Newest" || sortType === "Oldest") {
        const dateA = new Date(
          a.querySelector("[fs-cmssort-field='date']")?.textContent.trim()
        );
        const dateB = new Date(
          b.querySelector("[fs-cmssort-field='date']")?.textContent.trim()
        );
        return sortType === "Newest" ? dateB - dateA : dateA - dateB;
      }
    });

    // Reorder items in the DOM
    visibleItems.forEach((item) => container.appendChild(item));
  }

  // Render the current page based on pagination
  function renderPage() {
    // Filter the items to only those currently visible
    const visibleItems = cmsItems.filter((item) => {
      console.log(`Item display: ${item.style.display}`);
      return item.style.display !== "none";
    });

    // Calculate the start and end indexes for the current page
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    console.log(
      `Rendering items for page ${currentPage}: indexes ${start} to ${end}`
    );

    // Loop through all visible items and display only those within the range for the current page
    visibleItems.forEach((item, index) => {
      if (index >= start && index < end) {
        console.log(`Displaying item at index ${index}`);
        item.style.display = "block"; // Ensure items are displayed
        item.style.opacity = "1"; // Make sure items are visible
        item.style.transform = "translateY(0)"; // Reset transform
      } else {
        console.log(`Hiding item at index ${index}`);
        item.style.display = "none"; // Ensure other items are hidden
        item.style.opacity = "0"; // Hide items visually
        item.style.transform = "translateY(20rem)"; // Apply transform for animation
      }
    });

    // Update pagination controls based on the total visible items
    renderPaginationControls(visibleItems.length);
  }

  // Render pagination controls
  function renderPaginationControls(totalItems) {
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

  // Attach event listeners to category filters
  categoryFilters.forEach((filter) => {
    filter.addEventListener("click", () => {
      const filterValue = filter.textContent.trim();
      activeCategoryFilter =
        activeCategoryFilter === filterValue ? null : filterValue;
      applyFilters();
      applySorting(sortType); // Ensure sorting is reapplied
      currentPage = 1; // Reset to the first page
      renderPage();
    });
  });

  // Attach event listeners to tag filters
  tagFilters.forEach((filter) => {
    filter.addEventListener("click", () => {
      const filterValue = filter.textContent.trim();
      activeTagFilter = activeTagFilter === filterValue ? null : filterValue;
      applyFilters();
      applySorting(sortType); // Ensure sorting is reapplied
      currentPage = 1; // Reset to the first page
      renderPage();
    });
  });

  // Attach event listeners to sort filters
  sortFilters.forEach((filter) => {
    filter.addEventListener("click", () => {
      sortType = filter.textContent.trim();
      applySorting(sortType);
      currentPage = 1; // Reset to the first page
      renderPage();
    });
  });

  await loadAllPages();
});
