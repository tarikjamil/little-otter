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

  // Fetch additional data for each CMS item
  async function fetchAdditionalData(cmsItem) {
    const link = cmsItem.querySelector("a").href;
    try {
      console.log(`Fetching additional data from: ${link}`);
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
          console.log(`Appended categories to .categories-parents for ${link}`);
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
    console.log(`Rendering page ${currentPage}`);
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

  await loadAllPages();
});
