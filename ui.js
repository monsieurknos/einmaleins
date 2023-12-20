window.addEventListener('load', function() {
    let resultat = document.getElementById('resultat');
    let rechnung = document.getElementById('rechnung');
    let richtig = document.getElementById('richtig');
    let overlay = document.getElementById('overlay');
    let settings = document.getElementById('settings');

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
    let gewaehlteReihen = [false, false, true, true, true, true, true, true, true, true, false];
    let naechste = [];
    let anzahlNaechste = 3;

    function saveReihen() {
        window.localStorage.setItem("einmaleinsreihen", JSON.stringify(gewaehlteReihen));
    }

    function loadReihen() {
        let json = window.localStorage.getItem("einmaleinsreihen");
        if (json) {
            try {
                let reihen = JSON.parse(json);
                if (reihen.length == 11) {
                    reihen.forEach((e,i)=>gewaehlteReihen[i]= e);
                    gewaehlteReihen[10] = false;
                    gewaehlteReihen[0] = false;
                    gewaehlteReihen[1] = false;
                }
            } catch (e) {
                //console.log(e);
            }
        }
    }

    function saveScores() {
        let scores = rechnungen.map(e=>e.score);
        window.localStorage.setItem("einmaleinsscores", JSON.stringify(scores));
        //console.log("scores saved");
    }

    function loadScores() {
        let json = window.localStorage.getItem("einmaleinsscores");
        if (json) {
            try {
                let scores = JSON.parse(json);
                if (scores.length == rechnungen.length) {
                    scores.forEach((e,i)=>rechnungen[i].score = e);
                    //console.log("scores loaded");
                } else {
                    //console.log("scores with wrong length");
                }
            } catch (e) {
                //console.log(e);
            }
        } else {
            //console.log("no scores stored");
        }
    }

    function resetScores() {
        for (r of rechnungen) {
            r.score = 0;
        }
        saveScores();
    }

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
            let r = rechnungen[j];
            if ((!naechste.includes(j)) && (gewaehlteReihen[r.a] || gewaehlteReihen[r.b])) {
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
            if (rechnungen[naechste[0]].score>5) {
                rechnungen[naechste[0]].score = 5;
            }
            korrekt+=1;
            statistik();
            neueRechnung();
        } else {
            if (naechste[naechste.length-1]!=naechste[0]) {
                naechste.push(naechste[0]);
                rechnungen[naechste[0]].score-=3;
                if (rechnungen[naechste[0]].score<-5) {
                    rechnungen[naechste[0]].score = -5;
                }
                if (korrekt>0) falsch += 1;
            }
            resultat.innerText = "";
            overlay.style.display = "flex";
        }
        saveScores();
    }

    function processKey(key) {
        if (startzeit==0) {
            startzeit = new Date();
        }
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

    function klick(ev) {
        processKey(this.innerText);
    }

    this.document.body.addEventListener('keyup', ev=>{
        let key = ev.key;
        if (key>='0' && key<='9') {
            processKey(key);
        }
        if (key=="Enter") {
            if (overlay.style.display != "none") {
                overlay.style.display = "none";
            } else {
                processKey("⏎");
            }
        }
        if (key=="Backspace") processKey("⌫");
    });

    function init_ui() {
        document.querySelectorAll("#keypad div").forEach((el)=>{
            el.addEventListener('click', klick);
        });
        document.getElementById('weiter').addEventListener('click', (ev)=>{
            overlay.style.display = "none";
        });
        document.getElementById('clearstats').addEventListener('click', (ev)=>{
            clearStats();
        });
        document.getElementById('hamburger').addEventListener('click', ()=>{
            settings.style.display = "flex";
        });
        document.getElementById('oksettings').addEventListener('click', ()=>{
            settings.style.display = "none";
            naechste = [];
            clearStats();
            resetScores();
            neueRechnung();
        });
        loadReihen();
        document.querySelectorAll("#reihen div").forEach(e=>{
            console.log(e);
            let r = e.innerText;
            e.className = gewaehlteReihen[r] ? "on" : "off";
            e.addEventListener('click', function(e) {
                let r = this.innerText;
                gewaehlteReihen[r] = !gewaehlteReihen[r];
                if (gewaehlteReihen.every(e=>!e)) {
                    gewaehlteReihen[2] = true;
                    document.querySelector("#reihen div").className = "on";
                }
                this.className = gewaehlteReihen[r] ? "on" : "off";
                saveReihen();
            });
        });

        overlay.style.display = "none";
        settings.style.display = "none";
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
        loadScores();
        naechsteFuellen();
    }
    initWebWorker();
    init_ui();
    initRechnungen();
    neueRechnung();

});