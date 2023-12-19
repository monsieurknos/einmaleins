window.addEventListener('load', function() {
    let resultat = document.getElementById('resultat');
    let rechnung = document.getElementById('rechnung');
    let richtig = document.getElementById('richtig');
    let overlay = document.getElementById('overlay');

    function myRand() {
        return Math.floor(Math.pow(Math.random(), 0.8)*9+2);
    }

    let geheim = 0;
    let korrekt = 0;
    let falsch = 0;

    function neueRechnung() {
        let a = myRand();
        let b = myRand();
        geheim = a*b;
        rechnung.innerText = `${a} · ${b}`
        resultat.innerText = "";
        richtig.innerText = rechnung.innerText + " = " + geheim;
    }

    function pruefe() {
        if (resultat.innerText == geheim) {
            korrekt+=1;
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

    init_keypad();
    neueRechnung();

});