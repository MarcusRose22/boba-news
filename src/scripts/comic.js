import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
  ScrollTrigger.create({
    trigger: ".container",
    start: "top top",
    end: "bottom bottom",
    pin: "#comicSection",
    scrub: true,
    onUpdate: (self) => {
      const sections = document.querySelectorAll(".section");

      sections.forEach((section, index) => {
        // 根據容器滾動進度 (self.progress) 來依次顯示每個 section
        const progress = self.progress;

        // 當進度達到特定條件時顯示對應的 section，並設置固定位置
        if (progress >= (index + 1) * 0.1) {
          section.style.opacity = 1; // 設置該 section 的透明度為 1
          section.classList.add("visible"); // 顯示該 section
        } else {
          section.style.opacity = 0; // 設置該 section 的透明度為 1
          section.classList.remove("visible"); // 隱藏該 section
        }
      });
    },
  });
});
