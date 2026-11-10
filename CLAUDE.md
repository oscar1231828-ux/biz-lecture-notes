# CLAUDE.md

本專案的所有規則都寫在 **[AGENTS.md](./AGENTS.md)**，請在進行任何修改前完整閱讀。

最常用的三件事：

1. **新增講義**：照 AGENTS.md §8.1 的 SOP——複製 `templates/lesson-template.html`，填完五個固定區塊，在 `assets/js/catalog.js` 末端登記一筆。
2. **改完一定要檢查**：在專案根目錄執行 `python3 scripts/check.py`，看到「✅ 檢查通過」才算完成。
3. **不要**引入外部函式庫、不要寫 inline style、不要更動固定區塊的 id 與順序（AGENTS.md §9）。
