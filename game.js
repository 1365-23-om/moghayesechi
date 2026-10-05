const startButton = document.getElementById("startButton");
const saveButton = document.getElementById("saveButton");
const target = document.getElementById("target");

const scoreEl = document.getElementById("score");
const coinsEl = document.getElementById("coins");
const energyEl = document.getElementById("energy");
const message = document.getElementById("gameMessage");

let score = 0;
let coins = 0;
let energy = 20;
let playing = false;


// شروع بازی
startButton.onclick = function () {

    score = 0;
    energy = 20;
    playing = true;

    scoreEl.textContent = "0";
    energyEl.textContent = "20";

    target.disabled = false;
    saveButton.disabled = false;
    startButton.disabled = true;

    message.textContent = "🎯 بازی شروع شد!";
};


// زدن هدف
target.onclick = function () {

    if (!playing) {
        return;
    }

    score++;

    scoreEl.textContent =
        score.toLocaleString("fa-IR");
};


// پایان بازی
saveButton.onclick = function () {

    if (score === 0) {

        message.textContent =
            "🎯 اول امتیاز بگیر!";

        return;
    }

    playing = false;

    target.disabled = true;
    startButton.disabled = false;

    // هر 10 امتیاز = 1 سکه
    const earnedCoins =
        Math.floor(score / 10);

    coins += earnedCoins;

    coinsEl.textContent =
        coins.toLocaleString("fa-IR");

    message.textContent =
        "✅ بازی تمام شد | +" +
        earnedCoins +
        " 🪙 سکه";
};
