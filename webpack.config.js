const path = require('path')
const Mini = require('babel-minify-webpack-plugin')

module.exports = {
  entry: path.join(path.resolve(__dirname, 'src'), 'json_stream.js'),
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'bin'),
    library: 'JsonStream',
    libraryTarget: 'window',
    libraryExport: 'default'
  },
  plugins: [
    new Mini()
  ]
}
