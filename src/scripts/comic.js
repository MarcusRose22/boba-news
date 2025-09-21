document.addEventListener("DOMContentLoaded", function () {
  // Get DOM elements
  const topComponent = document.getElementById("newspaperHeadlines");
  const section = document.getElementById("comicSection");
  const scrollTopSpan = document.getElementById("scrollTop");
  const scrollPercentSpan = document.getElementById("scrollPercent");
  const windowHeightSpan = document.getElementById("windowHeight");
  const currentImageSpan = document.getElementById("currentImage");
  const progressFill = document.getElementById("progressFill");

  // Get all images
  const images = document.querySelectorAll(".comic-image");

  // Get all story-text
  const storyTexts = document.querySelectorAll(".story-text");

  // Function to update scroll information
  function updateScrollInfo() {
    // Get scroll position relative to window
    const scrollTop = window.pageYOffset - topComponent.offsetHeight;

    // Get window height
    const windowHeight = window.innerHeight;

    // Get dimensions
    const sectionHeight = section.offsetHeight;
    const maxScroll = sectionHeight - windowHeight;

    // Calculate scroll percentage
    const scrollPercent =
      maxScroll > 0 ? ((scrollTop / maxScroll) * 100).toFixed(2) : 0;

    // Update display
    progressFill.style.width = scrollPercent + "%";

    // Determine which image should be visible based on scroll position
    const imageIndex = Math.floor(
      (scrollTop / maxScroll) * images.length - 0.5
    ); // 增加 +1 來確保有更多的顯示區間
    const currentImageIndex =
      Math.min(Math.max(imageIndex, 0), images.length) - 1;

    // Log the image index to the console
    console.log(currentImageIndex);

    // Show images progressively - appear when scrolling down, disappear when scrolling up
    images.forEach((img, index) => {
      if (index <= currentImageIndex) {
        img.classList.add("visible");
      } else {
        img.classList.remove("visible");
      }
    });

    // Show story-text progressively - appear when scrolling down, disappear when scrolling up
    storyTexts.forEach((story, index) => {
      if (index === currentImageIndex) {
        story.classList.add("visible");
      } else {
        story.classList.remove("visible");
      }
    });

    // Update current image display
    // Log scroll data to console (optional)
    console.log({
      scrollTop: scrollTop,
      scrollPercent: scrollPercent + "%",
      currentImage: currentImageIndex + 1,
      maxScroll: maxScroll,
    });
  }

  // Listen for scroll events on the window
  window.addEventListener("scroll", updateScrollInfo);

  // Listen for window resize to update dimensions
  window.addEventListener("resize", updateScrollInfo);

  // Initial update
  updateScrollInfo();
});
