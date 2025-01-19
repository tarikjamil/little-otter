$(document).ready(function () {
  // ------------------ accordion ------------------ //

  $(".filters--accordion-trigger").on("click", function (event) {
    // Check if this is a click on a nested trigger
    if ($(this).closest(".filters--accordion-list").length > 0) {
      event.stopPropagation(); // Prevent the click from bubbling to the parent dropdown
    }

    // Close other accordions when opening a new one (only if not a nested accordion)
    if (
      !$(this).hasClass("open") &&
      $(this).parents(".filters--accordion-list").length === 0
    ) {
      $(".filters--accordion-trigger.open").not(this).click();
    }

    // Save the sibling of the toggle we clicked on
    let sibling = $(this).siblings(".filters--accordion-list");
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
      });
    }
    // Open and close the toggle div
    $(this).toggleClass("open");
  });

  // ------------------ close dropdown on outside click ------------------ //
  $(document).on("click", function (event) {
    // Check if the click is outside any open dropdown
    if (!$(event.target).closest(".filters--accordion").length) {
      $(".filters--accordion-trigger.open").each(function () {
        // Close the dropdown
        $(this).removeClass("open");
        $(this)
          .siblings(".filters--accordion-list")
          .animate({ height: "0px" }, 300);
      });
    }
  });

  // Prevent dropdown closing when clicking inside nested lists
  $(".filters--accordion-list").on("click", function (event) {
    event.stopPropagation(); // Allow clicks inside the list without closing it
  });

  // ------------------ close all dropdowns when clicking on a .filter--radio ------------------ //
  $(".filter--radio").on("click", function () {
    $(".filters--accordion-trigger.open").each(function () {
      // Close all dropdowns
      $(this).removeClass("open");
      $(this)
        .siblings(".filters--accordion-list")
        .animate({ height: "0px" }, 300);
    });
  });
});
