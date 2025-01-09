// --------------------- gsap --------------------- //

gsap.registerPlugin(ScrollTrigger, CustomEase, Flip);

// --------------------- smooth ease --------------------- //

CustomEase.create("smooth", "M0,0 C0.38,0.005 0.215,1 1,1");

// --------------------- loading --------------------- //

function pageLoad() {
  let tl = gsap.timeline();

  // Add a label to mark the starting point of simultaneous animations
  tl.add("loadingAnimationsStart");

  tl.to(
    ".main-wrapper",
    {
      opacity: 1,
      ease: "smooth",
      duration: 0.6,
    },
    "loadingAnimationsStart"
  );

  tl.from(
    "[animation=loading]",
    {
      y: "40rem",
      opacity: "0",
      stagger: { each: 0.1, from: "start" },
      ease: "smooth",
      duration: 0.6,
    },
    "loadingAnimationsStart"
  ); // <-- position parameter set to the label
}

pageLoad();

// --------------------- scroll trigger --------------------- //

document.querySelectorAll("[animation=fade]").forEach(function (fadeSplitElem) {
  gsap.from(fadeSplitElem, {
    scrollTrigger: {
      trigger: fadeSplitElem,
      start: "top bottom-=200",
      markers: false,
    },
    y: "40rem",
    opacity: 0,
    ease: "smooth",
    duration: 0.6,
  });
});

document
  .querySelectorAll("[animation=parallax-20]")
  .forEach(function (fadeSplitElem) {
    gsap.from(fadeSplitElem, {
      scrollTrigger: {
        trigger: fadeSplitElem,
        start: "top bottom-=100",
        end: "bottom top",
        scrub: true,
        markers: false,
      },
      y: "40rem",
      ease: "smooth",
    });
  });

document
  .querySelectorAll("[animation=fade-stagger]")
  .forEach(function (fadeSplitElem) {
    gsap.from(fadeSplitElem.querySelectorAll("[animation=fade-item]"), {
      scrollTrigger: {
        trigger: fadeSplitElem,
        start: "top bottom-=200",
        markers: false,
      },
      y: "40rem",
      opacity: 0,
      ease: "smooth",
      duration: 0.6,
      stagger: {
        each: 0.1,
      },
    });
  });

// ------------------ accordion ------------------ //

$(".faq--question").on("click", function () {
  // Close other accordions when opening new one
  if (!$(this).hasClass("open")) {
    $(".faq--question.open").click();
  }
  // Save the sibling of the toggle we clicked on
  let sibling = $(this).siblings(".faq--response");
  let animationDuration = 500;

  if ($(this).hasClass("open")) {
    // Close the content div if already open
    sibling.animate({ height: "0px" }, animationDuration);
  } else {
    // Open the content div if already closed
    sibling.css("height", "auto");
    let autoHeight = sibling.height();
    sibling.css("height", "0px");
    sibling.animate({ height: autoHeight }, animationDuration, () => {
      sibling.css("height", "auto");

      // Scroll the page to the accordion, leaving 200 pixels from the top
    });
  }
  // Open and close the toggle div
  $(this).toggleClass("open");
});

// --------------------- navbar dropdowns --------------------- //

// GSAP Dropdown Logic
document.addEventListener("DOMContentLoaded", () => {
  const dropdowns = document.querySelectorAll(".navbar--dropdown");

  // Close specific dropdown
  function closeDropdown(dropdownList) {
    if (dropdownList.classList.contains("open")) {
      gsap.to(dropdownList, {
        height: 0,
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
        onComplete: () => {
          dropdownList.style.display = "none"; // Hide completely after animation
          dropdownList.classList.remove("open");
        },
      });

      const parentElements = dropdownList.querySelectorAll(
        ".navbar--dropdown-title-parent, .navbar--dropdown-column"
      );
      gsap.to(parentElements, {
        y: "20rem",
        opacity: 0,
        duration: 0.3,
        stagger: 0.1,
        ease: "power2.out",
      });
    }
  }

  // Open specific dropdown
  function openDropdown(dropdownList) {
    dropdownList.style.display = "flex"; // Ensure it's visible before animation
    dropdownList.classList.add("open");
    gsap.fromTo(
      dropdownList,
      { height: 0, opacity: 0 },
      { height: "auto", opacity: 1, duration: 0.5, ease: "power2.out" }
    );

    const parentElements = dropdownList.querySelectorAll(
      ".navbar--dropdown-title-parent, .navbar--dropdown-column"
    );
    gsap.fromTo(
      parentElements,
      { y: "20rem", opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" }
    );
  }

  // Add hover events to dropdowns
  dropdowns.forEach((dropdown) => {
    const dropdownList = dropdown.querySelector(".navbar--dropdown-list");

    dropdown.addEventListener("mouseenter", () => {
      if (!dropdownList.classList.contains("open")) {
        openDropdown(dropdownList);
      }
    });

    dropdown.addEventListener("mouseleave", () => {
      closeDropdown(dropdownList);
    });
  });
});

// --------------------- navbar mobile toggle --------------------- //

document.addEventListener("DOMContentLoaded", () => {
  const menuTrigger = document.querySelector(".navbar--menu-trigger");
  const navbarMenu = document.querySelector(".navbar--menu");
  const dropdowns = document.querySelectorAll(".navbar--dropdown");
  const buttonsWrapper = document.querySelector(".navbar--buttons-wrapper");
  const menuIcon = document.querySelector(".menu--icon");
  const menuIconClose = document.querySelector(".menu--icon-close");

  // Function to open the menu
  function openMenu() {
    navbarMenu.style.display = "flex"; // Ensure visibility before animation
    gsap.fromTo(
      navbarMenu,
      { height: 0, opacity: 0 },
      { height: "auto", opacity: 1, duration: 0.5, ease: "power2.out" }
    );
    gsap.fromTo(
      [...dropdowns, buttonsWrapper],
      { y: "20rem", opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" }
    );

    // Animate icons
    gsap.to(menuIcon, { opacity: 0, duration: 0.3, ease: "power2.out" });
    gsap.to(menuIconClose, { opacity: 1, duration: 0.3, ease: "power2.out" });

    navbarMenu.classList.add("open");
  }

  // Function to close the menu
  function closeMenu() {
    gsap.to([...dropdowns, buttonsWrapper], {
      y: "20rem",
      opacity: 0,
      duration: 0.3,
      stagger: 0.1,
      ease: "power2.out",
    });
    gsap.to(navbarMenu, {
      height: 0,
      opacity: 0,
      duration: 0.5,
      ease: "power2.out",
      onComplete: () => {
        navbarMenu.style.display = "none"; // Hide completely after animation
        navbarMenu.classList.remove("open");
      },
    });

    // Animate icons
    gsap.to(menuIcon, { opacity: 1, duration: 0.3, ease: "power2.out" });
    gsap.to(menuIconClose, { opacity: 0, duration: 0.3, ease: "power2.out" });
  }

  // Toggle menu on trigger click
  menuTrigger.addEventListener("click", (e) => {
    e.stopPropagation();
    if (navbarMenu.classList.contains("open")) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    if (
      !e.target.closest(".navbar--menu") &&
      navbarMenu.classList.contains("open")
    ) {
      closeMenu();
    }
  });
});

// --------------------- navbar scroll background --------------------- //

$(document).ready(function () {
  var scrollTop = 0;
  $(window).scroll(function () {
    scrollTop = $(window).scrollTop();
    if (scrollTop >= 50) {
      $(".navbar").addClass("is--scrolled");
    } else if (scrollTop < 50) {
      $(".navbar").removeClass("is--scrolled");
    }
  });
});

// --------------------- navbar scroll down --------------------- //

let lastScrollY = window.scrollY;
const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {
  const currentScrollY = window.scrollY;

  if (currentScrollY > lastScrollY && currentScrollY > 200) {
    // Scrolling down and past 200px
    navbar.classList.add("hidden");
  } else {
    // Scrolling up
    navbar.classList.remove("hidden");
  }

  lastScrollY = currentScrollY;
});

// --------------------- navbar line with gsap flip --------------------- //

$(document).ready(function () {
  // Create the .navbar--dropdown-line dynamically
  const dropdownLine = $('<div class="navbar--dropdown-line"></div>');

  // Find the toggle whose sibling dropdown list contains a child with .w--current
  const initialTargetToggle = $(".navbar--dropdown-list")
    .filter(function () {
      // Check if this .navbar--dropdown-list contains a child with .w--current
      return $(this).find(".w--current").length > 0;
    })
    .siblings(".navbar--dropdown-toggle")
    .first();

  if (initialTargetToggle.length) {
    // Append the line to the correct toggle and make it visible
    initialTargetToggle.append(dropdownLine);
    dropdownLine.css("opacity", "1");
    console.log("Appended .navbar--dropdown-line to:", initialTargetToggle[0]);
  } else {
    console.warn(
      "No .navbar--dropdown-list containing .w--current found on page load."
    );
  }

  // Hover functionality for toggles
  $(".navbar--dropdown-toggle").on("mouseenter", function () {
    dropdownLine.css("opacity", "1"); // Ensure the line is visible
    const state = Flip.getState(dropdownLine[0]); // Capture the current position/state
    $(this).append(dropdownLine); // Move the line to the hovered toggle
    console.log("Moved .navbar--dropdown-line to hovered toggle:", this);
    Flip.from(state, {
      duration: 0.4,
      ease: "power2.out",
    });
  });

  // Mouse leave functionality for the entire navbar
  $(".navbar--menu").on("mouseleave", function () {
    const targetToggle = $(".navbar--dropdown-list")
      .filter(function () {
        // Check if this .navbar--dropdown-list contains a child with .w--current
        return $(this).find(".w--current").length > 0;
      })
      .siblings(".navbar--dropdown-toggle")
      .first();

    if (targetToggle.length) {
      const state = Flip.getState(dropdownLine[0]); // Capture the current position/state
      targetToggle.append(dropdownLine); // Move the line back to the correct toggle
      console.log("Returned .navbar--dropdown-line to:", targetToggle[0]);
      Flip.from(state, {
        duration: 0.4,
        ease: "power2.out",
      });
    } else {
      dropdownLine.css("opacity", "0"); // Hide the line if no valid target exists
      console.warn("No .w--current found on mouse leave. Hiding line.");
    }
  });
});

// --------------------- navbar active state --------------------- //

document.addEventListener("DOMContentLoaded", function () {
  // Select all elements with the class `.navbar--dropdown`
  const dropdowns = document.querySelectorAll(".navbar--dropdown");

  dropdowns.forEach((dropdown) => {
    // Check if the dropdown contains an element with the class `.w--current`
    if (dropdown.querySelector(".w--current")) {
      dropdown.classList.add("is--active");
    }
  });
});

// --------------------- how it works accordion --------------------- //

document.addEventListener("DOMContentLoaded", () => {
  const items = document.querySelectorAll(".howitworks--item");
  const visuals = document.querySelectorAll(
    ".images-parent img, .hoitworks--svg video"
  );
  const supportSection = document.querySelector(".section.is--support");
  let currentIndex = 0;
  let interval;
  let isAutoplayActive = false;

  // Function to update active visual and item
  const updateActive = (index) => {
    items.forEach((item, i) => {
      item.classList.toggle("is--active", i === index);
    });

    visuals.forEach((visual, i) => {
      if (i === index) {
        visual.style.display = "block"; // Show the current visual
        if (visual.tagName === "VIDEO") {
          visual.currentTime = 0; // Reset the video
          visual.play();
        }
      } else {
        if (visual.tagName === "VIDEO") {
          visual.pause(); // Pause non-active videos
        }
        visual.style.display = "none"; // Hide non-active visuals
      }
    });

    currentIndex = index;
  };

  // Function to play the next visual
  const playNext = () => {
    const nextIndex = (currentIndex + 1) % visuals.length; // Loop back to the first visual
    updateActive(nextIndex);
  };

  // Set up autoplay loop
  const startAutoplay = () => {
    if (!isAutoplayActive) {
      interval = setInterval(playNext, 3000); // 3 seconds per visual
      isAutoplayActive = true;
    }
  };

  // Stop autoplay
  const stopAutoplay = () => {
    clearInterval(interval);
    isAutoplayActive = false;
  };

  // Add hover event to items
  items.forEach((item, index) => {
    item.addEventListener("mouseenter", () => {
      stopAutoplay();
      updateActive(index);
      startAutoplay();
    });
  });

  // Add event listeners for video end
  visuals.forEach((visual, index) => {
    if (visual.tagName === "VIDEO") {
      visual.addEventListener("ended", () => {
        playNext();
      });
    }
  });

  // Initialize the first visual
  updateActive(0);

  // Observe the support section's position
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (
          entry.isIntersecting &&
          entry.boundingClientRect.top <= window.innerHeight - 200
        ) {
          startAutoplay(); // Start autoplay when conditions are met
        } else {
          stopAutoplay(); // Stop autoplay when it goes out of view
        }
      });
    },
    {
      root: null, // Viewport as the root
      threshold: 0, // Trigger as soon as the element enters
    }
  );

  // Observe the .section.is--support element
  if (supportSection) {
    observer.observe(supportSection);
  }
});

// --------------------- show more button --------------------- //

document.addEventListener("DOMContentLoaded", function () {
  // Select elements
  const containerShowMore = document.querySelector(
    ".container--1248.is--showmore"
  );
  const showMoreBtn = document.querySelector(".showmore--btn");
  const containerFlex = document.querySelector(".container--1248-flex");
  const showMoreGradient = document.querySelector(".showmore--gradient");

  // Set initial height on page load
  gsap.set(containerShowMore, { height: "468rem" });

  // Add click event to the button
  showMoreBtn.addEventListener("click", () => {
    // Animate the height to auto
    gsap.to(containerShowMore, {
      height: "auto",
      duration: 0.8,
      ease: "power2.out",
    });

    // Fade out containerFlex and set display to none
    gsap.to(containerFlex, {
      opacity: 0,
      duration: 0.5,
      ease: "power1.out",
      onComplete: () => {
        containerFlex.style.display = "none";
      },
    });

    // Fade out the gradient
    gsap.to(showMoreGradient, {
      opacity: 0,
      duration: 0.5,
      ease: "power1.out",
    });
  });
});

// --------------------- related resources conditions --------------------- //

document.addEventListener("DOMContentLoaded", () => {
  // Select all related resource items
  const relatedResourceItems = document.querySelectorAll(
    ".related-resource--item"
  );

  // Loop through each item
  relatedResourceItems.forEach((item) => {
    // Check if it contains an element with the class w--current
    if (item.querySelector(".w--current")) {
      // Add display: none to the parent item
      item.style.display = "none";
    }
  });
});

// --------------------- swiper --------------------- //

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed.");

  const carousel4 = document.querySelectorAll(".is--testimonials-slider");

  carousel4.forEach((swiperEl) => {
    console.log("Initializing Swiper for element:", swiperEl);

    const swiperInstance = new Swiper(swiperEl, {
      slidesPerView: 1,
      spaceBetween: "12rem", // Set space between slides in pixels
      loop: false,
      pagination: {
        el: swiperEl.querySelector(".swiper-pagination"), // Scoped to each swiper instance
        clickable: true, // Enable clickable pagination
      },
      breakpoints: {
        992: {
          slidesPerView: 3,
        },
      },
      navigation: {
        nextEl: swiperEl.querySelector(".swiper-button-next"), // Scoped to each swiper instance
        prevEl: swiperEl.querySelector(".swiper-button-prev"),
      },
      scrollbar: {
        el: swiperEl.querySelector(".swiper-scrollbar"),
      },
    });

    console.log("Swiper instance created:", swiperInstance);

    // Ensure Swiper is initialized if not done automatically
    if (!swiperInstance.initialized) {
      swiperInstance.init();
      console.log("Swiper instance manually initialized:", swiperInstance);
    }
  });
});

// --------------------- swiper dividers --------------------- //

document.addEventListener("DOMContentLoaded", function () {
  // Select the container with the bullets
  const paginationContainer = document.querySelector(".swiper-pagination");

  if (paginationContainer) {
    // Get all the .swiper-pagination-bullet elements
    const bullets = paginationContainer.querySelectorAll(
      ".swiper-pagination-bullet"
    );

    // Loop through the bullets and insert a divider after each one except the last
    bullets.forEach((bullet, index) => {
      if (index < bullets.length - 1) {
        // Skip the last bullet
        // Create a new divider element
        const divider = document.createElement("div");
        divider.classList.add("swiper-pagination-divider");

        // Insert the divider after the current bullet
        bullet.after(divider);
      }
    });
  }
});
