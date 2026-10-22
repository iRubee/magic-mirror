//input di inizio



// Variabili globali
const dateContainer = document.getElementById('date-container');
const mirrorContainer = document.querySelector('.magic-mirror');
const now = new Date();
window.mirrorCity = {
    current: "Figline Valdarno",
    previous: null
}
let nTimer = 0;

// Liste di comandi e risposte
const keyWords = [
    'ehi elsa',
    'ehy elsa',
    'hey elsa',
    'ei elsa',
    'ey elsa',
    'e elsa',
    'eyelsa',
];

const frasiAiuto = [
    "Come posso aiutarti?",
    "Dimmi pure.",
    "In che modo posso esserti utile?",
    "Sono pronta, dimmi tutto.",
    "Hai bisogno di qualcosa?",
    "Che posso fare per te?",
    "Eccomi, come posso servirti?",
    "Parla pure.",
    "Cosa posso fare per te?",
    "Come posso darti una mano?"
];

const timers = {};
let voicesLoaded = false;
let availableVoices = [];

// Funzione per sbloccare l'audio
function unlockAudio() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        const oscillator = ctx.createOscillator();
        oscillator.connect(ctx.destination);
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.001);
        console.log("Contesto audio sbloccato");
    } catch (e) {
        console.warn("Errore sblocco audio:", e);
    }
}

// Caricamento voci migliorato
function loadVoices() {
    function checkVoices() {
        availableVoices = window.speechSynthesis.getVoices();
        if (availableVoices.length > 0) {
            console.log("Voci disponibili:", availableVoices);
            voicesLoaded = true;
            
            // Sblocchiamo l'audio non appena le voci sono caricate
            unlockAudio();
            
            // Test iniziale della voce
            speak("Sistema pronto");
        } else {
            setTimeout(checkVoices, 200);
        }
    }
    
    // Forza il caricamento delle voci
    window.speechSynthesis.getVoices();
    checkVoices();
    
    // Alcuni browser richiedono questo evento
    window.speechSynthesis.onvoiceschanged = checkVoices;
}

// Funzione per ottenere una voce femminile italiana
function getItalianFemaleVoice() {
    const femaleVoices = availableVoices.filter(voice => 
        voice.lang === 'it-IT' && 
        (voice.name.includes('Elsa') || 
         voice.name.includes('Alice') || 
         voice.name.includes('Google italiano') ||
         voice.name.includes('Microsoft Elsa') ||
         voice.name.toLowerCase().includes('female'))
    );
    
    return femaleVoices[0] || availableVoices.find(voice => voice.lang === 'it-IT');
}

// Funzione per parlare con gestione degli errori
function speak(text) {
    if (!voicesLoaded) {
        console.log("Voci non ancora caricate, riprovo tra 500ms...");
        setTimeout(() => speak(text), 500);
        return;
    }

    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "it-IT";
    utterance.rate = 0.9; // Velocità leggermente ridotta per chiarezza

    const selectedVoice = getItalianFemaleVoice();
    if (selectedVoice) {
        utterance.voice = selectedVoice;
    }

    // Gestione degli errori
    utterance.onerror = (event) => {
        console.error("Errore nella sintesi vocale:", event.error);
    };

    try {
        synth.speak(utterance);
    } catch (e) {
        console.error("Errore durante il parlato:", e);
        // Riprova dopo un breve ritardo
        setTimeout(() => speak(text), 1000);
    }
}

// Funzioni per la visualizzazione di data e ora
function timeView() {
    let date = new Date();
    let hours = date.getHours();
    let minutes = date.getMinutes(); 
    minutes = minutes < 10 ? '0' + minutes : minutes;
    hours = hours < 10 ? '0' + hours : hours;
    
    dateContainer.innerHTML = "<p>" + hours + ":" + minutes + "</p> <p>" + dayView() + "</p>";
    requestAnimationFrame(timeView);
}

function dayView() {
    const daysOfWeek = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
    const monthNames = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
    const date = new Date();
    
    let day = daysOfWeek[date.getDay()] + ", " + date.getDate() + " " + monthNames[date.getMonth()] + " " + date.getFullYear();
    
    return day;
}

// Funzione per generare il calendario
function generateCalendar(year, month) {
    const calendarContainer = document.getElementById('calendar-container');
    const daysOfWeek = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
    const date = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = (date.getDay() + 6) % 7; 
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    const headerRow = document.createElement('tr');
    
    let row = document.createElement('tr');
    
    calendarContainer.innerHTML = ""; 
    
    daysOfWeek.forEach(day => {
        const th = document.createElement('th');
        th.textContent = day;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    for (let i = 0; i < firstDayIndex; i++) {
        const emptyCell = document.createElement('td');
        row.appendChild(emptyCell);
    }

    for (let day = 1; day <= lastDay; day++) {
        const cell = document.createElement('td');
        cell.textContent = day;
        if(day == now.getDate()) {
            cell.style.border = "1px solid #fff";
        }
        row.appendChild(cell);

        if ((firstDayIndex + day) % 7 === 0) {
            tbody.appendChild(row);
            row = document.createElement('tr');
        }
    }

    if (row.children.length > 0) {
        tbody.appendChild(row);
    }

    table.appendChild(thead);
    table.appendChild(tbody);
    calendarContainer.appendChild(table);
}

// Funzioni per il meteo
async function getWeather() {
    const url = `/api/weather?q=${encodeURIComponent(window.mirrorCity.current)}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Errore nel recupero del meteo: ${response.status}`);
    }
    const data = await response.json();
    return data;
}

async function showWeather() {    
    const weatherContainer = document.getElementById('weather-container');
    const weatherData = await getWeather();
    weatherContainer.innerHTML = "";

    let weatherTemp = weatherData.main.temp.toFixed(0);
    let weatherFeelsLike = weatherData.main.feels_like.toFixed(0);
    let weatherDescription = weatherData.weather[0].main;
    let weatherDetail = weatherData.weather[0].description; 
    
    let cityTag = document.createElement('h1');
    cityTag.innerText = window.mirrorCity.current.toUpperCase();
    weatherContainer.appendChild(cityTag);

    let descriptionTag = document.createElement('div');
    let descriptionImg = document.createElement('img');
    let detailTag = document.createElement('p');

    switch (weatherDescription.toLowerCase()) {
        case 'clear': 
            descriptionImg.src = "./img/wi_clear-day.svg";
            break;
        case 'rain':
            descriptionImg.src = "./img/wi_rain.svg";
            break;
        case 'clouds': 
            descriptionImg.src = "./img/wi_overcast.svg";
            break;
        case 'drizzle': 
            descriptionImg.src = "./img/drizzle.svg";
            break;
        case 'thunderstorm':
            descriptionImg.src = "./img/wi_thunderstorms-rain.svg";
            break;
        case 'snow': 
            descriptionImg.src = "./img/wi_snow.svg";
            break;
        case 'atmosphere':
            descriptionImg.src = "./img/mist.svg";
    }

    descriptionImg.style.height = "71%";
    detailTag.innerText = weatherDetail;
    detailTag.style.fontSize = "1.4rem";
    
    descriptionTag.style.height = "200px";
    descriptionTag.style.textAlign = 'center';
    descriptionTag.style.display = 'flex';
    descriptionTag.style.flexDirection = 'column';

    descriptionTag.appendChild(descriptionImg);
    descriptionTag.appendChild(detailTag);
    weatherContainer.appendChild(descriptionTag);

    let tempContainer = document.createElement('div');
    tempContainer.style.display = 'flex';
    tempContainer.style.justifyContent = 'space-around';
    tempContainer.style.alignItems = 'center';

    let tempTag = document.createElement('h2');
    tempTag.innerHTML = "Temperatura <br >"+ weatherTemp +"°C";
    tempContainer.appendChild(tempTag);

    tempTag = document.createElement('h2');
    tempTag.innerHTML= "Percepita <br >" + weatherFeelsLike + "°C ";
    tempContainer.appendChild(tempTag);

    weatherContainer.appendChild(tempContainer);
}

// Funzioni per i timer
function deleteTimer(id) {
    if (timers[id]) {
        clearInterval(timers[id].intervalId);
        timers[id].displayElement.remove();
        delete timers[id];
        speak(`Timer numero ${id} cancellato.`);
        nTimer--;
    }
}

function setTimer(time, unit, id) {
    const elsaContainer = document.getElementById("elsa-container");
    let seconds = 0;

    if (unit === "secondi" || unit == "secondo") {
        seconds = time;
    } else if (unit === "minuti" || unit == "minuto") {
        seconds = time * 60;
    } else if (unit === "ore" || unit == "ora") {
        seconds = time * 60 * 60;
    } else {
        return;
    }

    let timerDisplay = document.createElement('p');
    timerDisplay.id = `timer-display-${id}`;
    timerDisplay.innerText = "Avviato timer #" + id;
    speak(`Avviato timer numero ${id} di ${time} ${unit}`);
    elsaContainer.appendChild(timerDisplay);
    
    const intervalId = setInterval(() => {
        seconds--;
        let hours = Math.floor(seconds / 3600); 
        let mins = Math.floor((seconds % 3600) / 60); 
        let secs = seconds % 60;

        if(hours < 10) hours = '0' + hours;
        if(mins < 10) mins = '0' + mins;
        if(secs < 10) secs = '0' + secs;

        timerDisplay.innerText = `${id} - ${hours}:${mins}:${secs}`;

        if (seconds <= 0) {
            clearInterval(intervalId);
            timerDisplay.innerText = `Timer #${id} scaduto!`;
            speak(`Timer numero ${id} scaduto!`);
        }
    }, 1000);

    timers[id] = {
        intervalId: intervalId,
        displayElement: timerDisplay
    };
}

// Inizializzazione riconoscimento vocale
function initVoiceRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'it-IT';
        recognition.interimResults = false;
        recognition.continuous = true;

        recognition.onresult = (event) => {
            const transcript = event.results[event.results.length - 1][0].transcript.trim();
            const elsaContainer = document.getElementById("elsa-container");
            console.log("Hai detto:", transcript);

            if (keyWords.some(keyword => transcript.toLowerCase().includes(keyword))) {
                console.log("Attivazione riconosciuta: Ehi Elsa");
                recognition.stop(); 
                
                function getFraseAiuto() {
                    const indiceCasuale = Math.floor(Math.random() * frasiAiuto.length);
                    return frasiAiuto[indiceCasuale];
                }
                
                speak(getFraseAiuto());
                
                let elsaTitle = document.createElement('p');
                elsaTitle.innerText = "In Ascolto...";
                elsaTitle.id = "elsa-title"; 
                elsaContainer.appendChild(elsaTitle);
                mirrorContainer.classList.add('elsa-active')

                const elsaRecognition = new SpeechRecognition();
                elsaRecognition.lang = 'it-IT';
                elsaRecognition.interimResults = false;
                elsaRecognition.continuous = true;

                elsaRecognition.onresult = (event) => {
                    const elsaTranscript = event.results[event.results.length - 1][0].transcript.trim();
                    console.log("Elsa ha ascoltato:", elsaTranscript);
                    
                    if (elsaTranscript.toLowerCase().includes("timer")) {
                        console.log("Comando identificato");

                        const matches = elsaTranscript.match(/(?:imposta|attiva)?(?:\s+un(?:'|')?|una)?\s+timer\s+di\s+(\d+|un(?:'|')?|una)?\s*(secondi|minuti|ore|secondo|minuto|ora)?/i);

                        if (matches && matches[1]) {
                            nTimer++;
                            let time = parseInt(matches[1], 10);
                            console.log(matches[2]);
                            if(matches[1] === "un" || matches[1] === "una" || matches[1] === "un'") {   
                               time = 1; 
                            }
                            let unit = matches[2] ? matches[2].toLowerCase() : "minuti"; 
                            console.log(`Imposto un timer di ${time} ${unit}`);
                            setTimer(time, unit, nTimer); 
                            elsaRecognition.stop(); 
                        } else {
                            console.log("Comando non valido per il timer.");
                        }
                    }

                    if (elsaTranscript.toLowerCase().includes("meteo") || elsaTranscript.toLowerCase().includes("tempo")) {
                        console.log("Comando identificato");
                        
                        const matches = elsaTranscript.match(/(?:meteo|tempo)?\s+a\s+(.+)/i);

                        if(matches && matches[1]) {
                            let città = matches[1].trim();
                            window.mirrorCity.previous = window.mirrorCity.current;
                            window.mirrorCity.current = città;
                            speak(`Ecco il meteo a ${città}`);
                            console.log(`Imposto la città per il meteo a: ${window.mirrorCity.current}`);
                            
                            const weatherContainer = document.getElementById('weather-container');
                            weatherContainer.innerHTML = '<div class="loading">Aggiornamento meteo...</div>';
    
                            showWeather().then(() => {
                                speak(`Ecco il meteo a ${città}`);
                            });
                            
                            elsaRecognition.stop(); 
                        } else {
                            console.log("Comando non valido per il meteo.");
                        }
                    }
                    
                    if (elsaTranscript.toLowerCase().includes("cancella") || elsaTranscript.toLowerCase().includes("elimina")) {
                        const match = elsaTranscript.match(/(?:cancella|elimina)? timer(?: numero)? (\d+)/i);
                        if (match && match[1]) {
                            const idDaCancellare = parseInt(match[1], 10);
                            deleteTimer(idDaCancellare);
                            elsaRecognition.stop(); 
                        }
                    }

                    if(elsaTranscript.toLowerCase().includes("ora") || elsaTranscript.toLowerCase().includes("ore")) {
                        const date = new Date();
                        const hours = date.getHours().toString().padStart(2, '0');
                        const minutes = date.getMinutes().toString().padStart(2, '0');
                        const timeString = `Sono le ${hours} e ${minutes}`;
                        speak(timeString);
                        elsaRecognition.stop(); 
                    }

                    if (elsaTranscript.toLowerCase().includes("data") || elsaTranscript.toLowerCase().includes("giorno")) {
                        const date = new Date();
                        const daysOfWeek = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
                        const monthNames = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
                        const dayString = `Oggi è ${daysOfWeek[date.getDay()]}, ${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
                        speak(dayString);
                        elsaRecognition.stop(); 
                    }
                };

                elsaRecognition.onerror = (event) => {
                    console.error("Errore nel riconoscimento:", event.error);
                };

                elsaRecognition.onend = () => {
                    console.log("Elsa ha smesso di ascoltare.");
                    const title = document.getElementById("elsa-title");
                    mirrorContainer.classList.remove("elsa-active")
                    if (title) title.remove();
                    recognition.start();
                };

                elsaRecognition.start();
            }
        };

        recognition.onerror = (event) => {
            if (event.error == 'no-speech') {
                setTimeout(() => {
                    console.log("Registrazione riavviata");
                    recognition.start();
                }, 1000);
            }
            console.error("Errore:", event.error);
        };

        recognition.start();
        console.log("Riconoscimento vocale avviato");
    } else {
        console.error("Il browser non supporta l'API SpeechRecognition.");
    }
}

// Inizializzazione dell'applicazione
function initApp() {
    // Sblocca l'audio e carica le voci
    unlockAudio();
    loadVoices();
    
    // Avvia le funzioni di visualizzazione
    generateCalendar(now.getFullYear(), now.getMonth());
    timeView();
    console.log("Mostro il meteo per la città:", window.mirrorCity.current);
    showWeather();
    setInterval(showWeather, 600000); // Aggiorna il meteo ogni 10 minuti
    
    // Avvia il riconoscimento vocale
    initVoiceRecognition();
    
    // Simula un evento click dopo 1 secondo per sbloccare l'audio su alcuni browser
    setTimeout(() => {
        const event = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
        });
        document.dispatchEvent(event);
    }, 1000);
}

// Avvia l'applicazione quando il DOM è pronto
document.addEventListener('DOMContentLoaded', initApp);