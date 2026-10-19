const menuItems = [
  {
    id: "sekretaris-gula-aren",
    name: "Sekretaris Gula Aren",
    category: "coffee",
    label: "SIGNATURE",
    description:
      "Espresso house blend, susu segar, dan manis gula aren yang akrab.",
    price: 28000,
    image:
      "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=82",
    alt: "Es kopi susu gula aren dalam gelas",
  },
  {
    id: "executive-americano",
    name: "Executive Americano",
    category: "coffee",
    label: "FAVORIT",
    description:
      "Kopi espresso ditambahkan air, kuat untuk menemani hari kerjamu.",
    price: 21000,
    image:
      "https://images.unsplash.com/photo-1611162458324-aae1eb4129a4?auto=format&fit=crop&w=900&q=82",
    alt: "Espresso hitam dalam cangkir putih ditambah air",
  },
  {
    id: "direktur-latte",
    name: "Direktur Latte",
    category: "coffee",
    label: "HOUSE BLEND",
    description:
      "Dua shot espresso dan susu steamed dengan tekstur yang silky.",
    price: 24000,
    image:
      "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=82",
    alt: "Seni latte art di atas kopi",
  },
  {
    id: "manual-brew",
    name: "Manual Brew",
    category: "coffee",
    label: "SINGLE ORIGIN",
    description:
      "Seduhan V60 dari biji pilihan Nusantara. Tanya barista soal beans hari ini.",
    price: 35000,
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=82",
    alt: "Alat seduh kopi manual di meja barista",
  },
  {
    id: "matcha-cloud",
    name: "Matcha Cloud",
    category: "non-coffee",
    label: "NON-KOPI",
    description:
      "Matcha pilihan Jepang, susu lembut, dan lapisan foam yang ringan.",
    price: 32000,
    image:
      "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=900&q=82",
    alt: "Minuman matcha latte dingin",
  },
  {
    id: "cokelat-kantor",
    name: "Cokelat Kantor",
    category: "non-coffee",
    label: "NON-KOPI",
    description:
      "Cokelat pekat yang diracik dengan susu segar. Hangat atau dingin, kamu pilih.",
    price: 30000,
    image:
      "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=900&q=82",
    alt: "Segelas minuman cokelat dengan es",
  },
  {
    id: "roti-panggang",
    name: "Roti Panggang Deadline",
    category: "food",
    label: "TEMAN NGOPI",
    description: "Roti panggang renyah dengan selai srikaya buatan dapur kami.",
    price: 24000,
    image:
      "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=900&q=82",
    alt: "Roti panggang untuk teman minum kopi",
  },
  {
    id: "salt-bread",
    name: "Salt Bread",
    category: "food",
    label: "FAVORIT",
    description:
      "Roti garam yang lembut didalam, renyah diluar. Cocok untuk teman minum kopi atau teh.",
    price: 18000,
    image:
      "https://images.unsplash.com/photo-1559811814-e2c57b5e69df?auto=format&fit=crop&w=900&q=82",
    alt: "Roti Garam dengan taburan garam diatasnya",
  },
];

const menuGrid = document.querySelector("#menu-grid");
const orderDialog = document.querySelector("#order-dialog");
const orderItems = new Map();
let activeCategory = "all";
let toastTimer;
const weatherEndpoint =
  "https://api.open-meteo.com/v1/forecast?latitude=-6.2886&longitude=106.7179&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code&timezone=Asia%2FJakarta";

function formatPrice(amount) {
  return `Rp${new Intl.NumberFormat("id-ID").format(amount)}`;
}

function renderMenu() {
  const visibleItems =
    activeCategory === "all"
      ? menuItems
      : menuItems.filter((item) => item.category === activeCategory);

  const cards = visibleItems.map((item) => {
    const card = document.createElement("article");
    card.className = "coffee-card menu-card";

    const imageWrap = document.createElement("div");
    imageWrap.className = "card-image-wrap";
    const image = document.createElement("img");
    image.className = "card-image";
    image.src = item.image;
    image.alt = item.alt;
    image.loading = "lazy";
    imageWrap.append(image);

    const badge = document.createElement("span");
    badge.className = "card-badge";
    badge.textContent = item.label;
    imageWrap.append(badge);

    const content = document.createElement("div");
    content.className = "card-content";
    const title = document.createElement("h3");
    title.className = "card-title";
    title.textContent = item.name;
    const description = document.createElement("p");
    description.className = "card-description";
    description.textContent = item.description;

    const bottomline = document.createElement("div");
    bottomline.className = "card-bottomline";
    const price = document.createElement("span");
    price.className = "card-price";
    price.textContent = formatPrice(item.price);
    const addButton = document.createElement("button");
    addButton.className = "add-button";
    addButton.type = "button";
    addButton.setAttribute("aria-label", `Tambah ${item.name} ke pesanan`);
    addButton.textContent = "＋ Tambah";
    addButton.addEventListener("click", () => addToOrder(item.id));
    bottomline.append(price, addButton);

    content.append(title, description, bottomline);
    card.append(imageWrap, content);
    return card;
  });

  menuGrid.replaceChildren(...cards);
}

function addToOrder(itemId) {
  orderItems.set(itemId, (orderItems.get(itemId) || 0) + 1);
  renderOrder();
  showToast(
    `${menuItems.find((item) => item.id === itemId).name} ditambahkan ke pesanan.`,
  );
}

function renderOrder() {
  const entries = [...orderItems.entries()];
  const quantity = entries.reduce((total, [, count]) => total + count, 0);
  const total = entries.reduce((sum, [itemId, count]) => {
    const item = menuItems.find((menuItem) => menuItem.id === itemId);
    return sum + item.price * count;
  }, 0);

  document.querySelector("#order-count").textContent = String(quantity);
  document.querySelector("#order-total").textContent = formatPrice(total);
  document.querySelector("#order-submit").disabled = quantity === 0;
  document.querySelector("#order-clear").disabled = quantity === 0;
  const rows = entries.map(([itemId, count]) => {
    const item = menuItems.find((menuItem) => menuItem.id === itemId);
    const row = document.createElement("div");
    row.className = "order-row";

    const info = document.createElement("div");
    const name = document.createElement("strong");
    name.textContent = item.name;
    const unit = document.createElement("span");
    unit.textContent = `${count} × ${formatPrice(item.price)}`;
    info.append(name, unit);

    const controls = document.createElement("div");
    controls.className = "quantity-controls";
    const decrease = document.createElement("button");
    decrease.type = "button";
    decrease.setAttribute("aria-label", `Kurangi ${item.name}`);
    decrease.textContent = "−";
    decrease.addEventListener("click", () => updateQuantity(itemId, -1));
    const quantity = document.createElement("span");
    quantity.textContent = String(count);
    const increase = document.createElement("button");
    increase.type = "button";
    increase.setAttribute("aria-label", `Tambah ${item.name}`);
    increase.textContent = "+";
    increase.addEventListener("click", () => updateQuantity(itemId, 1));
    controls.append(decrease, quantity, increase);
    row.append(info, controls);
    return row;
  });

  const container = document.querySelector("#order-items");
  if (rows.length === 0) {
    const empty = document.createElement("p");
    empty.className = "order-empty";
    empty.textContent = "Belum ada menu. Pilih yang kamu suka dari daftar.";
    container.replaceChildren(empty);
  } else {
    container.replaceChildren(...rows);
  }
}

function updateQuantity(itemId, change) {
  const nextQuantity = (orderItems.get(itemId) || 0) + change;
  if (nextQuantity <= 0) {
    orderItems.delete(itemId);
  } else {
    orderItems.set(itemId, nextQuantity);
  }
  renderOrder();
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(
    () => toast.classList.remove("is-visible"),
    2800,
  );
}

function getWeatherDescription(code) {
  if (code === 0) return "Cerah";
  if (code === 1) return "Cerah berawan";
  if (code === 2) return "Berawan sebagian";
  if (code === 3) return "Berawan";
  if (code === 45 || code === 48) return "Berkabut";
  if (code >= 51 && code <= 57) return "Gerimis";
  if (code >= 61 && code <= 67) return "Hujan";
  if (code >= 71 && code <= 77) return "Salju";
  if (code >= 80 && code <= 82) return "Hujan lokal";
  if (code === 85 || code === 86) return "Hujan salju";
  if (code >= 95 && code <= 99) return "Badai petir";
  return "Kondisi cuaca berubah";
}

function getWeatherAdvice(current) {
  const code = current.weather_code;
  const isWet =
    current.precipitation >= 0.2 ||
    (code >= 51 && code <= 67) ||
    (code >= 80 && code <= 82) ||
    (code >= 95 && code <= 99);

  if (isWet) {
    return {
      title: "Hujan di luar, hangat di dalam.",
      copy: "Cuaca basah paling pas ditemani minuman hangat. Pilihan ini diracik untuk bikin jedamu terasa nyaman.",
      itemIds: ["direktur-latte", "cokelat-kantor", "manual-brew"],
    };
  }

  if (current.apparent_temperature <= 24 || current.temperature_2m <= 23) {
    return {
      title: "Sejuk begini enaknya yang hangat.",
      copy: "Udara sejuk jadi alasan pas buat menikmati latte lembut atau cokelat hangat pelan-pelan.",
      itemIds: ["direktur-latte", "manual-brew", "cokelat-kantor"],
    };
  }

  return {
    title: "Lagi panas? Segarkan harimu.",
    copy: "Cuaca terasa hangat—coba kopi dingin yang ringan atau matcha segar buat nemenin aktivitasmu.",
    itemIds: ["sekretaris-gula-aren", "matcha-cloud", "cokelat-kantor"],
  };
}

function renderWeatherRecommendations(advice) {
  const container = document.querySelector("#weather-recommendations");
  const suggestions = advice.itemIds.map((itemId) => {
    const item = menuItems.find((menuItem) => menuItem.id === itemId);
    const row = document.createElement("article");
    row.className = "weather-suggestion";

    const info = document.createElement("div");
    const name = document.createElement("strong");
    name.textContent = item.name;
    const label = document.createElement("span");
    label.textContent = item.label;
    info.append(name, label);

    const action = document.createElement("div");
    action.className = "weather-suggestion-action";
    const price = document.createElement("span");
    price.textContent = formatPrice(item.price);
    const addButton = document.createElement("button");
    addButton.className = "weather-add-button";
    addButton.type = "button";
    addButton.setAttribute(
      "aria-label",
      `Tambah ${item.name} dari rekomendasi cuaca`,
    );
    addButton.textContent = "+";
    addButton.addEventListener("click", () => addToOrder(item.id));
    action.append(price, addButton);

    row.append(info, action);
    return row;
  });
  container.replaceChildren(...suggestions);
}

function showWeatherError(message) {
  document.querySelector("#weather-icon").textContent = "☁";
  document.querySelector("#weather-temperature").textContent = "--°";
  document.querySelector("#weather-status").textContent = "Cuaca gagal dimuat";
  document.querySelector("#weather-description").textContent =
    "Data cuaca sementara tidak tersedia";
  document.querySelector("#weather-meta").textContent =
    "Suhu dan kelembapan belum tersedia";
  document.querySelector("#weather-advice-title").textContent =
    "Belum bisa cek cuaca.";
  document.querySelector("#weather-advice-copy").textContent = message;
  document.querySelector("#weather-recommendations").replaceChildren();
  document.querySelector("#weather-updated").textContent =
    "Coba perbarui lagi beberapa saat.";
}

async function loadWeather() {
  const refreshButton = document.querySelector("#weather-refresh");
  const status = document.querySelector("#weather-status");
  refreshButton.disabled = true;
  refreshButton.classList.add("is-loading");
  status.textContent = "Mengambil data cuaca...";

  try {
    const response = await fetch(weatherEndpoint);
    if (!response.ok) {
      throw new Error(
        `Layanan cuaca merespons dengan kode ${response.status}.`,
      );
    }
    const data = await response.json();
    const current = data.current;
    const values = [
      current?.temperature_2m,
      current?.apparent_temperature,
      current?.relative_humidity_2m,
      current?.precipitation,
      current?.weather_code,
    ];
    if (!current || values.some((value) => !Number.isFinite(value))) {
      throw new Error("Format data cuaca yang diterima tidak lengkap.");
    }

    const description = getWeatherDescription(current.weather_code);
    const advice = getWeatherAdvice(current);
    const isRain =
      (current.weather_code >= 51 && current.weather_code <= 67) ||
      (current.weather_code >= 80 && current.weather_code <= 82) ||
      (current.weather_code >= 95 && current.weather_code <= 99);
    const isSnow =
      (current.weather_code >= 71 && current.weather_code <= 77) ||
      current.weather_code === 85 ||
      current.weather_code === 86;
    document.querySelector("#weather-icon").textContent =
      current.weather_code <= 1 ? "☀" : isRain ? "☂" : isSnow ? "❄" : "☁";
    document.querySelector("#weather-temperature").textContent =
      `${Math.round(current.temperature_2m)}°`;
    document.querySelector("#weather-description").textContent = description;
    document.querySelector("#weather-meta").textContent =
      `Terasa seperti ${Math.round(current.apparent_temperature)}° · Kelembapan ${current.relative_humidity_2m}%`;
    document.querySelector("#weather-advice-title").textContent = advice.title;
    document.querySelector("#weather-advice-copy").textContent = advice.copy;
    document.querySelector("#weather-updated").textContent =
      `Diperbarui ${new Intl.DateTimeFormat("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Jakarta",
      }).format(new Date(`${current.time}:00+07:00`))} WIB`;
    status.textContent = "Cuaca terkini";
    renderWeatherRecommendations(advice);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan yang tidak diketahui.";
    showWeatherError(
      `${message} Pastikan koneksi internet tersedia lalu coba lagi.`,
    );
  } finally {
    refreshButton.disabled = false;
    refreshButton.classList.remove("is-loading");
  }
}

document
  .querySelector("#weather-refresh")
  .addEventListener("click", loadWeather);

for (const button of document.querySelectorAll(".menu-category")) {
  button.addEventListener("click", () => {
    activeCategory = button.dataset.category;
    for (const categoryButton of document.querySelectorAll(".menu-category")) {
      const isActive = categoryButton === button;
      categoryButton.classList.toggle("is-active", isActive);
      categoryButton.setAttribute("aria-pressed", String(isActive));
    }
    renderMenu();
  });
}

document
  .querySelector("#order-open")
  .addEventListener("click", () => orderDialog.showModal());
document
  .querySelector("#dialog-close")
  .addEventListener("click", () => orderDialog.close());
orderDialog.addEventListener("click", (event) => {
  if (event.target === orderDialog) orderDialog.close();
});

document.querySelector("#order-clear").addEventListener("click", () => {
  orderItems.clear();
  renderOrder();
});

document.querySelector("#order-submit").addEventListener("click", () => {
  if (orderItems.size === 0) return;
  orderItems.clear();
  renderOrder();
  orderDialog.close();
  showToast("Terima kasih! Ini baru contoh alur pemesanan website.");
});

renderMenu();
renderOrder();
loadWeather();
