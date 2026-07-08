// ===============================
// USTAWIENIA
// ===============================

const CHANGE_INTERVAL = 30000;
const REFRESH_INTERVAL = 900000;


// ===============================
// ZMIENNE
// ===============================

let sheets = [];

let currentSheet = 0;

let changeTimer;

let refreshTimer;

let progressTimer;

let progressStart = Date.now();



// ===============================
// ELEMENTY
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


const text = await response.text();


console.log("ODPOWIEDŹ GOOGLE:");
console.log(text);


const json = JSON.parse(text);

        sheets = json.sheets;


        updateLabel.textContent =
            "Aktualizacja: " + json.updated;



        if (sheets.length > 0) {

            currentSheet = 0;

            drawSheet(currentSheet);

            startSheetRotation();

        }


    }
    catch(e){

        console.error(e);

    }

}




// ===============================
// RYSOWANIE ARKUSZA
// ===============================

function drawSheet(index){


    const sheet = sheets[index];


    if(!sheet)
        return;



    machineName.textContent =
        sheet.name;



    sheetCounter.textContent =
        "Arkusz " +
        (index + 1) +
        " / " +
        sheets.length;



    tableHead.innerHTML="";
    tableBody.innerHTML="";



    const rows = sheet.rows;



    if(!rows || rows.length < 2)
        return;



    const headers = rows[0];



    createHeaderRow(headers);

    createHeaderRow(rows[1]);



    const statusIndex =
        findColumn(headers,"Status");


    const dateIndex =
        findColumn(headers,"Data");



    for(let i=2;i<rows.length;i++){


        const tr=document.createElement("tr");



        rows[i].forEach((value,index)=>{


            const td=document.createElement("td");


            td.textContent=value;


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
            statusIndex >= 0 &&
            rows[i][statusIndex] &&
            rows[i][statusIndex]
                .toString()
                .trim()
                .toLowerCase()
                .includes("production")
        ){

            console.log("ZNALEZIONO PRODUCTION:", rows[i]);
            tr.classList.add("productionRow");

        }





        // ===============================
        // STARA DATA
        // ===============================


        if(
            dateIndex >= 0 &&
            isOldDate(rows[i][dateIndex])
        ){

            console.log("STARA DATA:", rows[i][dateIndex], rows[i]);
            tr.classList.add("oldDate");

        }



        tableBody.appendChild(tr);


    }



    adjustTableFont();

    resetProgress();


}






// ===============================
// NAGŁÓWKI
// ===============================

function createHeaderRow(values){


    const tr=document.createElement("tr");


    values.forEach(value=>{


        const th=document.createElement("th");


        th.textContent=value;


        applyColumnWidth(th,value);


        tr.appendChild(th);


    });


    tableHead.appendChild(tr);


}






// ===============================
// SZUKANIE KOLUMNY
// ===============================

function findColumn(headers,name){


    return headers.findIndex(h =>

        h.toString()
        .trim()
        .toLowerCase()
        ===
        name.toLowerCase()

    );


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

        cell.classList.add("smallColumn");

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



    const text =
        value.toString().trim();



    const date =
        new Date(text);



    if(isNaN(date))
        return false;



    const today =
        new Date();



    today.setHours(0,0,0,0);

    date.setHours(0,0,0,0);



    return date < today;


}






// ===============================
// FONT
// ===============================

function adjustTableFont(){


    const columns =
        tableHead.rows[0]?.cells.length;



    if(!columns)
        return;



    let size;



    if(columns <=8)

        size="2vw";

    else if(columns<=14)

        size="1.5vw";

    else if(columns<=20)

        size="1.2vw";

    else

        size="0.9vw";




    document
    .querySelectorAll(
        "#productionTable th,#productionTable td"
    )
    .forEach(c=>{

        c.style.fontSize=size;

    });


}






// ===============================
// ZMIANA ARKUSZY
// ===============================

function startSheetRotation(){


    clearInterval(changeTimer);



    changeTimer=setInterval(()=>{


        if(sheets.length<=1)
            return;



        currentSheet++;



        if(currentSheet>=sheets.length)

            currentSheet=0;



        drawSheet(currentSheet);



    },CHANGE_INTERVAL);


}






// ===============================
// PASEK POSTĘPU
// ===============================

function resetProgress(){

    progressStart=Date.now();


    if(progress)

        progress.style.width="0%";

}




function startProgress(){


    clearInterval(progressTimer);



    progressTimer=setInterval(()=>{


        if(!progress)
            return;



        let percent =
            ((Date.now()-progressStart)
            /CHANGE_INTERVAL)*100;



        if(percent>100)

            percent=100;



        progress.style.width =
            percent+"%";



    },100);



}





// ===============================
// ODŚWIEŻANIE
// ===============================

function startRefreshTimer(){


    clearInterval(refreshTimer);



    refreshTimer=setInterval(()=>{


        loadData();


    },REFRESH_INTERVAL);



}




// ===============================
// START
// ===============================

loadData();

startProgress();

startRefreshTimer();
