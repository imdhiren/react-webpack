const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserWebpackPlugin = require('terser-webpack-plugin')
const path = require("path");

module.exports = {
  mode: "development",
  entry: path.resolve(__dirname, "src", "index.js"),
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "js/[name].bundle.js",
  },
  devServer: {
    static: {
      directory: path.resolve(__dirname, "dist"), //Absolute path
      clean: true, // Automatically empty the contents of the last package
    },
    open: true,
    port: 9000,
    historyApiFallback: true,
  },
  // Loader
  module: {
     // Loader configuration
    rules: [
      {
        test: /\.(jsx|js)$/,
        include: path.resolve(__dirname, "src"),
        exclude: path.resolve(__dirname, "node_modules"),
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                [
                  "@babel/preset-env",
                  {
                    targets: "defaults",
                  },
                ],
                "@babel/preset-react",
              ],
            },
          },
        ],
      },
      {
        test: /\.css$/i, // Only check.css file
        use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "postcss-loader",
          "sass-loader",
        ],
      },
      {
        test: /\.(png|jpeg|gif|jpg)$/i,
        type: "asset/resource",
        // Output to the specified directory and uniformly configure to output.assetModuleFilename
        generator: {
          filename: 'images/[name]-[hash:10][ext][query]',
        },
      },
      {
        test: /\.webp$/i,
        use: ["file-loader","webp-loader"],
         // Output to the specified directory and uniformly configure to output.assetModuleFilename
         generator: {
          filename: 'images/[name]-[hash:10][ext][query]',
        },
      },
    ],
  },
  plugins: [
     // css extraction
     new MiniCssExtractPlugin({
      filename: 'css/[name].css',  // Output to the specified directory
    }),
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      filename: "index.html",
    }),
  ],
  optimization: {
    splitChunks: {
      chunks: "all",
    },
  },
};
