document.addEventListener("DOMContentLoaded", () => {
  // Select the richtext container and the element for the summary list
  const richtextContainer = document.querySelector(".richtext.w-richtext");
  const summaryList = document.querySelector(".list--article-points");
  const articlePins = document.querySelector(".article-pins"); // Select the article-pins element

  if (!richtextContainer || !summaryList) {
    console.error("Required elements not found!");
    return;
  }

  // Get all children inside the richtext container
  const children = Array.from(richtextContainer.children);

  let sections = [];
  let currentSection = null;
  let introSection = {
    id: "intro-section",
    title: "Introduction",
    elements: [],
  };
  let hasIntroContent = false; // Flag to check if intro section has content

  // Loop through all children to structure content
  children.forEach((child) => {
    if (child.tagName === "H2") {
      // Close the previous section if any
      if (currentSection) {
        sections.push(currentSection);
      }
      // Create a new section
      currentSection = {
        id: `section-${sections.length + 1}`,
        title: child.textContent,
        elements: [child],
      };
    } else if (currentSection) {
      // Add non-H2 elements to the current section
      currentSection.elements.push(child);
    } else {
      // This means we're before the first H2 → it's part of the introduction
      introSection.elements.push(child);
      hasIntroContent = true;
    }
  });

  // Push the last section if exists
  if (currentSection) {
    sections.push(currentSection);
  }

  // If there was content before the first H2, add the intro section
  if (hasIntroContent) {
    sections.unshift(introSection); // Add at the beginning
  }

  // If no sections found, do not edit the richtext or add summary links
  if (sections.length === 0) {
    console.warn(
      "No H2 elements found. The richtext content will remain unchanged."
    );
    if (articlePins) {
      articlePins.style.display = "none"; // Hide .article-pins when no H2 is found
      console.log(
        ".article-pins is now hidden because no H2 elements were found."
      );
    } else {
      console.error(".article-pins element not found!");
    }
    return;
  }

  // Clear the container to rebuild the structure
  richtextContainer.innerHTML = "";

  // Process each section to add to the container
  sections.forEach((section) => {
    // Create a new div for the section
    const sectionDiv = document.createElement("div");
    sectionDiv.id = section.id;

    // Append all elements to the section div
    section.elements.forEach((el) => sectionDiv.appendChild(el));

    // Append the section div to the container
    richtextContainer.appendChild(sectionDiv);

    // **Skip "Introduction" section in the summary list**
    if (section.id === "intro-section") {
      return;
    }

    // Create a new list item for the summary
    const listItem = document.createElement("li");
    const link = document.createElement("a");
    link.href = `#${section.id}`;
    link.textContent = section.title;
    link.className = "article--link";
    listItem.appendChild(link);

    // Append the list item to the summary
    summaryList.appendChild(listItem);
  });

  // Debugging: Log the successful completion of the script
  console.log(
    "Script completed successfully. Sections processed and summary list updated."
  );
});

// ------------------ related blog posts ------------------ //

document.addEventListener("DOMContentLoaded", function () {
  // Helper function to parse date strings into Date objects
  function parseDate(dateStr) {
    return new Date(dateStr);
  }

  // Get all related resources
  const resources1 = Array.from(
    document.querySelectorAll(".related--resources.is--categories .w-dyn-item")
  );
  const resources2 = Array.from(
    document.querySelectorAll(".related--resources.is--tags .w-dyn-item")
  );
  const resources3 = Array.from(
    document.querySelectorAll(".related--resources.is--recent .w-dyn-item")
  );

  // Create a unique map of articles by href (assuming href is unique)
  const uniqueArticles = new Map();

  function addArticles(articles) {
    articles.forEach((article) => {
      const href = article.querySelector("a").getAttribute("href");
      const dateEl = article.querySelector(".is--related-article-date");
      const date = dateEl ? parseDate(dateEl.textContent.trim()) : new Date(0); // Default to old date if missing
      if (!uniqueArticles.has(href)) {
        uniqueArticles.set(href, { element: article, date });
      }
    });
  }

  // Add articles from the first two resources
  addArticles(resources1);
  addArticles(resources2);

  // Convert map to array and sort by date, newest to oldest
  let sortedArticles = Array.from(uniqueArticles.values())
    .sort((a, b) => b.date - a.date)
    .map((item) => item.element);

  // If fewer than 3 articles, add from the third resource
  if (sortedArticles.length < 3) {
    const uniqueSet = new Set(uniqueArticles.keys());
    const additionalArticles = resources3.filter((article) => {
      const href = article.querySelector("a").getAttribute("href");
      return !uniqueSet.has(href);
    });
    addArticles(additionalArticles);
    sortedArticles = Array.from(uniqueArticles.values())
      .sort((a, b) => b.date - a.date)
      .map((item) => item.element);
  }

  // Update the grid with the first 3 articles
  const grid = document.querySelector(".grid--3els");
  if (grid) {
    grid.innerHTML = ""; // Clear existing content
    sortedArticles.slice(0, 3).forEach((article) => {
      grid.appendChild(article.cloneNode(true)); // Clone to avoid removing from original
    });
  }
});
