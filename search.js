document.addEventListener("DOMContentLoaded", function () {
  const totalPages = 5; // Adjust this to the actual number of pages
  const cmsContainer = document.getElementById("cms-container");
  const noResultsMessage = document.getElementById("no-results-message");
  const countElement = document.getElementById("count");
  const loadingIndicator = document.getElementById("loading-indicator");
  const searchInput = document.getElementById("search-bar");

  let cmsItems = []; // Store all CMS items for dynamic updates

  // Fetch all CMS items across pages
  async function loadAllPages() {
    for (let i = 1; i <= totalPages; i++) {
      const items = await fetchPageContent(i);
      cmsItems.push(...items);
      items.forEach((item) => {
        cmsContainer.appendChild(item); // Append each item to the container
      });
    }
  }

  // Fetch items from a page
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

  // Filter and display items dynamically
  function updateResults(query) {
    console.log("Filtering items...");
    let matchesFound = 0;

    cmsItems.forEach((item, index) => {
      const content = item.textContent.toLowerCase();
      if (content.includes(query)) {
        item.style.display = "block";
        setTimeout(() => {
          item.style.opacity = "1";
          item.style.transform = "translateY(0)";
        }, matchesFound * 100); // Stagger timing for visible items
        matchesFound++;
      } else {
        item.style.display = "none";
        item.style.opacity = "0";
        item.style.transform = "translateY(20px)";
      }
    });

    console.log(`Matches found: ${matchesFound}`);

    if (countElement) {
      countElement.textContent = matchesFound;
    }

    if (noResultsMessage) {
      noResultsMessage.style.display = matchesFound > 0 ? "none" : "block";
    }
  }

  // Main function
  async function main() {
    if (!cmsContainer) {
      console.error("CMS container not found");
      return;
    }

    cmsContainer.style.visibility = "hidden";

    console.log("Loading all CMS pages...");
    await loadAllPages();
    console.log("All pages loaded.");

    updateResults(searchInput.value.toLowerCase()); // Initial filter based on current input

    if (loadingIndicator) {
      loadingIndicator.style.display = "none";
    }

    // Add real-time search functionality
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase();
      updateResults(query);
    });

    cmsContainer.style.visibility = "visible";
  }

  main();
});
