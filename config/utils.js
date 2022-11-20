/*
 * @Author: Dhiren Patel
 * @Date: 2022-11-21 12:42:11
 * @Description: webpack config utils
 * @LastEditTime: 2022-11-21 15:53:15
 * @LastEditors: Dhiren Patel
 */
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  /**
   * @description: Get style configuration loader
   *@param{*} loaderName undefined (css does not require a preprocessor)|less-loader|stylus-loader|sass-loader
   * @return {*}
   */
  getStyleLoader(loaderName) {
    return [
      MiniCssExtractPlugin.loader,
      'css-loader',
      {
        loader: 'postcss-loader',
        options: {
          postcssOptions: {
            plugins: [
              [
                'postcss-preset-env',
                // Other options
                {},
              ],
            ],
          },
        },
      },
      loaderName,
    ].filter(Boolean);
  },
};