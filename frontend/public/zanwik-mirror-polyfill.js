/**
 * Zanwik static-mirror polyfill (iter 3)
 * Ports Krastor's icosahedron hero canvas, Services mega-menu, mobile drawer,
 * FAQ accordion, scroll reveals, and card tilt — without Next hydration.
 */
(function () {
  "use strict";

  document.documentElement.classList.add("js-motion");

  /* ---------- Full-page navigation (no RSC) ---------- */
  document.addEventListener(
    "click",
    function (e) {
      var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
      if (!a) return;
      if (a.hasAttribute("download")) return;
      if (a.dataset.zanwikNoNav === "1") return;
      var href = a.getAttribute("href") || "";
      if (!href || href.charAt(0) !== "/" || href.indexOf("//") === 0) return;
      e.preventDefault();
      window.location.href = href;
    },
    true
  );

  /* ---------- Scroll reveals ---------- */
  function setupReveals() {
    var nodes = document.querySelectorAll(".reveal, .reveal-scale");
    if (!nodes.length) return;
    if (!("IntersectionObserver" in window)) {
      nodes.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
    nodes.forEach(function (el, idx) {
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.72 && rect.bottom > 0) {
        el.style.transitionDelay = Math.min(idx * 40, 280) + "ms";
        el.classList.add("is-visible");
      } else {
        io.observe(el);
      }
    });
  }

  /* ---------- Hero: Krastor icosahedron canvas (ported) ---------- */
  function setupHeroCanvas() {
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var canvases = document.querySelectorAll("canvas.pointer-events-none");
    if (!canvases.length) return;

    // Golden-ratio icosahedron unit vertices (same as Krastor source)
    var PHI = 1.61803398875;
    var verts = [
      [-1, PHI, 0],
      [1, PHI, 0],
      [-1, -PHI, 0],
      [1, -PHI, 0],
      [0, -1, PHI],
      [0, 1, PHI],
      [0, -1, -PHI],
      [0, 1, -PHI],
      [PHI, 0, -1],
      [PHI, 0, 1],
      [-PHI, 0, -1],
      [-PHI, 0, 1],
    ].map(function (v) {
      var len = Math.hypot(v[0], v[1], v[2]);
      return [v[0] / len, v[1] / len, v[2] / len];
    });

    var edges = [];
    for (var e = 0; e < verts.length; e++) {
      for (var f = e + 1; f < verts.length; f++) {
        if (
          Math.hypot(
            verts[e][0] - verts[f][0],
            verts[e][1] - verts[f][1],
            verts[e][2] - verts[f][2]
          ) < 1.2
        ) {
          edges.push([e, f]);
        }
      }
    }

    function rotateY(p, ay) {
      var x = p[0],
        y = p[1],
        z = p[2];
      var c = Math.cos(ay),
        s = Math.sin(ay);
      var nz = z * c - x * s;
      var nx = z * s + x * c;
      return [nx, y, nz];
    }
    function rotateX(p, ax) {
      var x = p[0],
        y = p[1],
        z = p[2];
      var c = Math.cos(ax),
        s = Math.sin(ax);
      var ny = y * c - z * s;
      var nz = y * s + z * c;
      return [x, ny, nz];
    }
    function project(p, scale, cx, cy, size) {
      var r = 2.4 / (3 + p[2] * scale);
      return {
        sx: cx + p[0] * scale * size * r,
        sy: cy - p[1] * scale * size * r,
        depth: p[2],
      };
    }

    canvases.forEach(function (canvas) {
      if (canvas.dataset.zanwikNet === "1") return;
      canvas.dataset.zanwikNet = "1";
      var parent = canvas.parentElement;
      if (parent) parent.classList.add("zanwik-hero-canvas-wrap");

      var ctx = canvas.getContext("2d");
      if (!ctx) return;

      var w = 1,
        h = 1,
        dpr = 1;
      var angle = 0.4;
      var raf = 0;
      var running = true;
      var last = performance.now();

      function resize() {
        var box = parent
          ? parent.getBoundingClientRect()
          : canvas.getBoundingClientRect();
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = Math.max(1, box.width);
        h = Math.max(1, box.height);
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        canvas.style.width = w + "px";
        canvas.style.height = h + "px";
      }

      function draw(a) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        var cx = 0.5 * w;
        var cy = 0.5 * h;
        var size = 0.34 * Math.min(w, h);

        var layers = [
          {
            scale: 1,
            ax: 0.45 * a,
            ay: a,
            color: [193, 120, 50],
            node: true,
            lw: 1.1,
            op: 0.9,
          },
          {
            scale: 0.58,
            ax: -(0.7 * a),
            ay: -(1.25 * a),
            color: [232, 168, 76],
            node: false,
            lw: 0.8,
            op: 0.5,
          },
        ];

        layers.forEach(function (layer) {
          var projected = verts.map(function (v) {
            var r = rotateX(rotateY(v, layer.ay), layer.ax);
            return project(r, layer.scale, cx, cy, size);
          });
          edges.forEach(function (edge) {
            var A = projected[edge[0]];
            var B = projected[edge[1]];
            var depth = (A.depth + B.depth) / 2;
            var r = (depth + 1) / 2;
            var alpha = (0.12 + 0.78 * r) * layer.op;
            ctx.strokeStyle =
              "rgba(" +
              layer.color[0] +
              "," +
              layer.color[1] +
              "," +
              layer.color[2] +
              "," +
              alpha.toFixed(3) +
              ")";
            ctx.lineWidth = layer.lw * (0.6 + 0.9 * r);
            ctx.beginPath();
            ctx.moveTo(A.sx, A.sy);
            ctx.lineTo(B.sx, B.sy);
            ctx.stroke();
          });
          if (layer.node) {
            projected.forEach(function (p) {
              var e = (p.depth + 1) / 2;
              ctx.fillStyle =
                "rgba(245,240,232," + (0.25 + 0.7 * e).toFixed(3) + ")";
              ctx.beginPath();
              ctx.arc(p.sx, p.sy, 1.4 + 2.6 * e, 0, Math.PI * 2);
              ctx.fill();
            });
          }
        });
      }

      function frame(now) {
        var dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        angle += 0.22 * dt;
        draw(angle);
        if (running && !reduced) raf = requestAnimationFrame(frame);
      }

      resize();
      draw(angle);
      if (!reduced) raf = requestAnimationFrame(frame);

      var io = new IntersectionObserver(
        function (entries) {
          var hit = entries[0];
          if (!hit) return;
          if (hit.isIntersecting && !reduced) {
            if (!running) {
              running = true;
              last = performance.now();
              raf = requestAnimationFrame(frame);
            }
          } else {
            running = false;
            cancelAnimationFrame(raf);
          }
        },
        { threshold: 0.01 }
      );
      io.observe(canvas);
      window.addEventListener("resize", function () {
        resize();
        draw(angle);
      });
    });
  }

  /* ---------- Shared mega-menu link data (from Krastor source) ---------- */
  var START = [
    {
      href: "/diagnostic",
      title: "Free Diagnostic",
      blurb: "30 minutes. Find what's costing you most",
    },
    {
      href: "/assess",
      title: "AI Readiness Assessment",
      blurb: "See where your business stands today",
    },
    {
      href: "/services/strategy",
      title: "Strategy & Roadmap",
      blurb: "What to fix first, and what it's worth",
    },
    {
      href: "/services/advisory",
      title: "AI Advisory",
      blurb: "What to use, what to skip, how your team adopts it",
    },
  ];
  var BUILD = [
    {
      href: "/services/operations",
      title: "Automate the Busywork",
      blurb: "Follow-up, quotes, invoicing, scheduling",
    },
    {
      href: "/services/technology",
      title: "Connect Your Systems",
      blurb: "One source of truth, custom software",
    },
    {
      href: "/services/ai-architecture",
      title: "AI Agents",
      blurb: "Agents that do the work, a person approves",
    },
    {
      href: "/services/consolidation",
      title: "Cut Tool Sprawl",
      blurb: "Fewer tools, lower cost",
    },
    {
      href: "/services/enablement",
      title: "Train Your Team",
      blurb: "So the tools actually get used",
    },
    {
      href: "/services/product-engineering",
      title: "Product Engineering",
      blurb: "A new product or revenue line, built",
    },
  ];
  var STAY = [
    {
      href: "/services/embedded-partnership",
      title: "We Keep It Running",
      blurb: "Monthly monitoring, fixes, and improvements",
    },
    {
      href: "/services/command-center",
      title: "See It All in One Place",
      blurb: "Every system and agent on one screen",
    },
    {
      href: "/services/token-governance",
      title: "Control AI Costs",
      blurb: "What AI costs and who's using it",
    },
    {
      href: "/services/on-prem",
      title: "Private AI",
      blurb: "AI on your own hardware, data stays put",
    },
    {
      href: "/services/transactions",
      title: "Deals & Exit Readiness",
      blurb: "Raising, buying, or selling: systems due diligence",
    },
  ];
  var WORK = [
    { href: "/work/building-materials-manufacturer", title: "Building Materials" },
    { href: "/work/custom-cabin-builder", title: "Custom Cabin Builder" },
    { href: "/work/rv-park-operator", title: "RV Park Operator" },
  ];

  function itemHtml(item) {
    return (
      '<a class="item" href="' +
      item.href +
      '"><strong>' +
      item.title +
      "</strong><span>" +
      item.blurb +
      "</span></a>"
    );
  }

  /* ---------- Services mega-menu ---------- */
  function setupServicesMenu() {
    var btn = null;
    document.querySelectorAll("nav button").forEach(function (b) {
      if ((b.textContent || "").indexOf("Services") !== -1) btn = b;
    });
    if (!btn) return;
    var wrap = btn.parentElement;
    if (!wrap) return;
    wrap.style.position = "relative";

    var existing = document.getElementById("zanwik-services-menu");
    if (existing) existing.remove();

    var menu = document.createElement("div");
    menu.id = "zanwik-services-menu";
    menu.innerHTML = [
      '<a class="blueprint-callout" href="/blueprint">',
      "<strong>The Zanwik Blueprint</strong>",
      "<span>Start here: a fixed-fee plan you own, from $1,500</span>",
      "</a>",
      '<div class="menu-cols">',
      '<div class="col"><div class="col-label">Start</div>' +
        START.map(itemHtml).join("") +
        "</div>",
      '<div class="col"><div class="col-label">Build</div>' +
        BUILD.map(itemHtml).join("") +
        "</div>",
      '<div class="col"><div class="col-label">Stay / Run</div>' +
        STAY.map(itemHtml).join("") +
        "</div>",
      "</div>",
      '<div class="work-row"><span class="col-label">Selected work</span>' +
        WORK.map(function (w) {
          return '<a class="work" href="' + w.href + '">' + w.title + "</a>";
        }).join("") +
        "</div>",
      '<a class="all-link" href="/services">All services →</a>',
    ].join("");
    wrap.appendChild(menu);

    function close() {
      menu.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    }
    function open() {
      menu.classList.add("open");
      btn.setAttribute("aria-expanded", "true");
    }
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (menu.classList.contains("open")) close();
      else open();
    });
    wrap.addEventListener("mouseenter", open);
    wrap.addEventListener("mouseleave", close);
    document.addEventListener("click", function (e) {
      if (!wrap.contains(e.target)) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
  }

  /* ---------- Mobile nav drawer ---------- */
  function setupMobileNav() {
    var btn = document.querySelector('button[aria-label="Toggle menu"]');
    if (!btn) return;
    var existing = document.getElementById("zanwik-mobile-nav");
    if (existing) existing.remove();

    var drawer = document.createElement("div");
    drawer.id = "zanwik-mobile-nav";
    drawer.setAttribute("role", "dialog");
    drawer.setAttribute("aria-label", "Site menu");
    drawer.innerHTML = [
      '<div class="zanwik-mobile-backdrop" data-close="1"></div>',
      '<nav class="zanwik-mobile-panel">',
      '<div class="zanwik-mobile-head"><span>Menu</span>',
      '<button type="button" class="zanwik-mobile-close" aria-label="Close menu">×</button></div>',
      '<a href="/about">About</a>',
      '<a href="/blueprint">Pricing</a>',
      '<a href="/insights">Insights</a>',
      '<a href="/services">All services</a>',
      '<p class="zanwik-mobile-label">Start</p>',
      START.map(function (i) {
        return '<a href="' + i.href + '">' + i.title + "</a>";
      }).join(""),
      '<p class="zanwik-mobile-label">Build</p>',
      BUILD.map(function (i) {
        return '<a href="' + i.href + '">' + i.title + "</a>";
      }).join(""),
      '<p class="zanwik-mobile-label">Stay / Run</p>',
      STAY.map(function (i) {
        return '<a href="' + i.href + '">' + i.title + "</a>";
      }).join(""),
      '<div class="zanwik-mobile-cta">',
      '<a class="primary" href="/assess">Take the assessment</a>',
      '<a class="ghost" href="https://cal.com/krastor/intro" target="_blank" rel="noreferrer">Book a Discovery Call</a>',
      "</div>",
      "</nav>",
    ].join("");
    document.body.appendChild(drawer);

    var bars = btn.querySelectorAll("span");

    function setOpen(open) {
      drawer.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      document.documentElement.classList.toggle("zanwik-nav-open", open);
      if (bars[0])
        bars[0].style.transform = open
          ? "translateY(8px) rotate(45deg)"
          : "";
      if (bars[1]) bars[1].style.opacity = open ? "0" : "1";
      if (bars[2])
        bars[2].style.transform = open
          ? "translateY(-8px) rotate(-45deg)"
          : "";
    }

    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      setOpen(!drawer.classList.contains("open"));
    });
    drawer.querySelector(".zanwik-mobile-close").addEventListener("click", function () {
      setOpen(false);
    });
    drawer.querySelector(".zanwik-mobile-backdrop").addEventListener("click", function () {
      setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
  }

  /* ---------- FAQ accordion ---------- */
  function setupFaq() {
    var heading = null;
    document.querySelectorAll("h2").forEach(function (h) {
      if ((h.textContent || "").trim() === "Straight answers.") heading = h;
    });
    if (!heading) return;
    var col = heading.closest("div");
    var grid = col && col.parentElement;
    if (!grid) return;
    var listCol = null;
    Array.prototype.forEach.call(grid.children, function (child) {
      if (child !== col) listCol = child;
    });
    if (!listCol) return;

    var items = listCol.querySelectorAll(":scope > div.border-t");
    items.forEach(function (item, idx) {
      item.classList.add("zanwik-faq-item");
      var h3 = item.querySelector("h3");
      var p = item.querySelector("p");
      if (!h3 || !p) return;
      h3.setAttribute("role", "button");
      h3.setAttribute("tabindex", "0");
      h3.setAttribute("aria-expanded", idx === 0 ? "true" : "false");
      if (idx === 0) item.classList.add("is-open");

      function toggle() {
        var open = item.classList.contains("is-open");
        items.forEach(function (other) {
          other.classList.remove("is-open");
          var oh = other.querySelector("h3");
          if (oh) oh.setAttribute("aria-expanded", "false");
        });
        if (!open) {
          item.classList.add("is-open");
          h3.setAttribute("aria-expanded", "true");
        }
      }
      h3.addEventListener("click", toggle);
      h3.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      });
    });
  }

  /* ---------- Card tilt / micro-motion ---------- */
  function setupTilt() {
    var cards = document.querySelectorAll(
      ".depth-card-light, .depth-card, a.group.rounded-2xl"
    );
    cards.forEach(function (card) {
      card.classList.add("zanwik-tilt");
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty("--rx", (-py * 6).toFixed(2) + "deg");
        card.style.setProperty("--ry", (px * 8).toFixed(2) + "deg");
        card.classList.add("is-tilting");
      });
      card.addEventListener("pointerleave", function () {
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
        card.classList.remove("is-tilting");
      });
    });
  }

  function boot() {
    setupReveals();
    setupHeroCanvas();
    setupServicesMenu();
    setupMobileNav();
    setupFaq();
    setupTilt();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
