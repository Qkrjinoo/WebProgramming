// === API 키 ===
const OPENWEATHER_API_KEY = "ab5650daefb30bed00787559dd50297b";

// === 날씨 → 테마/플레이리스트 매핑 ===
const weatherMap = {
  Thunderstorm: { bg: "thunder-bg", pl: "37i9dQZF1DX0KpeLFwA3f0" },
  Drizzle: { bg: "rain-bg", pl: "37i9dQZF1DXbvABJXBIyiY" },
  Rain: { bg: "rain-bg", pl: "37i9dQZF1DXbvABJXBIyiY" },
  Snow: { bg: "snow-bg", pl: "37i9dQZF1DWUNIrSzKgQbP" },
  Clear: { bg: "clear-bg", pl: "37i9dQZF1DX1BzILRveYHb" },
  Clouds: { bg: "clouds-bg", pl: "37i9dQZF1DX2sUQwD7tbmL" },
  Mist: { bg: "mist-bg", pl: "37i9dQZF1DWTwnEm1IYyoj" },
  Smoke: { bg: "mist-bg", pl: "37i9dQZF1DWTwnEm1IYyoj" },
  Haze: { bg: "mist-bg", pl: "37i9dQZF1DWTwnEm1IYyoj" },
  Dust: { bg: "mist-bg", pl: "37i9dQZF1DWTwnEm1IYyoj" },
  Fog: { bg: "mist-bg", pl: "37i9dQZF1DWTwnEm1IYyoj" },
  Squall: { bg: "rain-bg", pl: "37i9dQZF1DXbvABJXBIyiY" },
  Tornado: { bg: "thunder-bg", pl: "37i9dQZF1DX0KpeLFwA3f0" },
};

// === 도우미 ===
function $(id) {
  return document.getElementById(id);
}
const MAX_HISTORY = 5;

// === 검색 히스토리 ===
function getHistory() {
  return JSON.parse(localStorage.getItem("searchHistory") || "[]");
}
function saveHistory(city) {
  let arr = getHistory().filter((c) => c !== city);
  arr.unshift(city);
  if (arr.length > MAX_HISTORY) arr = arr.slice(0, MAX_HISTORY);
  localStorage.setItem("searchHistory", JSON.stringify(arr));
}

function renderHistory() {
  const box = $("historyBox"),
    list = $("historyList");
  list.innerHTML = "";
  const arr = getHistory();
  if (!arr.length) {
    box.classList.add("hidden");
    return;
  }
  arr.forEach((city) => {
    const b = document.createElement("button");
    b.innerText = city;
    b.onclick = () => queryCity(city);
    list.appendChild(b);
  });
  box.classList.remove("hidden");
}

function showError(msg) {
  let box = document.getElementById("errorBox");
  if (!box) {
    box = document.createElement("div");
    box.id = "errorBox";
    document.body.appendChild(box);
  }
  box.innerText = msg;
  box.style.display = "block";
  setTimeout(() => (box.style.display = "none"), 4000);
}

// === API ===
async function fetchJson(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error("데이터를 가져올 수 없습니다");
  return r.json();
}
async function geocodeCity(city) {
  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
    city
  )}&limit=1&appid=${OPENWEATHER_API_KEY}`;
  const list = await fetchJson(url);
  if (!list.length) throw new Error("도시를 찾을 수 없습니다");
  return { lat: list[0].lat, lon: list[0].lon };
}
async function fetchWeatherByCoords(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=kr&appid=${OPENWEATHER_API_KEY}`;
  return fetchJson(url);
}
async function fetchWeatherByCity(city) {
  const { lat, lon } = await geocodeCity(city);
  return fetchWeatherByCoords(lat, lon);
}

// === UI ===
function updateUI(data) {
  $("cityName").innerText = `${data.name}, ${data.sys.country}`;
  $("description").innerText = data.weather[0].description;
  $("temp").innerText = `${data.main.temp.toFixed(
    1
  )}°C (체감 ${data.main.feels_like.toFixed(1)}°C)`;
  $(
    "icon"
  ).src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  $("weatherBox").classList.remove("hidden");

  const cond = data.weather[0].main;
  const m = weatherMap[cond] || {
    bg: "default-bg",
    pl: "37i9dQZF1DX1BzILRveYHb",
  };
  document.body.className = document.body.className.replace(
    /\b(\w+-bg)\b/g,
    ""
  );
  document.body.classList.add(m.bg);
  document.body.classList.remove("loading");

  $("playlist").src = `https://open.spotify.com/embed/playlist/${m.pl}`;
  $("musicSection").classList.remove("hidden");
  $("footnote").innerText = "Powered by OpenWeather & Spotify";
}

// === 핵심 기능 ===
async function queryCity(city) {
  if (!city) return;
  try {
    const data = await fetchWeatherByCity(city);
    updateUI(data);
    saveHistory(city);
    renderHistory();
  } catch (e) {
    showError(e.message);
  }
}

function initGeo() {
  if (!navigator.geolocation) {
    $("searchForm").classList.remove("hidden");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      try {
        const data = await fetchWeatherByCoords(
          pos.coords.latitude,
          pos.coords.longitude
        );
        updateUI(data);
      } catch (e) {
        showError(e.message);
        $("searchForm").classList.remove("hidden");
      }
    },
    () => {
      $("searchForm").classList.remove("hidden");
    }
  );
}

// === 이벤트 ===
$("searchForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const city = $("cityInput").value.trim();
  queryCity(city);
});

// === 시작 ===
document.addEventListener("DOMContentLoaded", () => {
  initGeo();
  renderHistory();
});
