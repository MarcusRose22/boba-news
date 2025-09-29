const chapterList = document.querySelectorAll("nav p");
window.addEventListener("scroll", function () {
  const chap1 = document.getElementById("chap1");
  const chap2 = document.getElementById("chap2");
  /*-----------------------------------------------*/
  const chap1Top = chap1.getBoundingClientRect().top;
  const chap2Top = chap2.getBoundingClientRect().top;
  /*-----------------------------------------------*/
  const chap1Bottom = chap1.getBoundingClientRect().bottom;
  const chap2Bottom = chap2.getBoundingClientRect().bottom;
  /*----------------------------------------------------------*/
  const header = document.getElementById("header");
  const comicSection = document.getElementById("comicSection");
  const sugarSection = document.getElementById("sugarSection");
  const sugarTop = sugarSection.getBoundingClientRect().top + window.scrollY;
  const sugarBottom = sugarSection.getBoundingClientRect().bottom;
  const comicBottom = comicSection.getBoundingClientRect().bottom;

  //Specific Area
  if (
    (comicBottom <= 300 && sugarTop - window.scrollY > 10) ||
    sugarBottom <= 300
  ) {
    header.style.opacity = 1;
  } else {
    header.style.opacity = 0;
  }

  console.log(comicBottom);
  //chap1
  if (chap1Top <= 300) {
    chapterList[0].classList.add("now");
  } else {
    chapterList[0].classList.remove("now");
  }

  if (chap1Bottom <= 300) {
    chapterList[0].classList.remove("now");
  }

  // chap2
  if (chap2Top <= 300) {
    chapterList[1].classList.add("now");
  } else {
    chapterList[1].classList.remove("now");
  }

  if (chap2Bottom <= 300) {
    chapterList[1].classList.remove("now");
  }
});

const sections = document.querySelectorAll(".article"); // 假設每個章節內容是 <section> 元素

// 遍歷每個章節導航項目
chapterList.forEach((chapter, index) => {
  chapter.addEventListener("click", function () {
    // 根據 index 取得對應的 section 元素
    const targetSection = sections[index];

    // 滾動到目標區塊
    targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});
