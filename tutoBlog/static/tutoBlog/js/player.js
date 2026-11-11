/* Schrittansicht für Mitarbeitende, mit Vor- und Zurück. */
var PlayerPage = (function () {
  function canSee(user, tutorial, preview) {
    if (!tutorial) return false;
    if (preview && user.role !== "mitarbeiter") return true;
    if (user.role !== "mitarbeiter") return true;
    return tutorial.status === "veroeffentlicht" && tutorial.standorte.indexOf(user.standort) >= 0;
  }

  function blockHtml(block) {
    if (block.typ === "text") {
      if (Mugler.isEmptyHtml(block.html)) return "";
      return '<div class="prose">' + Mugler.sanitize(block.html) + "</div>";
    }
    if (block.typ === "image") {
      if (!block.src) return "";
      return '<figure class="media-frame"><img src="' + block.src + '" alt="' + Mugler.esc(block.caption || "") + '">' +
        (block.caption ? "<figcaption>" + Mugler.esc(block.caption) + "</figcaption>" : "") + "</figure>";
    }
    var poster = block.poster ? ' style="background-image:url(\'' + String(block.poster).replace(/'/g, "%27") + "')\"" : "";
    return '<figure class="media-frame" data-video-block="' + Mugler.esc(block.id) + '">' +
      '<video controls playsinline class="d-none"' + (block.poster ? ' poster="' + Mugler.esc(block.poster) + '"' : "") + "></video>" +
      '<div class="video-poster"' + poster + ' data-video-fallback><div><div class="play"><i class="bi bi-play-fill"></i></div><strong>' +
      Mugler.esc(block.name || "Video") + "</strong><p>Für dieses Beispiel ist noch keine Datei hinterlegt.</p></div></div>" +
      (block.caption ? "<figcaption>" + Mugler.esc(block.caption) + "</figcaption>" : "") + "</figure>";
  }

  function init() {
    var session = Store.getSession();
    var user = Mugler.boot({
      allow: ["hr", "leiter", "mitarbeiter"],
      page: session && session.role === "mitarbeiter" ? "meine" : "tutorials"
    });
    if (!user) return;
    var params = new URLSearchParams(location.search);
    var preview = params.get("preview") === "1" && user.role !== "mitarbeiter";
    var tutorial = Store.getTutorial(params.get("id"));
    var back = document.getElementById("back-link");
    back.href = user.role === "mitarbeiter" ? Mugler.route("maDashboard") : Mugler.route("hrTutorials");
    if (preview) document.getElementById("preview-flag").hidden = false;

    if (!canSee(user, tutorial, preview)) {
      document.getElementById("stage").innerHTML = '<div class="empty"><i class="bi bi-lock"></i>Diese Schulung ist für Sie nicht freigegeben.</div>';
      document.getElementById("prev").hidden = true;
      document.getElementById("next").hidden = true;
      return;
    }

    var textMode = tutorial.art === "text";
    var steps = tutorial.schritte || [];
    var saved = Store.getProgress(user.nr, tutorial.id);
    var index = 0;
    if (!textMode && saved && !saved.done) index = Math.min(saved.step || 0, steps.length - 1);
    var direction = 1;
    var showingDone = false;

    document.getElementById("player-kicker").textContent = tutorial.fachbereich + " · " + tutorial.dauer;
    document.getElementById("player-title").textContent = tutorial.titel;
    document.getElementById("rail-wrap").hidden = textMode;

    function persist(markDone) {
      var done = markDone || !!(saved && saved.done);
      Store.setProgress(user.nr, tutorial.id, { step: index, done: done });
      saved = Store.getProgress(user.nr, tutorial.id);
    }

    function hydrate(stage) {
      stage.querySelectorAll("[data-video-block]").forEach(function (figure) {
        var block = null;
        steps.forEach(function (step) {
          (step.bloecke || []).forEach(function (item) {
            if (item.id === figure.dataset.videoBlock) block = item;
          });
        });
        if (!block) return;
        var video = figure.querySelector("video");
        function show(src) {
          video.src = src;
          video.classList.remove("d-none");
          var fallback = figure.querySelector("[data-video-fallback]");
          if (fallback) fallback.classList.add("d-none");
        }
        if (block.src) {
          show(block.src);
          return;
        }
        if (!block.mediaId) return;
        Store.getVideo(block.mediaId).then(function (blob) {
          if (blob) show(URL.createObjectURL(blob));
        });
      });
    }

    function renderDone() {
      showingDone = true;
      document.getElementById("rail-wrap").hidden = true;
      document.getElementById("step-label").textContent = "Abgeschlossen";
      document.getElementById("player-bar").style.width = "100%";
      document.getElementById("prev").hidden = true;
      var next = document.getElementById("next");
      next.hidden = false;
      next.innerHTML = 'Zurück zur Übersicht';
      next.onclick = function () { location.href = back.href; };
      var stage = document.getElementById("stage");
      stage.className = "stage step-in";
      stage.innerHTML = '<div class="done-panel"><svg class="check" viewBox="0 0 72 72" aria-hidden="true"><circle cx="36" cy="36" r="32"></circle><path d="M22 37 l10 10 l20 -22"></path></svg>' +
        '<h2>Geschafft</h2><p class="prose">„' + Mugler.esc(tutorial.titel) + '“ ist für Ihre Personalnummer abgeschlossen.</p>' +
        '<button class="btn btn-outline-green" id="review" type="button">Inhalt noch einmal ansehen</button></div>';
      document.getElementById("review").addEventListener("click", function () {
        index = 0;
        direction = 1;
        render();
      });
    }

    function render() {
      showingDone = false;
      document.getElementById("rail-wrap").hidden = textMode;
      var step = steps[index];
      var stage = document.getElementById("stage");
      var blocks = (step.bloecke || []).map(blockHtml).join("");
      stage.className = "stage step-in" + (direction < 0 ? " is-back" : "");
      stage.innerHTML = '<p class="kicker-step">' + (textMode ? "Schulung" : "Schritt " + (index + 1) + " von " + steps.length) + "</p>" +
        "<h2>" + Mugler.esc(textMode ? tutorial.titel : step.titel) + "</h2>" +
        (blocks || '<p class="quiet">Für diesen Schritt liegt noch kein Inhalt vor.</p>');
      hydrate(stage);
      document.getElementById("step-label").textContent = textMode ? tutorial.dauer : "Schritt " + (index + 1) + " von " + steps.length;
      document.getElementById("player-bar").style.width = (textMode ? 35 : Math.round(((index + 1) / steps.length) * 100)) + "%";
      document.getElementById("prev").disabled = index === 0;
      document.getElementById("prev").hidden = textMode;
      var next = document.getElementById("next");
      next.hidden = false;
      next.onclick = onNext;
      var last = index === steps.length - 1;
      next.innerHTML = last || textMode ? 'Schulung abschließen <i class="bi bi-check2"></i>' : 'Weiter <i class="bi bi-arrow-right"></i>';
      var rail = document.getElementById("rail");
      rail.innerHTML = steps.map(function (item, stepIndex) {
        var cls = stepIndex === index ? "is-current" : stepIndex < index || (saved && saved.done) ? "is-done" : "";
        return '<li><button type="button" class="' + cls + '" data-go="' + stepIndex + '" aria-label="Schritt ' + (stepIndex + 1) + ": " + Mugler.esc(item.titel) + '"><span class="rail-index">' +
          String(stepIndex + 1).padStart(2, "0") + "</span><span>" + Mugler.esc(item.titel) + "</span></button></li>";
      }).join("");
      if (window.innerWidth < 992) stage.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function go(nextIndex) {
      if (nextIndex < 0 || nextIndex >= steps.length || nextIndex === index) return;
      direction = nextIndex > index ? 1 : -1;
      index = nextIndex;
      persist(false);
      render();
    }

    function onNext() {
      if (showingDone) {
        location.href = back.href;
        return;
      }
      if (textMode || index === steps.length - 1) {
        persist(true);
        renderDone();
        return;
      }
      go(index + 1);
    }

    document.getElementById("prev").addEventListener("click", function () { go(index - 1); });
    document.getElementById("rail").addEventListener("click", function (event) {
      var button = event.target.closest("[data-go]");
      if (!button) return;
      go(Number(button.dataset.go));
    });
    document.addEventListener("keydown", function (event) {
      var tag = event.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || event.target.isContentEditable) return;
      if (event.key === "ArrowRight") onNext();
      if (event.key === "ArrowLeft" && !textMode) go(index - 1);
    });

    if (saved && saved.done && !preview) renderDone();
    else render();
  }

  return { init: init };
})();
