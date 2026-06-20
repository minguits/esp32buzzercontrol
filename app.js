  import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
  import {
    getAuth,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
  } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
  import {
    getDatabase,
    ref,
    set,
    onValue
  } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

  //  Replace With YOUR Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyA14eMUrW8_O8EfYD9wAw991ErIhu11jY8",
  authDomain: "esp32-buzzer-c7e26.firebaseapp.com",
  databaseURL: "https://esp32-buzzer-c7e26-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "esp32-buzzer-c7e26",
  storageBucket: "esp32-buzzer-c7e26.firebasestorage.app",
  messagingSenderId: "873054574201",
  appId: "1:873054574201:web:01b59e5a8d6e37053126a8",
};

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const auth = getAuth();
  const db = getDatabase(app);

  // UI elements
  const authBox = document.getElementById("authBox");
  const controlBox = document.getElementById("controlBox");
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const authMsg = document.getElementById("authMsg");
  const badge = document.getElementById("statusBadge");

  const gpioButtons = {
    gpio1: document.getElementById("gpio1Btn"),
    gpio2: document.getElementById("gpio2Btn"),
    gpio3: document.getElementById("gpio3Btn")
  };

  const gpioLabels = {
    gpio1: document.getElementById("gpio1Status"),
    gpio2: document.getElementById("gpio2Status"),
    gpio3: document.getElementById("gpio3Status")
  };

  // Login
  loginBtn.onclick = async () => {
    authMsg.textContent = "";
    try {
      await signInWithEmailAndPassword(
        auth,
        document.getElementById("emailField").value,
        document.getElementById("passwordField").value
      );
    } catch (e) {
      authMsg.textContent = e.message;
    }
  };

  logoutBtn.onclick = () => signOut(auth);

  // Auth state monitor
  onAuthStateChanged(auth, (user) => {
    if (user) {
      authBox.style.display = "none";
      controlBox.style.display = "block";
      badge.className = "status-badge online";
      badge.textContent = "Online";
      startListeners();
    } else {
      authBox.style.display = "block";
      controlBox.style.display = "none";
      badge.className = "status-badge offline";
      badge.textContent = "Offline";
    }
  });

  // Listen to DB
  function startListeners() {
    ["gpio1", "gpio2"].forEach((key) => {
      onValue(ref(db, "/" + key), (snapshot) => {
        let value = snapshot.val() ? 1 : 0;
        updateUI(key, value);
      });
    });

    // Button click
    Object.values(gpioButtons).forEach((btn) => {
      btn.onclick = () => {
        let gpio = btn.dataset.gpio;
        let newState = btn.classList.contains("on") ? 0 : 1;
        set(ref(db, "/" + gpio), newState);
      };
    });
  }

  // Update UI
  function updateUI(key, val) {
    let btn = gpioButtons[key];
    let lab = gpioLabels[key];

    if (val === 1) {
      btn.classList.add("on");
      lab.textContent = "Status: ON";
      lab.style.color = "#9effae";
    } else {
      btn.classList.remove("on");
      lab.textContent = "Status: OFF";
      lab.style.color = "#d1d1d1";
    }
  }
