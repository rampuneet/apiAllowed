const BASE = "/api";

let token = localStorage.getItem("token") || "";
let currentUser = JSON.parse(localStorage.getItem("user")) || {};

let toggle, toggleText;

/* INIT AFTER DOM LOAD */
document.addEventListener("DOMContentLoaded", () => {
  toggle = document.querySelector("#toggleSwitch");
  toggleText = document.querySelector("#toggleText");

  if (token && currentUser?.client) {
    showPanel();
  }
});

/* NAVIGATION */
function hideAll() {
  document.getElementById("landingScreen").style.display = "none";
  document.getElementById("registerBox").style.display = "none";
  document.getElementById("loginBox").style.display = "none";
  document.getElementById("panel").style.display = "none";
}

function openRegister() {
  hideAll();
  document.getElementById("registerBox").style.display = "block";
}

function openLogin() {
  hideAll();
  document.getElementById("loginBox").style.display = "block";
}

function goBack() {
  hideAll();
  document.getElementById("landingScreen").style.display = "block";
}

/* REGISTER */
registerBtn.onclick = async () => {
  const loader = regLoader;
  const text = regText;

  const clientVal = regClient.value.trim();
  const usernameVal = regUsername.value.trim();
  const passwordVal = regPassword.value.trim();
  const confirmVal = regConfirm.value.trim();

  if (!clientVal || !usernameVal || !passwordVal || !confirmVal) {
    showMessage("registerMsg", "All fields required ❗");
    return;
  }

  if (passwordVal !== confirmVal) {
    showMessage("registerMsg", "Passwords do not match ❌");
    return;
  }

  loader.style.display = "inline-block";
  text.innerText = "Registering...";

  try {
    const res = await fetch(BASE + "/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client: clientVal,
        username: usernameVal,
        password: passwordVal,
      }),
    });

    if (!res.ok) throw new Error("Server error");

    const data = await res.json();

    if (data.success) {
      token = data.token;
      currentUser = { client: clientVal, username: usernameVal };

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(currentUser));

      showMessage("registerMsg", "Registered successfully ✅", "success");

      setTimeout(showPanel, 700);

      // ✅ clear inputs
      regClient.value = "";
      regUsername.value = "";
      regPassword.value = "";
      regConfirm.value = "";
    } else {
      showMessage("registerMsg", data.message || "Registration failed ❌");
    }
  } catch {
    showMessage("registerMsg", "Network issue ⚠️");
  } finally {
    loader.style.display = "none";
    text.innerText = "Register";
  }
};

/* LOGIN */
loginBtn.onclick = async () => {
  const loaderEl = loader;
  const textEl = btnText;

  const clientVal = client.value.trim();
  const usernameVal = username.value.trim();
  const passwordVal = password.value.trim();

  if (!clientVal || !usernameVal || !passwordVal) {
    showMessage("loginMsg", "All fields required ❗");
    return;
  }

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

    if (!res.ok) throw new Error();

    const data = await res.json();

    if (data.success) {
      token = data.token;
      currentUser = { client: clientVal, username: usernameVal };

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(currentUser));

      showMessage("loginMsg", "Login successful ✅", "success");

      setTimeout(showPanel, 600);

      // ✅ clear inputs
      client.value = "";
      username.value = "";
      password.value = "";
    } else {
      showMessage("loginMsg", data.message || "Invalid credentials ❌");
    }
  } catch {
    showMessage("loginMsg", "Network issue ⚠️");
  } finally {
    loaderEl.style.display = "none";
    textEl.innerText = "Login";
    loginBtn.disabled = false;
  }
};

/* PANEL */
function showPanel() {
  hideAll();
  document.getElementById("panel").style.display = "block";

  setPanelTitle(); // 🔥 FIXED
  loadStatus();
}

/* STATUS */
async function loadStatus() {
  const status = document.getElementById("apiStatus");

  status.innerText = "Loading...";
  status.style.color = "#facc15";

  try {
    const res = await fetch(BASE + "/check", {
      headers: { Authorization: token },
    });

    const data = await res.json();

    if (!data.success) return;

    toggle.checked = data.isValid;
    toggleText.innerText = data.isValid ? "ON" : "OFF";

    status.innerText = data.isValid ? "API ON" : "API OFF";
    status.style.color = data.isValid ? "#22c55e" : "#ef4444";
  } catch {
    status.innerText = "Error";
    status.style.color = "red";
  }
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

  status.innerText = toggle.checked ? "API ON" : "API OFF";
  status.style.color = toggle.checked ? "#22c55e" : "#ef4444";
};

/* LOGOUT */
logoutBtn.onclick = () => {
  localStorage.clear();
  token = "";
  currentUser = {};
  goBack();
};

/* MESSAGE */
function showMessage(id, text, type = "error") {
  const el = document.getElementById(id);

  el.innerText = text;
  el.className = `msg show ${type}`;

  setTimeout(() => {
    el.className = "msg";
    el.innerText = "";
  }, 1000);
}

/* PANEL TITLE */
function setPanelTitle() {
  const title = document.getElementById("panelTitle");
  const endpoint = document.getElementById("apiEndpoint");

  if (!title) return;

  if (title) {
    title.innerText = currentUser?.client
      ? `🚀 API Control - ${currentUser.client}`
      : "🚀 API Control";
  }
  
  // ✅ SET API URL
  if (endpoint && currentUser?.client) {
    const url = `https://api-allowed.vercel.app/api/validate/${currentUser.client}`;
    endpoint.innerText = url;
  }
}
