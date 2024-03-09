window.addEventListener('load', function () {
    let resultat = document.getElementById('resultat');
    let rechnung = document.getElementById('rechnung');
    let richtig = document.getElementById('richtig');
    let overlay = document.getElementById('overlay');
    let settings = document.getElementById('settings');
    let teilen = document.getElementById('teilen');
    let installbutton = document.getElementById('installbutton')
    let audioswitch = document.getElementById('audioswitch');
    let audioSymbols = ['🔇', '🔊'];
    let audioEnabled = 0;
    let confcount = 75;

    let confetti = new Confetti('rain');
    confetti.setCount(75);
    confetti.setSize(2);
    //confetti.setGravity(20);
    confetti.setPower(30);
    confetti.setFade(false);
    confetti.destroyTarget(true);


    const cheers = new Audio("ogg/cheers.ogg");
    const baam = new Audio("ogg/baam.ogg");

    let geheim = 0;
    let korrekt = 0;
    let falsch = 0;
    let streak = 0;
    const streaklength = 10;
    let startzeit = 0;
    let letzteRichtig = 0;
    let durchschnitt = 0;
    let rechnungen = [];
    let gewaehlteReihen = [true, true, true, false, false, true, true, true, true, true, true, true, true, false];
    let naechste = [];
    let anzahlNaechste = 3;
    let audios = {};
    let audioQueue = [];

    let installPrompt = null;
    window.addEventListener("beforeinstallprompt", (event) => {
        event.preventDefault();
        installPrompt = event;
        console.log("show installbutton")
        installbutton.style.display = "block";
    });

    installbutton.addEventListener("click", async () => {
        console.log("installbutton click")
        if (!installPrompt) {
            return;
        }
        console.log("Installation starting")
        const result = await installPrompt.prompt();
        console.log(`Install prompt was: ${result.outcome}`);
        disableInAppInstallPrompt();
    });

    window.addEventListener("appinstalled", () => {
        console.log("installed");
        disableInAppInstallPrompt();
    });

    function disableInAppInstallPrompt() {
        console.log("hiding")
        installPrompt = null;
        installbutton.setAttribute("hidden", "");
    }

    function myRand() {
        return Math.floor(Math.pow(Math.random(), 0.8) * 8.3 + 2);
    }

    function loadBG() {
        let dataurl = window.localStorage.getItem("einmaleinsbgimage");
        if (dataurl) {
            document.body.style.backgroundImage = "url(" + dataurl + ")";
        }
    }

    function loadAudio() {
        let files = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'mal'];
        for (let file of files) {
            let path = `ogg/${file}.ogg`;
            let audio = new Audio(path);
            audios[file] = audio;
            //audio.addEventListener('ended', nextAudio);
        }
    }

    function nextAudio() {
        if (audioQueue.length > 0) {
            let a = audioQueue.shift();
            audios[a].play();
            setTimeout(nextAudio, audios[a].duration * 1000 - 20);
        }
    }


    function stopAudio() {
        audioQueue = [];
        for (let file in audios) {
            audios[file].pause();
            audios[file].currentTime = 0;
        }
    }

    function sayRechung() {
        stopAudio();
        r = rechnungen[naechste[0]];
        audioQueue = [r.a, "mal", r.b];
        nextAudio();
    }

    function saveReihen() {
        //console.log(gewaehlteReihen);
        window.localStorage.setItem("einmaleinsreihen", JSON.stringify(gewaehlteReihen));
    }

    function loadReihen() {
        let json = window.localStorage.getItem("einmaleinsreihen");
        if (json) {
            try {
                let reihen = JSON.parse(json);
                //console.log(reihen)
                //alert("rieh");
                if (reihen.length == 14) {
                    reihen.forEach((e, i) => gewaehlteReihen[i] = e);
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
        let scores = rechnungen.map(e => e.score);
        window.localStorage.setItem("einmaleinsscores", JSON.stringify(scores));
        //console.log("scores saved");
    }

    function loadScores() {
        let json = window.localStorage.getItem("einmaleinsscores");
        if (json) {
            try {
                let scores = JSON.parse(json);
                if (scores.length == rechnungen.length) {
                    scores.forEach((e, i) => rechnungen[i].score = e);
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
        let indecies = new Array(rechnungen.length).fill(0).map((e, i) => i);
        indecies.sort((a, b) => rechnungen[a].score - rechnungen[b].score + Math.random() - 0.5);
        let i = 0;
        while (naechste.length < anzahlNaechste) {
            let j = indecies[i];
            let r = rechnungen[j];
            console.log(naechste);
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
        geheim = a * b;
        rechnung.innerText = `${a} · ${b}`
        resultat.innerText = "";
        richtig.innerText = rechnung.innerText + " = " + geheim;
        if (audioEnabled == 1) {
            sayRechung();
        }
    }

    function statistik() {
        let prozent = korrekt == 0 ? 0 : Math.floor(korrekt / (korrekt + falsch) * 100 + 0.5);
        durchschnitt = korrekt == 0 ? 0 : Math.round((new Date() - startzeit) / 100 / korrekt) / 10;
        document.getElementById('prozent').innerText = prozent;
        document.getElementById('sekunden').innerText = durchschnitt;
        document.getElementById('anzahl').innerText = korrekt;

    }

    function pruefe() {
        if (resultat.innerText == geheim) {
            streak += 1;
            if (audioEnabled == 1) {
                baam.play();
            }
            console.log(streak);
            if (streak == streaklength) {
                confcount += 500;
                //alert("Juhui");
                cheers.play()

                streak = 0;
                confetti.setCount(confcount);
                document.getElementById("rain").click();
            }
            let addScore = 1;
            if (korrekt > 3) {
                let dieseZeit = (new Date() - letzteRichtig) / 1000;
                if (dieseZeit > 3 * durchschnitt) {
                    addScore = -0.5;
                }
                else if (dieseZeit > 2 * durchschnitt) {
                    addScore = 0.5;
                }
                if (dieseZeit < durchschnitt / 2) {
                    addScore = 2.5;
                }
            }
            letzteRichtig = new Date();
            rechnungen[naechste[0]].score += addScore;
            if (rechnungen[naechste[0]].score > 5) {
                rechnungen[naechste[0]].score = 5;
            }
            korrekt += 1;
            statistik();
            neueRechnung();
        } else {
            streak = 0;
            confcount = 500;
            if (naechste[naechste.length - 1] != naechste[0]) {
                naechste.push(naechste[0]);
                rechnungen[naechste[0]].score -= 3;
                if (rechnungen[naechste[0]].score < -5) {
                    rechnungen[naechste[0]].score = -5;
                }
                if (korrekt > 0) falsch += 1;
            }
            resultat.innerText = "";
            overlay.style.display = "flex";
        }
        saveScores();
    }

    function processKey(key) {
        if (startzeit == 0) {
            startzeit = new Date();
        }
        if (key == "⌫") {
            if (resultat.innerText.length > 0) {
                resultat.innerText = resultat.innerText.substring(0, resultat.innerText.length - 1);
            }
            return;
        }
        if (key == "⏎") {
            if (resultat.innerText.length > 0) {
                pruefe();
            }
            return;
        }
        if (resultat.innerText.length < 2) {
            resultat.innerText += key
        }
    }

    function klick(ev) {
        processKey(this.innerText);
    }

    this.document.body.addEventListener('keyup', ev => {
        let key = ev.key;
        if (key >= '0' && key <= '9') {
            processKey(key);
        }
        if (key == "Enter") {
            if (overlay.style.display != "none") {
                overlay.style.display = "none";
            } else {
                processKey("⏎");
            }
        }
        if (key == "Backspace") processKey("⌫");
    });

    // from https://stackoverflow.com/questions/23945494/use-html5-to-resize-an-image-before-upload
    function bgUpload(ev) {
        if (this.files && this.files[0]) {
            let file = this.files[0];
            if (file.type.match(/image.*/)) {
                var reader = new FileReader();
                reader.onload = function (readerEvent) {
                    var image = new Image();
                    image.onload = function (imageEvent) {
                        // Resize the image
                        var canvas = document.createElement('canvas'),
                            max_size = 800,// TODO : pull max size from a site config
                            width = image.width,
                            height = image.height;
                        if (width > height) {
                            if (width > max_size) {
                                height *= max_size / width;
                                width = max_size;
                            }
                        } else {
                            if (height > max_size) {
                                width *= max_size / height;
                                height = max_size;
                            }
                        }
                        canvas.width = width;
                        canvas.height = height;
                        canvas.getContext('2d').drawImage(image, 0, 0, width, height);
                        var dataUrl = canvas.toDataURL('image/jpeg');
                        localStorage.setItem("einmaleinsbgimage", dataUrl);
                        document.body.style.backgroundImage = "url(" + dataUrl + ")";
                    }
                    image.src = readerEvent.target.result;
                }
                reader.readAsDataURL(file);
            }
        }
    }

    function init_ui() {
        document.querySelectorAll("#keypad div").forEach((el) => {
            el.addEventListener('click', klick);
        });
        document.getElementById('weiter').addEventListener('click', (ev) => {
            overlay.style.display = "none";
        });
        document.getElementById('clearstats').addEventListener('click', (ev) => {
            clearStats();
        });
        document.getElementById('hamburger').addEventListener('click', () => {
            settings.style.display = "flex";
        });
        document.getElementById('teilenbutton').addEventListener('click', () => {
            teilen.style.display = "flex";
        });
        document.getElementById('oksettings').addEventListener('click', () => {
            settings.style.display = "none";
            naechste = [];
            clearStats();
            resetScores();
            neueRechnung();
        });
        document.getElementById('okteilen').addEventListener('click', () => {
            teilen.style.display = "none";
        });
        document.getElementById('audioswitch').addEventListener('click', () => {
            audioEnabled = 1 - audioEnabled;
            audioswitch.innerText = audioSymbols[audioEnabled];
            if (audioEnabled == 1) {
                sayRechung();
            } else {
                stopAudio();
            }
        });
        loadReihen();
        document.querySelectorAll("#reihen div").forEach(e => {
            //alert(e.innerHTML);
            //console.log(e);
            let r = e.innerText;
            e.className = gewaehlteReihen[r] ? "on" : "off";
            e.addEventListener('click', function (e) {
                let r = this.innerText;
                gewaehlteReihen[r] = !gewaehlteReihen[r];
                if (gewaehlteReihen.every(e => !e)) {
                    gewaehlteReihen[2] = true;
                    document.querySelector("#reihen div").className = "on";
                }
                this.className = gewaehlteReihen[r] ? "on" : "off";
                saveReihen();
            });
        });
        document.getElementById('uploadBgImage').addEventListener('change', bgUpload);

        document.getElementById('resetbg').addEventListener('click', e => {
            localStorage.removeItem("einmaleinsbgimage");
            document.body.style.backgroundImage = "url(bg.jpg)";
        });
        loadBG();
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
        for (let a = 2; a <= 10; a++) {
            for (let b = 2; b <= 10; b++) {
                rechnungen.push({ "a": a, "b": b, "score": 0 })
            }
        }
        loadScores();
        naechsteFuellen();
    }
    initWebWorker();
    init_ui();
    loadAudio();
    initRechnungen();
    neueRechnung();

});