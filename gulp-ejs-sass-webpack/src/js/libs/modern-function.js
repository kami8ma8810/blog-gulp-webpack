// Babelで変換されるかどうかのテストコード
export default () => {
  const obj = { a: 'これが出力されれば', b: 'Babelを通じて' };
  const newObj = { ...obj, c: '正常に変換されてます' };
  console.log('Index.jsを読み込んでいます', newObj);
  //ProvidePluginでjQuery($)を読み込んでいるかテスト
  $('body').addClass('jqueryyyyyyyyyy')
};