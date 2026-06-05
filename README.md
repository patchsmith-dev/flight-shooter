# 星翼突击 Flight Shooter

一个可直接在浏览器运行的飞行射击小游戏。项目使用静态 HTML、CSS、JavaScript 和 Phaser 3，无需构建步骤，适合部署到 GitHub Pages。

## 特色

- 自动射击、键盘移动和指针跟随移动
- 鼠标左键或右键蓄力释放激光炮
- 8 波战斗节奏，每 4 波出现 Boss
- 最高分记录、连击倍率和 Boss 血条
- 护盾、火力强化、维修、脉冲清弹道具
- 响应式界面，桌面和移动端都能游玩
- 保留 SVG 素材源文件，运行时使用 Phaser 绘制稳定的 Canvas 纹理

## 本地运行

在项目根目录启动一个静态服务器：

```powershell
python -m http.server 5177
```

然后打开：

```text
http://localhost:5177
```

也可以使用任意静态文件服务器托管本项目。

## GitHub Pages

仓库上传后，可以在 GitHub Pages 中选择 `main` 分支和根目录 `/` 作为发布来源。

## 技术栈

- Phaser 3.90.0 Canvas Renderer
- HTML5 Canvas
- CSS Grid
- 原生 JavaScript
