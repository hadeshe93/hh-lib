let scene;

module.exports = {
  pluginName: 'hadeshe',
  hooks: {
    start({ scene: rawScene }) {
      scene = rawScene;
      return scene;
    },
    beforeNewPlugin({ pluginClass, args }) {
      if (pluginClass.name === 'HtmlWebpackPlugin') {
        const [options] = args;
        options.title = `钩子中注入的标题(${scene && scene.toUpperCase()})`;
        console.log('options.title: ', options.title);
      }
      return { pluginClass, args };
    },
    context(path) {
      console.log('old context', path);
      return '123';
    },
  },
};
