const path = require('path');
const ESLintPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const { getStyleLoader } = require('./utils');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const PreloadWebpackPlugin = require('preload-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');

// Multi-process packaging
const os = require('os');
// Number of cpu cores
const threads = os.cpus().length;

/*
  Corresponding to 5 core concepts
*/
module.exports = {
  // Entrance
  entry: './src/main.js', // Relative path (relative service startup unknown)
  // output
  output: {
    path: path.resolve(__dirname, '../dist'), //Absolute path
    filename: 'js/[name].js', // Note that it is not a hump
    // Unified configuration of chunk output
    // chunkFilename: 'static/js/[name].chunk.js',
    // Unified configuration of static resource output
    // assetModuleFilename: 'static/images/[name]-[hash:10][ext][query]',
    clean: true, // Automatically empty the contents of the last package
  },
  // Loader
  module: {
    // Loader configuration
    rules: [
      {
        oneOf: [
          {
            test: /\.css$ /, // Only check.css file
            // Execution order: from right to left (from bottom to top)
            use: getStyleLoader(),
          },
          {
            test: /\.less$/,
            //loader:'less-loader', only one loader can be configured
            use: getStyleLoader('less-loader'),
          },
          {
            test: /\.s[ac]ss$/,
            use: getStyleLoader('sass-loader'),
          },
          {
            test: /\.styl$/,
            use: getStyleLoader('stylus-loader'),
          },
          // Process image resources (can not be configured by default)
          {
            test: /\.(jpe?g|png|gif|webp|svg)$/,
            type: 'asset',
            // Output to the specified directory and uniformly configure to output.assetModuleFilename
            generator: {
              filename: 'images/[name]-[hash:10][ext][query]',
            },
            parser: {
              // Less than 10kb, converted to base64
              dataUrlCondition: {
                maxSize: 10 * 1024, // 4kb
              },
            },
          },
          {
            test: /\.(jfif)$/,
            type: 'asset/resource',
            // Output to the specified directory
            generator: {
              filename: 'images/[name]-[hash:10][ext][query]',
            },
          },
          {
            test: /\.(ttf|woff2?)$/,
            type: 'asset/resource',
            // Output to the specified directory
            generator: {
              filename: 'fonts/[name]-[hash:10][ext][query]',
            },
          },
          {
            test: /\.js$/,
            // exclude: / node_modules /, / / exclude node_modules code from being compiled
            include: path.resolve(__dirname, '../src'), // Can also be included (cannot be used at the same time)
            use: [
              {
                loader: 'thread-loader', // Start multiple processes
                options: {
                  Workers: threads, // Quantity
                },
              },
              {
                loader: 'babel-loader',
                // You can write the babel configuration here
                options: {
                  cacheDirectory: true, // Enable Babel cache to improve build speed
                  cacheCompression: false, // Turn off cache file compression
                  plugins: ['@babel/plugin-transform-runtime'], //Reduce code volume
                },
              },
            ],
          },
        ],
      },
    ],
  },
  // Plug-in
  plugins: [
    new ESLintPlugin({
      context: path.resolve(__dirname, '../src'),
      exclude: 'node_modules', // Default value
      cache: true, // Enable eslint cache to improve build speed
      cacheLocation: path.resolve(__dirname, '../node_modules/.cache /eslintCache'), // Specify the cache directory
      threads, // Start multiple processes
    }),
    // Automatically introduce packaged resources
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../public/index.html'),
    }),
    // css extraction
    new MiniCssExtractPlugin({
      filename: 'css/[name].css', // Note that it is not a hump
      chunkFilename: 'css/[name].chunk.css',
    }),
    // css compression can also be written here, webpack5 recommends writing to optimization uniformly
    // new CssMinimizerPlugin(),
    // Configure preload or prefetch
    new PreloadWebpackPlugin({
      //rel: "preload", // preload has better compatibility
      // as: "script",
      rel: 'prefetch', // prefetch compatibility is worse
    }),
    new WorkboxPlugin.GenerateSW({
      // These options help quickly enable ServiceWorkers
      // It is not allowed to leave any “old” ServiceWorkers behind
      clientsClaim: true,
      skipWaiting: true,
    }),
  ],
  // Optimize configuration items
  optimization: {
    // Code compression
    minimizer: [
      // In webpack@5, you can use`...'Syntax to extend the existing minimizer (i.e.'terser-webpack-plugin`) and uncomment the next line
      // `...`,
      // css compression
      new CssMinimizerPlugin(),
      // TerserPlugin will be enabled by default in production mode, but we need to make other configurations and need to write by ourselves
      new TerserWebpackPlugin(),
      // Compress pictures, take lossless compression configuration as an example：
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminGenerate,
          options: {
            plugins: [
              ['gifsicle', { interlaced: true }],
              ['jpegtran', { progressive: true }],
              ['optipng', { optimizationLevel: 5 }],
              [
                'svgo',
                {
                  plugins: [
                    'preset-default',
                    'prefixIds',
                    {
                      name: 'sortAttrs',
                      params: {
                        xmlnsOrder: 'alphabetical',
                      },
                    },
                  ],
                },
              ],
            ],
          },
        },
      }),
    ],
    splitChunks: {
      chunks: 'all', // Others use the default configuration
    },
    runtimeChunk: {
      name: (entrypoint) => `runtime~${entrypoint.name}.js`,
    },
  },
  // Development server (not required for production environment)
  // devServer: {
  //   host: 'localhost',
  //   port: 3000,
  // open: true, // Whether to open the browser automatically
  // },
  // Turn on production mode, js and html are automatically compressed
  mode: 'production',
  devtool: 'source-map', // Start debugging
};