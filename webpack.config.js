const path = require('path')

module.exports = {
  entry: path.join(path.resolve(__dirname, 'src'), 'json_stream.js'),
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'bin'),
    library: 'JsonStream',
    libraryTarget: 'window',
    libraryExport: 'default'
  },
  plugins: [],
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: { loader: 'babel-loader' }
    }]
  }
}
