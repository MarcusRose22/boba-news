import { gsap } from "gsap";

//animate ".box" from an opacity of 0 to an opacity of 0.5
gsap.fromTo(
  ".animate-in",
  {
    opacity: 0,
    y: 50,
  },
  {
    opacity: 1,
    duration: 1,
    ease: "power1.inOut",
    stagger: 0.8,
    y: 0,
  }
);
