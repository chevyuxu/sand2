# 大漠之家公益互動網頁廣告

一個基於HTML5的互動式網頁廣告，通過撥開沙子露出綠洲的互動方式，展示防沙治沙的重要性。

## 功能特點

- 互動式沙漠效果，用戶可以撥開沙子看到底下的土地
- 隨著用戶互動逐步顯現從乾裂土地到綠洲的轉變過程
- 支持移動端和桌面設備
- 使用PixiJS實現沙子的物理效果和動畫

## 技術棧

- HTML5 / CSS3
- JavaScript
- PixiJS (WebGL渲染)
- Vite (構建工具)

## 本地開發

### 安裝依賴

```bash
npm install
```

### 啟動開發服務器

```bash
npm run dev
```

### 構建生產版本

```bash
npm run build
```

### 預覽生產構建

```bash
npm run preview
```

## 部署到GitHub Pages

1. 構建專案
   ```bash
   npm run build
   ```

2. 將`dist`目錄提交到GitHub倉庫的`gh-pages`分支

3. 在GitHub倉庫設置中啟用GitHub Pages，選擇`gh-pages`分支作為來源

## 項目結構

```
├── public/             # 靜態資源
│   └── assets/         # 圖片、字體等資源
│       └── images/     # 圖片資源
├── src/                # 源代碼
│   ├── css/            # 樣式表
│   └── js/             # JavaScript代碼
├── index.html          # 入口HTML文件
├── package.json        # 項目依賴配置
├── vite.config.js      # Vite配置
└── README.md           # 項目說明
```

## License

MIT 