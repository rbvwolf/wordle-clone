document.addEventListener("DOMContentLoaded", async () => {
    let guessedWords = [[]];
    let availableSpace = 1;
    let guessWordCount = 0; /*sıra sıra*/
    
    let isGame = true;
    let isHardMode = false; /*work on that later*/

    let word = "";
    let wordList = [];
    let allWordList = [];

    const colorGreen = "rgb(83, 141, 78)";
    const colorOrange = "rgb(181, 159, 59)";

    await loadWords();
    createSquares();

    async function loadWords() {
        try{
            const wordFileName = isHardMode ? 'data/hard_words.json' : 'data/easy_words.json';
            const allWordsFileName = 'data/clean_combined_words.json';
            const response = await fetch(wordFileName);
            let rawWordList = await response.json();

            const allresponse = await fetch(allWordsFileName);
            let rawAllWordList = await allresponse.json();

            function normalizeTurkish(word){
                return word.toLocaleLowerCase('tr-TR').replace(/â/g, 'a').replace(/î/g, 'i').replace(/û/g, 'u');
            }

            wordList = rawWordList.map(w => normalizeTurkish(w));
            allWordList = rawAllWordList.map(w => normalizeTurkish(w));
            
            const randomIndex = Math.floor(Math.random() * wordList.length);
            word = wordList[randomIndex];

            console.log("Words are loaded!");
            console.log("sil bunu, kelime: " + word);
        }
        catch(error){
            console.error("Error: Words couldnt loaded!", error);
        }
    }

    const keys = document.querySelectorAll(".keyboard-row button");

    function showModal(title, message){
        document.getElementById("modal-title").textContent = title;
        document.getElementById("modal-message").innerHTML = message;
        document.getElementById("modal-overlay").classList.remove("hidden");
    }

    function resetGame(){
        guessedWords = [[]];
        availableSpace = 1;
        guessWordCount = 0;
        isGame = true;

        const randomIndex = Math.floor(Math.random() * wordList.length);
        word = wordList[randomIndex].toLocaleLowerCase('tr-TR');

        const gameBoard = document.getElementById("board");
        gameBoard.innerHTML = "";
        createSquares();

        keys.forEach(keyBtn => {
            keyBtn.style.backgroundColor = "";
            keyBtn.style.color = "";
            keyBtn.style.borderColor = "";
        })

        document.getElementById("modal-overlay").classList.add("hidden");
        console.log("sil bunu, kelime: " + word);
    }

    document.getElementById("reset-button").addEventListener("click", resetGame);

    function formatForDisplay(char){
        if(char === "i") return "İ";
        if(char === "ı") return "I";
        return char.toLocaleUpperCase('tr-TR');
    }
    keys.forEach(keyBtn =>{
        const keyVal = keyBtn.getAttribute("data-key");
        if(keyVal && keyVal.length === 1){
            keyBtn.textContent = formatForDisplay(keyVal);
        }
    });


    function getCurrentWordArr(){
        const numberOfGuessedWords = guessedWords.length;
        return guessedWords[numberOfGuessedWords - 1];
    }

    function updateGuessedWords(key){
        const currentWordArr = getCurrentWordArr();
        const normalizedKey = key.toLocaleLowerCase('tr-TR');

        if(currentWordArr && currentWordArr.length < 5){ /*max 5 guess varsa*/
            currentWordArr.push(normalizedKey);

            const availableSpaceElement = document.getElementById(String(availableSpace));
            availableSpace++;

            availableSpaceElement.textContent = formatForDisplay(normalizedKey);
        }
    }

    function getTileColor(key, index){
        const isCorrectLetter = word.includes(key);
        if(!isCorrectLetter){
            return "rgb(58, 58, 60)";
        }

        const letterPos = word.charAt(index);
        const isCorrectPos = key === letterPos;
        if(isCorrectPos){
            return colorGreen;
        }

        return colorOrange;
    }

    function updateKeyboardColor(key, tileColor){
        const lowerKey = String(key).toLocaleLowerCase('tr-TR');
        let keyButton = document.querySelector(`[data-key="${lowerKey}"]`);
        if (!keyButton) {
            const upperKey = String(key).toLocaleUpperCase('tr-TR');
            keyButton = document.querySelector(`[data-key="${key}"]`);
        }
        if (!keyButton) return;

        const currentColor = keyButton.style.backgroundColor;
        if(currentColor === colorGreen) return;
        if(currentColor === colorOrange && tileColor !== colorGreen) return;

        keyButton.classList.add("animate__animated", "animate__flipInX");

        keyButton.style.backgroundColor = tileColor;
        keyButton.style.borderColor = tileColor;
        keyButton.style.color = "white";

        setTimeout(() => {
            keyButton.classList.remove("animate__flipInX");
        }, 1000);
    }

    function handleSubmitWord(){
        const currentWordArr = getCurrentWordArr();
        if(currentWordArr.length !== 5){
            alert("Word must be 5 letters!");
            return;
        }

        const currentWord = currentWordArr.join('').toLocaleLowerCase('tr-TR');;
        
        if(!allWordList.includes(currentWord)){
            console.warn("Theres no word in the word list but continue testing");
            //return;
        }

        /*smart painting alg, first gray, then green, than orange*/
        let letterCounts = {};
        for (let char of word){
            letterCounts[char] = (letterCounts[char] || 0) + 1;
        }
        /*gray*/
        let tileColors = Array(5).fill("rgb(58, 58, 60)");
        /*green*/
        currentWordArr.forEach((key, index) => {
            if(key === word[index]){
                tileColors[index] = colorGreen;
                letterCounts[key]--;
            }
        });

        currentWordArr.forEach((key,index) => {
            if(tileColors[index] !== colorGreen){
                if(letterCounts[key] > 0){
                    tileColors[index] = colorOrange;
                    letterCounts[key]--;
                }
            }
        });

        const firstLetterId = guessWordCount * 5 + 1; /*ikinci satır, 1 * 5 + 1 = index 6*/
        const interval = 200;
        currentWordArr.forEach((key, i) => {
            setTimeout(() => {
                /*const tileColor = getTileColor(key, i);*/
                const tileColor = tileColors[i];
                const letterId = firstLetterId + i;
                const letterEl = document.getElementById(String(letterId));

                letterEl.classList.add("animate__flipInX");
                letterEl.style.backgroundColor = tileColor;
                letterEl.style.borderColor = tileColor;

                updateKeyboardColor(key, tileColor);
            }, interval * i);
        })

        guessWordCount++;

        if(currentWord === word){
            setTimeout( () => {
                showModal("Congrats!", `You find the word: <strong>${word.toLocaleUpperCase('tr-TR')}</strong>`)
                }, 1200);
            isGame = false;
            return;
        }

        if(guessedWords.length === 6){
            setTimeout( () => {
                showModal("You Lose!", `You tried but it didnt work. <br>Word was: <strong>${word.toLocaleUpperCase('tr-TR')}</strong>`)
                }, 1200);
            isGame = false;
            return;
        }

        guessedWords.push([]);
    }

    function handleDeleteKey(){
        const currentWordArr = getCurrentWordArr();

        if(currentWordArr.length === 0){
            return;
        }

        const removedKey = currentWordArr.pop();

        guessedWords[guessedWords.length - 1] = currentWordArr;

        const lastKeyEl = document.getElementById(String(availableSpace - 1));
        lastKeyEl.textContent = "";
        availableSpace--;
    }

    function createSquares(){
        const gameBoard = document.getElementById("board");

        for(let i = 0; i < 30; i++){
            let square = document.createElement("div");
            square.classList.add("square");
            square.classList.add("animate__animated")
            square.setAttribute("id", i+1);
            gameBoard.appendChild(square);
        }
    }

    for(let i = 0; i < keys.length; i++){
        keys[i].onclick = ({target}) => {
            if(!isGame) return;
            const key = target.getAttribute("data-key");
            handleInput(key);
        }
    }

    document.body.onkeydown = (e) => {
        if(e.key === "Enter" || e.key === "Backspace" || isLetter(e.key)){
            handleInput(e.key);
        }
    }

    function handleInput(key){
        if(!isGame) return;
        const normalizedKey = key.toLocaleLowerCase('tr-TR');

        if(normalizedKey === "enter"){
            handleSubmitWord();
        }
        else if(normalizedKey === "del" || normalizedKey === "backspace"){
            handleDeleteKey();
        }
        else if(isLetter(normalizedKey)){
            updateGuessedWords(normalizedKey);
        }
    }

    function isLetter(key){
        return key.length === 1 && key.match(/[a-zA-ZçğıöşüÇĞİÖŞÜ]/i);
    }
});