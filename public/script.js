const BASE = "https://api-allowed.vercel.app";

let token = localStorage.getItem("token") || "";
let currentUser = JSON.parse(localStorage.getItem("user")) || {};

const toggle = document.querySelector("#toggleSwitch");
const toggleText = document.querySelector("#toggleText");

/* AUTO LOGIN */
window.onload = () => {
  if (token) showPanel();
};

/* NAVIGATION */
function hideAll() {
  landingScreen.style.display = "none";
  registerBox.style.display = "none";
  loginBox.style.display = "none";
  panel.style.display = "none";
}

function openRegister() {
  hideAll();
  registerBox.style.display = "block";
}

function openLogin() {
  hideAll();
  loginBox.style.display = "block";
}

function goBack() {
  hideAll();
  landingScreen.style.display = "block";
}

/* REGISTER */
registerBtn.onclick = async () => {
  const loader = regLoader;
  const text = regText;

  const client = regClient.value.trim();
  const username = regUsername.value.trim();
  const password = regPassword.value.trim();
  const confirm = regConfirm.value.trim();

  // ✅ 1. VALIDATION
  if (!client || !username || !password || !confirm) {
    showMessage("registerMsg", "All fields required❗");
    return;
  }

  if (password !== confirm) {
    showMessage("registerMsg", "Passwords do not match ❌");
    return;
  }

  // ✅ START LOADER
  loader.style.display = "inline-block";
  text.innerText = "Registering...";

  try {
    const res = await fetch(BASE + "/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client, username, password }),
    });

    // ✅ HANDLE HTTP ERROR
    if (!res.ok) {
      throw new Error("Server error");
    }

    const data = await res.json();

    // ✅ SUCCESS
    if (data.success) {
      token = data.token;
      currentUser = { client, username };

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(currentUser));

      showMessage("registerMsg", "Registered successfully ✅", "success");

      setTimeout(() => {
        showPanel();
      }, 800);
    } else {
      // ✅ BACKEND ERROR MESSAGE (if exists)
      showMessage("registerMsg", data.message || "Registration failed ❌");
    }
  } catch (err) {
    console.error(err);

    // ✅ NETWORK / SERVER ERROR
    showMessage("registerMsg", "Network issue ⚠️ Try again");
  } finally {
    // ✅ ALWAYS RESET UI
    loader.style.display = "none";
    text.innerText = "Register";
  }
};

/* LOGIN */
loginBtn.onclick = async () => {
  const loaderEl = loader; // your #loader span
  const textEl = btnText; // your #btnText span

  const clientVal = client.value.trim();
  const usernameVal = username.value.trim();
  const passwordVal = password.value.trim();

  // ✅ 1) VALIDATION
  if (!clientVal || !usernameVal || !passwordVal) {
    showMessage("loginMsg", "All fields required ❗");
    return;
  }

  // ✅ START LOADER
  loaderEl.style.display = "inline-block";
  textEl.innerText = "Logging...";
  loginBtn.disabled = true;

  try {
    const res = await fetch(BASE + "/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client: clientVal,
        username: usernameVal,
        password: passwordVal,
      }),
    });

    // ✅ 2) HANDLE HTTP ERROR
    if (!res.ok) {
      throw new Error("Server error");
    }

    const data = await res.json();

    // ✅ 3) SUCCESS / FAIL
    if (data.success) {
      token = data.token;
      currentUser = { client: clientVal, username: usernameVal };

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(currentUser));

      showMessage("loginMsg", "Login successful ✅", "success");

      // small delay so user sees success
      setTimeout(() => {
        showPanel();
      }, 700);
    } else {
      showMessage("loginMsg", data.message || "Invalid credentials ❌");
    }
  } catch (err) {
    console.error(err);

    // ✅ 4) NETWORK / SERVER ERROR
    showMessage("loginMsg", "Network issue ⚠️ Try again");
  } finally {
    // ✅ 5) ALWAYS RESET UI
    loaderEl.style.display = "none";
    textEl.innerText = "Login";
    loginBtn.disabled = false;
  }
};

/* PANEL */
function showPanel() {
  hideAll();
  panel.style.display = "block";
  loadStatus();
}

/* STATUS */
async function loadStatus() {
  const status = document.getElementById("apiStatus");

  status.innerText = "Loading...";
  status.style.color = "#facc15";

  const res = await fetch(BASE + "/check", {
    headers: { Authorization: token },
  });

  const data = await res.json();

  if (!data.success) return;

  const isValid = data.isValid;

  toggle.checked = isValid;
  toggleText.innerText = isValid ? "ON" : "OFF";

  status.innerText = isValid ? "API ON" : "API OFF";
  status.style.color = isValid ? "#22c55e" : "#ef4444";
}

/* APPLY */
applyBtn.onclick = async () => {
  const status = document.getElementById("apiStatus");

  status.innerText = "Updating...";
  status.style.color = "#facc15";

  await fetch(BASE + "/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({
      client: currentUser.client,
      username: currentUser.username,
      isValid: toggle.checked,
    }),
  });

  const isValid = toggle.checked;

  status.innerText = isValid ? "API ON" : "API OFF";
  status.style.color = isValid ? "#22c55e" : "#ef4444";
};

/* LOGOUT */
logoutBtn.onclick = () => {
  localStorage.clear();
  token = "";
  currentUser = {};
  goBack();
};

function showMessage(elementId, text, type = "error") {
  const el = document.getElementById(elementId);

  el.innerText = text;
  el.className = `msg show ${type}`;

  setTimeout(() => {
    el.className = "msg";
    el.innerText = "";
  }, 1000);
}