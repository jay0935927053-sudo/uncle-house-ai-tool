# 房仲自媒體工廠｜手動測試發文包流程

## 用途

不用等每天 10:00，也可以手動測試「每日發文包」格式是否符合使用習慣。

## 操作步驟

1. 打開網站
2. 到「內容生成」分頁
3. 填寫或選擇主題、海外資產欄位、人設與轉化目標
4. 到「內容月曆」區塊
5. 點擊「下載測試發文包 .txt」
6. 打開下載檔，檢查 9 個段落是否完整

## 測試包內容

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

## 注意

- 手動測試包只會下載到本機，不會上傳 Google Drive。
- 手動測試包不會寄 Gmail 通知。
- 手動測試包不會使用 API Key。
- 正式雲端流程仍由 `automation-3` 每天台灣時間 10:00 執行。

## 手機驗收標準

下載後確認：

- FB / Threads 文案可直接複製
- Reels / TikTok / YouTube Shorts 腳本可拍攝
- LINE 私訊有承接話術
- 圖片提示詞可拿去產圖
- 分鏡圖腳本含 Flux Prompt 與 Seedance Motion Prompt
- 發布前檢查有風險揭露與 CTA 檢查

