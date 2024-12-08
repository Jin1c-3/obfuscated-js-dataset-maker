# 制作 `JavaScript` 混淆代码数据集

## 项目说明

配置 `config.yml` 中的 `origin_source` ，可以将仓库中的 `JavaScript` 代码进行混淆，在对应文件夹下生成混淆后的代码数据集。

## 混淆原理

使用了 [javascript-obfuscator](https://github.com/javascript-obfuscator/javascript-obfuscator)

## 使用方式

1. 修改配置

首先修改 `config.yml` 中的配置，文件中有具体注释。

2. 安装依赖

```powershell
npm i
```

3. 运行

```powershell
npm run app
```
