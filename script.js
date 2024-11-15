// --------------------- gsap --------------------- //

gsap.registerPlugin(ScrollTrigger, CustomEase);

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

// --------------------- navbar --------------------- //

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
