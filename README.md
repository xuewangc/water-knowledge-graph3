# 中国 1911年以前水利知识图谱

## 简介
本项目旨在构建一个关于中国1911年以前水利知识的可视化图谱，通过交互式界面展示水利历史事件、工程、人物及相关知识。该图谱可以帮助用户更直观地了解中国古代水利的发展脉络及其对社会的影响。

## 功能特点
- **时间轴筛选**：通过拖动时间轴，用户可以筛选特定历史时期内的水利事件和工程。
- **节点交互**：
    - 节点可拖拽，拖拽后位置固定，便于用户自定义布局。
    - 双击节点可解除固定位置，恢复自由拖拽状态。
    - 鼠标悬停在节点上时，会显示节点的详细信息，包括名称、描述、时间等。
- **信息展示**：详细信息展示包括水利事件、工程、人物及相关背景知识。

## 使用方法
1. **启动图谱**：
    - 打开项目文件夹，运行 `index.js` 文件。
    - 或者将项目部署到Web服务器上，通过浏览器访问。

2. **交互操作**：
    - 使用鼠标拖动时间轴滑块，筛选特定时间段内的节点。
    - 点击并拖动节点，调整其在图谱中的位置。
    - 双击节点解除固定位置。
    - 将鼠标悬停在节点上，查看详细信息。

## 数据来源
本知识图谱的数据来源于以下渠道：
- 古籍文献：《史记》《汉书》《水经注》等。
- 学术研究：水利史相关论文和著作。
- 公开数据集：中国古代水利工程数据库等。

## 技术栈
- **前端框架**：D3.js（用于数据可视化）
- **交互功能**：HTML5、CSS3、JavaScript
- **数据存储**：JSON格式存储水利知识数据

## 项目结构
```markdown
water-knowledge-graph3/
├── node_modules/
├── public/
├── src/
│   ├── components/
│   │   ├── Detail/
│   │   │   ├── DetailPanel.js
│   │   │   ├── FloodDetail.js
│   │   │   ├── ProjectDetail.js
│   │   │   └── TechDetail.js
│   │   ├── Graph/
│   │   │   ├── Graph.css
│   │   │   ├── Graph.js
│   │   │   ├── GraphControls.js
│   │   │   ├── GraphEdge.js
│   │   │   └── GraphNode.js
│   │   ├── Header/
│   │   │   └── Header.js
│   │   ├── Search/
│   │   │   └── SearchBar.js
│   │   ├── Timeline/
│   │   │   └── Timeline.js
│   │   └── context/
│   │       └── GraphContext.js
│   ├── data/
│   │   ├── 技术.json
│   │   ├── 水利工程.json
│   │   └── 水灾.json
│   ├── hooks/
│   │   └── useGraphData.js
│   ├── styles/
│   │   └── index.css
│   ├── utils/
│   │   ├── dataProcessor.js
│   │   ├── debugHelper.js
│   │   ├── graphLayout.js
│   │   └── timeNormalizer.js
│   ├── App.css
│   ├── App.js
│   ├── App.test.js
│   ├── index.css
│   ├── index.js
│   └── logo.svg
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

### 版权声明

本项目的所有数据、代码及文档均受知识共享许可协议（Creative Commons License）或 MIT 许可证保护。用户可以自由使用、修改和分发本项目，但需遵守以下条件：

- **数据**：请注明数据来源，如古籍、论文或公开数据库。
- **代码**：遵循 MIT 许可证，允许自由使用和修改，但需附带原始许可证声明。
- **文档**：可以引用和分享，但请注明出处。

本项目仅用于学术研究和非商业用途，如需商业化应用，请联系项目作者获取授权。
