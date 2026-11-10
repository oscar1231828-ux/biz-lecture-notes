# 商學院講義庫 · Business School Lecture Notes

把商學院課程的投影片與程式範例，重新整理成**結構一致、可反覆查閱**的學習講義網站。

🔗 **網站**：https://oscar1231828-ux.github.io/biz-lecture-notes/

## 目前收錄

| 課程 | 講次 | 主題 |
|---|---|---|
| 投資組合管理（IPM） | 01 | Factor Investing I：基本面因子 |
| | 02 | Factor Investing II：技術面因子 |
| | 03 | Fama-French 3 Factors Construction：Python 實作 |

## 特色

- **固定五段結構**：學習目標 → 內容講解 → 重點整理 → 小練習（附解答）→ 延伸資源
- **簡潔學術風**：襯線標題、紙張色調、支援深色模式與列印
- **零依賴**：純 HTML / CSS / JavaScript，不需要安裝或建置，直接用瀏覽器開啟 `index.html` 也能瀏覽
- **為 AI 協作設計**：所有規則寫在 [`AGENTS.md`](./AGENTS.md)，並附自動檢查腳本

## 新增一講（摘要）

1. 複製 `templates/lesson-template.html` 到 `lessons/<課程 id>/<NN>-<slug>.html`
2. 依 `AGENTS.md` 填入五個區塊
3. 在 `assets/js/catalog.js` 對應課程的 `lessons` 末端加一筆
4. 執行 `python3 scripts/check.py`，看到「✅ 檢查通過」即完成

首頁清單、麵包屑、上一講／下一講都會自動更新。完整規則請見 [`AGENTS.md`](./AGENTS.md)。

## 專案結構

```
├── AGENTS.md / CLAUDE.md     專案規則（給 AI 與協作者）
├── index.html                首頁
├── assets/css/style.css      全站樣式與元件庫
├── assets/js/catalog.js      講義目錄（唯一資料來源）
├── assets/js/site.js         頁首頁尾、清單、目錄、導覽
├── lessons/<課程>/           講義頁
├── templates/                講義模板
└── scripts/check.py          自動檢查
```

## 來源說明

講義內容以 Douglas Chung 老師《Investment & Portfolio Management》課程為基礎，以自己的文字與程式重新整理撰寫。原始課程講義不包含在本 repo 中。
