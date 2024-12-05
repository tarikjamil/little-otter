document.addEventListener("DOMContentLoaded", function () {
  const totalPages = 20; // Total number of pages
  const cmsContainer = document.getElementById("cms-container");
  const noResultsMessage = document.getElementById("no-results-message");
  const countElement = document.getElementById("count"); // Element to show the count

  // Get the search query from the URL
  const params = new URLSearchParams(window.location.search);
  const searchQuery = params.get("query")?.toLowerCase() || "";

  // Function to fetch and load items from a page
  async function fetchPageContent(pageNumber) {
    try {
      const response = await fetch(`/cms-items/page-${pageNumber}`);
      if (!response.ok) {
        throw new Error(
          `Failed to load page ${pageNumber}: ${response.status}`
        );
      }
      const pageContent = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(pageContent, "text/html");

      // Return all .cms-item elements from the fetched page
      return Array.from(doc.querySelectorAll(".cms-item"));
    } catch (error) {
      console.error(`Error fetching page ${pageNumber}:`, error);
      return [];
    }
  }

  // Function to load all pages
  async function loadAllPages() {
    for (let i = 1; i <= totalPages; i++) {
      const items = await fetchPageContent(i);
      items.forEach((item) => {
        cmsContainer.appendChild(item); // Append each item to the container
      });
    }
  }

  // Function to filter items based on the search query
  function filterItems() {
    const cmsItems = cmsContainer.querySelectorAll(".cms-item");
    let matchesFound = 0;

    cmsItems.forEach((item) => {
      const content = item.textContent.toLowerCase();
      if (content.includes(searchQuery)) {
        item.style.display = "block";
        matchesFound++;
      } else {
        item.style.display = "none";
      }
    });

    // Update the count element
    if (countElement) {
      countElement.textContent = matchesFound;
    }

    // Show or hide "No Results Found" message
    noResultsMessage.style.display = matchesFound > 0 ? "none" : "block";

    // Show the container after filtering is complete
    cmsContainer.style.visibility = "visible";
  }

  // Main function to load pages and filter results
  async function main() {
    if (!cmsContainer) {
      console.error("CMS container not found");
      return;
    }

    // Hide the container while loading and filtering
    cmsContainer.style.visibility = "hidden";

    // Load all items and then filter them
    console.log("Loading all CMS pages...");
    await loadAllPages();
    console.log("All pages loaded. Applying search filter...");
    filterItems();

    // Add live filtering as the user types
    const searchInput = document.getElementById("search-bar");
    if (searchInput) {
      searchInput.value = searchQuery;
      searchInput.addEventListener("input", filterItems);
    }
  }

  main();
});
