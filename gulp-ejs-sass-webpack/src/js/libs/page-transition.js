// import barba from '@barba/core';
// import anime from 'animejs/lib/anime.es.js';
// import $ from 'jquery';

/*
 * ページ離脱アニメーション
 * @param {Object} current 離脱するページ（前のページ）の情報
 * @return Promise
 */
function leaveAnimation(current) {
  const animation = anime
    .timeline()
    .add({
      easing: 'easeOutSine',
      targets: current.container.querySelector('#js-button'),
      duration: 300,
      opacity: [1, 0],
    })
    .add(
      {
        easing: 'easeInOutExpo',
        targets: current.container.querySelector('#js-bg'),
        duration: 600,
        opacity: [1, 0],
        scale: [1, 1.1],
      },
      '-=300'
    );
  return animation.finished;
}

/*
 * ページ表示アニメーション
 * @param {Object} next 表示するページ（次のページ）の要素
 * @return Promise
 */
function enterAnimation(next) {
  const animation = anime
    .timeline()
    .add({
      easing: 'easeInSine',
      targets: next.container.querySelector('#js-button'),
      duration: 300,
      opacity: [0, 1],
      translateY: ['15px', 0],
    })
    .add(
      {
        easing: 'easeInOutExpo',
        targets: next.container.querySelector('#js-bg'),
        duration: 1000,
        opacity: [0, 1],
        scale: [1.1, 1],
      },
      '-=300'
    );
  return animation.finished;
}

/*
 * <head>内のタグを入れ替える
 * @param {Object} target 表示するページ（次のページ）の要素
 *
 */
function replaceHeadTags(target) {
  const $newPageHead = $('<head />').html(
    $.parseHTML(
      target.html.match(/<head[^>]*>([\s\S.]*)<\/head>/i)[0],
      document,
      true
    )
  );
  const headTags = [
    "meta[name='robots']",
    "meta[name='keywords']",
    "meta[name='description']",
    "meta[property^='og']",
    "meta[name^='twitter']",
    'meta[itemprop]',
    "link[rel='next']",
    "link[rel='prev']",
    "link[rel='alternate']",
    "link[rel='canonical']",
    "script[type='application/ld+json']",
  ].join(',');
  // タグを削除
  $('head').find(headTags).remove();
  // タグを追加
  $newPageHead.find(headTags).appendTo('head');

  //Googleアナリティクスに送信
  if (typeof ga === 'function') {
    ga('send', 'pageview', location.pathname);
  }
}

export default () => {
  barba.init({
    transitions: [
      {
        async leave({ current, next, trigger }) {
          //ページを離れる時のアニメーション
          const leave = await leaveAnimation(current);
          return leave;
        },
        afterLeave({ current, next, trigger }) {
          //enter時の初期表示状態を設定
          $(next.container).find('.header-nav a').css('opacity', 0);
        },
        beforeEnter({ current, next, trigger }) {
          //headタグの中身を入れ替え
          replaceHeadTags(next);
        },
        enter({ current, next, trigger }) {
          //ページを表示する時のアニメーション
          enterAnimation(next);
        },
      },
    ],
  });
};
