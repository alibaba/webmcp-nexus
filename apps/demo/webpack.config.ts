import path from 'node:path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { WebMcpPlugin } from 'webpack-plugin-webmcp-nexus';
import type { Configuration } from 'webpack';
import 'webpack-dev-server'; // 引入类型扩展

const config: Configuration = {
  entry: './src/main.tsx',

  output: {
    path: path.resolve(import.meta.dirname, 'dist-webpack'),
    filename: 'static/js/[name].[contenthash:8].js',
    clean: true,
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
  },

  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              ['@babel/preset-react', { runtime: 'automatic' }],
              '@babel/preset-typescript',
            ],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'static/media/[name].[hash:8][ext]',
        },
      },
    ],
  },

  plugins: [
    new WebMcpPlugin({ include: ['src'] }),
    new HtmlWebpackPlugin({
      template: './index.html',
      inject: true,
    }),
  ],

  optimization: {
    minimize: false,
  },

  devServer: {
    port: 3001,
    hot: true,
    historyApiFallback: true,
  },
};

export default config;
