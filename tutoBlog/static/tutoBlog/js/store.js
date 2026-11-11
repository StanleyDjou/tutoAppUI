/* Lokaler Prototyp-Speicher. Ersetzt später die Schnittstelle zur Personalplanung. */
var Store = (function () {
  var KEY = "muglerTutorStateV1";
  var SESSION = "muglerTutorSessionV1";
  var cache = null;

  function clone(value) {
    if (typeof structuredClone === "function") return structuredClone(value);
    return JSON.parse(JSON.stringify(value));
  }

  function seed() {
    return {
      tutorials: clone(MUGLER_DATA.tutorials),
      progress: clone(MUGLER_DATA.progress || {})
    };
  }

  function getState() {
    if (cache) return cache;
    var raw = localStorage.getItem(KEY);
    if (!raw) {
      cache = seed();
      localStorage.setItem(KEY, JSON.stringify(cache));
      return cache;
    }
    try {
      cache = JSON.parse(raw);
      cache.tutorials = cache.tutorials || [];
      cache.progress = cache.progress || {};
    } catch (error) {
      cache = seed();
    }
    return cache;
  }

  function saveState(state) {
    cache = state;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      return true;
    } catch (error) {
      return false;
    }
  }

  function idb() {
    return new Promise(function (resolve, reject) {
      var request = indexedDB.open("muglerTutorMedia", 1);
      request.onupgradeneeded = function () {
        request.result.createObjectStore("videos");
      };
      request.onsuccess = function () { resolve(request.result); };
      request.onerror = function () { reject(request.error); };
    });
  }

  function getTutorial(id) {
    return getState().tutorials.find(function (item) { return item.id === id; }) || null;
  }

  function upsertTutorial(tutorial) {
    var state = getState();
    var index = state.tutorials.findIndex(function (item) { return item.id === tutorial.id; });
    if (index >= 0) state.tutorials[index] = tutorial;
    else state.tutorials.unshift(tutorial);
    return saveState(state);
  }

  function deleteTutorial(id) {
    var state = getState();
    state.tutorials = state.tutorials.filter(function (item) { return item.id !== id; });
    Object.keys(state.progress).forEach(function (nr) {
      if (state.progress[nr]) delete state.progress[nr][id];
    });
    return saveState(state);
  }

  function setStandorte(id, standorte) {
    var tutorial = getTutorial(id);
    if (!tutorial) return false;
    tutorial.standorte = standorte.slice();
    tutorial.aktualisiert = new Date().toISOString().slice(0, 10);
    return upsertTutorial(tutorial);
  }

  function getProgress(nr, tutorialId) {
    var bucket = getState().progress[nr] || {};
    return bucket[tutorialId] || null;
  }

  function setProgress(nr, tutorialId, value) {
    var state = getState();
    if (!state.progress[nr]) state.progress[nr] = {};
    state.progress[nr][tutorialId] = value;
    return saveState(state);
  }

  function getSession() {
    var raw = sessionStorage.getItem(SESSION);
    if (!raw) return null;
    try {
      var parsed = JSON.parse(raw);
      return MUGLER_DATA.personen.find(function (person) { return person.nr === parsed.nr; }) || null;
    } catch (error) {
      return null;
    }
  }

  function setSession(person) {
    sessionStorage.setItem(SESSION, JSON.stringify({ nr: person.nr }));
  }

  function clearSession() {
    sessionStorage.removeItem(SESSION);
  }

  function saveVideo(id, blob) {
    return idb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction("videos", "readwrite");
        tx.objectStore("videos").put(blob, id);
        tx.oncomplete = function () { resolve(); };
        tx.onerror = function () { reject(tx.error); };
      });
    });
  }

  function getVideo(id) {
    if (!id) return Promise.resolve(null);
    return idb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction("videos", "readonly");
        var request = tx.objectStore("videos").get(id);
        request.onsuccess = function () { resolve(request.result || null); };
        request.onerror = function () { reject(request.error); };
      });
    });
  }

  function resetContent() {
    cache = null;
    localStorage.removeItem(KEY);
    return idb().then(function (db) {
      return new Promise(function (resolve) {
        var tx = db.transaction("videos", "readwrite");
        tx.objectStore("videos").clear();
        tx.oncomplete = function () { resolve(); };
        tx.onerror = function () { resolve(); };
      });
    }).catch(function () { return null; });
  }

  return {
    getState: getState,
    getTutorial: getTutorial,
    upsertTutorial: upsertTutorial,
    deleteTutorial: deleteTutorial,
    setStandorte: setStandorte,
    getProgress: getProgress,
    setProgress: setProgress,
    getSession: getSession,
    setSession: setSession,
    clearSession: clearSession,
    saveVideo: saveVideo,
    getVideo: getVideo,
    resetContent: resetContent
  };
})();
