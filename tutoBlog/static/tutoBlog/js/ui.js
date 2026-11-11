/* Gemeinsame Oberfläche: Navigation, Texte, Meldungen. */
var Mugler = (function () {
  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
    });
  }

  function uid(prefix) {
    var id = (window.crypto && crypto.randomUUID)
      ? crypto.randomUUID()
      : Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    return (prefix || "id") + "-" + id;
  }

  function standort(id) {
    return MUGLER_DATA.standorte.find(function (item) { return item.id === id; }) || null;
  }

  function standortName(id) {
    var item = standort(id);
    return item ? item.name : id;
  }

  function formatDate(iso) {
    if (!iso) return "";
    var date = new Date(iso + "T12:00:00");
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
  }

  function longDate(date) {
    return date.toLocaleDateString("de-DE", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }

  function gruss() {
    var hour = new Date().getHours();
    if (hour < 11) return "Guten Morgen";
    if (hour < 18) return "Guten Tag";
    return "Guten Abend";
  }

  function firstName(name) {
    return String(name || "").split(" ")[0];
  }

  function statusLabel(status) {
    return status === "veroeffentlicht" ? "Veröffentlicht" : "Entwurf";
  }

  function artLabel(art) {
    return art === "text" ? "Text" : "Schritt für Schritt";
  }

  function sanitize(html) {
    var template = document.createElement("template");
    template.innerHTML = html || "";
    template.content.querySelectorAll("script, iframe, object, embed, link, meta").forEach(function (node) {
      node.remove();
    });
    template.content.querySelectorAll("*").forEach(function (el) {
      Array.from(el.attributes).forEach(function (attr) {
        if (attr.name.indexOf("on") === 0 || (attr.name === "href" && /^\s*javascript:/i.test(attr.value))) {
          el.removeAttribute(attr.name);
        }
      });
    });
    return template.innerHTML;
  }

  function isEmptyHtml(html) {
    var holder = document.createElement("div");
    holder.innerHTML = html || "";
    return !holder.textContent.trim() && !holder.querySelector("img, video");
  }

  function coverOf(tutorial) {
    var src = "";
    (tutorial.schritte || []).some(function (step) {
      return (step.bloecke || []).some(function (block) {
        if (block.typ === "image" && block.src) {
          src = block.src;
          return true;
        }
        return false;
      });
    });
    return src;
  }

  function toast(message, kind) {
    var stack = document.getElementById("toasts");
    if (!stack) return;
    var note = document.createElement("div");
    note.className = "toast-note" + (kind ? " is-" + kind : "");
    note.textContent = message;
    stack.appendChild(note);
    requestAnimationFrame(function () { note.classList.add("is-in"); });
    setTimeout(function () {
      note.classList.remove("is-in");
      setTimeout(function () { note.remove(); }, 280);
    }, 3200);
  }

  function countUp(el, target) {
    if (!el) return;
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      el.textContent = String(target);
      return;
    }
    var start = performance.now();
    function frame(now) {
      var progress = Math.min(1, (now - start) / 700);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = String(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function route(name, params) {
    var routes = window.MUGLER_ROUTES || {};
    var base = routes[name] || "/";
    if (!params) return base;
    var search = new URLSearchParams();
    Object.keys(params).forEach(function (key) {
      if (params[key] != null && params[key] !== "") search.set(key, String(params[key]));
    });
    var query = search.toString();
    return query ? base + "?" + query : base;
  }

  function homeFor(user) {
    return user && user.role === "mitarbeiter" ? route("maDashboard") : route("hrDashboard");
  }

  function renderShell(user, page) {
    var area = user.role === "mitarbeiter" ? "ma" : "hr";
    var place = standort(user.standort);
    var items = area === "hr"
      ? [
          ["dashboard", route("hrDashboard"), "bi-grid-1x2", "Überblick"],
          ["tutorials", route("hrTutorials"), "bi-journal-richtext", "Schulungen"],
          ["editor", route("hrEditor"), "bi-plus-circle", "Neue Schulung"],
          ["zuweisung", route("hrZuweisung"), "bi-diagram-3", "Zuordnung"]
        ]
      : [
          ["meine", route("maDashboard"), "bi-collection-play", "Meine Schulungen"]
        ];
    var nav = items.map(function (item) {
      var active = item[0] === page;
      return '<a class="nav-link-app' + (active ? " is-active" : "") + '" href="' + item[1] + '"' +
        (active ? ' aria-current="page"' : "") + '><i class="bi ' + item[2] + '"></i><span>' + item[3] + "</span></a>";
    }).join("");

    document.getElementById("shell-side").innerHTML =
      '<a class="skip" href="#page">Zum Inhalt</a>' +
      '<a class="brand" href="' + homeFor(user) + '">' +
        '<span class="brand-mark" aria-hidden="true">M</span>' +
        '<span><strong>MUGLER</strong><small>Prozessschulungen</small></span>' +
      "</a>" +
      '<p class="side-kicker">Personalplanung</p>' +
      '<nav class="side-nav" aria-label="Modul">' + nav + "</nav>" +
      '<div class="side-foot">' +
        '<p class="side-place"><i class="bi bi-geo-alt"></i> ' + esc(place ? place.name : "") + "</p>" +
        '<p class="side-slogan">Start the green way.</p>' +
      "</div>";

    document.getElementById("shell-top").innerHTML =
      '<button class="icon-btn" id="nav-toggle" type="button" aria-label="Menü öffnen" aria-expanded="false"><i class="bi bi-list"></i></button>' +
      '<p class="top-module">MUGLER SE · Prozessschulungen</p>' +
      '<div class="dropdown">' +
        '<button class="user-btn" type="button" data-bs-toggle="dropdown" aria-expanded="false">' +
          '<span class="avatar">' + esc(user.initials) + "</span>" +
          '<span class="user-meta"><strong>' + esc(user.name) + "</strong><small>" + esc(user.rolleLabel) + "</small></span>" +
          '<i class="bi bi-chevron-down"></i>' +
        "</button>" +
        '<ul class="dropdown-menu dropdown-menu-end">' +
          '<li><span class="dropdown-item-text">Personalnummer ' + esc(user.nr) + "</span></li>" +
          '<li><button class="dropdown-item" id="reset-demo" type="button">Demodaten zurücksetzen</button></li>' +
          '<li><hr class="dropdown-divider"></li>' +
          '<li><button class="dropdown-item" id="logout" type="button">Abmelden</button></li>' +
        "</ul>" +
      "</div>";

    document.getElementById("logout").addEventListener("click", function () {
      Store.clearSession();
      location.href = route("login");
    });
    document.getElementById("reset-demo").addEventListener("click", function () {
      if (!window.confirm("Demodaten zurücksetzen? Lokal angelegte Schulungen in diesem Browser werden gelöscht.")) return;
      Store.resetContent().then(function () { location.reload(); });
    });
    var toggle = document.getElementById("nav-toggle");
    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.getElementById("nav-backdrop").addEventListener("click", function () {
      document.body.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  }

  function boot(options) {
    var user = Store.getSession();
    if (!user) {
      location.href = route("login");
      return null;
    }
    if (options.allow && options.allow.indexOf(user.role) === -1) {
      location.href = homeFor(user);
      return null;
    }
    renderShell(user, options.page || "");
    document.body.classList.add("is-ready");
    return user;
  }

  return {
    esc: esc,
    uid: uid,
    standort: standort,
    standortName: standortName,
    formatDate: formatDate,
    longDate: longDate,
    gruss: gruss,
    firstName: firstName,
    statusLabel: statusLabel,
    artLabel: artLabel,
    sanitize: sanitize,
    isEmptyHtml: isEmptyHtml,
    coverOf: coverOf,
    toast: toast,
    countUp: countUp,
    route: route,
    homeFor: homeFor,
    boot: boot
  };
})();
