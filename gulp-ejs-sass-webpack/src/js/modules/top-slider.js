// import Swiper from 'swiper';
// トップページswiper
export default () => {
  if (document.querySelector('.top-swiper') !== null) {
    const topSwiper = new Swiper('.top-swiper', {
      autoplay: {
        delay: 1500,
        disableOnInteraction: false, //ユーザー操作後もオートプレイ続行
      },
      loop: true,
      speed: 400,
      slidesPerView: 1,
      centeredSlides: true,
      grabCursor: true,
    });
  }
};
