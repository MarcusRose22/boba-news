window.addEventListener("scroll", function () {
  const sugarSection = document.getElementById("sugarSection");
  const sugar = document.querySelector(".sugar");
  const sugarTitle = document.querySelector(".sugar-title");
  const timeSlot = document.querySelector(".time-slot");
  const images = document.querySelectorAll(".bob-walk .sugar-img");
  const cubeImages = document.querySelectorAll(".cube .cube-img");
  const sugarAmount = document.querySelectorAll(
    ".sugar-amount .sugar-amount-text"
  );
  const sectionHeight = sugarSection.clientHeight;
  const sectionWidth = timeSlot.clientWidth;

  const sectionTop = sugarSection.getBoundingClientRect().top + window.scrollY;
  console.log(sectionTop);

  /*初始化*/
  if (images.length === 0) return; //確保圖片元素存在
  const scrollY = window.scrollY;
  const triggerHeight = 8500; // 設置觸發效果的滾動高度＊＊＊＊＊

  /*只有當滾動超過 triggerHeight 時，才開始觸發效果*/
  if (sectionTop - window.scrollY > 10) {
    sugar.style.opacity = 0;
    return;
  }
  sugar.style.opacity = 1;

  /*橫移 sugar*/
  const transformX = -(scrollY - sectionTop) * 0.65 + 700; // 根據滾動進度來平移 .time-slot
  timeSlot.style.transform = `translateX(${transformX}px)`;

  /*Bob走路*/
  const imgAvg = sectionWidth / 60; //平均多少px要出現一張
  const visibleIndex = Math.floor((scrollY - sectionTop) / imgAvg); // 根據滾動進度計算顯示的圖片索引
  images.forEach((img) => img.classList.remove("visible")); // 隱藏所有圖片
  if (visibleIndex < images.length) {
    images[visibleIndex].classList.add("visible");
  }

  /*方糖*/
  const cubeIndex = Math.floor(visibleIndex / 10); // 每 X 張 bob-walk img 顯示 1 張 cube-img
  cubeImages.forEach((cubeImg) => cubeImg.classList.remove("visible")); // 隱藏所有 cube-images
  sugarAmount.forEach((txt) => txt.classList.remove("visible"));
  // console.log(cubeIndex);
  if (cubeIndex >= 0 && visibleIndex % 10 === 9 && visibleIndex != 0) {
    cubeImages[cubeIndex].classList.add("visible");
    sugarAmount[cubeIndex].classList.add("visible");
  }

  /*左上大標題*/
  if (scrollY - triggerHeight < sectionHeight) {
    sugarTitle.classList.add("visible");
  } else if (scrollY - triggerHeight > sectionHeight) {
    sugarTitle.classList.remove("visible");
  }

  /*左上小標題*/
});
