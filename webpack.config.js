const path = require('path');

// This file extends the Create React App webpack configuration
module.exports = {
  // Only override what we need to
  // This will be merged with the CRA webpack config
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
        // Ignore source map warnings from problematic packages
        exclude: [
          // This ignores the html2pdf.js source map warnings
          path.resolve(__dirname, 'node_modules/html2pdf.js')
        ]
      }
    ]
  }
}; 