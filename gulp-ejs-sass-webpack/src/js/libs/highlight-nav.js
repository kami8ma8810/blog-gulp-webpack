// import $ from 'jquery'

// ヘッダーナビ現在のページをハイライト
export default () => {
  // $('.header-nav a').each(function () {
  // 	if (this.href == location.href) {
  // 		$(this).parents('li').addClass('is-current');
  // 	}
  // });
  // クラス名を定義
  const CLASS_NAME = 'is-current';
  // 現在のページのhrefを取得
  const currentHref = location.href;
  // 現在のページのすべてのヘッダーナビのhrefを取得
  const navLinks = document.querySelectorAll('.js-nav-link');
  // 現在のページのhrefと一致しているナビの項目にis-currentのクラスを付与する
  for (let i = 0; i < navLinks.length; i++) {
    let navHref = navLinks[i].href;
    if (currentHref === navHref) {
      navLinks[i].classList.add(CLASS_NAME);
    }
  }
};
