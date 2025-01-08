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
    }
  });

  // Push the last section if exists
  if (currentSection) {
    sections.push(currentSection);
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
