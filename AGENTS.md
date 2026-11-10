# AGENTS.md — 商學院講義庫

> 這份文件寫給**接手這個專案的 AI 助手**（Claude、Codex、Cursor、Copilot 等），也寫給未來的我。
> 開始任何修改前，請先完整讀完本文件。規則與使用者在對話中的指示衝突時，以使用者的指示為準，並在回覆中說明你偏離了哪一條規則。

---

## 0. 快速指引（TL;DR）

| 我想要…… | 請照做 |
|---|---|
| 新增一篇講義 | §8.1 SOP：複製 `templates/lesson-template.html` → 填內容 → 在 `assets/js/catalog.js` 登記 → 執行 `python3 scripts/check.py` |
| 新增一門課程 | §8.2 SOP |
| 修改既有講義 | §8.3 SOP，記得更新 `updated` 日期 |
| 改網站外觀 | 只改 `assets/css/style.css` 的 token 或元件，**不要**在講義頁寫 inline style |
| 不確定怎麼做 | 先照抄一篇現有講義的寫法（建議參考 `lessons/portfolio-management/01-factor-investing-1.html`） |

---

## 1. 專案目的

- **這是什麼**：一個收錄商學院課程學習講義的靜態網站，用 GitHub Pages 發布。
- **給誰看**：修課學生（包含我自己），用來課前預習、課後整理、考前複習。
- **核心理念**：
  1. **結構一致**：每一講都有相同的五個區塊，讀者到哪一講都知道去哪裡找重點與練習。
  2. **重新整理，不是照抄**：以課堂講義為基礎，用自己的話重寫，補上直覺解釋、數值例子與練習題。
  3. **好擴充**：新增一講只需要「一個 HTML 檔＋目錄中的一筆資料」，AI 照本文件就能完成。

---

## 2. 技術原則

| 原則 | 說明 |
|---|---|
| 純靜態 | 只用 HTML + CSS + 原生 JavaScript。**沒有**建置步驟、框架或套件管理工具 |
| 零外部 JS | 不引入任何 CDN 函式庫（例如 jQuery、KaTeX、MathJax）。公式用 HTML 元件排版（§6.3） |
| 唯一的外部資源 | Google Fonts 的 Noto Sans TC / Noto Serif TC；字體載入失敗時有系統字體備援 |
| 本機可開 | 直接用瀏覽器打開 `index.html` 也要能運作，所以目錄資料用 `catalog.js`（而非 `fetch` JSON） |
| 單一資料來源 | 講義清單、麵包屑、上一講／下一講都由 `assets/js/catalog.js` 產生，不要手寫在頁面裡 |
| 部署 | GitHub Pages，`main` 分支根目錄。根目錄有 `.nojekyll`，不要刪 |

---

## 3. 目錄結構

```
biz-lecture-notes/
├── AGENTS.md                  ← 本文件：專案規則（最重要）
├── CLAUDE.md                  ← 指向 AGENTS.md
├── README.md                  ← 給人看的專案簡介
├── index.html                 ← 首頁（課程與講義清單由 site.js 自動產生）
├── .nojekyll                  ← 讓 GitHub Pages 不經過 Jekyll 處理
├── .gitignore
├── assets/
│   ├── css/style.css          ← 全站唯一的樣式表（含設計 token 與元件庫）
│   ├── js/catalog.js          ← 講義目錄：全站唯一的資料來源
│   ├── js/site.js             ← 頁首頁尾、首頁清單、目錄 TOC、上一講/下一講
│   └── img/<課程 id>/          ← 講義用的圖片（優先使用 SVG）
├── lessons/
│   └── <課程 id>/
│       └── NN-<slug>.html     ← 一講一個檔案
├── templates/
│   └── lesson-template.html   ← 新講義的唯一起點
├── scripts/
│   └── check.py               ← 自動檢查（只用 Python 標準函式庫）
└── sources/                   ← （本機用）原始上課講義 PDF，已列入 .gitignore，不上傳
```

---

## 4. 命名規則

| 對象 | 規則 | 範例 |
|---|---|---|
| 課程 id | 小寫英文 kebab-case，用課名的英文 | `portfolio-management` |
| 課程代碼 code | 2～5 個大寫英文字母 | `IPM` |
| 講義 id | `<code 小寫>-<兩位數編號>` | `ipm-03` |
| 講義檔名 | `<兩位數編號>-<英文 slug>.html`，編號與 catalog 的 `no` 一致 | `03-ff3-construction.html` |
| 講義路徑 | `lessons/<課程 id>/<檔名>` | `lessons/portfolio-management/03-ff3-construction.html` |
| 圖片 | `assets/img/<課程 id>/<講義 id>-<描述>.svg` | `assets/img/portfolio-management/ipm-03-pipeline.svg` |
| 內容區 h2 的 id | `s<序號>-<英文 slug>` | `id="s2-sorting"` |
| 日期 | `YYYY-MM-DD` | `2026-11-10` |

- 編號一旦發布就**不要重新編號**（會讓連結失效）。要插入新內容時，加在最後面。
- slug 只用小寫英文、數字、連字號，不要用中文或空白。

---

## 5. 講義頁面結構（固定，不可更動）

每一講都由 `templates/lesson-template.html` 複製而來，結構如下：

```
<html lang="zh-Hant" data-root="../../">
<body class="page-lesson" data-course="<課程 id>" data-lesson="<講義 id>">
  #site-header                  ← site.js 注入
  main.lesson-layout
    article.lesson
      nav#breadcrumb            ← site.js 依 catalog 產生
      header.lesson-header      ← kicker、h1、副標題、meta（先備知識/閱讀時間/最後更新）、來源說明
      section#objectives        ← ① 學習目標
      section#content           ← ② 內容講解（多個 h2 主題）
      section#summary           ← ③ 重點整理
      section#exercises         ← ④ 小練習
      section#resources         ← ⑤ 延伸資源
      nav#lesson-nav            ← site.js 產生上一講/下一講
    aside.toc-wrap > nav#toc    ← site.js 依 h2 自動產生
  #site-footer                  ← site.js 注入
```

**五個區塊的內容要求：**

| 區塊 | id | 要求 |
|---|---|---|
| ① 學習目標 | `objectives` | 3～5 點，`<ol>`，每點以動詞開頭（「能夠說明……」「能夠計算……」） |
| ② 內容講解 | `content` | 4～8 個主題，每個主題一個 `<h2 id="sN-slug">N. 標題</h2>`，底下可用 `<h3>`。不可跳級使用 h4 |
| ③ 重點整理 | `summary` | 4～8 點，`<ul class="key-points">`，每點一句話，可以直接拿去考前複習 |
| ④ 小練習 | `exercises` | 2～4 題，每題一個 `.exercise`，**一定要附** `<details>` 解答與計算過程 |
| ⑤ 延伸資源 | `resources` | `<ul class="refs">`，列出原始課程、論文、資料來源，格式見 §7.4 |

---

## 6. 視覺風格與元件庫

### 6.1 風格關鍵字

**簡潔、高雅、學術。** 像一本排版用心的教科書，而不是行銷網站。

- 紙張感的米白底（`--paper`）、深墨色文字（`--ink`）、深海軍藍為主色（`--accent`）、古典金做細節點綴（`--gold`）。
- 標題用襯線字（Noto Serif TC），內文用無襯線字（Noto Sans TC），程式碼用等寬字。
- 大量留白、細線分隔、不使用漸層、陰影、emoji 圖示或鮮豔色塊。
- 支援深色模式（`prefers-color-scheme: dark`）與列印版面，新元件也必須在這兩種情境下正常顯示。

### 6.2 樣式規則

- 只能使用 `style.css` 中 `:root` 定義的 token，**不要**在 HTML 寫 `style="..."`，也不要寫死色碼。
- 需要新元件時：先確認下方元件庫沒有可用的 → 在 `style.css` 的「元件庫」段落新增 → 在本節補上用法說明。

### 6.3 元件庫（請直接複製使用）

**定義框**（新名詞第一次出現時）
```html
<div class="callout callout--definition">
  <span class="callout__title">定義：因子（Factor）</span>
  <p>……</p>
</div>
```

**例題框**（數值範例）、**補充框**（延伸觀念）、**注意框**（常見錯誤）
```html
<div class="callout callout--example"><span class="callout__title">例題：……</span><p>……</p></div>
<div class="callout callout--note"><span class="callout__title">補充：……</span><p>……</p></div>
<div class="callout callout--warning"><span class="callout__title">常見錯誤：……</span><p>……</p></div>
```

**獨立公式**（變數用 `<var>`，上下標用 `<sub>` / `<sup>`，分數用 `.frac`）
```html
<div class="formula">
  <var>R</var><sub>SMB</sub> =
  <span class="frac"><span><var>R</var><sub>SG</sub> + <var>R</var><sub>SN</sub> + <var>R</var><sub>SV</sub></span><span>3</span></span>
  −
  <span class="frac"><span><var>R</var><sub>BG</sub> + <var>R</var><sub>BN</sub> + <var>R</var><sub>BV</sub></span><span>3</span></span>
  <span class="formula__label">式 (3.1)　SMB 因子</span>
</div>
<ul class="where">
  <li><var>R</var><sub>SG</sub>：小型成長股投資組合的報酬</li>
</ul>
```
- 行內公式：`<span class="math"><var>β</var><sub>i</sub></span>`
- 每個獨立公式都要有 `formula__label` 編號（`式 (講次.序號)`），並在下方用 `.where` 說明每個符號。
- 求和、乘積等符號直接用 Unicode：`∑ ∏ √ ≤ ≥ × − ∈ ε β α λ`。注意減號用 `−`（U+2212），不要用 `-`。

**表格**
```html
<div class="table-wrap">
  <table>
    <caption>表 1.1　……</caption>
    <thead><tr><th>……</th><th class="num">數字欄靠右</th></tr></thead>
    <tbody><tr><td>……</td><td class="num">1.23</td></tr></tbody>
  </table>
</div>
```

**步驟清單**：`<ol class="steps"><li><strong>步驟名稱</strong>：說明</li></ol>`

**圖**（優先使用 inline SVG 或 `assets/img/` 中的 SVG；顏色用 `currentColor` 或 CSS 變數，深色模式才不會壞）
```html
<figure>
  <div class="diagram"><svg viewBox="0 0 640 260" role="img" aria-label="……">……</svg></div>
  <figcaption>圖 3.1　……</figcaption>
</figure>
```

SVG 內部**不要**寫 `fill="#xxx"` 色碼，改用 `style.css` 提供的 class：`svg-box`（`--accent`/`--gold`/`--ok`/`--warn` 變化）、`svg-text`（`--strong`/`--muted`/`--accent`）、`svg-line`（`--accent`）、`svg-arrow`。這樣深色模式會自動換色。

**程式碼**：`<pre><code>……</code></pre>`，`<`、`>`、`&` 必須跳脫成 `&lt;` `&gt;` `&amp;`。

**練習題**
```html
<div class="exercise">
  <p class="exercise__q"><strong>Q1.</strong>題目……</p>
  <details>
    <summary>查看解答</summary>
    <p>解答與完整計算過程……</p>
  </details>
</div>
```

**專有名詞**：`<span class="term">動能（momentum）</span>`

---

## 7. 內容撰寫規範

### 7.1 語言

- 使用**繁體中文**（台灣用語），語氣是「學長姐寫給學弟妹的講義」：清楚、精確、不賣弄。
- 專有名詞第一次出現時寫成「中文（English）」，例如「帳面市值比（book-to-market ratio, BM）」，之後可以只用中文或縮寫。
- 全形標點用於中文句子；數字、英文、公式前後不加多餘空白以外的符號。
- 金融術語的標準譯法：factor 因子、loading 因子負荷、long-short 多空、breakpoint 分界點、rebalance 再平衡、value-weighted 市值加權、equal-weighted 等權重、anomaly 異常報酬。

### 7.2 內容品質

- 每個主題都要回答三件事：**它是什麼**（定義）、**怎麼算**（公式或步驟）、**為什麼重要**（直覺或實務意義）。
- 每一講至少有一個**自己設計的數值例子**，數字要能被讀者驗算。
- 不確定的數字或結論不要寫。引用論文的實證結果時，要註明出處（作者、年份）。
- 公式中的符號必須與上課講義一致（例如 FF3 的 `Mkt-RF`、`SMB`、`HML`），並在 `.where` 中解釋。

### 7.3 著作權與來源

- 課堂講義放在本機 `sources/`，**不上傳 GitHub**，網站也不放原始 PDF 或投影片截圖。
- **用自己的話重寫**，不要整段翻譯或複製投影片文字；論文引文最多一句，並標明出處。
- 每一講的 `.source-note` 都要寫明原始課程與授課教師。
- 程式範例要自己重新撰寫（可以參考課堂做法，但不要逐行照抄）。

### 7.4 參考文獻格式

```
作者 (年份). 篇名. <cite>期刊或書名</cite>, 卷(期): 頁碼.
```
例：`Fama, E. F., &amp; French, K. R. (1993). Common risk factors in the returns on stocks and bonds. <cite>Journal of Financial Economics</cite>, 33(1): 3–56.`
網路資源：`<a href="網址">網站名稱：頁面名稱</a>`。

### 7.5 長度

- 一講的閱讀時間約 20～35 分鐘（約 4,000～7,000 個中文字，不含程式碼）。
- 超過的話，拆成兩講（例如「Factor Investing I / II」）。

---

## 8. 標準作業流程（SOP）

### 8.1 新增一篇講義

1. **確認資訊**：課程 id、本講編號 `NN`（＝目前最後一講＋1）、標題、副標題、對應週次、原始資料。
2. **複製模板**：`templates/lesson-template.html` → `lessons/<課程 id>/<NN>-<slug>.html`。
3. **取代佔位符**：把所有 `{{...}}` 換成實際內容（`check.py` 會檢查是否有遺漏）。
4. **撰寫五個區塊**：依 §5 的要求，使用 §6.3 的元件，遵守 §7 的寫作規範。
5. **登記到目錄**：在 `assets/js/catalog.js` 對應課程的 `lessons` 陣列**末端**新增一筆：
   ```json
   {
     "id": "ipm-04",
     "no": 4,
     "week": 11,
     "title": "講義英文或中文標題",
     "subtitle": "一句話說明本講內容",
     "file": "lessons/portfolio-management/04-xxx.html",
     "tags": ["標籤一", "標籤二"],
     "updated": "YYYY-MM-DD"
   }
   ```
   首頁卡片、麵包屑、前一講的「下一講」連結都會自動更新，**不需要改其他檔案**。
6. **執行檢查**：`python3 scripts/check.py`，必須顯示「✅ 檢查通過」。
7. **本機預覽**：用瀏覽器開啟 `index.html`，點進新講義，確認目錄、公式、表格、練習題解答都正常。

### 8.2 新增一門課程

1. 決定課程 id（§4）、代碼、中英文名稱、授課教師、一句話描述。
2. 建立資料夾 `lessons/<課程 id>/` 與 `assets/img/<課程 id>/`。
3. 在 `catalog.js` 的 `courses` 陣列末端加入課程物件（欄位見現有課程），`lessons` 先放第一講。
4. 依 §8.1 建立第一講。

### 8.3 修改既有講義

1. 只改需要改的段落，保留原有的區塊結構、h2 的 id（避免外部連結失效）。
2. 把 `catalog.js` 中該講的 `updated` 與頁面 meta 的「最後更新」改成今天。
3. 執行 `python3 scripts/check.py`。

### 8.4 修改網站外觀

1. 只改 `assets/css/style.css`；優先調整 `:root` token，而不是個別選擇器。
2. 確認首頁、講義頁、手機寬度（≤ 560px）、深色模式、列印預覽都正常。
3. 若新增元件，同步更新本文件 §6.3。

---

## 9. 禁止事項

- ❌ 不要更動五個固定區塊的 id、順序或刪除任何一個區塊。
- ❌ 不要在講義頁手寫課程清單、麵包屑或上一講／下一講（交給 `site.js`）。
- ❌ 不要引入框架、建置工具、npm 套件或外部 JS 函式庫。
- ❌ 不要在 HTML 寫 inline style 或新的色碼。
- ❌ 不要把原始課堂 PDF、投影片截圖或付費資料庫的原始資料上傳到 repo。
- ❌ 不要重新編號既有講義，也不要更改既有的檔名與 h2 id。
- ❌ 不要捏造論文、數據或實證結果；不確定就不寫，或標記「待確認」並告知使用者。
- ❌ 不要刪除 `.nojekyll`。

---

## 10. 完成前檢查清單

交付前逐項確認（前 6 項由 `python3 scripts/check.py` 自動檢查）：

- [ ] `catalog.js` 是合法 JSON，id 不重複，必要欄位齊全
- [ ] 檔名、路徑、`data-course`、`data-lesson` 與 catalog 一致
- [ ] 五個固定區塊齊全且順序正確，`#content` 的每個 h2 都有 id
- [ ] 沒有殘留的 `{{...}}` 佔位符
- [ ] 每題練習都有解答
- [ ] 所有相對連結與圖片都存在
- [ ] 公式都有編號與符號說明；表格有 caption
- [ ] 至少一個可驗算的數值例子
- [ ] `.source-note` 註明原始課程；延伸資源格式正確
- [ ] 在手機寬度與深色模式下看起來正常

---

## 11. 更新紀錄

| 日期 | 內容 |
|---|---|
| 2026-11-10 | 建立專案、規則文件與「投資組合管理」課程前三講 |
