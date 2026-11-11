/* Seitenlogik für Login, Überblicke, Liste und Zuordnung. */
var MuglerPages = (function () {
  function tutorials() {
    return Store.getState().tutorials.slice().sort(function (a, b) {
      return String(b.aktualisiert).localeCompare(String(a.aktualisiert));
    });
  }

  function login() {
    var form = document.getElementById("login-form");
    var input = document.getElementById("personalnummer");
    var error = document.getElementById("login-error");
    var existing = Store.getSession();
    var state = Store.getState();
    var published = state.tutorials.filter(function (item) { return item.status === "veroeffentlicht"; }).length;
    document.getElementById("stat-schulungen").textContent = String(published);
    document.getElementById("stat-orte").textContent = String(MUGLER_DATA.standorte.length);

    if (existing) {
      var line = document.getElementById("continue");
      line.hidden = false;
      document.getElementById("continue-name").textContent = existing.name;
      document.getElementById("continue-link").href = Mugler.homeFor(existing);
    }

    document.getElementById("demo-list").innerHTML = MUGLER_DATA.personen.map(function (person) {
      var place = Mugler.standortName(person.standort);
      return '<button class="demo-chip" type="button" data-nr="' + person.nr + '">' +
        "<span><strong>" + Mugler.esc(person.name) + "</strong><small>" + Mugler.esc(person.rolleLabel) + " · " + Mugler.esc(place) + "</small></span>" +
        "<em>" + person.nr + "</em></button>";
    }).join("");

    document.getElementById("demo-list").addEventListener("click", function (event) {
      var chip = event.target.closest("[data-nr]");
      if (!chip) return;
      input.value = chip.dataset.nr;
      form.requestSubmit();
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var nr = input.value.replace(/\s+/g, "");
      var person = MUGLER_DATA.personen.find(function (item) { return item.nr === nr; });
      if (!person) {
        error.textContent = nr ? "Diese Personalnummer ist uns nicht bekannt." : "Bitte geben Sie Ihre Personalnummer ein.";
        form.classList.remove("is-shake");
        void form.offsetWidth;
        form.classList.add("is-shake");
        input.focus();
        return;
      }
      Store.setSession(person);
      location.href = Mugler.homeFor(person);
    });
  }

  function hrDashboard() {
    var user = Mugler.boot({ allow: ["hr", "leiter"], page: "dashboard" });
    if (!user) return;
    var list = tutorials();
    var published = list.filter(function (item) { return item.status === "veroeffentlicht"; });
    document.getElementById("hero-date").textContent = Mugler.longDate(new Date());
    document.getElementById("hero-greet").textContent = Mugler.gruss() + ", " + Mugler.firstName(user.name) + ".";
    var lead = document.getElementById("hero-lead");
    if (user.role === "leiter") {
      lead.textContent = "Sie führen die Schulungen Ihres Bereichs: anlegen, den Niederlassungen zuordnen und für die Teams freigeben.";
    }
    Mugler.countUp(document.getElementById("stat-all"), list.length);
    Mugler.countUp(document.getElementById("stat-pub"), published.length);
    Mugler.countUp(document.getElementById("stat-draft"), list.filter(function (item) { return item.status !== "veroeffentlicht"; }).length);
    Mugler.countUp(document.getElementById("stat-open"), list.filter(function (item) { return !item.standorte.length; }).length);

    document.getElementById("recent").innerHTML = list.slice(0, 5).map(function (item) {
      return '<a class="recent-row" href="' + Mugler.route("hrEditor", { id: item.id }) + '">' +
        "<span><strong>" + Mugler.esc(item.titel) + "</strong><small>" + Mugler.esc(item.fachbereich) + " · " + Mugler.esc(Mugler.artLabel(item.art)) + "</small></span>" +
        "<span class=\"" + (item.status === "veroeffentlicht" ? "badge-soft" : "badge-draft") + "\">" + Mugler.esc(Mugler.statusLabel(item.status)) + "<br>" + Mugler.formatDate(item.aktualisiert) + "</span></a>";
    }).join("") || '<p class="empty">Noch keine Schulung angelegt.</p>';

    document.getElementById("coverage").innerHTML = MUGLER_DATA.standorte.map(function (place) {
      var count = published.filter(function (item) { return item.standorte.indexOf(place.id) >= 0; }).length;
      var pct = published.length ? Math.round((count / published.length) * 100) : 0;
      return '<div class="coverage-row"><span>' + Mugler.esc(place.name) + '</span><div class="bar"><span data-pct="' + pct + '"></span></div><strong>' + count + "</strong></div>";
    }).join("");
    requestAnimationFrame(function () {
      document.querySelectorAll(".bar span").forEach(function (bar) {
        bar.style.width = bar.dataset.pct + "%";
      });
    });
  }

  function coverClass(item) {
    var cover = Mugler.coverOf(item);
    if (!cover) return '<div class="tuto-cover is-fallback">';
    return '<div class="tuto-cover" style="background-image:url(\'' + cover.replace(/'/g, "%27") + "')\">";
  }

  function hrTutorials() {
    var user = Mugler.boot({ allow: ["hr", "leiter"], page: "tutorials" });
    if (!user) return;
    var query = "";
    var bereich = "alle";
    var status = "alle";
    var deleteId = "";

    function draw() {
      var list = tutorials().filter(function (item) {
        var hay = (item.titel + " " + item.kurztext + " " + item.fachbereich).toLowerCase();
        if (query && hay.indexOf(query) === -1) return false;
        if (bereich !== "alle" && item.fachbereich !== bereich) return false;
        if (status !== "alle" && item.status !== status) return false;
        return true;
      });
      document.getElementById("result-count").textContent = list.length + (list.length === 1 ? " Schulung" : " Schulungen");
      if (!list.length) {
        document.getElementById("grid").innerHTML = '<div class="empty" style="grid-column:1/-1"><i class="bi bi-search"></i>Keine Schulung passt auf diesen Filter.</div>';
        return;
      }
      document.getElementById("grid").innerHTML = list.map(function (item, index) {
        var badge = item.status === "veroeffentlicht" ? "badge-soft" : "badge-draft";
        return '<article class="tuto-card" style="animation-delay:' + (index * 0.04) + 's">' +
          coverClass(item) +
            '<div class="badge-row"><span class="' + badge + '">' + Mugler.esc(Mugler.statusLabel(item.status)) + '</span><span class="badge-line">' + Mugler.esc(Mugler.artLabel(item.art)) + "</span></div></div>" +
          '<div class="tuto-body">' +
            '<p class="eyebrow">' + Mugler.esc(item.fachbereich) + "</p>" +
            "<h3>" + Mugler.esc(item.titel) + "</h3>" +
            '<p class="quiet">' + Mugler.esc(item.kurztext) + "</p>" +
            '<p class="meta">' + (item.schritte.length === 1 ? "1 Schritt" : item.schritte.length + " Schritte") + " · " + Mugler.esc(item.dauer) + " · " + item.standorte.length + " Niederlassungen</p>" +
            '<div class="tuto-actions">' +
              '<a class="btn btn-green btn-sm" href="' + Mugler.route("hrEditor", { id: item.id }) + '">Bearbeiten</a>' +
              '<a class="btn btn-outline-green btn-sm" href="' + Mugler.route("hrZuweisung", { id: item.id }) + '">Zuordnen</a>' +
              '<button class="btn btn-ghost btn-sm" type="button" data-copy="' + item.id + '">Duplizieren</button>' +
              '<button class="btn btn-danger-ghost btn-sm" type="button" data-delete="' + item.id + '" data-title="' + Mugler.esc(item.titel) + '">Löschen</button>' +
            "</div></div></article>";
      }).join("");
    }

    var select = document.getElementById("filter-bereich");
    select.innerHTML = '<option value="alle">Alle Fachbereiche</option>' + MUGLER_DATA.fachbereiche.map(function (name) {
      return '<option value="' + Mugler.esc(name) + '">' + Mugler.esc(name) + "</option>";
    }).join("");

    document.getElementById("filter-search").addEventListener("input", function (event) {
      query = event.target.value.trim().toLowerCase();
      draw();
    });
    select.addEventListener("change", function (event) {
      bereich = event.target.value;
      draw();
    });
    document.getElementById("filter-status").addEventListener("change", function (event) {
      status = event.target.value;
      draw();
    });
    document.getElementById("grid").addEventListener("click", function (event) {
      var copy = event.target.closest("[data-copy]");
      var remove = event.target.closest("[data-delete]");
      if (copy) {
        var source = Store.getTutorial(copy.dataset.copy);
        if (!source) return;
        var duplicate = JSON.parse(JSON.stringify(source));
        duplicate.id = Mugler.uid("t");
        duplicate.titel = source.titel + " (Kopie)";
        duplicate.status = "entwurf";
        duplicate.aktualisiert = new Date().toISOString().slice(0, 10);
        duplicate.autor = user.name;
        if (Store.upsertTutorial(duplicate)) {
          Mugler.toast("Kopie angelegt.");
          draw();
        }
      }
      if (remove) {
        deleteId = remove.dataset.delete;
        document.getElementById("delete-label").textContent = remove.dataset.title;
        bootstrap.Modal.getOrCreateInstance(document.getElementById("deleteModal")).show();
      }
    });
    document.getElementById("confirm-delete").addEventListener("click", function () {
      if (deleteId && Store.deleteTutorial(deleteId)) {
        Mugler.toast("Schulung gelöscht.");
        bootstrap.Modal.getOrCreateInstance(document.getElementById("deleteModal")).hide();
        draw();
      }
    });
    draw();
  }

  function assign() {
    var user = Mugler.boot({ allow: ["hr", "leiter"], page: "zuweisung" });
    if (!user) return;
    var focus = new URLSearchParams(location.search).get("id");

    function draw() {
      var head = "<tr><th>Schulung</th>" + MUGLER_DATA.standorte.map(function (place) {
        return "<th>" + Mugler.esc(place.name) + "<small>" + place.mitarbeitende + " Personen</small></th>";
      }).join("") + "</tr>";
      var body = tutorials().map(function (item) {
        var cells = MUGLER_DATA.standorte.map(function (place) {
          var on = item.standorte.indexOf(place.id) >= 0;
          return '<td><button class="assign-cell' + (on ? " is-on" : "") + '" type="button" aria-pressed="' + on + '" aria-label="' +
            Mugler.esc(place.name) + " für " + Mugler.esc(item.titel) + '" data-id="' + item.id + '" data-ort="' + place.id + '"><i class="bi bi-check-lg"></i></button></td>';
        }).join("");
        return '<tr class="' + (item.id === focus ? "is-focus" : "") + '" id="row-' + item.id + '"><td><strong>' + Mugler.esc(item.titel) + "</strong><small class=\"d-block text-secondary\">" +
          Mugler.esc(item.fachbereich) + " · " + Mugler.esc(Mugler.statusLabel(item.status)) + " · " + item.standorte.length + " Standorte</small></td>" + cells + "</tr>";
      }).join("");
      document.getElementById("matrix").innerHTML = head + body;
      if (focus) {
        var row = document.getElementById("row-" + focus);
        if (row) row.scrollIntoView({ block: "center" });
      }
    }

    document.getElementById("matrix").addEventListener("click", function (event) {
      var button = event.target.closest("[data-id]");
      if (!button) return;
      var tutorial = Store.getTutorial(button.dataset.id);
      if (!tutorial) return;
      var next = tutorial.standorte.slice();
      var index = next.indexOf(button.dataset.ort);
      if (index >= 0) next.splice(index, 1);
      else next.push(button.dataset.ort);
      if (!Store.setStandorte(tutorial.id, next)) {
        Mugler.toast("Die Zuordnung konnte nicht gespeichert werden.", "danger");
        return;
      }
      focus = tutorial.id;
      draw();
    });
    draw();
  }

  function percent(tutorial, progress) {
    if (!progress) return 0;
    if (progress.done) return 100;
    var total = Math.max(tutorial.schritte.length, 1);
    return Math.round((progress.step / total) * 100);
  }

  function maDashboard() {
    var user = Mugler.boot({ allow: ["mitarbeiter"], page: "meine" });
    if (!user) return;
    var place = Mugler.standort(user.standort);
    document.getElementById("hero-date").textContent = Mugler.longDate(new Date());
    document.getElementById("hero-greet").textContent = Mugler.gruss() + ", " + Mugler.firstName(user.name) + ".";
    document.getElementById("hero-place").textContent = place ? place.name : "";
    var mine = tutorials().filter(function (item) {
      return item.status === "veroeffentlicht" && item.standorte.indexOf(user.standort) >= 0;
    });
    var records = mine.map(function (item) { return { item: item, progress: Store.getProgress(user.nr, item.id) }; });
    var open = records.filter(function (row) { return row.progress && !row.progress.done; });
    Mugler.countUp(document.getElementById("stat-all"), mine.length);
    Mugler.countUp(document.getElementById("stat-open"), open.length);
    Mugler.countUp(document.getElementById("stat-done"), records.filter(function (row) { return row.progress && row.progress.done; }).length);

    var cont = document.getElementById("continue");
    if (open.length) {
      var current = open[0];
      var stepNo = Math.min(current.progress.step + 1, current.item.schritte.length);
      cont.hidden = false;
      cont.href = Mugler.route("maTutorial", { id: current.item.id });
      cont.innerHTML = "<span><p class=\"eyebrow\">Weitermachen</p><strong>" + Mugler.esc(current.item.titel) + "</strong><small class=\"d-block text-secondary\">Schritt " + stepNo + " von " + current.item.schritte.length + "</small></span><span class=\"btn btn-green\">Fortsetzen</span>";
    }

    var filter = "alle";
    function draw() {
      var list = records.filter(function (row) {
        return filter === "alle" || row.item.fachbereich === filter;
      });
      list.sort(function (a, b) {
        function rank(row) {
          if (row.progress && row.progress.done) return 2;
          if (row.progress) return 0;
          return 1;
        }
        return rank(a) - rank(b);
      });
      if (!list.length) {
        document.getElementById("grid").innerHTML = '<div class="empty" style="grid-column:1/-1"><i class="bi bi-journal-x"></i>Für Ihren Standort liegt in diesem Filter keine Schulung bereit.</div>';
        return;
      }
      document.getElementById("grid").innerHTML = list.map(function (row) {
        var item = row.item;
        var p = percent(item, row.progress);
        var label = row.progress && row.progress.done ? "Wiederholen" : row.progress ? "Fortsetzen" : "Beginnen";
        return '<article class="tuto-card">' + coverClass(item) +
          '<div class="badge-row"><span class="badge-line">' + Mugler.esc(Mugler.artLabel(item.art)) + "</span></div></div>" +
          '<div class="tuto-body"><p class="eyebrow">' + Mugler.esc(item.fachbereich) + "</p><h3>" + Mugler.esc(item.titel) + "</h3>" +
          '<p class="quiet">' + Mugler.esc(item.kurztext) + "</p>" +
          '<div class="d-flex align-items-center gap-3"><div class="ring" style="--p:' + p + '"><span>' + p + '%</span></div><p class="meta mb-0">' + (item.schritte.length === 1 ? "1 Schritt" : item.schritte.length + " Schritte") + " · " + Mugler.esc(item.dauer) + "</p></div>" +
          '<div class="tuto-actions"><a class="btn btn-green" href="' + Mugler.route("maTutorial", { id: item.id }) + '">' + label + "</a></div></div></article>";
      }).join("");
    }

    var chips = document.getElementById("chips");
    var names = ["alle"].concat(MUGLER_DATA.fachbereiche.filter(function (name) {
      return mine.some(function (item) { return item.fachbereich === name; });
    }));
    chips.innerHTML = names.map(function (name) {
      return '<button class="chip' + (name === "alle" ? " is-on" : "") + '" type="button" data-filter="' + Mugler.esc(name) + '">' + (name === "alle" ? "Alle" : Mugler.esc(name)) + "</button>";
    }).join("");
    chips.addEventListener("click", function (event) {
      var chip = event.target.closest("[data-filter]");
      if (!chip) return;
      filter = chip.dataset.filter;
      chips.querySelectorAll(".chip").forEach(function (node) { node.classList.toggle("is-on", node === chip); });
      draw();
    });
    draw();
  }

  return {
    login: login,
    hrDashboard: hrDashboard,
    hrTutorials: hrTutorials,
    assign: assign,
    maDashboard: maDashboard
  };
})();
