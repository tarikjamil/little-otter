document.addEventListener("DOMContentLoaded", function () {
  const totalPages = 5; // Total number of pages in /cms-items/
  const cmsContainer = document.getElementById("cms-container");

  async function fetchPageContent(pageNumber) {
    try {
      const response = await fetch(`/cms-items/page-${pageNumber}.html`);
      if (!response.ok) {
        throw new Error(`Failed to fetch page ${pageNumber}`);
      }
      const pageContent = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(pageContent, "text/html");
      const items = doc.querySelectorAll(".cms-item");
      items.forEach((item) => {
        cmsContainer.appendChild(item);
      });
    } catch (error) {
      console.error(`Error fetching page ${pageNumber}:`, error);
    }
  }

  // Load all pages dynamically
  for (let i = 1; i <= totalPages; i++) {
    fetchPageContent(i);
  }
});
