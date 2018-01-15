const colors = require('colors/safe');

class Renderer {
  static output(dynasty) {
    const output = '';

    process.stdout.write(dynasty);

    process.stdout.write(colors.white(output));
  }
}

module.exports = Renderer;
