/* ==========================================================================
   商學院講義庫 · 全站共用腳本（不依賴任何外部函式庫）
   功能：
   1. 注入共用頁首 #site-header 與頁尾 #site-footer
   2. 首頁：依 catalog.js 產生課程與講義清單（#catalog）
   3. 講義頁：產生麵包屑、目錄（TOC）、捲動時標示目前段落、上一篇／下一篇
   頁面只需要：<html data-root="相對於網站根目錄的路徑">，
   講義頁另需：<body data-course="課程 id" data-lesson="講義 id">
   ========================================================================== */
(function () {
  "use strict";

  var CATALOG = window.CATALOG || { site: {}, courses: [] };
  var ROOT = document.documentElement.getAttribute("data-root") || "./";

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === "text") node.textContent = attrs[k];
        else if (k === "class") node.className = attrs[k];
        else node.setAttribute(k, attrs[k]);
      });
    }
    (children || []).forEach(function (c) { if (c) node.appendChild(c); });
    return node;
  }
  function pad(n) { return String(n).padStart(2, "0"); }

  /* ---------- 1. 頁首與頁尾 ---------- */
  function renderChrome() {
    var site = CATALOG.site || {};
    var header = document.getElementById("site-header");
    if (header) {
      header.className = "site-header";
      header.innerHTML = "";
      var brand = el("a", { class: "site-brand", href: ROOT + "index.html" }, [
        document.createTextNode(site.title || "講義庫"),
        el("small", { text: site.titleEn || "" })
      ]);
      var nav = el("nav", { class: "site-nav", "aria-label": "主要導覽" }, [
        el("a", { href: ROOT + "index.html#courses", text: "課程講義" }),
        el("a", { href: ROOT + "index.html#about", text: "關於本站" }),
        site.repo ? el("a", { href: site.repo, text: "GitHub" }) : null
      ]);
      header.appendChild(el("div", { class: "site-header__inner" }, [brand, nav]));
    }
    var footer = document.getElementById("site-footer");
    if (footer) {
      footer.className = "site-footer";
      footer.innerHTML = "";
      var left = el("p", { text: "© " + new Date().getFullYear() + " " + (site.author || "") + " · " + (site.title || "") });
      var right = el("p", {}, [
        document.createTextNode("本站依照 "),
        site.repo ? el("a", { href: site.repo + "/blob/main/AGENTS.md", text: "AGENTS.md" }) : document.createTextNode("AGENTS.md"),
        document.createTextNode(" 的規則建置與維護")
      ]);
      footer.appendChild(el("div", { class: "site-footer__inner" }, [left, right]));
    }
  }

  /* ---------- 2. 首頁課程清單 ---------- */
  function renderCatalog() {
    var mount = document.getElementById("catalog");
    if (!mount) return;
    mount.innerHTML = "";
    (CATALOG.courses || []).forEach(function (course) {
      var head = el("div", { class: "course__head" }, [
        el("span", { class: "course__code", text: course.code }),
        el("h3", { class: "course__title" }, [
          document.createTextNode(course.title),
          el("span", { text: course.titleEn || "" })
        ]),
        el("p", { class: "course__desc", text: course.description + (course.instructor ? "（授課教師：" + course.instructor + "）" : "") })
      ]);
      var list = el("ol", { class: "lesson-list" });
      (course.lessons || []).forEach(function (lesson) {
        var meta = el("div", { class: "lesson-card__meta" });
        (lesson.tags || []).forEach(function (t) { meta.appendChild(el("span", { class: "tag", text: t })); });
        var card = el("a", { href: ROOT + lesson.file }, [
          el("span", { class: "lesson-card__no", text: "第 " + pad(lesson.no) + " 講" + (lesson.week ? " · Week " + lesson.week : "") }),
          el("span", { class: "lesson-card__title", text: lesson.title }),
          el("p", { class: "lesson-card__sub", text: lesson.subtitle }),
          meta
        ]);
        list.appendChild(el("li", { class: "lesson-card" }, [card]));
      });
      mount.appendChild(el("article", { class: "course", id: "course-" + course.id }, [head, list]));
    });
  }

  /* ---------- 3. 講義頁 ---------- */
  function findLesson() {
    var courseId = document.body.getAttribute("data-course");
    var lessonId = document.body.getAttribute("data-lesson");
    if (!courseId || !lessonId) return null;
    var course = (CATALOG.courses || []).filter(function (c) { return c.id === courseId; })[0];
    if (!course) return null;
    var idx = -1;
    course.lessons.forEach(function (l, i) { if (l.id === lessonId) idx = i; });
    if (idx < 0) return null;
    return { course: course, lesson: course.lessons[idx], prev: course.lessons[idx - 1], next: course.lessons[idx + 1] };
  }

  function renderBreadcrumb(ctx) {
    var mount = document.getElementById("breadcrumb");
    if (!mount || !ctx) return;
    mount.innerHTML = "";
    function sep() { return el("span", { "aria-hidden": "true", text: "/" }); }
    mount.appendChild(el("a", { href: ROOT + "index.html", text: "首頁" }));
    mount.appendChild(sep());
    mount.appendChild(el("a", { href: ROOT + "index.html#course-" + ctx.course.id, text: ctx.course.title }));
    mount.appendChild(sep());
    mount.appendChild(el("span", { text: "第 " + pad(ctx.lesson.no) + " 講" }));
  }

  function slugify(text, used) {
    var base = text.trim().toLowerCase().replace(/[\s　]+/g, "-").replace(/[^\w一-鿿-]/g, "").slice(0, 40) || "section";
    var id = base, n = 2;
    while (used[id] || document.getElementById(id)) { id = base + "-" + n++; }
    used[id] = true;
    return id;
  }

  function renderToc() {
    var article = document.querySelector("article.lesson");
    var mount = document.getElementById("toc");
    if (!article || !mount) return;
    var headings = article.querySelectorAll(".lesson-section > h2, #content h2");
    var used = {};
    var items = [];
    Array.prototype.forEach.call(headings, function (h) {
      if (!h.id) {
        // 固定區塊的 h2 直接連到 section 的 id
        var parent = h.parentElement;
        if (parent && parent.classList.contains("lesson-section") && parent.querySelector("h2") === h) {
          h.id = parent.id + "-title";
        } else {
          h.id = slugify(h.textContent, used);
        }
      }
      items.push({ id: h.id, text: h.textContent });
    });
    if (!items.length) return;

    function buildList() {
      var ol = el("ol");
      items.forEach(function (it) { ol.appendChild(el("li", {}, [el("a", { href: "#" + it.id, text: it.text })])); });
      return ol;
    }
    mount.className = "toc";
    mount.innerHTML = "";
    mount.appendChild(el("p", { class: "toc__label", text: "本講目錄" }));
    mount.appendChild(buildList());

    // 窄螢幕版目錄：放在講義標頭之後
    var header = article.querySelector(".lesson-header");
    if (header) {
      var details = el("details", { class: "toc-mobile" }, [el("summary", { text: "本講目錄" }), buildList()]);
      header.insertAdjacentElement("afterend", details);
    }

    // 捲動時標示目前段落
    if ("IntersectionObserver" in window) {
      var links = mount.querySelectorAll("a");
      var map = {};
      Array.prototype.forEach.call(links, function (a) { map[a.getAttribute("href").slice(1)] = a; });
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            Array.prototype.forEach.call(links, function (a) { a.classList.remove("is-active"); });
            var link = map[entry.target.id];
            if (link) link.classList.add("is-active");
          }
        });
      }, { rootMargin: "0px 0px -70% 0px" });
      items.forEach(function (it) { observer.observe(document.getElementById(it.id)); });
    }
  }

  function renderLessonNav(ctx) {
    var mount = document.getElementById("lesson-nav");
    if (!mount || !ctx) return;
    mount.className = "lesson-nav";
    mount.innerHTML = "";
    if (ctx.prev) {
      mount.appendChild(el("a", { class: "prev", href: ROOT + ctx.prev.file }, [
        el("small", { text: "← 上一講" }), el("strong", { text: ctx.prev.title })
      ]));
    }
    if (ctx.next) {
      mount.appendChild(el("a", { class: "next", href: ROOT + ctx.next.file }, [
        el("small", { text: "下一講 →" }), el("strong", { text: ctx.next.title })
      ]));
    }
  }

  function init() {
    renderChrome();
    renderCatalog();
    var ctx = findLesson();
    renderBreadcrumb(ctx);
    renderToc();
    renderLessonNav(ctx);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
