module.exports = {
  pluginName: 'hadeshe',
  hooks: {
    context(path) {
      console.log('old context', path);
      return '123';
    },
  },
};
