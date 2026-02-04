//State
let currentRequest = null;
let cache = {};
let requestId = 0;

//DOM
const searchInput = document.getElementById("searchInput");
const statusText = document.getElementById("statusText");
const result = document.getElementById("result");

//Data
async function fetchCryptoPrice(coin) {
  const currentId = ++requestId;
  result.innerHTML = "";

  if (cache[coin]) {
    renderPrice(coin, cache[coin]);
    return;
  }

  try {
    statusText.textContent = "Fetching price...";
    result.innerHTML = "";

    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`
    );

    if (currentId !== requestId) return;

    if (!res.ok) throw new Error("Network error");

    const data = await res.json();

    if (!data[coin]) {
      throw new Error("Coin not found");
    }

    const price = data[coin].usd;
    cache[coin] = price;

    if (coin.length < 2) return;

    renderPrice(coin, price);
  } catch (err) {
    if (currentId === requestId) {
      statusText.textContent = err.message;
    }
  }
}

//Utils
function debounce(fn, delay = 500) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

function formatPrice(price) {
  return price.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

//Render
function renderPrice(name, price) {
  statusText.textContent = "";
  result.innerHTML = `<p>${name.toUpperCase()}: ${formatPrice(price)}</p>`;
}

//Events
const debouncedSearch = debounce((value) => {
  if (value) fetchCryptoPrice(value);
}, 600);

searchInput.addEventListener("input", (e) => {
  const value = e.target.value.trim().toLowerCase();

  if (!value) {
    statusText.textContent = "";
    result.innerHTML = "";
    return;
  }

  debouncedSearch(value);
});
