module.exports = {
  pluginName: 'hadeshe',
  context(path) {
    console.log('old context', path);
    return '123';
  },
};
