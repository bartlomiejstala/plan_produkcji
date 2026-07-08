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

let changeTimer;

let refreshTimer;


// ===============================
// ELEMENTY STRONY
// ===============================

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

            startSheetRotation();

        }

    }

    catch (e) {

        console.error("Błąd pobierania danych:", e);

    }

}


// ===============================
// RYSOWANIE ARKUSZA
// ===============================

function drawSheet(index) {


    const sheet = sheets[index];


    if (!sheet)
        return;


    machineName.textContent = sheet.name;


    sheetCounter.textContent =
        "Arkusz " +
        (index + 1) +
        " / " +
        sheets.length;


    tableHead.innerHTML = "";

    tableBody.innerHTML = "";


    const rows = sheet.rows;


    if (!rows || rows.length < 2)
        return;



    // nagłówki - pierwszy wiersz

    const tr1 = document.createElement("tr");


    rows[0].forEach(value => {


        const th = document.createElement("th");

        th.textContent = value;

        tr1.appendChild(th);


    });


    tableHead.appendChild(tr1);



    // nagłówki - drugi wiersz

    const tr2 = document.createElement("tr");


    rows[1].forEach(value => {


        const th = document.createElement("th");

        th.textContent = value;

        tr2.appendChild(th);


    });


    tableHead.appendChild(tr2);




    // dane

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
// AUTOMATYCZNA ZMIANA ARKUSZY
// ===============================

function startSheetRotation() {


    clearInterval(changeTimer);


    changeTimer = setInterval(() => {


        if (sheets.length <= 1)
            return;



        currentSheet++;


        if (currentSheet >= sheets.length)
            currentSheet = 0;



        drawSheet(currentSheet);


    }, CHANGE_INTERVAL);


}



// ===============================
// PASEK POSTĘPU
// ===============================

function startProgress() {


    let start = Date.now();


    setInterval(() => {


        let elapsed = Date.now() - start;


        let percent =
            (elapsed / CHANGE_INTERVAL) * 100;


        if (percent >= 100) {

            start = Date.now();

            percent = 0;

        }


        if (progress) {

            progress.style.width =
                percent + "%";

        }


    }, 100);

}


// ===============================
// AUTOMATYCZNE ODŚWIEŻANIE
// ===============================

function startRefreshTimer() {


    clearInterval(refreshTimer);


    refreshTimer = setInterval(() => {


        loadData();


    }, REFRESH_INTERVAL);


}


// ===============================
// START
// ===============================

loadData();

startProgress();

startRefreshTimer();
