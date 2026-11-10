/* ==========================================================================
   講義目錄（全站唯一的資料來源）
   - 首頁的課程/講義清單、講義頁的麵包屑與「上一篇／下一篇」都由這裡產生。
   - 新增講義 = 新增 HTML 檔 + 在對應課程的 lessons 陣列「末端」加一筆。
   - 等號右邊必須是合法 JSON：雙引號、不可有註解、不可有結尾逗號。
     （scripts/check.py 會解析這段內容做檢查）
   ========================================================================== */
window.CATALOG = {
  "site": {
    "title": "商學院講義庫",
    "titleEn": "Business School Lecture Notes",
    "description": "整理商學院課程的學習講義：用一致的結構、清楚的公式與可練習的題目，把上課內容變成可以反覆查閱的筆記。",
    "author": "oscar1231828-ux",
    "repo": "https://github.com/oscar1231828-ux/biz-lecture-notes"
  },
  "courses": [
    {
      "id": "portfolio-management",
      "code": "IPM",
      "title": "投資組合管理",
      "titleEn": "Investment & Portfolio Management",
      "instructor": "Douglas Chung",
      "description": "從因子投資出發，學習如何把股票的特徵轉成可交易的投資組合，並用 Python 實際複製學術界的因子。",
      "lessons": [
        {
          "id": "ipm-01",
          "no": 1,
          "week": 9,
          "title": "Factor Investing I",
          "subtitle": "基本面因子：從排序、加權到 Fama-French 模型",
          "file": "lessons/portfolio-management/01-factor-investing-1.html",
          "tags": ["因子投資", "投資組合排序", "FF3 / FF5"],
          "updated": "2026-11-10"
        },
        {
          "id": "ipm-02",
          "no": 2,
          "week": 10,
          "title": "Factor Investing II",
          "subtitle": "技術面因子：動能、波動、偏態與流動性",
          "file": "lessons/portfolio-management/02-factor-investing-2.html",
          "tags": ["效率市場", "動能", "異常報酬"],
          "updated": "2026-11-10"
        },
        {
          "id": "ipm-03",
          "no": 3,
          "week": 9,
          "title": "Fama-French 3 Factors Construction",
          "subtitle": "實作：用 CRSP 與 Compustat 資料親手做出 SMB 與 HML",
          "file": "lessons/portfolio-management/03-ff3-construction.html",
          "tags": ["Python", "pandas", "因子複製"],
          "updated": "2026-11-10"
        }
      ]
    }
  ]
};
