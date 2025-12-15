# Study 3 行为实验系统

网页端行为实验系统，用于博士论文 Study 3 数据收集。

## 技术栈

- **React 18** - UI框架
- **Vite** - 构建工具
- **纯网页应用** - 无需安装，支持移动端和桌面端

## 功能特性

- ✅ 随机视频播放（从18个视频中随机选择1个）
- ✅ 全屏竖屏播放体验（移动端优先）
- ✅ 交互按钮（红心点赞、购物车）
- ✅ 自动记录行为数据（观看时长、点击行为等）
- ✅ 自动跳转问卷页面
- ✅ 问卷数据收集（单选题、Likert量表）
- ✅ 自动生成唯一用户ID（UUID）
- ✅ 数据提交（当前为Mock模式）

## 项目结构

```
study3实验程序/
├── src/
│   ├── components/
│   │   ├── VideoExperiment.jsx    # 视频实验页面
│   │   ├── VideoExperiment.css
│   │   ├── Questionnaire.jsx      # 问卷页面
│   │   └── Questionnaire.css
│   ├── utils/
│   │   ├── uuid.js                # UUID生成工具
│   │   ├── videos.js               # 视频配置
│   │   └── api.js                 # API接口（Mock）
│   ├── App.jsx                     # 主应用组件
│   ├── App.css
│   ├── main.jsx                    # 入口文件
│   └── index.css                   # 全局样式
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

服务器将在 `http://localhost:3000` 启动，并自动在浏览器中打开。

### 3. 预览效果

- 打开浏览器开发者工具（F12）
- 切换到移动设备模式（手机竖屏）
- 刷新页面开始实验

## 数据记录说明

系统自动记录以下行为数据：

- `user_id`: 唯一用户ID（UUID，存储在localStorage）
- `video_id`: 视频ID（1-18）
- `like`: 是否点击红心（0/1）
- `cart`: 是否加入购物车（0/1）
- `watch_duration`: 实际观看时长（秒，精确到小数点后2位）
- `completed`: 是否完整播放（0/1）
- `questionnaire`: 问卷答案对象

## 配置说明

### 修改视频URL

编辑 `src/utils/videos.js`：

```javascript
export const VIDEO_LIST = Array.from({ length: 18 }, (_, i) => ({
  id: i + 1,
  url: `https://your-project.supabase.co/storage/v1/object/public/videos/video_${i + 1}.mp4`,
  duration: 20 + Math.random() * 5,
}));
```

### 修改问卷题目

编辑 `src/components/Questionnaire.jsx` 中的 `questions` 数组。

### 连接真实后端API

编辑 `src/utils/api.js`，取消注释真实API调用代码，并替换 `API_BASE_URL`。

## 构建生产版本

```bash
npm run build
```

构建产物在 `dist/` 目录。

## 注意事项

1. **视频格式**：建议使用 MP4 格式，确保移动端兼容性
2. **视频时长**：当前设置为20-25秒，可在 `videos.js` 中调整
3. **用户ID**：存储在localStorage，清除浏览器数据会生成新ID
4. **数据提交**：当前为Mock模式，数据仅打印到控制台

## 后续开发建议

1. 替换视频URL为Supabase Storage链接
2. 连接真实后端API
3. 根据实际需求调整问卷题目
4. 添加数据验证和错误处理
5. 考虑添加实验说明页面

## 浏览器兼容性

- Chrome/Edge（推荐）
- Safari（iOS/macOS）
- Firefox
- 移动端浏览器

## 许可证

仅供学术研究使用。

