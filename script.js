// --------------------- gsap --------------------- //

gsap.registerPlugin(ScrollTrigger, CustomEase);

// --------------------- smooth ease --------------------- //

CustomEase.create("smooth", "M0,0 C0.38,0.005 0.215,1 1,1");

// --------------------- tabs change --------------------- //
document.addEventListener("DOMContentLoaded", function () {
  function openTabByHash() {
    // Get the hash from the URL without the #
    const hash = window.location.hash.substring(1);

    if (hash) {
      // Find the tab link with the corresponding ID and simulate a click
      const targetTabLink = document.getElementById(hash);
      if (targetTabLink) {
        targetTabLink.click();
      }
    }
  }

  // Run openTabByHash once Webflow is ready
  setTimeout(openTabByHash, 500);

  // Add click event listeners to each tab link to update URL hash
  document.querySelectorAll(".tabs-link-activity").forEach((tab) => {
    tab.addEventListener("click", function () {
      const tabId = tab.getAttribute("id");
      history.pushState(null, null, `#${tabId}`);
    });
  });
});

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
      duration: 1,
    },
    "loadingAnimationsStart"
  );

  tl.from(
    "[animation=loading]",
    {
      y: "40rem",
      opacity: "0",
      stagger: { each: 0.2, from: "start" },
      ease: "smooth",
      duration: 1,
    },
    "loadingAnimationsStart"
  ); // <-- position parameter set to the label
}

pageLoad();

// --------------------- tabs --------------------- //

document.addEventListener("DOMContentLoaded", function () {
  // Wait for Webflow to finish rendering
  Webflow.push(function () {
    // Get the current URL
    const url = new URL(window.location.href);

    // Check if a URL parameter is used to specify the brand (e.g., ?brand=brand-marketing)
    const brandParam = url.searchParams.get("brand");

    let targetTab;

    if (brandParam) {
      // Map the brand parameter to the corresponding data-w-tab value for all tabs
      switch (brandParam) {
        // Original "Activity" tabs
        case "brand-marketing":
          targetTab = "brand marketing";
          break;
        case "communication":
          targetTab = "Communication";
          break;
        case "merchandising":
          targetTab = "Merchandising";
          break;
        case "architecture-design":
          targetTab = "Architecture & Design";
          break;

        // New "Make" tabs
        case "business-concept":
          targetTab = "business-concept";
          break;
        case "twin-concept":
          targetTab = "twin-concept";
          break;
        case "turnkey":
          targetTab = "Turnkey";
          break;

        default:
          console.warn("No matching tab for brand parameter:", brandParam);
      }
    }

    if (targetTab) {
      // Find the tab link element using the data-w-tab attribute
      const tabLink = document.querySelector(`[data-w-tab="${targetTab}"]`);
      if (tabLink) {
        tabLink.click(); // Trigger a click to activate the tab
      } else {
        console.warn("Tab link not found for targetTab:", targetTab);
      }
    }
  });
});

// --------------------- scroll trigger --------------------- //

document.querySelectorAll("[animation=fade]").forEach(function (fadeSplitElem) {
  gsap.from(fadeSplitElem, {
    scrollTrigger: {
      trigger: fadeSplitElem,
      start: "top bottom-=100",
      markers: false,
    },
    y: "40rem",
    opacity: 0,
    ease: "smooth",
    duration: 0.6,
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
      duration: 1,
      stagger: {
        each: 0.2,
      },
    });
  });

// Select all elements with the class
const imageWrappers = document.querySelectorAll(".gallery--image-wrapper");

// Loop through each element and add hover animations
imageWrappers.forEach((imageWrapper) => {
  imageWrapper.addEventListener("mouseenter", () => {
    gsap.to(imageWrapper, {
      border: "1px solid var(--color--orange)",
      borderRadius: "30rem",
      maxWidth: "800rem",
      boxShadow: "-8rem -11rem 37rem #00000040",
      duration: 0.3,
      ease: "smooth",
    });
  });

  imageWrapper.addEventListener("mouseleave", () => {
    gsap.to(imageWrapper, {
      border: "none", // Reset to the original state
      borderRadius: "0rem",
      maxWidth: "704rem", // Reset to original or specific value
      boxShadow: "none",
      duration: 0.3,
      ease: "smooth",
    });
  });
});

// --------------------- add is--open to menu--trigger --------------------- //

document.addEventListener("DOMContentLoaded", () => {
  const menuTrigger = document.querySelector(".menu--trigger");
  const menuSide = document.querySelector(".menu--side");

  menuTrigger.addEventListener("click", () => {
    console.log("Menu trigger clicked"); // Add this line for debugging

    menuSide.classList.toggle("is--open");
  });
});

// --------------------- video play and sound --------------------- //

const video = document.getElementById("myVideo");
const soundToggle = document.getElementById("soundToggle");
const soundTextWrapper = document.querySelectorAll(".button--sound-text");
const activeIcon = document.querySelector(".sound--icon-active");
const inactiveIcon = document.querySelector(".sound--icon-inactive");

// Set initial styles on page load
window.addEventListener("load", () => {
  gsap.set(soundTextWrapper, { y: 0 });
  gsap.set(activeIcon, { opacity: 0 });
  gsap.set(inactiveIcon, { opacity: 1 });
});

// Toggle sound on button click with GSAP animations
soundToggle.addEventListener("click", () => {
  if (video.muted) {
    video.muted = false;
    gsap.to(soundTextWrapper, { y: "-1.5em", duration: 0.3, ease: "smooth" });
    gsap.to(activeIcon, { opacity: 1, duration: 0.3, ease: "smooth" });
    gsap.to(inactiveIcon, { opacity: 0, duration: 0.3, ease: "smooth" });
  } else {
    video.muted = true;
    gsap.to(soundTextWrapper, { y: 0, duration: 0.3, ease: "smooth" });
    gsap.to(activeIcon, { opacity: 0, duration: 0.3, ease: "smooth" });
    gsap.to(inactiveIcon, { opacity: 1, duration: 0.3, ease: "smooth" });
  }
});

// --------------------- swiper --------------------- //

const carousel = document.querySelectorAll(".is--testimonials-slider");

carousel4.forEach((swiperEl) => {
  const swiperInstance = new Swiper(swiperEl, {
    slidesPerView: 1,
    spaceBetween: "12rem", // Set space between slides in pixels
    loop: false,
    pagination: {
      el: swiperEl.querySelector(".swiper-pagination"), // Scoped to each swiper instance
      clickable: true, // Enable clickable pagination
    },
    breakpoints: {
      768: {
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
