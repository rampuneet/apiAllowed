const BASE = "/api";

let currentUser = JSON.parse(localStorage.getItem("user")) || {};

let toggle, toggleText;

/* INIT */
document.addEventListener("DOMContentLoaded", () => {
  toggle = document.querySelector("#toggleSwitch");
  toggleText = document.querySelector("#toggleText");

  toggle.addEventListener("change", () => {
    toggleText.innerText = toggle.checked ? "ON" : "OFF";

    // enable apply button only after interaction
    applyBtn.disabled = false;
  });

 if (currentUser && currentUser?.client) {
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

/* ================= REGISTER ================= */
registerBtn.onclick = async () => {
  const loader = regLoader;
  const text = regText;

  const clientVal = regClient.value.trim();
  const usernameVal = regUsername.value.trim();
  const passwordVal = regPassword.value.trim();
  const confirmVal = regConfirm.value.trim();

  if (!clientVal || !usernameVal || !passwordVal || !confirmVal) {
    return showMessage("registerMsg", "All fields required ❗");
  }

  if (passwordVal !== confirmVal) {
    return showMessage("registerMsg", "Passwords do not match ❌");
  }

  loader.style.display = "inline-block";
  text.innerText = "Registering...";
  registerBtn.disabled = true;

  try {
    const res = await fetch(BASE + "/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client: clientVal,
        username: usernameVal,
        password: passwordVal,
      }),
    });

    const raw = await res.text();

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      throw new Error("Invalid server response");
    }

    if (!res.ok) {
      throw new Error(data.message || `Server error (${res.status})`);
    }

    if (data.success) {
      currentUser = { client: clientVal, username: usernameVal };

      localStorage.setItem("user", JSON.stringify(currentUser));

      showMessage("registerMsg", "Registered successfully ✅", "success");

      setTimeout(showPanel, 600);

      // clear fields
      regClient.value = "";
      regUsername.value = "";
      regPassword.value = "";
      regConfirm.value = "";
    } else {
      showMessage("registerMsg", data.message || "Registration failed ❌");
    }
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    showMessage("registerMsg", err.message || "Something went wrong ❌");
  } finally {
    loader.style.display = "none";
    text.innerText = "Register";
    registerBtn.disabled = false;
  }
};

/* ================= LOGIN ================= */
loginBtn.onclick = async () => {
  const loaderEl = loader;
  const textEl = btnText;

  const clientVal = client.value.trim();
  const usernameVal = username.value.trim();
  const passwordVal = password.value.trim();

  if (!clientVal || !usernameVal || !passwordVal) {
    return showMessage("loginMsg", "All fields required ❗");
  }

  loaderEl.style.display = "inline-block";
  textEl.innerText = "Logging...";
  loginBtn.disabled = true;

  try {
    const res = await fetch(BASE + "/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client: clientVal,
        username: usernameVal,
        password: passwordVal,
      }),
    });

    const raw = await res.text();

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      throw new Error("Invalid server response");
    }

    if (!res.ok) {
      throw new Error(data.message || `Server error (${res.status})`);
    }

    if (data.success) {
      currentUser = { client: clientVal, username: usernameVal };

      localStorage.setItem("user", JSON.stringify(currentUser));

      showMessage("loginMsg", "Login successful ✅", "success");

      setTimeout(showPanel, 600);

      // clear fields
      client.value = "";
      username.value = "";
      password.value = "";
    } else {
      showMessage("loginMsg", data.message || "Invalid credentials ❌");
    }
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    showMessage("loginMsg", err.message || "Something went wrong ❌");
  } finally {
    loaderEl.style.display = "none";
    textEl.innerText = "Login";
    loginBtn.disabled = false;
  }
};

/* ================= PANEL ================= */
function showPanel() {
  hideAll();
  document.getElementById("panel").style.display = "block";

  setPanelTitle();
  loadStatus();
}

/* ================= STATUS ================= */
async function loadStatus() {
  const status = document.getElementById("apiStatus");

  status.innerText = "Loading...";
  status.style.color = "#facc15";

  try {
    const res = await fetch(`${BASE}/validate/${currentUser.client}`);

   if (!res.ok) {
     console.warn("API failed:", res.status);

     // fallback instead of throwing error
     toggle.checked = false;
     toggleText.innerText = "OFF";

     status.innerText = "API OFF";
     status.style.color = "#ef4444";

     applyBtn.disabled = true;

     return; // stop further execution
   }

    const data = await res.json();

    const isValid = data?.isValid === true;

    // ✅ sync UI
    toggle.checked = isValid;
    toggleText.innerText = isValid ? "ON" : "OFF";

    status.innerText = isValid ? "API ON" : "API OFF";
    status.style.color = isValid ? "#22c55e" : "#ef4444";

    // ✅ IMPORTANT FIX
    applyBtn.disabled = true;
  } catch (err) {
    console.error("LOAD STATUS ERROR:", err);

    // 🔥 Better fallback (instead of Error ❌)
    status.innerText = "API OFF";
    status.style.color = "#ef4444";

    toggle.checked = false;
    toggleText.innerText = "OFF";

    applyBtn.disabled = true;
  }
}

/* ================= APPLY ================= */
applyBtn.onclick = async () => {
  const status = document.getElementById("apiStatus");

  status.innerText = "Updating...";
  status.style.color = "#facc15";

  applyBtn.disabled = true;

  try {
    const res = await fetch(BASE + "/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client: currentUser.client,
        isValid: toggle.checked,
      }),
    });

    if (!res.ok) {
      throw new Error("Update failed");
    }

    const isValid = toggle.checked;

    status.innerText = isValid ? "API ON" : "API OFF";
    status.style.color = isValid ? "#22c55e" : "#ef4444";
  } catch (err) {
    console.error(err);
    status.innerText = "Error ❌";
    status.style.color = "red";
    applyBtn.disabled = false; // re-enable if failed
  }
};

/* ================= LOGOUT ================= */
logoutBtn.onclick = () => {
  localStorage.removeItem("user"); // cleaner than clear()
  currentUser = {};
  goBack();
};

/* ================= MESSAGE ================= */
function showMessage(id, text, type = "error") {
  const el = document.getElementById(id);

  el.innerText = text;
  el.className = `msg show ${type}`;

  setTimeout(() => {
    el.className = "msg";
    el.innerText = "";
  }, 1500);
}

/* ================= TITLE ================= */
function setPanelTitle() {
  const title = document.getElementById("panelTitle");
  const endpoint = document.getElementById("apiEndpoint");

  if (title) {
    title.innerText = `🚀 API Control - ${currentUser.client}`;
  }

  if (endpoint) {
    endpoint.innerText = `https://api-allowed.vercel.app/api/validate/${currentUser.client}`;
  }
}
