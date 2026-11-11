/* Editor für Textschulungen und Schrittfolgen. Quill ist der freie Texteditor. */
var EditorPage = (function () {
  var draft = null;
  var user = null;

  function emptyBlock(type) {
    if (type === "image") return { id: Mugler.uid("b"), typ: "image", src: "", caption: "" };
    if (type === "video") return { id: Mugler.uid("b"), typ: "video", name: "", mediaId: "", src: "", poster: "", caption: "" };
    return { id: Mugler.uid("b"), typ: "text", html: "" };
  }

  function readStepsFromDom() {
    return Array.from(document.querySelectorAll("[data-step]")).map(function (stepEl) {
      return {
        id: stepEl.dataset.id,
        titel: (stepEl.querySelector("[data-step-title]") || {}).value || "Inhalt",
        bloecke: Array.from(stepEl.querySelectorAll("[data-block]")).map(function (blockEl) {
          var type = blockEl.dataset.typ;
          var base = { id: blockEl.dataset.id, typ: type };
          if (type === "text") {
            base.html = blockEl._quill ? blockEl._quill.root.innerHTML : "";
            return base;
          }
          base.caption = blockEl.querySelector("[data-caption]").value;
          if (type === "image") {
            base.src = blockEl.dataset.src || "";
            return base;
          }
          base.name = blockEl.dataset.name || "";
          base.mediaId = blockEl.dataset.mediaId || "";
          base.src = blockEl.dataset.src || "";
          base.poster = blockEl.dataset.poster || "";
          return base;
        })
      };
    });
  }

  function syncDraftFromDom() {
    draft.titel = document.getElementById("titel").value;
    draft.kurztext = document.getElementById("kurztext").value;
    draft.fachbereich = document.getElementById("fachbereich").value;
    draft.dauer = document.getElementById("dauer").value;
    draft.status = document.querySelector('input[name="status"]:checked').value;
    draft.art = document.querySelector('input[name="art"]:checked').value;
    var steps = readStepsFromDom();
    if (steps.length) draft.schritte = steps;
  }

  function updateStats() {
    var steps = draft.art === "text" ? draft.schritte.slice(0, 1) : draft.schritte;
    var blocks = steps.reduce(function (sum, step) { return sum + step.bloecke.length; }, 0);
    var stepWord = draft.art === "text" ? "Abschnitt" : (steps.length === 1 ? "Schritt" : "Schritte");
    var blockWord = blocks === 1 ? "Block" : "Blöcke";
    document.getElementById("meta-stats").textContent = steps.length + " " + stepWord + " · " + blocks + " " + blockWord;
  }

  function compressImage(file) {
    return new Promise(function (resolve, reject) {
      var image = new Image();
      var url = URL.createObjectURL(file);
      image.onload = function () {
        var max = 1600;
        var scale = Math.min(1, max / Math.max(image.width, image.height));
        var canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        var context = canvas.getContext("2d");
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL("image/jpeg", 0.84));
      };
      image.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error("image"));
      };
      image.src = url;
    });
  }

  function mountQuill(blockEl, html) {
    if (typeof Quill === "undefined") return;
    var host = blockEl.querySelector(".quill-host");
    var quill = new Quill(host, {
      theme: "snow",
      placeholder: "Text für diesen Schritt …",
      modules: {
        toolbar: [
          [{ header: [2, 3, false] }],
          ["bold", "italic", "underline"],
          [{ color: [] }, { background: [] }],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ align: [] }],
          ["blockquote", "link"],
          ["clean"]
        ]
      }
    });
    if (html && !Mugler.isEmptyHtml(html)) {
      var delta = quill.clipboard.convert({ html: html });
      quill.setContents(delta, "silent");
    }
    blockEl._quill = quill;
  }

  function bindDrop(zone, input, onFile) {
    zone.addEventListener("click", function () { input.click(); });
    zone.addEventListener("dragover", function (event) {
      event.preventDefault();
      zone.classList.add("is-over");
    });
    zone.addEventListener("dragleave", function () { zone.classList.remove("is-over"); });
    zone.addEventListener("drop", function (event) {
      event.preventDefault();
      zone.classList.remove("is-over");
      if (event.dataTransfer.files[0]) onFile(event.dataTransfer.files[0]);
    });
    input.addEventListener("change", function () {
      if (input.files && input.files[0]) onFile(input.files[0]);
    });
  }

  function buildBlock(block) {
    var el = document.createElement("div");
    el.className = "block";
    el.dataset.block = "1";
    el.dataset.id = block.id;
    el.dataset.typ = block.typ;
    var kind = block.typ === "image" ? "Bild" : block.typ === "video" ? "Video" : "Text";
    var bar = document.createElement("div");
    bar.className = "block-bar";
    bar.innerHTML = '<span class="block-kind">' + kind + '</span><span class="block-tools">' +
      '<button class="icon-mini" type="button" data-action="block-up" aria-label="Nach oben"><i class="bi bi-arrow-up"></i></button>' +
      '<button class="icon-mini" type="button" data-action="block-down" aria-label="Nach unten"><i class="bi bi-arrow-down"></i></button>' +
      '<button class="icon-mini" type="button" data-action="block-delete" aria-label="Block entfernen"><i class="bi bi-trash"></i></button></span>';
    el.appendChild(bar);

    if (block.typ === "text") {
      var mount = document.createElement("div");
      mount.innerHTML = '<div class="quill-host"></div>';
      el.appendChild(mount);
      return el;
    }

    var caption = document.createElement("input");
    caption.className = "form-control mt-2";
    caption.dataset.caption = "1";
    caption.placeholder = "Beschriftung";
    caption.value = block.caption || "";

    if (block.typ === "image") {
      el.dataset.src = block.src || "";
      var preview = document.createElement("div");
      preview.className = "media-preview" + (block.src ? "" : " d-none");
      preview.innerHTML = '<img alt=""><button class="btn btn-outline-green btn-sm mt-2" type="button" data-replace>Bild ersetzen</button>';
      if (block.src) preview.querySelector("img").src = block.src;
      var zone = document.createElement("div");
      zone.className = "dropzone" + (block.src ? " d-none" : "");
      zone.innerHTML = '<div><i class="bi bi-image"></i><p class="mb-0">Bild hier ablegen oder auswählen</p></div>';
      var input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.hidden = true;
      input.dataset.file = "image";
      el.append(preview, zone, input, caption);
      bindDrop(zone, input, function (file) { takeFile(el, "image", file); });
      preview.querySelector("[data-replace]").addEventListener("click", function () { input.click(); });
      return el;
    }

    el.dataset.name = block.name || "";
    el.dataset.mediaId = block.mediaId || "";
    el.dataset.src = block.src || "";
    el.dataset.poster = block.poster || "";
    var video = document.createElement("video");
    video.controls = true;
    video.className = "d-none";
    video.playsInline = true;
    var vzone = document.createElement("div");
    vzone.className = "dropzone";
    vzone.innerHTML = '<div><i class="bi bi-camera-video"></i><p class="mb-0">Video hier ablegen oder auswählen</p><small data-video-name>' +
      Mugler.esc(block.name || "MP4, WebM oder MOV") + "</small></div>";
    var vinput = document.createElement("input");
    vinput.type = "file";
    vinput.accept = "video/*";
    vinput.hidden = true;
    vinput.dataset.file = "video";
    el.append(video, vzone, vinput, caption);
    bindDrop(vzone, vinput, function (file) { takeFile(el, "video", file); });
    return el;
  }

  function takeFile(blockEl, kind, file) {
    if (kind === "image") {
      if (!file.type || file.type.indexOf("image/") !== 0) {
        Mugler.toast("Bitte eine Bilddatei wählen.", "danger");
        return;
      }
      compressImage(file).then(function (src) {
        blockEl.dataset.src = src;
        var preview = blockEl.querySelector(".media-preview");
        preview.classList.remove("d-none");
        preview.querySelector("img").src = src;
        blockEl.querySelector(".dropzone").classList.add("d-none");
      }).catch(function () {
        Mugler.toast("Das Bild konnte nicht gelesen werden.", "danger");
      });
      return;
    }
    if (!file.type || file.type.indexOf("video/") !== 0) {
      Mugler.toast("Bitte eine Videodatei wählen.", "danger");
      return;
    }
    var mediaId = blockEl.dataset.mediaId || Mugler.uid("v");
    Store.saveVideo(mediaId, file).then(function () {
      blockEl.dataset.mediaId = mediaId;
      blockEl.dataset.name = file.name;
      var video = blockEl.querySelector("video");
      video.src = URL.createObjectURL(file);
      video.classList.remove("d-none");
      blockEl.querySelector(".dropzone").classList.add("d-none");
      Mugler.toast("Video übernommen.");
    }).catch(function () {
      Mugler.toast("Das Video konnte nicht gespeichert werden.", "danger");
    });
  }

  function renderSteps() {
    var root = document.getElementById("steps");
    root.innerHTML = "";
    var steps = draft.art === "text" ? draft.schritte.slice(0, 1) : draft.schritte;
    steps.forEach(function (step, index) {
      var card = document.createElement("article");
      card.className = "step-card";
      card.dataset.step = "1";
      card.dataset.id = step.id;
      if (draft.art === "schritte") {
        var head = document.createElement("div");
        head.className = "step-head";
        head.innerHTML = '<span class="step-index">' + String(index + 1).padStart(2, "0") + "</span>" +
          '<input class="form-control" data-step-title value="' + Mugler.esc(step.titel) + '" aria-label="Titel des Schritts">' +
          '<button class="icon-mini" type="button" data-action="step-up" aria-label="Schritt nach oben"><i class="bi bi-arrow-up"></i></button>' +
          '<button class="icon-mini" type="button" data-action="step-down" aria-label="Schritt nach unten"><i class="bi bi-arrow-down"></i></button>' +
          '<button class="icon-mini" type="button" data-action="step-delete" aria-label="Schritt löschen"><i class="bi bi-trash"></i></button>';
        card.appendChild(head);
      } else {
        var hidden = document.createElement("input");
        hidden.type = "hidden";
        hidden.dataset.stepTitle = "1";
        hidden.value = step.titel || "Inhalt";
        card.appendChild(hidden);
      }
      (step.bloecke || []).forEach(function (block) {
        var node = buildBlock(block);
        card.appendChild(node);
        if (block.typ === "text") mountQuill(node, block.html);
      });
      var add = document.createElement("div");
      add.className = "add-row";
      add.innerHTML = '<button class="btn btn-outline-green btn-sm" type="button" data-action="add-text">Text</button>' +
        '<button class="btn btn-outline-green btn-sm" type="button" data-action="add-image">Bild</button>' +
        '<button class="btn btn-outline-green btn-sm" type="button" data-action="add-video">Video</button>';
      card.appendChild(add);
      root.appendChild(card);
    });
    document.getElementById("add-step").classList.toggle("d-none", draft.art !== "schritte");
    updateStats();
    hydrateVideos(root);
  }

  function hydrateVideos(root) {
    root.querySelectorAll('[data-typ="video"]').forEach(function (blockEl) {
      var video = blockEl.querySelector("video");
      var zone = blockEl.querySelector(".dropzone");
      function show(src) {
        video.src = src;
        video.classList.remove("d-none");
        zone.classList.add("d-none");
      }
      if (blockEl.dataset.src) {
        show(blockEl.dataset.src);
        return;
      }
      if (!blockEl.dataset.mediaId) return;
      Store.getVideo(blockEl.dataset.mediaId).then(function (blob) {
        if (blob) show(URL.createObjectURL(blob));
      });
    });
  }

  function move(list, index, direction) {
    var target = index + direction;
    if (target < 0 || target >= list.length) return;
    var current = list[index];
    list.splice(index, 1);
    list.splice(target, 0, current);
  }

  function mutate(fn) {
    syncDraftFromDom();
    fn(draft);
    renderSteps();
  }

  function collect() {
    syncDraftFromDom();
    var steps = draft.schritte.map(function (step) {
      return {
        id: step.id,
        titel: (step.titel || "").trim() || (draft.art === "text" ? "Inhalt" : "Schritt"),
        bloecke: step.bloecke
      };
    });
    if (draft.art === "text") steps = steps.slice(0, 1);
    return {
      id: draft.id,
      titel: document.getElementById("titel").value.trim(),
      kurztext: document.getElementById("kurztext").value.trim(),
      fachbereich: document.getElementById("fachbereich").value,
      dauer: document.getElementById("dauer").value.trim() || "–",
      status: document.querySelector('input[name="status"]:checked').value,
      art: draft.art,
      autor: draft.autor || user.name,
      aktualisiert: new Date().toISOString().slice(0, 10),
      standorte: draft.standorte || [],
      schritte: steps
    };
  }

  function validate(tutorial) {
    if (!tutorial.titel) return "Bitte einen Titel eingeben.";
    if (!tutorial.schritte.length) return "Mindestens ein Schritt ist nötig.";
    for (var i = 0; i < tutorial.schritte.length; i += 1) {
      var step = tutorial.schritte[i];
      if (tutorial.art === "schritte" && !step.titel.trim()) return "Jeder Schritt braucht einen Titel.";
      if (!step.bloecke.length) return "Jeder Schritt braucht mindestens einen Block.";
      for (var j = 0; j < step.bloecke.length; j += 1) {
        var block = step.bloecke[j];
        if (block.typ === "image" && !block.src) return "Ein Bildblock ist noch leer.";
        if (block.typ === "video" && !block.mediaId && !block.src && !block.name) return "Ein Videoblock ist noch leer.";
      }
    }
    return "";
  }

  function save(preview) {
    var tutorial = collect();
    var message = validate(tutorial);
    if (message) {
      Mugler.toast(message, "danger");
      return;
    }
    if (!Store.upsertTutorial(tutorial)) {
      Mugler.toast("Der Browser-Speicher ist voll. Bitte kleinere Bilder verwenden.", "danger");
      return;
    }
    draft = tutorial;
    var next = Mugler.route("hrEditor", { id: tutorial.id });
    history.replaceState(null, "", next);
    document.getElementById("page-title").textContent = "Schulung bearbeiten";
    document.getElementById("assign-link").href = Mugler.route("hrZuweisung", { id: tutorial.id });
    if (preview) {
      window.open(Mugler.route("maTutorial", { id: tutorial.id, preview: "1" }), "_blank");
      return;
    }
    Mugler.toast("Schulung gespeichert.");
  }

  function init() {
    var params = new URLSearchParams(location.search);
    var existingId = params.get("id");
    user = Mugler.boot({ allow: ["hr", "leiter"], page: existingId ? "tutorials" : "editor" });
    if (!user) return;
    if (typeof Quill === "undefined") {
      Mugler.toast("Der Texteditor konnte nicht geladen werden.", "danger");
    }
    var select = document.getElementById("fachbereich");
    select.innerHTML = MUGLER_DATA.fachbereiche.map(function (name) {
      return '<option value="' + Mugler.esc(name) + '">' + Mugler.esc(name) + "</option>";
    }).join("");

    if (existingId) {
      var found = Store.getTutorial(existingId);
      if (!found) {
        location.href = Mugler.route("hrTutorials");
        return;
      }
      draft = JSON.parse(JSON.stringify(found));
      document.getElementById("page-title").textContent = "Schulung bearbeiten";
    } else {
      draft = {
        id: Mugler.uid("t"),
        titel: "",
        kurztext: "",
        fachbereich: MUGLER_DATA.fachbereiche[0],
        dauer: "15 Min.",
        status: "entwurf",
        art: "schritte",
        autor: user.name,
        aktualisiert: new Date().toISOString().slice(0, 10),
        standorte: [],
        schritte: [{ id: Mugler.uid("s"), titel: "Schritt 1", bloecke: [emptyBlock("text")] }]
      };
    }

    document.getElementById("titel").value = draft.titel;
    document.getElementById("kurztext").value = draft.kurztext;
    document.getElementById("fachbereich").value = draft.fachbereich;
    document.getElementById("dauer").value = draft.dauer;
    document.querySelector('input[name="status"][value="' + draft.status + '"]').checked = true;
    document.querySelector('input[name="art"][value="' + draft.art + '"]').checked = true;
    document.getElementById("assign-link").href = Mugler.route("hrZuweisung", { id: draft.id });

    document.querySelectorAll('input[name="art"]').forEach(function (input) {
      input.addEventListener("change", function () {
        syncDraftFromDom();
        draft.art = input.value;
        if (draft.art === "text" && draft.schritte.length > 1) {
          draft.schritte = [{
            id: draft.schritte[0].id,
            titel: "Inhalt",
            bloecke: draft.schritte.reduce(function (all, step) { return all.concat(step.bloecke); }, [])
          }];
          Mugler.toast("Die Schritte wurden zu einem Text zusammengeführt.");
        }
        if (draft.art === "schritte") {
          draft.schritte.forEach(function (step, index) {
            if (!step.titel || step.titel === "Inhalt") step.titel = "Schritt " + (index + 1);
          });
        }
        renderSteps();
      });
    });

    document.getElementById("steps").addEventListener("click", function (event) {
      var button = event.target.closest("[data-action]");
      if (!button) return;
      var action = button.dataset.action;
      var stepEl = button.closest("[data-step]");
      var blockEl = button.closest("[data-block]");
      mutate(function (current) {
        var steps = current.art === "text" ? current.schritte.slice(0, 1) : current.schritte;
        var stepIndex = steps.findIndex(function (step) { return step.id === stepEl.dataset.id; });
        if (stepIndex < 0) return;
        var blocks = steps[stepIndex].bloecke;
        var blockIndex = blockEl ? blocks.findIndex(function (block) { return block.id === blockEl.dataset.id; }) : -1;
        if (action === "step-up") move(current.schritte, stepIndex, -1);
        if (action === "step-down") move(current.schritte, stepIndex, 1);
        if (action === "step-delete") {
          if (current.schritte.length === 1) {
            Mugler.toast("Mindestens ein Schritt bleibt bestehen.", "danger");
            return;
          }
          current.schritte.splice(stepIndex, 1);
        }
        if (action === "block-up") move(blocks, blockIndex, -1);
        if (action === "block-down") move(blocks, blockIndex, 1);
        if (action === "block-delete") {
          if (blocks.length === 1) {
            Mugler.toast("Ein Schritt braucht mindestens einen Block.", "danger");
            return;
          }
          blocks.splice(blockIndex, 1);
        }
        if (action === "add-text") blocks.push(emptyBlock("text"));
        if (action === "add-image") blocks.push(emptyBlock("image"));
        if (action === "add-video") blocks.push(emptyBlock("video"));
      });
    });

    document.getElementById("add-step").addEventListener("click", function () {
      mutate(function (current) {
        current.schritte.push({
          id: Mugler.uid("s"),
          titel: "Schritt " + (current.schritte.length + 1),
          bloecke: [emptyBlock("text")]
        });
      });
    });
    document.getElementById("save").addEventListener("click", function () { save(false); });
    document.getElementById("preview").addEventListener("click", function () { save(true); });
    renderSteps();
  }

  return { init: init };
})();
