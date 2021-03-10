const path = require("path");
const isProduction = process.env.NODE_ENV === "production";
const CompressionPlugin = require("compression-webpack-plugin");
module.exports = {
  productionSourceMap: isProduction ? false : true,
  devServer: {
    port: 3000,
  },
  configureWebpack: {
    resolve: {
      alias: {
        "@": path.join(__dirname, "./src"),
      },
    },
    performance: {
      hints: false,
      maxEntrypointSize: 51200000,
      maxAssetSize: 51200000,
    },
  },
  chainWebpack(config) {
    if (!isProduction) return;
    config.plugin("CompressionPlugin").use(CompressionPlugin);
  },
};
