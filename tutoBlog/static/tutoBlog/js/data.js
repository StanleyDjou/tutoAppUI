/* Statische Prototyp-Daten. Im Firmenprojekt durch die Personalplanung ersetzen. */
var MUGLER_DATA = (function () {
  var IMG = {
    mast: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1600&q=70",
    bau: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1600&q=70",
    plan: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1600&q=70",
    server: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=70",
    lager: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1600&q=70",
    team: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1600&q=70",
    buero: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=70",
    netz: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1600&q=70"
  };

  var standorte = [
    { id: "ol", name: "Oberlungwitz", region: "Sachsen", kuerzel: "OL", mitarbeitende: 186 },
    { id: "mw", name: "Mittweida", region: "Sachsen", kuerzel: "MW", mitarbeitende: 42 },
    { id: "doe", name: "Döbeln", region: "Sachsen", kuerzel: "DÖ", mitarbeitende: 28 },
    { id: "ber", name: "Berlin", region: "Berlin", kuerzel: "BE", mitarbeitende: 64 },
    { id: "han", name: "Hannover", region: "Niedersachsen", kuerzel: "HA", mitarbeitende: 37 },
    { id: "nue", name: "Nürnberg", region: "Bayern", kuerzel: "NÜ", mitarbeitende: 31 }
  ];

  var fachbereiche = [
    "Arbeitssicherheit",
    "Mobilfunk",
    "Campusnetze",
    "Logistik",
    "Qualität & Umwelt",
    "Personal"
  ];

  var personen = [
    { nr: "10001", name: "Anna Berger", role: "hr", rolleLabel: "Personalentwicklung", standort: "ol", initials: "AB" },
    { nr: "10002", name: "Thomas Klein", role: "leiter", rolleLabel: "Bereichsleiter Mobilfunk", standort: "ol", initials: "TK" },
    { nr: "20015", name: "Lea Hoffmann", role: "mitarbeiter", rolleLabel: "Technikerin Mobilfunk", standort: "ber", initials: "LH" },
    { nr: "20028", name: "Jonas Weber", role: "mitarbeiter", rolleLabel: "Monteur", standort: "han", initials: "JW" }
  ];

  var alle = standorte.map(function (s) { return s.id; });

  var tutorials = [
    {
      id: "t1",
      titel: "Sicherer Aufstieg am Mast",
      kurztext: "Verbindlicher Ablauf für Vorbereitung, PSA, Aufstieg, Arbeit in der Höhe und Abstieg an Mobilfunkstandorten.",
      fachbereich: "Arbeitssicherheit",
      dauer: "20 Min.",
      status: "veroeffentlicht",
      art: "schritte",
      autor: "Anna Berger",
      aktualisiert: "2026-11-04",
      standorte: alle.slice(),
      schritte: [
        {
          id: "t1s1",
          titel: "Auftrag und Standort prüfen",
          bloecke: [
            {
              id: "t1s1b1",
              typ: "text",
              html: "<p>Bevor jemand den Standort betritt, liegen Auftrag und Gefährdungsbeurteilung vor. Stimmen Standortnummer, Adresse und der geplante Arbeitsschritt nicht überein, wird nicht aufgestiegen.</p><ul><li>Standortnummer und Zugang mit dem Auftrag abgleichen</li><li>Wetter prüfen, insbesondere Wind, Gewitter und Glätte</li><li>Absperrung, Verkehrsraum und Rettungskette festlegen</li><li>Zweitperson benennen, die unten bleibt</li></ul><blockquote>Ohne freigegebenen Auftrag und ohne zweite Person kein Aufstieg.</blockquote>"
            },
            {
              id: "t1s1b2",
              typ: "image",
              src: IMG.mast,
              caption: "Standortumfeld vor Arbeitsbeginn: Zufahrt, Absperrung und Rettungsweg müssen frei sein."
            }
          ]
        },
        {
          id: "t1s2",
          titel: "Persönliche Schutzausrüstung anlegen",
          bloecke: [
            {
              id: "t1s2b1",
              typ: "text",
              html: "<p>Die PSA wird angelegt, bevor der Aufstieg beginnt, und von der zweiten Person gegengelesen.</p><ol><li>Helm mit Kinnriemen</li><li>Auffanggurt, geschlossen und der Körpergröße angepasst</li><li>Verbindungsmittel mit Bandfalldämpfer</li><li>Geschlossene Schuhe mit Griff und Handschuhe</li></ol><p>Beschädigte Nähte, offene Karabiner oder abgelaufene Prüffristen beenden den Einsatz an dieser Stelle.</p>"
            },
            {
              id: "t1s2b2",
              typ: "image",
              src: IMG.bau,
              caption: "Kontrolle von Helm, Gurt und Verbindungsmittel vor dem Verlassen des Fahrzeugs."
            },
            {
              id: "t1s2b3",
              typ: "video",
              name: "psa-kontrolle.mp4",
              mediaId: "",
              src: "",
              poster: IMG.bau,
              caption: "Kurze Sichtprüfung. Im Prototyp können Sie hier ein eigenes Video hinterlegen."
            }
          ]
        },
        {
          id: "t1s3",
          titel: "Aufstieg",
          bloecke: [
            {
              id: "t1s3b1",
              typ: "text",
              html: "<p>Der Aufstieg erfolgt ruhig und mit drei festen Kontaktpunkten. Das Verbindungsmittel wird immer umgesetzt, bevor die Sicherung des vorherigen Punktes gelöst wird.</p><ul><li>Steigweg frei von Eis, Öl und losen Teilen</li><li>Werkzeug in der Tasche, nicht in der Hand</li><li>Keine zwei Personen auf demselben Leiterzug</li><li>Abbruch bei plötzlichem Wind oder Unwohlsein</li></ul>"
            }
          ]
        },
        {
          id: "t1s4",
          titel: "Arbeiten in der Höhe",
          bloecke: [
            {
              id: "t1s4b1",
              typ: "image",
              src: IMG.plan,
              caption: "Erst sichern, dann arbeiten. Das Werkzeug bleibt an der Person."
            },
            {
              id: "t1s4b2",
              typ: "text",
              html: "<p>An der Arbeitsposition wird zuerst die Sicherung geschlossen und geprüft, danach erst das Werkzeug aufgenommen. Funkkontakt zur Person am Boden bleibt bestehen.</p><p>Änderungen an der Antenne, an Kabeln oder an der Stromversorgung, die nicht im Auftrag stehen, werden nicht ausgeführt. Sie werden dokumentiert und an die Einsatzleitung zurückgemeldet.</p>"
            }
          ]
        },
        {
          id: "t1s5",
          titel: "Abstieg und Rückmeldung",
          bloecke: [
            {
              id: "t1s5b1",
              typ: "text",
              html: "<p>Der Abstieg folgt demselben Weg. Unten wird die PSA abgelegt, auf Schäden gesehen und der Standort so verlassen, wie er vorgefunden wurde.</p><ul><li>Werkzeug vollständig</li><li>Absperrung entfernt</li><li>Abweichungen im Einsatzbericht</li><li>Meldung an die Einsatzleitung, auch wenn nichts vorgefallen ist</li></ul>"
            }
          ]
        }
      ]
    },
    {
      id: "t2",
      titel: "Abnahme eines Mobilfunkstandortes",
      kurztext: "So entsteht ein vollständiges Abnahmeprotokoll, bevor ein Standort an den Betrieb übergeben wird.",
      fachbereich: "Mobilfunk",
      dauer: "25 Min.",
      status: "veroeffentlicht",
      art: "schritte",
      autor: "Thomas Klein",
      aktualisiert: "2026-10-28",
      standorte: ["ol", "ber", "nue"],
      schritte: [
        {
          id: "t2s1",
          titel: "Unterlagen bereitlegen",
          bloecke: [
            {
              id: "t2s1b1",
              typ: "text",
              html: "<p>Zur Abnahme gehören Plan, Stückliste, Fotoliste und das offene Mängelprotokoll. Fehlt eines davon, wird der Termin nicht begonnen, sondern neu angesetzt.</p><ul><li>Ausführungsplan mit Revisionsstand</li><li>Messprotokoll, falls der Auftrag es verlangt</li><li>Zugangs- und Schlüsseldaten</li></ul>"
            }
          ]
        },
        {
          id: "t2s2",
          titel: "Begehung in fester Reihenfolge",
          bloecke: [
            {
              id: "t2s2b1",
              typ: "text",
              html: "<p>Die Begehung folgt immer derselben Linie, damit nichts ausgelassen wird: Zufahrt, Technikfläche, Mast oder Dach, Energie, Übertragung, Dokumentation vor Ort.</p>"
            },
            {
              id: "t2s2b2",
              typ: "image",
              src: IMG.server,
              caption: "Technikfläche: Beschriftung, Reserve und saubere Kabelführung gehören zur Abnahme."
            },
            {
              id: "t2s2b3",
              typ: "video",
              name: "begehung-technikflaeche.mp4",
              mediaId: "",
              src: "",
              poster: IMG.server,
              caption: "Beispiel einer Begehung. Ersetzen Sie den Platzhalter durch die Aufnahme aus der Niederlassung."
            }
          ]
        },
        {
          id: "t2s3",
          titel: "Mängel und Freigabe",
          bloecke: [
            {
              id: "t2s3b1",
              typ: "video",
              name: "mangel-dokumentieren.mp4",
              mediaId: "",
              src: "",
              poster: IMG.plan,
              caption: "Jeder Mangel wird mit Foto, Ort und Frist festgehalten."
            },
            {
              id: "t2s3b2",
              typ: "text",
              html: "<p>Ein Mangel ist erst erfasst, wenn Ort, Beschreibung, Foto und Verantwortliche benannt sind. Kosmetische Punkte und sicherheitsrelevante Punkte werden getrennt.</p><blockquote>Sicherheitsrelevante Mängel halten die Übergabe auf. Sie werden noch am selben Tag an die Bereichsleitung gemeldet.</blockquote>"
            },
            {
              id: "t2s3b3",
              typ: "image",
              src: IMG.plan,
              caption: "Protokoll und Foto gehören zusammen. Ohne Foto kein abgeschlossener Mangel."
            }
          ]
        }
      ]
    },
    {
      id: "t3",
      titel: "Wareneingang und Einlagerung",
      kurztext: "Vom Lieferschein bis zum Lagerplatz: so bleibt Material auffindbar und dem richtigen Auftrag zugeordnet.",
      fachbereich: "Logistik",
      dauer: "15 Min.",
      status: "veroeffentlicht",
      art: "schritte",
      autor: "Anna Berger",
      aktualisiert: "2026-10-21",
      standorte: ["ol", "doe", "han"],
      schritte: [
        {
          id: "t3s1",
          titel: "Lieferung annehmen",
          bloecke: [
            {
              id: "t3s1b1",
              typ: "text",
              html: "<p>Angenommen wird nur, was sich einem Auftrag oder einem Lagerartikel zuordnen lässt. Beschädigte Packstücke werden vor der Quittung fotografiert.</p><ul><li>Lieferschein mit Bestellung vergleichen</li><li>Anzahl der Packstücke zählen, nicht schätzen</li><li>Sichtbare Schäden auf dem Schein vermerken</li></ul>"
            },
            {
              id: "t3s1b2",
              typ: "image",
              src: IMG.lager,
              caption: "Warenannahme in der Niederlassung. Der Weg vom Tor zum Prüfplatz bleibt frei."
            }
          ]
        },
        {
          id: "t3s2",
          titel: "Prüfen und buchen",
          bloecke: [
            {
              id: "t3s2b1",
              typ: "image",
              src: IMG.plan,
              caption: "Artikel, Menge und Charge werden einzeln gegen den Lieferschein gehalten."
            },
            {
              id: "t3s2b2",
              typ: "text",
              html: "<p>Jeder Artikel wird einzeln gebucht. Sammelbuchungen sind nur zulässig, wenn die Positionen identisch sind und die Zählung zu zweit erfolgt ist.</p><p>Differenzen bleiben offen. Sie werden nicht durch den nächsten Auftrag ausgeglichen.</p>"
            }
          ]
        },
        {
          id: "t3s3",
          titel: "Lagerplatz vergeben",
          bloecke: [
            {
              id: "t3s3b1",
              typ: "text",
              html: "<p>Der Lagerplatz steht auf dem Etikett und in der Buchung. Material ohne Platz gilt als nicht eingebucht.</p><ol><li>Platz nach Fachbereich wählen</li><li>Etikett mit Artikel, Menge und Datum</li><li>Sperrgut zusätzlich im Lageplan markieren</li></ol>"
            }
          ]
        }
      ]
    },
    {
      id: "t4",
      titel: "Umgang mit umweltrelevanten Stoffen",
      kurztext: "Kennzeichnung, Lagerung und Meldung, wenn Öl, Kraftstoff oder Reiniger am Standort anfallen.",
      fachbereich: "Qualität & Umwelt",
      dauer: "12 Min.",
      status: "veroeffentlicht",
      art: "schritte",
      autor: "Anna Berger",
      aktualisiert: "2026-09-30",
      standorte: alle.slice(),
      schritte: [
        {
          id: "t4s1",
          titel: "Stoff erkennen",
          bloecke: [
            {
              id: "t4s1b1",
              typ: "text",
              html: "<p>Umweltrelevant ist, was Boden oder Wasser gefährden kann: Kraftstoff, Öl, Hydraulikflüssigkeit, Lösemittel, nicht geleerte Gebinde.</p><p>Unbekannte Gebinde werden nicht geöffnet und nicht in den Restmüll gegeben.</p>"
            }
          ]
        },
        {
          id: "t4s2",
          titel: "Sicher stellen",
          bloecke: [
            {
              id: "t4s2b1",
              typ: "image",
              src: IMG.lager,
              caption: "Auffangwanne, geschlossenes Gebinde, lesbares Etikett."
            },
            {
              id: "t4s2b2",
              typ: "text",
              html: "<ul><li>Gebinde schließen</li><li>In die Auffangwanne stellen</li><li>Etikett mit Stoff, Datum und Standort</li><li>Bindemittel bleibt in der Nähe, nicht im verschlossenen Schrank ohne Zugriff</li></ul>"
            }
          ]
        },
        {
          id: "t4s3",
          titel: "Melden",
          bloecke: [
            {
              id: "t4s3b1",
              typ: "text",
              html: "<p>Eine Freisetzung, auch eine kleine, wird noch in der Schicht gemeldet: was, wie viel, wohin, was bereits getan wurde.</p><blockquote>Erst sichern, dann melden, dann reinigen. Nicht umgekehrt.</blockquote>"
            }
          ]
        }
      ]
    },
    {
      id: "t5",
      titel: "Erster Arbeitstag bei MUGLER",
      kurztext: "Orientierung für neue Mitarbeitende: Ansprechpartner, Zugang, Sicherheit und der erste Auftrag.",
      fachbereich: "Personal",
      dauer: "10 Min.",
      status: "entwurf",
      art: "text",
      autor: "Anna Berger",
      aktualisiert: "2026-11-10",
      standorte: [],
      schritte: [
        {
          id: "t5s1",
          titel: "Inhalt",
          bloecke: [
            {
              id: "t5s1b1",
              typ: "text",
              html: "<h2>Willkommen im Team</h2><p>Am ersten Tag lernen Sie Ihren Standort, Ihre Führungskraft und die Wege kennen, auf denen bei MUGLER gearbeitet wird. Diese Schulung ersetzt nicht die persönliche Einweisung.</p><h3>Was heute passiert</h3><ul><li>Begrüßung durch die Führungskraft</li><li>Zugang, Schlüssel und persönliche Schutzausrüstung</li><li>Rundgang: Arbeitsplatz, Sammelplatz, Erste Hilfe</li><li>Erster Blick in die Prozessschulungen Ihres Fachbereichs</li></ul><p>Offene Fragen gehören in das Gespräch, nicht in den Feierabend. Ihre Ansprechpartner stehen im Einarbeitungsplan.</p>"
            },
            {
              id: "t5s1b2",
              typ: "image",
              src: IMG.team,
              caption: "Einarbeitung ist eine gemeinsame Aufgabe von Team und Personalentwicklung."
            },
            {
              id: "t5s1b3",
              typ: "video",
              name: "willkommen-mugler.mp4",
              mediaId: "",
              src: "",
              poster: IMG.buero,
              caption: "Begrüßungsfilm der Niederlassung. Im Entwurf noch ohne Datei."
            }
          ]
        }
      ]
    },
    {
      id: "t6",
      titel: "Störung am Campusnetz aufnehmen",
      kurztext: "Die ersten Minuten einer Störung: Informationen sichern, Wirkung begrenzen, richtig eskalieren.",
      fachbereich: "Campusnetze",
      dauer: "18 Min.",
      status: "veroeffentlicht",
      art: "schritte",
      autor: "Thomas Klein",
      aktualisiert: "2026-11-02",
      standorte: ["ber", "nue"],
      schritte: [
        {
          id: "t6s1",
          titel: "Meldung aufnehmen",
          bloecke: [
            {
              id: "t6s1b1",
              typ: "text",
              html: "<p>Eine Störungsmeldung braucht fünf Angaben, bevor jemand losfährt: Wer meldet, welcher Standort, seit wann, welche Wirkung, was wurde schon versucht.</p><p>Fehlt die Wirkung, fragen Sie nach: kein Netz, Teilausfall, nur ein Gebäude, nur eine Technik.</p>"
            },
            {
              id: "t6s1b2",
              typ: "image",
              src: IMG.netz,
              caption: "Campus- und Mobilfunkstandorte bleiben auch außerhalb der Bürozeit erreichbar dokumentiert."
            }
          ]
        },
        {
          id: "t6s2",
          titel: "Wirkung begrenzen",
          bloecke: [
            {
              id: "t6s2b1",
              typ: "text",
              html: "<p>Bis die fachliche Störungskette übernimmt, wird nur eingegrenzt, nichts umkonfiguriert.</p><ul><li>Nutzer informieren, falls der Betrieb vor Ort betroffen ist</li><li>Keine Neustarts an Systemen, die nicht im Leitfaden stehen</li><li>Zugänge sichern, wenn Unbefugte die Störung auslösen könnten</li></ul>"
            },
            {
              id: "t6s2b2",
              typ: "video",
              name: "stoerung-erstminuten.mp4",
              mediaId: "",
              src: "",
              poster: IMG.server,
              caption: "Die ersten Minuten, ohne in die Konfiguration einzugreifen."
            }
          ]
        },
        {
          id: "t6s3",
          titel: "Eskalieren",
          bloecke: [
            {
              id: "t6s3b1",
              typ: "text",
              html: "<p>Die Meldung geht an die hinterlegte Bereitschaft des Fachbereichs Campusnetze und, bei Kundenwirkung, parallel an die Einsatzleitung.</p><blockquote>Eine Störung ist erst übergeben, wenn die übernehmende Person Uhrzeit und Namen bestätigt hat.</blockquote>"
            }
          ]
        }
      ]
    }
  ];

  return {
    standorte: standorte,
    fachbereiche: fachbereiche,
    personen: personen,
    tutorials: tutorials,
    progress: {
      "20015": {
        t1: { step: 1, done: false },
        t4: { step: 2, done: true }
      }
    }
  };
})();
