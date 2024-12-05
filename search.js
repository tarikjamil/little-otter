document.addEventListener("DOMContentLoaded", function () {
  const totalPages = 5; // Adjust this to the actual number of pages
  const cmsContainer = document.getElementById("cms-container");
  const noResultsMessage = document.getElementById("no-results-message");
  const countElement = document.getElementById("count");

  const params = new URLSearchParams(window.location.search);
  const searchQuery = params.get("query")?.toLowerCase() || "";

  async function fetchPageContent(pageNumber) {
    try {
      console.log(`Fetching page ${pageNumber}`);
      const response = await fetch(`/cms-items/page-${pageNumber}`);
      if (!response.ok) {
        throw new Error(
          `Failed to load page ${pageNumber}: ${response.status}`
        );
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

  async function loadAllPages() {
    for (let i = 1; i <= totalPages; i++) {
      const items = await fetchPageContent(i);
      console.log(`Appending ${items.length} items from page ${i}`);
      items.forEach((item) => {
        cmsContainer.appendChild(item);
      });
    }
  }

  function filterItems() {
    console.log("Filtering items...");
    const cmsItems = cmsContainer.querySelectorAll(".cms-item");
    console.log(`Total items: ${cmsItems.length}`);
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
  }

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
