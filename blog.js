$(document).ready(function () {
  // ------------------ accordion ------------------ //

  $(".filters--accordion-trigger").on("click", function (event) {
    // Prevent parent dropdown from closing when clicking inside a nested dropdown
    if (
      $(event.target).closest(".filters--accordion-list").length &&
      !$(event.target).hasClass("filters--accordion-trigger")
    ) {
      return; // Do nothing if clicking inside a nested dropdown
    }

    // Close other accordions when opening a new one
    if (!$(this).hasClass("open")) {
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
          .animate({ height: "0px" }, 500);
      });
    }
  });
});
