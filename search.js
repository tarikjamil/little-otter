async function fetchCMSItems() {
  const collectionId = "673b6e5d4003792c3842f67d"; // Replace with your CMS Collection ID
  const accessToken =
    "4f506a91a4d60d4d31883a2ea22195766528a59df550a4cab3a74338017c633a"; // Replace with your Webflow API Token

  try {
    // Fetch CMS items from Webflow API
    const response = await fetch(
      `const response = await fetch("https://little-otter-server.netlify.app/.netlify/functions/proxy");`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "accept-version": "1.0.0", // Required for Webflow API
        },
      }
    );

    if (!response.ok) {
      console.error("Failed to fetch CMS items:", response.statusText);
      return;
    }

    const data = await response.json();
    const items = data.items;

    // Select the container where CMS items will be rendered
    const container = document.querySelector(".cms-container");
    if (!container) {
      console.error("No container element with class .cms-container found");
      return;
    }

    // Dynamically render fetched items
    items.forEach((item) => {
      const element = document.createElement("div");
      element.classList.add("cms-item");
      element.setAttribute(
        "data-item",
        `${item.name} ${item.description || ""}` // Add more fields if needed
      );
      element.innerHTML = `
        <h3>${item.name}</h3>
        <p>${item.description || "No description available"}</p>
      `;
      container.appendChild(element);
    });

    // Apply filtering logic after items are loaded
    applyFiltering();
  } catch (error) {
    console.error("Error fetching CMS items:", error);
  }
}

function applyFiltering() {
  document.addEventListener("DOMContentLoaded", function () {
    // Get query string from URL
    const params = new URLSearchParams(window.location.search);
    const searchQuery = params.get("query")?.toLowerCase() || "";

    // Populate the search input with the query
    const searchInput = document.querySelector('input[name="query"]');
    if (searchInput) {
      searchInput.value = searchQuery;
    }

    // Filter CMS items dynamically
    const cmsItems = document.querySelectorAll(".cms-item");
    cmsItems.forEach((item) => {
      const content = item.getAttribute("data-item").toLowerCase();
      if (content.includes(searchQuery)) {
        item.style.display = "block"; // Show matching items
      } else {
        item.style.display = "none"; // Hide non-matching items
      }
    });

    // Display a "No Results Found" message if no items match
    const visibleItems = Array.from(cmsItems).filter(
      (item) => item.style.display === "block"
    );
    const noResultsMessage = document.querySelector(".no-results-message");
    if (noResultsMessage) {
      noResultsMessage.style.display = visibleItems.length ? "none" : "block";
    }
  });
}

// Fetch and render CMS items on page load
fetchCMSItems();
