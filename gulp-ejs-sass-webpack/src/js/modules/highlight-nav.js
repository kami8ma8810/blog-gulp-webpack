
// ヘッダーナビ現在のページをハイライト
export default () => {
	$('.header-nav a').each(function () {
		if (this.href == location.href) {
			$(this).parents('li').addClass('is-current');
		}
	});
};
