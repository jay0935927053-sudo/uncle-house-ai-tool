# 房仲自媒體工廠｜後台自動化設定

## 目前已啟用

- 自動任務：`automation-3`
- 執行時間：每日台灣時間 `10:00`
- Google Drive 主資料夾：已保存在 Codex 自動任務設定中
- 通知信箱：已保存在 Codex 自動任務設定中

## 每日發文包輸出

每天建立一個日期資料夾，格式：

```text
YYYY-MM-DD｜每日發文包
```

日期資料夾內再分成兩個分類資料夾：

```text
01_海外資產內容
02_房仲自媒體內容
```

每個分類資料夾內固定輸出：

```text
01_FB貼文.txt
02_Threads貼文.txt
03_Reels腳本.txt
04_TikTok腳本.txt
05_YouTubeShorts腳本.txt
06_LINE私訊.txt
07_圖片提示詞.txt
08_分鏡圖腳本.txt
09_發布前檢查.txt
```

分類用途：

```text
01_海外資產內容：馬來西亞置產、海外資產配置、跨境生活、風險揭露
02_房仲自媒體內容：房仲主題、短影音、自媒體經營、AI內容工具、成交轉化
```

## 安全 API Key 原則

目前網站是 GitHub Pages 靜態前端，不能安全保存 API Key。

禁止放在：

```text
index.html
localStorage
GitHub 公開檔案
前端 JavaScript
網址參數
```

未來若升級成真正後台，API Key 應放在：

```text
GitHub Actions Secrets
Vercel Environment Variables
Cloudflare Workers Secrets
Codex / OpenAI 安全金鑰儲存
```

## 通知設計

目前正式通知通道：

```text
Gmail → 自動任務設定中的通知信箱
```

LINE Notify 已於 2025-03-31 結束服務；未來若要 LINE 通知，應改用：

```text
LINE Messaging API
LINE Official Account
```

## 深層圖片自動化

API Key 僅保存在本機 `.env.local` 或正式後台 Secrets，不進前端網站。

目前本機腳本：

```text
scripts/generate-daily-images.mjs
```

預設每天只為兩個分類各產 1 張 FB 貼文圖，先不生成分鏡圖圖片：

```text
01_海外資產內容 / FB貼文圖.png
02_房仲自媒體內容 / FB貼文圖.png
```

若正式自動任務偵測到 API Key 可用，產圖後上傳到對應 Google Drive 分類資料夾。

## 手機操作流程

1. 收到 Gmail 通知
2. 用手機打開 Google Drive 今日資料夾
3. 進入 `01_海外資產內容` 或 `02_房仲自媒體內容`
4. 複製各平台文案
5. 下載圖片提示詞與分鏡腳本
6. 到 FB / Threads / TikTok / YouTube / LINE 發布或排程
