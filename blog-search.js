document.addEventListener("DOMContentLoaded", async function () {
  const totalPages = 5; // Adjust to the actual number of pages
  const itemsPerPage = 4;
  const cmsContainer = document.getElementById("cms-container");
  const paginationContainer = document.getElementById("pagination");
  const loadingIndicator = document.getElementById("loading-indicator");
  const categoryFilters = document.querySelectorAll(
    ".filters--accordion.is--filter .filter--radio"
  );
  const tagFilters = document.querySelectorAll(
    ".filters--accordion.is--tag .filter--radio"
  );
  const sortFilters = document.querySelectorAll(
    ".filters--accordion.is--sort .filter--radio"
  );

  let cmsItems = [];
  let visibleItems = []; // Store filtered items
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
    const link = cmsItem.querySelector(".blog--item a").href; // Ensure it's fetching the correct link
    try {
      const response = await fetch(link);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${link}: ${response.status}`);
      }
      const pageContent = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(pageContent, "text/html");

      // Extract and update categories
      const categories = doc.querySelector(".article--categories-list");
      if (categories) {
        const categoriesParent = cmsItem.querySelector(".categories-parents");
        if (categoriesParent) {
          categoriesParent.innerHTML = categories.innerHTML;
        }
      }

      // Extract and update authors
      const authorsContainer = cmsItem.querySelector(".authors--list");
      if (authorsContainer) {
        const authors = doc.querySelectorAll(".author--item"); // Fetch all authors from the blog post
        authorsContainer.innerHTML = ""; // Clear existing authors before adding new ones
        authors.forEach((author) => {
          const clonedAuthor = author.cloneNode(true); // Clone each author item
          authorsContainer.appendChild(clonedAuthor); // Append to the authors list in cmsItem
        });
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
      await Promise.all(cmsItems.map(fetchAdditionalData)); // Fetch additional data for all items
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
    visibleItems = cmsItems.filter((item) => {
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

      return matchesCategoryFilter && matchesTagFilter;
    });

    console.log(`Filtered items count: ${visibleItems.length}`);
    currentPage = 1; // Reset to the first page after filtering
    renderPage(); // Render the filtered items
  }

  // Apply sorting to items
  function applySorting(sortType) {
    if (!sortType) return;

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

    console.log(`Sorted items by: ${sortType}`);
    renderPage(); // Render after sorting
  }

  // Render the current page based on pagination
  function renderPage() {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    console.log(
      `Rendering items for page ${currentPage}: indexes ${start} to ${end}`
    );

    cmsItems.forEach((item) => {
      item.style.display = "none"; // Hide all items initially
    });

    visibleItems.forEach((item, index) => {
      if (index >= start && index < end) {
        item.style.display = "block"; // Display items for the current page
        item.style.opacity = "1"; // Make sure items are visible
        item.style.transform = "translateY(0)"; // Reset transform
      }
    });

    renderPaginationControls(visibleItems.length);
  }

  // Render pagination controls
  function renderPaginationControls(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    paginationContainer.innerHTML = ""; // Clear existing buttons

    if (currentPage > 1) {
      const prevButton = document.createElement("a");
      prevButton.setAttribute("aria-label", "Previous Page");
      prevButton.className = "w-pagination-previous pagination--btn";
      prevButton.innerHTML = `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        viewBox="0 0 16 16"
        fill="none"
        class="icon--16 is--reverse"
      >
        <path
          d="M2.64555 7.33268H10.7962L7.05241 3.60602L8.00344 2.66602L13.3613 7.99935L8.00344 13.3327L7.05911 12.3927L10.7962 8.66602H2.64555V7.33268Z"
          fill="currentColor"
        ></path>
      </svg>`;
      prevButton.addEventListener("click", () => {
        currentPage--;
        renderPage();
      });
      paginationContainer.appendChild(prevButton);
    }

    if (currentPage < totalPages) {
      const nextButton = document.createElement("a");
      nextButton.setAttribute("aria-label", "Next Page");
      nextButton.className = "w-pagination-next pagination--btn";
      nextButton.innerHTML = `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        viewBox="0 0 16 16"
        fill="none"
        class="icon--16"
      >
        <path
          d="M2.64555 7.33268H10.7962L7.05241 3.60602L8.00344 2.66602L13.3613 7.99935L8.00344 13.3327L7.05911 12.3927L10.7962 8.66602H2.64555V7.33268Z"
          fill="currentColor"
        ></path>
      </svg>`;
      nextButton.addEventListener("click", () => {
        currentPage++;
        renderPage();
      });
      paginationContainer.appendChild(nextButton);
    }
  }

  categoryFilters.forEach((filter) => {
    filter.addEventListener("click", () => {
      const filterValue = filter.textContent.trim();
      if (activeCategoryFilter === filterValue) {
        activeCategoryFilter = null;
        filter.classList.remove("is--active"); // Remove active class if deselected
      } else {
        activeCategoryFilter = filterValue;
        categoryFilters.forEach((f) => f.classList.remove("is--active")); // Remove active class from others
        filter.classList.add("is--active"); // Add active class to the clicked filter
      }
      applyFilters();
    });
  });

  // Attach event listeners to tag filters
  tagFilters.forEach((filter) => {
    filter.addEventListener("click", () => {
      const filterValue = filter.textContent.trim();
      if (activeTagFilter === filterValue) {
        activeTagFilter = null;
        filter.classList.remove("is--active"); // Remove active class if deselected
      } else {
        activeTagFilter = filterValue;
        tagFilters.forEach((f) => f.classList.remove("is--active")); // Remove active class from others
        filter.classList.add("is--active"); // Add active class to the clicked filter
      }
      applyFilters();
    });
  });

  // Attach event listeners to sort filters
  sortFilters.forEach((filter) => {
    filter.addEventListener("click", () => {
      const sortValue = filter.textContent.trim();
      if (sortType === sortValue) {
        sortType = null;
        filter.classList.remove("is--active"); // Remove active class if deselected
      } else {
        sortType = sortValue;
        sortFilters.forEach((f) => f.classList.remove("is--active")); // Remove active class from others
        filter.classList.add("is--active"); // Add active class to the clicked filter
      }
      applySorting(sortType);
    });
  });

  await loadAllPages();
});
