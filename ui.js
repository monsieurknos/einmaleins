window.addEventListener('load', function() {
    let resultat = document.getElementById('resultat');
    let rechnung = document.getElementById('rechnung');

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
    }

    function pruefe() {
        if (resultat.innerText == geheim) {
            korrekt+=1;
            neueRechnung();
        } else {
            falsch += 1;
            resultat.innerText = "";
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
    }

    init_keypad();
    neueRechnung();

});