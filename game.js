const SUPABASE_URL =
  "https://evvdggckoalesyyyqhqm.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_fkx37LxzP3Lb1q2HNxsoKw_6oTDNLUl";

const GAME_URL =
  `${SUPABASE_URL}/functions/v1/sekkechi-game`;


const coinsEl =
  document.getElementById("coins");

const energyEl =
  document.getElementById("energy");

const scoreEl =
  document.getElementById("score");

const target =
  document.getElementById("target");

const startButton =
  document.getElementById("startButton");

const saveButton =
  document.getElementById("saveButton");

const message =
  document.getElementById("gameMessage");


let score = 0;
let playing = false;


// --------------------------------
// دریافت Token کاربر
// --------------------------------

function getAccessToken() {

  return localStorage.getItem(
    "supabase_access_token"
  );

}


// --------------------------------
// نمایش پیام
// --------------------------------

function showMessage(text) {

  message.textContent = text;

}


// --------------------------------
// شروع بازی
// --------------------------------

startButton.addEventListener(
  "click",
  () => {

    const token =
      getAccessToken();

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


// --------------------------------
// کلیک روی هدف
// --------------------------------

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


// --------------------------------
// ذخیره نتیجه
// --------------------------------

async function saveGame() {

  const token =
    getAccessToken();


  if (!token) {

    showMessage(
      "❌ کاربر وارد نشده است."
    );

    return;
  }


  saveButton.disabled = true;


  showMessage(
    "⏳ در حال ذخیره نتیجه..."
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
              `Bearer ${token}`

          },

          body: JSON.stringify({
            score: score
          })

        }
      );


    const result =
      await response.json();


    if (
      !response.ok ||
      !result.ok
    ) {

      throw new Error(
        result.error ||
        "ذخیره بازی انجام نشد"
      );

    }


    // موجودی جدید
    coinsEl.textContent =
      Number(
        result.coin_balance
      ).toLocaleString("fa-IR");


    // امتیاز صفر شود
    score = 0;

    scoreEl.textContent = "0";


    playing = false;

    target.disabled = true;

    startButton.disabled = false;


    showMessage(
      `✅ بازی ذخیره شد | ` +
      `+${result.coins_earned} 🪙 | ` +
      `سطح ${result.level}`
    );


  } catch (error) {

    console.error(error);


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


// --------------------------------
// دکمه پایان
// --------------------------------

saveButton.addEventListener(
  "click",
  async () => {

    if (!playing && score === 0) {

      showMessage(
        "ابتدا یک بازی انجام دهید."
      );

      return;
    }


    playing = false;

    target.disabled = true;


    await saveGame();

  }
);
