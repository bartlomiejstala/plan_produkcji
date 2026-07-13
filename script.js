// ===============================
// USTAWIENIA
// ===============================

const CHANGE_INTERVAL = 30000;
const REFRESH_INTERVAL = 900000;

// pełne odświeżenie strony co 30 minut
const PAGE_RELOAD_INTERVAL = 1800000;


// ===============================
// ZMIENNE
// ===============================

let sheets = [];

let currentSheet = 0;

let changeTimer = null;

let refreshTimer = null;

let progressTimer = null;

let progressStart = Date.now();


// ===============================
// ELEMENTY
// ===============================

const tableHead = document.querySelector("#productionTable thead");
const tableBody = document.querySelector("#productionTable tbody");
const sheetTabs = document.getElementById("sheetTabs");

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

        const text = await response.text();

        const json = JSON.parse(text);


        sheets = json.sheets || [];


        updateLabel.textContent =
            "Aktualizacja: " + json.updated;



        if (sheets.length > 0) {


            // zabezpieczenie gdyby liczba arkuszy się zmieniła

            if(currentSheet >= sheets.length){

                currentSheet = 0;

            }


            drawSheet(currentSheet);


            resetProgress();


            startSheetRotation();

        }


    }
    catch(e){

        console.error("Błąd pobierania danych:", e);

    }

}



// ===============================
// ZAKŁADKI ARKUSZY
// ===============================

function drawSheetTabs() {

    if (!sheetTabs) return;

    sheetTabs.innerHTML = "";

    sheets.forEach(function (sheet, index) {

        const tab = document.createElement("div");

        tab.className = "sheetTab";

        if (index === currentSheet) {
            requestAnimationFrame(() => {
                tab.classList.add("active");
            });
        }

        tab.textContent = sheet.name;

        tab.title = sheet.name;

        tab.addEventListener("click", function () {

            if (index === currentSheet)
                return;

            currentSheet = index;

            drawSheet(currentSheet);

            resetProgress();

            startSheetRotation();

        });

        sheetTabs.appendChild(tab);

    });

}



// ===============================
// RYSOWANIE ARKUSZA
// ===============================

function drawSheet(index){


    const table =
        document.getElementById("productionTable");



    table.classList.remove("fadeIn");

    table.classList.add("fadeOut");



    const sheet = sheets[index];



    if(!sheet)
        return;



    setTimeout(function(){



        machineName.textContent =
            sheet.name;



        drawSheetTabs();



        sheetCounter.textContent =
            "Arkusz " +
            (index + 1) +
            " / " +
            sheets.length;



        tableHead.innerHTML = "";

        tableBody.innerHTML = "";



        const rows = sheet.rows;



        if(!rows || rows.length < 2){

            table.classList.remove("fadeOut");

            table.classList.add("fadeIn");

            return;

        }



        const headers = rows[1];



        createHeaderRow(headers);



        const statusIndex =
            findColumn(headers,"Status");



        const dateIndex =
            findColumn(headers,"Data");



        for(let i = 2; i < rows.length; i++){


            const row = rows[i];


            const tr =
                document.createElement("tr");



            row.forEach(function(value,index){


                const td =
                    document.createElement("td");


                td.textContent = value;


                applyColumnWidth(
                    td,
                    headers[index]
                );


                tr.appendChild(td);


            });



            // ===============================
            // PRODUCTION
            // ===============================

            if(
                row[statusIndex] &&
                row[statusIndex]
                .toLowerCase()
                .includes("production")
            ){


                tr.classList.add("productionRow");


                const statusCell =
                    tr.cells[statusIndex];



                if(statusCell){


                    statusCell.innerHTML =
                        "<span class='productionBadge'>" +
                        statusCell.textContent +
                        "</span>";

                }

            }



            // ===============================
            // STARA DATA
            // ===============================


            if(
                dateIndex >= 0 &&
                isOldDate(row[dateIndex])
            ){

                tr.classList.add("oldDate");

            }



            tableBody.appendChild(tr);


        }



        adjustTableFont();



        table.classList.remove("fadeOut");

        table.classList.add("fadeIn");



    },350);


}

// ===============================
// NAGŁÓWKI
// ===============================

function createHeaderRow(values){


    const tr =
        document.createElement("tr");



    values.forEach(function(value){


        const th =
            document.createElement("th");


        th.textContent = value;


        applyColumnWidth(th,value);


        tr.appendChild(th);


    });



    tableHead.appendChild(tr);


}




// ===============================
// SZUKANIE KOLUMNY
// ===============================

function findColumn(headers,name){


    return headers.findIndex(function(h){


        return h
        .toString()
        .trim()
        .toLowerCase()
        .replace(/\s+/g,"")
        ===
        name
        .toLowerCase()
        .replace(/\s+/g,"");


    });


}




// ===============================
// SZEROKOŚCI KOLUMN
// ===============================

function applyColumnWidth(cell,name){


    if(!name)
        return;



    const n =
        name
        .toString()
        .toLowerCase()
        .trim();



    if(n==="status"){

        cell.classList.add("statusColumn");

    }


    else if(n==="nr zlec."){

        cell.classList.add("orderColumn");

    }


    else if(
        n==="ilość" ||
        n==="ok" ||
        n==="scrap"
    ){

        cell.classList.add("qtyColumn");

    }


    else if(n==="nesting"){

        cell.classList.add("nestingColumn");

    }


    else if(n==="data"){

        cell.classList.add("dateColumn");

    }


}




// ===============================
// SPRAWDZENIE DATY
// ===============================

function isOldDate(value){


    if(!value)
        return false;



    const date =
        new Date(value.toString().trim());



    if(isNaN(date))
        return false;



    const today =
        new Date();



    today.setHours(0,0,0,0);

    date.setHours(0,0,0,0);



    return date < today;


}





// ===============================
// FONT TABELI
// ===============================

function adjustTableFont(){


    let columns = 0;



    if(tableHead.rows.length > 0){

        columns =
            tableHead.rows[0].cells.length;

    }



    if(!columns)
        return;



    let size;



    if(columns <= 8)

        size="2vw";


    else if(columns <= 14)

        size="1.5vw";


    else if(columns <= 20)

        size="1.2vw";


    else

        size="0.9vw";




    document
    .querySelectorAll(
        "#productionTable th,#productionTable td"
    )
    .forEach(function(cell){


        cell.style.fontSize=size;


    });


}




// ===============================
// ZMIANA ARKUSZY
// ===============================

function startSheetRotation(){


    clearInterval(changeTimer);



    changeTimer =
        setInterval(function(){



            if(sheets.length <= 1)
                return;



            currentSheet++;



            if(currentSheet >= sheets.length){

                currentSheet = 0;

            }



            drawSheet(currentSheet);



            // synchronizacja paska

            resetProgress();



        },CHANGE_INTERVAL);


}





// ===============================
// PASEK POSTĘPU
// ===============================

function resetProgress(){


    progressStart = Date.now();



    if(progress){

        progress.style.width="0%";

    }


}





function startProgress(){


    clearInterval(progressTimer);



    progressTimer =
        setInterval(function(){



            if(!progress)
                return;



            let percent =
                ((Date.now()-progressStart)
                /
                CHANGE_INTERVAL)
                *
                100;



            if(percent > 100){

                percent = 100;

            }



            progress.style.width =
                percent + "%";



        },100);



}




// ===============================
// ODŚWIEŻANIE DANYCH
// ===============================

function startRefreshTimer(){


    clearInterval(refreshTimer);



    refreshTimer =
        setInterval(function(){


            loadData();


        },REFRESH_INTERVAL);


}




// ===============================
// AUTOMATYCZNE ODŚWIEŻENIE STRONY
// ===============================

function startPageReloadTimer(){


    setInterval(function(){


        location.reload();


    },PAGE_RELOAD_INTERVAL);


}





// ===============================
// START
// ===============================

loadData();

startProgress();

startRefreshTimer();

startPageReloadTimer();
