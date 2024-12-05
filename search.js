async function fetchCMSItems() {
  const collectionId = "673b6e5d4003792c3842f67d"; // Replace with your CMS Collection ID
  const accessToken =
    "4f506a91a4d60d4d31883a2ea22195766528a59df550a4cab3a74338017c633a"; // Replace with your Webflow API Token

  const response = await fetch(
    `https://api.webflow.com/collections/${collectionId}/items?limit=100`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await response.json();
  const items = data.items;

  // Render items dynamically
  const container = document.querySelector(".cms-container");
  items.forEach((item) => {
    const element = document.createElement("div");
    element.classList.add("cms-item");
    element.setAttribute("data-item", `${item.name} ${item.description}`);
    element.innerHTML = `<h3>${item.name}</h3><p>${item.description}</p>`;
    container.appendChild(element);
  });

  // Reapply filtering logic here
}

fetchCMSItems();
