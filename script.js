// ===============================
// USTAWIENIA
// ===============================

const CHANGE_INTERVAL = 30000;      // zmiana arkusza co 30 s
const REFRESH_INTERVAL = 900000;    // odświeżenie danych co 15 min

// ===============================
// ZMIENNE
// ===============================

let sheets = [];

let currentSheet = 0;

let lastUpdate = "";

// elementy strony

const tableHead = document.querySelector("#productionTable thead");
const tableBody = document.querySelector("#productionTable tbody");

const machineName = document.getElementById("machineName");
const sheetCounter = document.getElementById("sheetCounter");
const updateLabel = document.getElementById("lastUpdate");

const progress = document.getElementById("progress");

// ===============================
// POBIERANIE DANYCH
// ===============================

async function loadData() {

    try {

        const response = await fetch(API_URL);

        const json = await response.json();

        sheets = json.sheets;

        lastUpdate = json.updated;

        updateLabel.textContent =
            "Aktualizacja: " + lastUpdate;

        if (sheets.length > 0) {

            currentSheet = 0;

            drawSheet(currentSheet);

        }

    }

    catch (e) {

        console.error(e);

    }

}


// ===============================
// RYSOWANIE ARKUSZA
// ===============================

function drawSheet(index) {

    const sheet = sheets[index];

    if (!sheet) return;

    machineName.textContent = sheet.name;

    sheetCounter.textContent =
        "Arkusz " +
        (index + 1) +
        " / " +
        sheets.length;

    tableHead.innerHTML = "";

    tableBody.innerHTML = "";

    const rows = sheet.rows;

    if (rows.length < 2)
        return;

    // pierwszy wiersz

    const tr1 = document.createElement("tr");

    rows[0].forEach(value => {

        const th = document.createElement("th");

        th.textContent = value;

        tr1.appendChild(th);

    });

    tableHead.appendChild(tr1);

    // drugi wiersz

    const tr2 = document.createElement("tr");

    rows[1].forEach(value => {

        const th = document.createElement("th");

        th.textContent = value;

        tr2.appendChild(th);

    });

    tableHead.appendChild(tr2);

    // pozostałe wiersze

    for (let i = 2; i < rows.length; i++) {

        const tr = document.createElement("tr");

        rows[i].forEach(value => {

            const td = document.createElement("td");

            td.textContent = value;

            tr.appendChild(td);

        });

        tableBody.appendChild(tr);

    }

}


// ===============================
// START
// ===============================

loadData();
