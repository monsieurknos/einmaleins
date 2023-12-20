window.addEventListener('load', function() {
    let resultat = document.getElementById('resultat');
    let rechnung = document.getElementById('rechnung');
    let richtig = document.getElementById('richtig');
    let overlay = document.getElementById('overlay');

    function myRand() {
        return Math.floor(Math.pow(Math.random(), 0.8)*8.3+2);
    }

    let geheim = 0;
    let korrekt = 0;
    let falsch = 0;
    let startzeit = 0;
    let letzteRichtig = 0;
    let durchschnitt = 0;
    let rechnungen = [];
    let naechste = [];
    let anzahlNaechste = 3;

    function clearStats() {
        korrekt = 0;
        falsch = 0;
        startzeit = 0;
        statistik();
    }

    function naechsteFuellen() {
        let indecies = new Array(rechnungen.length).fill(0).map((e,i)=>i);
        indecies.sort((a,b)=>rechnungen[a].score-rechnungen[b].score+Math.random()-0.5);
        let i = 0;
        while (naechste.length<anzahlNaechste) {
            let j = indecies[i];
            if (!naechste.includes(j)) {
                naechste.push(j);
            }
            i++;
        }
    }

    function neueRechnung() {
        naechste.shift();
        naechsteFuellen();
        let neu = rechnungen[naechste[0]];
        let a = neu.a;
        let b = neu.b;
        geheim = a*b;
        rechnung.innerText = `${a} · ${b}`
        resultat.innerText = "";
        richtig.innerText = rechnung.innerText + " = " + geheim;
    }

    function statistik() {
        let prozent = korrekt==0 ? 0 : Math.floor(korrekt/(korrekt+falsch)*100+0.5);
        durchschnitt = korrekt==0 ? 0 : Math.round((new Date() - startzeit)/100/korrekt)/10;
        document.getElementById('prozent').innerText = prozent;
        document.getElementById('sekunden').innerText = durchschnitt;
        document.getElementById('anzahl').innerText = korrekt;

    }

    function pruefe() {
        if (resultat.innerText == geheim) {
            let addScore = 1;
            if (korrekt>3) {
                let dieseZeit = (new Date()-letzteRichtig)/1000;
                if (dieseZeit > 3*durchschnitt) {
                    addScore = -0.5;
                }
                else if (dieseZeit > 2*durchschnitt) {
                    addScore=0.5;
                }
                if (dieseZeit<durchschnitt/2) {
                    addScore = 2.5;
                }
            }
            letzteRichtig = new Date();
            rechnungen[naechste[0]].score+=addScore;
            korrekt+=1;
            statistik();
            neueRechnung();
        } else {
            if (naechste[naechste.length-1]!=naechste[0]) {
                naechste.push(naechste[0]);
            }
            rechnungen[naechste[0]].score-=3;
            if (korrekt>0) falsch += 1;
            resultat.innerText = "";
            overlay.style.display = "flex";
        }

    }

    function klick(ev) {
        if (startzeit==0) {
            startzeit = new Date();
        }
        key = this.innerText;
        if (key=="⌫") {
            if (resultat.innerText.length>0) {
                resultat.innerText = resultat.innerText.substring(0, resultat.innerText.length-1);
            }
            return;
        }
        if (key=="⏎") {
            if (resultat.innerText.length>0) {
                pruefe();
            }
            return;
        }
        if (resultat.innerText.length<3) {
            resultat.innerText += key
        }
    }

    function init_keypad() {
        document.querySelectorAll("#keypad div").forEach((el)=>{
            el.addEventListener('click', klick);
        });
        document.getElementById('weiter').addEventListener('click', (ev)=>{
            overlay.style.display = "none";
        });
        document.getElementById('clearstats').addEventListener('click', (ev)=>{
            clearStats();
        });
    }

    function initWebWorker() {
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker
            .register("./serviceWorker.js")
            .then(res => console.log("service worker registered"))
            .catch(err => console.log("service worker not registered", err))
        } else {
            console.log("no serviceWorker in navigator");
        }
    }

    function initRechnungen() {
        for (let a=2; a<=10; a++) {
            for (let b=2; b<=10; b++) {
                rechnungen.push({"a":a, "b":b, "score":0})
            }
        }
        naechsteFuellen();
    }
    initWebWorker();
    init_keypad();
    initRechnungen();
    neueRechnung();

});