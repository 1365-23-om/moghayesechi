const SUPABASE_URL =
  "https://evvdggckoalesyyyqhqm.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_fkx37LxzP3Lb1q2HNxsoKw_6oTDNLUl";

const GAME_URL =
  SUPABASE_URL + "/functions/v1/sekkechi-game";


const coinsEl = document.getElementById("coins");
const energyEl = document.getElementById("energy");
const scoreEl = document.getElementById("score");

const target = document.getElementById("target");
const startButton = document.getElementById("startButton");
const saveButton = document.getElementById("saveButton");

const message = document.getElementById("gameMessage");


let score = 0;
let playing = false;


// ================================
// پیام
// ================================

function showMessage(text) {

  if (message) {
    message.textContent = text;
  }

}


// ================================
// پیدا کردن توکن
// ================================

function getToken() {

  const directKeys = [
    "supabase_access_token",
    "access_token",
    "sb-access-token"
  ];

  for (const key of directKeys) {

    const token =
      localStorage.getItem(key);

    if (token) {
      return token;
    }

  }


  // بررسی کلیدهای Supabase
  for (
    let i = 0;
    i < localStorage.length;
    i++
  ) {

    const key =
      localStorage.key(i);

    if (!key) continue;


    const raw =
      localStorage.getItem(key);

    if (!raw) continue;


    try {

      const data =
        JSON.parse(raw);


      if (
        data &&
        data.access_token
      ) {

        return data.access_token;

      }


      if (
        data &&
        data.currentSession &&
        data.currentSession.access_token
      ) {

        return data.currentSession.access_token;

      }

    } catch (error) {

      // JSON نبود، ادامه بده

    }

  }


  return null;

}


// ================================
// بررسی اولیه صفحه
// ================================

showMessage(
  "🎮 سکه‌چی آماده است."
);


// ================================
// شروع بازی
// ================================

if (startButton) {

  startButton.addEventListener(
    "click",
    function () {

      score = 0;

      playing = true;


      scoreEl.textContent = "0";


      target.disabled = false;

      saveButton.disabled = false;

      startButton.disabled = true;


      showMessage(
        "🎯 بازی شروع شد!"
      );

    }
  );

}


// ================================
// هدف بازی
// ================================

if (target) {

  target.addEventListener(
    "click",
    function () {

      if (!playing) {
        return;
      }


      score++;


      scoreEl.textContent =
        score.toLocaleString("fa-IR");

    }
  );

}


// ================================
// ذخیره نتیجه
// ================================

async function saveGame() {

  const token =
    getToken();


  if (!token) {

    showMessage(
      "⚠️ بازی انجام شد، اما ورود کاربر برای ذخیره لازم است."
    );

    saveButton.disabled = false;

    return;

  }


  saveButton.disabled = true;


  showMessage(
    "⏳ در حال ذخیره..."
  );


  try {

    const response =
      await fetch(
        GAME_URL,
        {
          method: "POST",

          headers: {

            "Content-Type":
              "application/json",

            "apikey":
              SUPABASE_KEY,

            "Authorization":
              "Bearer " + token

          },

          body: JSON.stringify({
            score: score
          })

       
