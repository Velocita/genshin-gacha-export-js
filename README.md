# 原神导出抽卡记录 JS 版

受 sunfkny 在 NGA 的帖子启发，写了一个 JavaScript 版的给自己用。

## 使用方法

1. 使用 Fiddler 或其他抓包工具，获取 https://webstatic.mihoyo.com/hk4e/event/e20190909gacha/index.html 开头的链接，附带上后面的参数。
2. 在浏览器中打开链接，按 F12 打开控制台，把 index.js 的内容复制到控制台按回车执行。
3. 等待执行完成，目前每 0.2 秒获取一页，一页最大 20 条抽卡记录。
4. 推荐使用新版本的 Chrome 或 Firefox。
