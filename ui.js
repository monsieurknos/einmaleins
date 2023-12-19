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
    let startzeit = new Date();

    function neueRechnung() {
        let a = myRand();
        let b = myRand();
        geheim = a*b;
        rechnung.innerText = `${a} · ${b}`
        resultat.innerText = "";
        richtig.innerText = rechnung.innerText + " = " + geheim;
    }

    function statistik() {
        let prozent = Math.floor(korrekt/(korrekt+falsch)*100+0.5);
        let zeit = Math.round((new Date() - startzeit)/100/korrekt)/10;
        document.getElementById('prozent').innerText = prozent;
        document.getElementById('sekunden').innerText = zeit;

    }

    function pruefe() {
        if (resultat.innerText == geheim) {
            korrekt+=1;
            statistik();
            neueRechnung();
        } else {
            falsch += 1;
            resultat.innerText = "";
            overlay.style.display = "flex";
        }

    }

    function klick(ev) {
        key = this.innerText;
        console.log(key);
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

    initWebWorker();
    init_keypad();
    neueRechnung();

});