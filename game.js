const SUPABASE_URL =
  "https://evvdggckoalesyyyqhqm.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_fkx37LxzP3Lb1q2HNxsoKw_6oTDNLUl";

const GAME_URL =
  `${SUPABASE_URL}/functions/v1/sekkechi-game`;

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
// دریافت Session
// ================================

async function getSession() {

  try {

    const response = await fetch(
      `${SUPABASE_URL}/auth/v1/user`,
      {
        headers: {
          apikey: SUPABASE_KEY
        }
      }
    );

    return response.ok;

  } catch (error) {

    console.error(error);

    return false;

  }
}


// ================================
// دریافت Token
// ================================

function getAccessToken() {

  return (
    localStorage.getItem("supabase_access_token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("sb-access-token")
  );

}


// ================================
// پیام
// ================================

function showMessage(text) {

  if (message) {
    message.textContent = text;
  }

}


// ================================
// شروع بازی
// ================================

startButton.addEventListener(
  "click",
  async () => {

    const token = getAccessToken();

    if (!token) {

      showMessage(
        "❌ ابتدا وارد حساب کاربری شوید."
      );

      return;
    }

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


// ================================
// کلیک روی هدف
// ================================

target.addEventListener(
  "click",
  () => {

    if (!playing) {
      return;
    }

    score++;

    scoreEl.textContent =
      score.toLocaleString("fa-IR");

  }
);


// ================================
// ذخیره بازی
// ================================

async function saveGame() {

  const token = getAccessToken();

  if (!token) {

    showMessage(
      "❌ کاربر وارد نشده است."
    );

    saveButton.disabled = false;

    return;

  }


  saveButton.disabled = true;

  showMessage(
    "⏳ در حال ذخیره نتیجه..."
  );


  try {

    const response = await fetch(
      GAME_URL,
      {
        method: "POST",

        headers: {

          "Content-Type":
            "application/json",

          "apikey":
            SUPABASE_KEY,

          "Authorization":
            `Bearer ${token}`

        },

        body: JSON.stringify({
          score: score
        })

      }
    );


    const result =
      await response.json();


    console.log(
      "Sekkechi result:",
      result
    );


    if (
      !response.ok ||
      !result.ok
    ) {

      throw new Error(
        result.error ||
        "ذخیره بازی انجام نشد"
      );

    }


    // ==========================
    // موفقیت
    // ==========================

    coinsEl.textContent =
      Number(
        result.coin_balance
      ).toLocaleString("fa-IR");


    score = 0;

    scoreEl.textContent = "0";

    playing = false;

    target.disabled = true;

    startButton.disabled = false;


    showMessage(
      `✅ بازی ذخیره شد | ` +
      `+${result.coins_earned} 🪙 | ` +
      `موجودی: ${result.coin_balance} 🪙 | ` +
      `سطح ${result.level}`
    );


  } catch (error) {

    console.error(
      "Game save error:",
      error
    );


    showMessage(
      "❌ " +
      (
        error.message ||
        "خطا در ذخیره بازی"
      )
    );


    saveButton.disabled = false;

  }

}


// ================================
// پایان و ذخیره
// ================================

saveButton.addEventListener(
  "click",
  async () => {

    if (!playing || score <= 0) {

      showMessage(
        "ابتدا بازی کنید و امتیاز بگیرید."
      );

      return;

    }


    playing = false;

    target.disabled = true;


    await saveGame();

  }
);
