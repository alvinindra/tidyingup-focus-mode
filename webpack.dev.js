import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { merge } from 'webpack-merge';
import common from './webpack.common.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    static: [
      {
        directory: resolve(__dirname, 'dist'),
      },
      {
        directory: resolve(__dirname, '.'),
        publicPath: '/',
        serveIndex: false,
        watch: true,
      },
    ],
    port: 9000,
    hot: true,
    open: true,
    compress: true,
    historyApiFallback: true,
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
    watchFiles: ['index.html', '**/*.css', '**/*.js', 'manifest.json'],
  },
  output: {
    filename: '[name].bundle.js',
    path: resolve(__dirname, 'dist'),
    clean: true,
    publicPath: '/',
  },
});