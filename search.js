document.addEventListener("DOMContentLoaded", function () {
  const totalPages = 5; // Adjust this to the actual number of pages
  const cmsContainer = document.getElementById("cms-container");
  const noResultsMessage = document.getElementById("no-results-message");
  const countElement = document.getElementById("count");
  const loadingIndicator = document.getElementById("loading-indicator");

  // Get the search query from the URL
  const params = new URLSearchParams(window.location.search);
  const searchQuery = params.get("query")?.toLowerCase() || "";

  // Function to fetch and load items from a page
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

  // Function to load all pages
  async function loadAllPages() {
    for (let i = 1; i <= totalPages; i++) {
      const items = await fetchPageContent(i);
      console.log(`Appending ${items.length} items from page ${i}`);
      items.forEach((item) => {
        cmsContainer.appendChild(item); // Append each item to the container
      });
    }
  }

  // Function to filter items based on the search query
  function filterItems() {
    console.log("Filtering items...");
    const cmsItems = cmsContainer.querySelectorAll(".cms-item");
    console.log(`Total items: ${cmsItems.length}`);
    let matchesFound = 0;

    cmsItems.forEach((item, index) => {
      const content = item.textContent.toLowerCase();
      if (content.includes(searchQuery)) {
        item.style.display = "block";
        // Apply fade-in animation with stagger
        setTimeout(() => {
          item.style.opacity = "1";
          item.style.transform = "translateY(0)";
        }, index * 100); // Adjust the stagger timing (100ms between items)
        matchesFound++;
      } else {
        item.style.display = "none";
        item.style.opacity = "0"; // Reset opacity
        item.style.transform = "translateY(20px)"; // Reset transform
      }
    });

    console.log(`Matches found: ${matchesFound}`);

    if (countElement) {
      countElement.textContent = matchesFound;
    }

    if (noResultsMessage) {
      noResultsMessage.style.display = matchesFound > 0 ? "none" : "block";
    }

    if (cmsContainer) {
      cmsContainer.style.visibility = "visible";
    }

    // Remove the loading indicator after filtering
    if (loadingIndicator) {
      loadingIndicator.style.display = "none";
    }
  }

  // Main function to load pages and filter results
  async function main() {
    if (!cmsContainer) {
      console.error("CMS container not found");
      return;
    }

    cmsContainer.style.visibility = "hidden";

    console.log("Loading all CMS pages...");
    await loadAllPages();
    console.log("All pages loaded. Applying search filter...");
    filterItems();

    const searchInput = document.getElementById("search-bar");
    if (searchInput) {
      searchInput.value = searchQuery;
      searchInput.addEventListener("input", filterItems);
    }
  }

  main();
});
