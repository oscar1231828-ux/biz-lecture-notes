#!/usr/bin/env python3
"""
商學院講義庫 · 自動檢查腳本
用法（在專案根目錄執行）：python3 scripts/check.py

檢查項目（對應 AGENTS.md §9 完成前檢查清單）：
  1. catalog.js 可以解析成 JSON，必要欄位齊全，id 不重複
  2. catalog 中每一講的 HTML 檔都存在；lessons/ 底下沒有「未登記」的講義
  3. 檔名符合 NN-slug.html，且 NN 與 catalog 的 no 一致
  4. 每一講的 <html lang>、data-root、data-course、data-lesson 正確
  5. 五個固定區塊存在且順序正確；#content 內每個 h2 都有 id
  6. <title> 與 meta description 存在；模板佔位符 {{...}} 已全部取代
  7. 頁面中的相對連結與圖片都指向存在的檔案
只使用 Python 標準函式庫，不需要安裝任何套件。
"""
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REQUIRED_SECTIONS = ["objectives", "content", "summary", "exercises", "resources"]
LESSON_FIELDS = ["id", "no", "title", "subtitle", "file", "tags", "updated"]
COURSE_FIELDS = ["id", "code", "title", "titleEn", "description", "lessons"]
FILE_RE = re.compile(r"^(\d{2})-[a-z0-9]+(?:-[a-z0-9]+)*\.html$")
SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")

errors, warnings = [], []


def err(msg):
    errors.append(msg)


def warn(msg):
    warnings.append(msg)


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.html_attrs, self.body_attrs = {}, {}
        self.section_ids, self.links = [], []
        self.title, self._in_title = "", False
        self.has_description = False
        self.content_h2_without_id = 0
        self._stack = []  # 追蹤目前是否在 #content 內

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "html":
            self.html_attrs = a
        elif tag == "body":
            self.body_attrs = a
        elif tag == "title":
            self._in_title = True
        elif tag == "meta" and a.get("name") == "description" and a.get("content"):
            self.has_description = True
        if tag == "section":
            sid = a.get("id")
            if sid in REQUIRED_SECTIONS:
                self.section_ids.append(sid)
            self._stack.append(sid)
        if tag == "h2" and "content" in self._stack and not a.get("id"):
            self.content_h2_without_id += 1
        for key in ("href", "src"):
            if a.get(key):
                self.links.append(a[key])

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False
        if tag == "section" and self._stack:
            self._stack.pop()

    def handle_data(self, data):
        if self._in_title:
            self.title += data


def load_catalog():
    path = ROOT / "assets" / "js" / "catalog.js"
    text = path.read_text(encoding="utf-8")
    m = re.search(r"window\.CATALOG\s*=\s*(\{.*\})\s*;?\s*$", text, re.S)
    if not m:
        err("catalog.js：找不到 `window.CATALOG = {...};`")
        return None
    try:
        return json.loads(m.group(1))
    except json.JSONDecodeError as e:
        err(f"catalog.js 不是合法 JSON（第 {e.lineno} 行附近）：{e.msg}。請檢查雙引號、逗號、註解。")
        return None


def check_links(page: Path, links):
    for link in links:
        if re.match(r"^(https?:|mailto:|#|data:|javascript:)", link):
            continue
        target = link.split("#")[0].split("?")[0]
        if not target:
            continue
        if not (page.parent / target).resolve().exists():
            err(f"{page.relative_to(ROOT)}：連結或資源不存在 → {link}")


def check_lesson(course, lesson, index):
    rel = lesson.get("file", "")
    page = ROOT / rel
    if not page.exists():
        err(f"catalog 登記了 {lesson.get('id')}，但檔案不存在：{rel}")
        return
    expected_dir = f"lessons/{course['id']}/"
    if not rel.startswith(expected_dir):
        err(f"{rel}：講義應放在 {expected_dir} 底下")
    m = FILE_RE.match(page.name)
    if not m:
        err(f"{rel}：檔名需符合 NN-slug.html（兩位數編號 + 小寫英文 kebab-case）")
    elif int(m.group(1)) != lesson.get("no"):
        err(f"{rel}：檔名編號 {m.group(1)} 與 catalog 的 no={lesson.get('no')} 不一致")
    if lesson.get("no") != index + 1:
        warn(f"{lesson.get('id')}：no={lesson.get('no')}，但它是課程中第 {index + 1} 筆，請確認編號連續")

    html = page.read_text(encoding="utf-8")
    p = PageParser()
    p.feed(html)
    if p.html_attrs.get("lang") != "zh-Hant":
        err(f"{rel}：<html> 需設定 lang=\"zh-Hant\"")
    if p.html_attrs.get("data-root") != "../../":
        err(f"{rel}：<html> 的 data-root 應為 \"../../\"")
    if p.body_attrs.get("data-course") != course["id"]:
        err(f"{rel}：data-course 應為 \"{course['id']}\"")
    if p.body_attrs.get("data-lesson") != lesson.get("id"):
        err(f"{rel}：data-lesson 應為 \"{lesson.get('id')}\"")
    if p.section_ids != REQUIRED_SECTIONS:
        err(f"{rel}：固定區塊應依序為 {REQUIRED_SECTIONS}，目前為 {p.section_ids}")
    if p.content_h2_without_id:
        err(f"{rel}：#content 內有 {p.content_h2_without_id} 個 h2 沒有 id")
    if lesson.get("title") and lesson["title"] not in p.title:
        err(f"{rel}：<title> 需包含講義標題「{lesson['title']}」")
    if not p.has_description:
        err(f"{rel}：缺少 <meta name=\"description\">")
    if "{{" in html or "}}" in html:
        err(f"{rel}：仍有未取代的模板佔位符 {{{{...}}}}")
    for sid in ("exercises",):
        block = re.search(rf'<section id="{sid}".*?</section>', html, re.S)
        if block and block.group(0).count("<details") < block.group(0).count('class="exercise"'):
            err(f"{rel}：每一題小練習都需要附 <details> 解答")
    check_links(page, p.links)


def main():
    catalog = load_catalog()
    if catalog is None:
        return report()

    seen_ids, registered = set(), set()
    for course in catalog.get("courses", []):
        for f in COURSE_FIELDS:
            if f not in course:
                err(f"課程 {course.get('id', '?')} 缺少欄位 {f}")
        if not SLUG_RE.match(course.get("id", "")):
            err(f"課程 id「{course.get('id')}」需為小寫英文 kebab-case")
        for i, lesson in enumerate(course.get("lessons", [])):
            for f in LESSON_FIELDS:
                if f not in lesson:
                    err(f"講義 {lesson.get('id', '?')} 缺少欄位 {f}")
            lid = lesson.get("id")
            if lid in seen_ids:
                err(f"講義 id 重複：{lid}")
            seen_ids.add(lid)
            expected_prefix = course.get("code", "").lower() + "-"
            if lid and not re.match(rf"^{re.escape(expected_prefix)}\d{{2}}$", lid):
                err(f"講義 id「{lid}」應為「{expected_prefix}NN」格式")
            if not re.match(r"^\d{4}-\d{2}-\d{2}$", str(lesson.get("updated", ""))):
                err(f"{lid}：updated 需為 YYYY-MM-DD")
            registered.add((ROOT / lesson.get("file", "")).resolve())
            check_lesson(course, lesson, i)

    for page in sorted((ROOT / "lessons").rglob("*.html")):
        if page.resolve() not in registered:
            err(f"{page.relative_to(ROOT)} 存在，但沒有登記在 catalog.js（首頁不會顯示）")

    index = ROOT / "index.html"
    p = PageParser()
    p.feed(index.read_text(encoding="utf-8"))
    check_links(index, p.links)
    return report()


def report():
    for w in warnings:
        print(f"⚠️  {w}")
    for e in errors:
        print(f"❌ {e}")
    if errors:
        print(f"\n檢查失敗：{len(errors)} 個錯誤、{len(warnings)} 個提醒。")
        return 1
    print(f"✅ 檢查通過（{len(warnings)} 個提醒）。")
    return 0


if __name__ == "__main__":
    sys.exit(main())
