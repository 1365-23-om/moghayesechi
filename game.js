const SUPABASE_URL = "https://evvdggckoalesyyyqhqm.supabase.co";

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
// پیدا کردن توکن کاربر
// ================================

function getToken() {

  const keys = [
    "supabase_access_token",
    "access_token",
    "sb-access-token"
  ];


  for (const key of keys) {

    const value =
      localStorage.getItem(key);

    if (value) {
      return value;
    }

  }


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


      if (data?.access_token) {

        return data.access_token;

      }


      if (
        data?.currentSession?.access_token
      ) {

        return data.currentSession.access_token;

      }


      if (
        data?.session?.access_token
      ) {

        return data.session.access_token;

      }

    } catch (_) {}

  }


  return null;

}


// ================================
// شروع بازی
// ================================

function startGame() {

  score = 0;

  playing = true;


 
