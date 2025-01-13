document.addEventListener("DOMContentLoaded", async function () {
  const totalPages = 5; // Adjust to the actual number of pages
  const itemsPerPage = 4;
  const cmsContainer = document.getElementById("cms-container");
  const paginationContainer = document.getElementById("pagination");
  const loadingIndicator = document.getElementById("loading-indicator");
  let cmsItems = []; // Store all loaded items
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
      const items = Array.from(doc.querySelectorAll(".cms-item"));

      return items;
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
      } else {
        console.warn(`No .article--categories-list found on ${link}`);
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
        if (items.length === 0) {
          console.warn(`No items found on page ${i}`);
        }
        cmsItems.push(...items);
        items.forEach((item) => cmsContainer.appendChild(item));
      }

      // Fetch additional data for each item
      await Promise.all(cmsItems.map(fetchAdditionalData));

      loadingIndicator.style.display = "none";

      if (cmsItems.length === 0) {
        loadingIndicator.textContent = "No items found.";
      }

      renderPage();
    } catch (error) {
      console.error("Error loading all pages:", error);
      loadingIndicator.textContent = "Failed to load content.";
    }
  }

  // Render current page of items
  function renderPage() {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    cmsItems.forEach((item, index) => {
      if (index >= start && index < end) {
        item.style.display = "block";
        setTimeout(() => {
          item.style.opacity = "1";
          item.style.transform = "translateY(0)";
        }, index * 50);
      } else {
        item.style.opacity = "0";
        item.style.transform = "translateY(20rem)";
        setTimeout(() => {
          item.style.display = "none";
        }, 300);
      }
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

  await loadAllPages();
});

document.addEventListener("DOMContentLoaded", function () {
  const cmsItems = Array.from(document.querySelectorAll(".cms-item"));
  const categoryFilters = document.querySelectorAll(
    ".filters--accordion:nth-child(1) .filter--radio"
  );
  const tagFilters = document.querySelectorAll(
    ".filters--accordion:nth-child(2) .filter--radio"
  );
  const sortFilters = document.querySelectorAll(
    ".filters--accordion:nth-child(3) .filter--radio"
  );

  let activeCategoryFilter = null;
  let activeTagFilter = null;

  // Filter items based on active filters
  function applyFilters() {
    cmsItems.forEach((item) => {
      const tagItems = Array.from(
        item.querySelectorAll(".tag--item.is--regular")
      ).map((tag) => tag.textContent.trim());
      const tagField = item
        .querySelector("[fs-cmsfilter-field='tag']")
        ?.textContent.trim();

      const matchesCategoryFilter =
        !activeCategoryFilter || tagItems.includes(activeCategoryFilter);
      const matchesTagFilter = !activeTagFilter || tagField === activeTagFilter;

      item.style.display =
        matchesCategoryFilter && matchesTagFilter ? "block" : "none";
    });
  }

  // Sort items
  function applySorting(sortType) {
    const container = cmsItems[0]?.parentElement;
    const sortedItems = [...cmsItems];

    if (sortType === "A-Z" || sortType === "Z-A") {
      sortedItems.sort((a, b) => {
        const nameA = a
          .querySelector("[fs-cmssort-field='name']")
          ?.textContent.trim()
          .toLowerCase();
        const nameB = b
          .querySelector("[fs-cmssort-field='name']")
          ?.textContent.trim()
          .toLowerCase();

        if (sortType === "A-Z") return nameA > nameB ? 1 : -1;
        if (sortType === "Z-A") return nameA < nameB ? 1 : -1;
        return 0;
      });
    } else if (sortType === "Newest" || sortType === "Oldest") {
      sortedItems.sort((a, b) => {
        const dateA = new Date(
          a.querySelector("[fs-cmssort-field='date']")?.textContent.trim()
        );
        const dateB = new Date(
          b.querySelector("[fs-cmssort-field='date']")?.textContent.trim()
        );

        if (sortType === "Newest") return dateB - dateA;
        if (sortType === "Oldest") return dateA - dateB;
        return 0;
      });
    }

    // Reorder the items in the container
    sortedItems.forEach((item) => container.appendChild(item));
  }

  // Attach click events to category filters
  categoryFilters.forEach((filter) => {
    filter.addEventListener("click", () => {
      const filterValue = filter.textContent.trim();
      activeCategoryFilter =
        activeCategoryFilter === filterValue ? null : filterValue;
      applyFilters();
    });
  });

  // Attach click events to tag filters
  tagFilters.forEach((filter) => {
    filter.addEventListener("click", () => {
      const filterValue = filter.textContent.trim();
      activeTagFilter = activeTagFilter === filterValue ? null : filterValue;
      applyFilters();
    });
  });

  // Attach click events to sort filters
  sortFilters.forEach((filter) => {
    filter.addEventListener("click", () => {
      const sortType = filter.textContent.trim();
      applySorting(sortType);
    });
  });
});
