/* ==========================================================================
   FILE: script.js
   Semua fitur interaktif website ada di sini, dibagi per bagian dengan
   komentar supaya mudah dipahami dan dimodifikasi.
   ========================================================================== */
 
/* ==========================================================================
   0. DATA — UBAH BAGIAN INI UNTUK MENGGANTI HARGA / NOMOR WHATSAPP
   ========================================================================== */
 
// Ganti nomor WhatsApp toko di sini (format: 62 diikuti nomor tanpa angka 0 di depan)
const NOMOR_WHATSAPP_TOKO = "628XXXXXXXXXX";
 
// Daftar produk Top Up Genesis Crystal. Tambah/ubah/hapus item sesuka Anda.
const daftarTopUp = [
  { id: "tu1", nama: "60 Genesis Crystal", harga: 15000 },
  { id: "tu2", nama: "300 + 30 Genesis Crystal", harga: 65000 },
  { id: "tu3", nama: "980 + 110 Genesis Crystal", harga: 190000 },
  { id: "tu4", nama: "1.980 + 260 Genesis Crystal", harga: 380000 },
  { id: "tu5", nama: "3.280 + 600 Genesis Crystal", harga: 620000 },
  { id: "tu6", nama: "6.480 + 1.600 Genesis Crystal", harga: 1200000 },
];
 
// Daftar harga joki eksplorasi per region.
// Struktur: setiap region punya 4 tingkat harga sesuai rentang persentase.
// tingkat 1 = 0-25%, tingkat 2 = 26-50%, tingkat 3 = 51-75%, tingkat 4 = 76-100%
const daftarHargaJoki = {
  Mondstadt: [10000, 20000, 30000, 45000],
  Liyue: [15000, 30000, 45000, 60000],
  Inazuma: [20000, 40000, 60000, 80000],
  Sumeru: [25000, 50000, 75000, 100000],
  Fontaine: [25000, 50000, 75000, 100000],
  Natlan: [30000, 60000, 90000, 120000],
};
 
// Pilihan persentase yang tersedia di kalkulator (kelipatan 5%)
const pilihanPersentase = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];
 
 
/* ==========================================================================
   1. HELPER — FORMAT HARGA KE RUPIAH
   ========================================================================== */
function formatRupiah(angka) {
  return "Rp" + angka.toLocaleString("id-ID");
}
 
// Menentukan tingkat harga (0-3) berdasarkan persentase eksplorasi
function getTingkatHarga(persentase) {
  if (persentase <= 25) return 0;
  if (persentase <= 50) return 1;
  if (persentase <= 75) return 2;
  return 3;
}
 
// Menghitung estimasi biaya joki berdasarkan region, eksplorasi awal, dan target.
// Logika: kita ambil selisih antara harga di tingkat target dan tingkat awal.
// Jika target sama atau lebih rendah dari awal, biaya dianggap 0.
function hitungEstimasiJoki(region, awal, target) {
  const hargaPerTingkat = daftarHargaJoki[region];
  if (!hargaPerTingkat) return 0;
  if (target <= awal) return 0;
 
  const tingkatAwal = getTingkatHarga(awal);
  const tingkatTarget = getTingkatHarga(target);
 
  // Jika masih di tingkat yang sama, hitung proporsional dari harga tingkat tsb.
  if (tingkatAwal === tingkatTarget) {
    const persenTingkat = target - awal; // rentang persentase yang dikerjakan
    const totalHargaTingkat = hargaPerTingkat[tingkatTarget];
    return Math.round((persenTingkat / 25) * totalHargaTingkat);
  }
 
  // Jika berbeda tingkat, jumlahkan harga penuh setiap tingkat yang dilewati,
  // lalu sesuaikan proporsi pada tingkat awal dan tingkat akhir.
  let total = 0;
 
  // Sisa persen pada tingkat awal yang belum dikerjakan
  const batasAtasTingkatAwal = (tingkatAwal + 1) * 25;
  const sisaPersenTingkatAwal = batasAtasTingkatAwal - awal;
  total += (sisaPersenTingkatAwal / 25) * hargaPerTingkat[tingkatAwal];
 
  // Tambahkan harga penuh tingkat-tingkat di antaranya
  for (let t = tingkatAwal + 1; t < tingkatTarget; t++) {
    total += hargaPerTingkat[t];
  }
 
  // Tambahkan porsi persen pada tingkat target
  const batasBawahTingkatTarget = tingkatTarget * 25;
  const persenDiTingkatTarget = target - batasBawahTingkatTarget;
  total += (persenDiTingkatTarget / 25) * hargaPerTingkat[tingkatTarget];
 
  return Math.round(total);
}
 
 
/* ==========================================================================
   2. NAVBAR — STICKY STYLE & HAMBURGER MENU MOBILE
   ========================================================================== */
const navbar = document.getElementById("navbar");
const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("navMenu");
 
// Tambah bayangan/background lebih gelap saat halaman discroll
window.addEventListener("scroll", () => {
  if (window.scrollY > 20) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});
 
// Buka/tutup menu mobile saat tombol hamburger ditekan
hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("open");
  navMenu.classList.toggle("open");
});
 
// Tutup menu mobile otomatis saat salah satu link diklik
document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    hamburger.classList.remove("open");
    navMenu.classList.remove("open");
  });
});
 
 
/* ==========================================================================
   3. RENDER PRODUK TOP UP (GRID)
   ========================================================================== */
const topupGrid = document.getElementById("topupGrid");
 
function renderTopupGrid() {
  topupGrid.innerHTML = daftarTopUp
    .map(
      (produk) => `
      <div class="product-card reveal">
        <i class="fa-solid fa-gem product-icon"></i>
        <div class="product-name">${produk.nama}</div>
        <div class="product-price">${formatRupiah(produk.harga)}</div>
        <button class="btn btn-primary btn-block" data-produk-id="${produk.id}">
          Beli Sekarang
        </button>
      </div>
    `
    )
    .join("");
 
  // Pasang event listener ke setiap tombol "Beli Sekarang" yang baru dibuat
  topupGrid.querySelectorAll("button[data-produk-id]").forEach((btn) => {
    btn.addEventListener("click", () => bukaModal(btn.dataset.produkId));
  });
}
 
 
/* ==========================================================================
   4. RENDER TABEL HARGA JOKI
   ========================================================================== */
const priceTableBody = document.querySelector("#priceTable tbody");
 
function renderTabelHarga() {
  priceTableBody.innerHTML = Object.entries(daftarHargaJoki)
    .map(
      ([region, harga]) => `
      <tr>
        <td>${region}</td>
        <td>${formatRupiah(harga[0])}</td>
        <td>${formatRupiah(harga[1])}</td>
        <td>${formatRupiah(harga[2])}</td>
        <td>${formatRupiah(harga[3])}</td>
      </tr>
    `
    )
    .join("");
}
 
 
/* ==========================================================================
   5. KALKULATOR HARGA JOKI
   ========================================================================== */
const calcRegion = document.getElementById("calcRegion");
const calcStart = document.getElementById("calcStart");
const calcTarget = document.getElementById("calcTarget");
const calcPrice = document.getElementById("calcPrice");
const btnOrderJoki = document.getElementById("btnOrderJoki");
 
// Isi dropdown region berdasarkan data daftarHargaJoki
function isiDropdownRegion() {
  calcRegion.innerHTML = Object.keys(daftarHargaJoki)
    .map((region) => `<option value="${region}">${region}</option>`)
    .join("");
}
 
// Isi dropdown persentase (dipakai untuk eksplorasi awal & target)
function isiDropdownPersentase(selectEl, nilaiTerpilih) {
  selectEl.innerHTML = pilihanPersentase
    .map((p) => `<option value="${p}" ${p === nilaiTerpilih ? "selected" : ""}>${p}%</option>`)
    .join("");
}
 
// Update tampilan estimasi harga setiap ada perubahan pilihan
function updateEstimasiHarga() {
  const region = calcRegion.value;
  const awal = parseInt(calcStart.value, 10);
  const target = parseInt(calcTarget.value, 10);
 
  const estimasi = hitungEstimasiJoki(region, awal, target);
  calcPrice.textContent = formatRupiah(estimasi);
}
 
calcRegion.addEventListener("change", updateEstimasiHarga);
calcStart.addEventListener("change", updateEstimasiHarga);
calcTarget.addEventListener("change", updateEstimasiHarga);
 
// Tombol "Pesan Joki via WhatsApp"
btnOrderJoki.addEventListener("click", () => {
  const region = calcRegion.value;
  const awal = calcStart.value;
  const target = calcTarget.value;
  const estimasi = calcPrice.textContent;
 
  // Minta nama, UID, dan server pemesan lewat prompt sederhana
  const nama = prompt("Masukkan nama Anda:");
  if (!nama) return;
  const uid = prompt("Masukkan UID Genshin Impact Anda:");
  if (!uid) return;
  const server = prompt("Masukkan server (Asia/America/Europe/TW-HK-MO):");
  if (!server) return;
 
  const pesan =
    `Halo, saya ingin memesan Joki Eksplorasi:\n\n` +
    `Nama: ${nama}\n` +
    `UID: ${uid}\n` +
    `Server: ${server}\n` +
    `Region: ${region}\n` +
    `Eksplorasi Awal: ${awal}%\n` +
    `Target Eksplorasi: ${target}%\n` +
    `Estimasi Harga: ${estimasi}\n\n` +
    `Mohon konfirmasinya. Terima kasih!`;
 
  bukaWhatsApp(pesan);
});
 
 
/* ==========================================================================
   6. MODAL PEMESANAN TOP UP
   ========================================================================== */
const modalOverlay = document.getElementById("modalOverlay");
const modalClose = document.getElementById("modalClose");
const modalProductName = document.getElementById("modalProductName");
const inputNominal = document.getElementById("inputNominal");
const orderForm = document.getElementById("orderForm");
 
let produkTerpilih = null;
 
// Isi dropdown nominal di dalam form modal
function isiDropdownNominal() {
  inputNominal.innerHTML = daftarTopUp
    .map((p) => `<option value="${p.id}">${p.nama} - ${formatRupiah(p.harga)}</option>`)
    .join("");
}
 
// Buka modal dan set produk yang dipilih dari tombol "Beli Sekarang"
function bukaModal(produkId) {
  produkTerpilih = daftarTopUp.find((p) => p.id === produkId);
  if (!produkTerpilih) return;
 
  modalProductName.textContent = `${produkTerpilih.nama} - ${formatRupiah(produkTerpilih.harga)}`;
  inputNominal.value = produkTerpilih.id;
 
  modalOverlay.classList.add("active");
  document.body.style.overflow = "hidden"; // kunci scroll di belakang modal
}
 
// Tutup modal
function tutupModal() {
  modalOverlay.classList.remove("active");
  document.body.style.overflow = "";
  orderForm.reset();
}
 
modalClose.addEventListener("click", tutupModal);
 
// Tutup modal jika klik di luar kotak modal (area overlay gelap)
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) tutupModal();
});
 
// Tutup modal dengan tombol Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modalOverlay.classList.contains("active")) {
    tutupModal();
  }
});
 
 
/* ==========================================================================
   7. VALIDASI & SUBMIT FORM TOP UP -> GENERATE PESAN WHATSAPP
   ========================================================================== */
orderForm.addEventListener("submit", (e) => {
  e.preventDefault();
 
  const uid = document.getElementById("inputUID").value.trim();
  const server = document.getElementById("inputServer").value;
  const nominalId = document.getElementById("inputNominal").value;
  const nama = document.getElementById("inputNama").value.trim();
  const nomorWA = document.getElementById("inputWA").value.trim();
 
  // Validasi sederhana: pastikan semua field terisi dengan benar
  if (uid.length < 5) {
    alert("UID tidak valid. Mohon periksa kembali UID Genshin Impact Anda.");
    return;
  }
 
  if (nama.length < 3) {
    alert("Nama terlalu pendek. Mohon isi nama/username dengan benar.");
    return;
  }
 
  // Validasi nomor WhatsApp: hanya angka, minimal 9 digit
  const regexNomorWA = /^[0-9]{9,15}$/;
  if (!regexNomorWA.test(nomorWA)) {
    alert("Nomor WhatsApp tidak valid. Gunakan hanya angka, contoh: 081234567890");
    return;
  }
 
  const produk = daftarTopUp.find((p) => p.id === nominalId);
 
  const pesan =
    `Halo, saya ingin memesan Top Up Genesis Crystal:\n\n` +
    `Nama: ${nama}\n` +
    `UID: ${uid}\n` +
    `Server: ${server}\n` +
    `Nominal: ${produk.nama}\n` +
    `Harga: ${formatRupiah(produk.harga)}\n` +
    `No. WhatsApp: ${nomorWA}\n\n` +
    `Mohon konfirmasinya. Terima kasih!`;
 
  bukaWhatsApp(pesan);
  tutupModal();
});
 
 
/* ==========================================================================
   8. HELPER — BUKA WHATSAPP DENGAN PESAN OTOMATIS
   ========================================================================== */
function bukaWhatsApp(pesan) {
  const pesanEncoded = encodeURIComponent(pesan);
  const url = `https://wa.me/${NOMOR_WHATSAPP_TOKO}?text=${pesanEncoded}`;
  window.open(url, "_blank");
}
 
 
/* ==========================================================================
   9. FAQ ACCORDION
   ========================================================================== */
document.querySelectorAll(".accordion-header").forEach((header) => {
  header.addEventListener("click", () => {
    const item = header.parentElement;
    const body = item.querySelector(".accordion-body");
    const sedangTerbuka = item.classList.contains("open");
 
    // Tutup semua item accordion lain (opsional: buat FAQ lebih rapi)
    document.querySelectorAll(".accordion-item").forEach((i) => {
      i.classList.remove("open");
      i.querySelector(".accordion-body").style.maxHeight = null;
    });
 
    // Buka item yang diklik jika sebelumnya tertutup
    if (!sedangTerbuka) {
      item.classList.add("open");
      body.style.maxHeight = body.scrollHeight + 40 + "px";
    }
  });
});
 
 
/* ==========================================================================
   10. ANIMASI MUNCUL SAAT SCROLL (INTERSECTION OBSERVER)
   ========================================================================== */
function aktifkanScrollReveal() {
  const elemenReveal = document.querySelectorAll(".reveal");
 
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
 
  elemenReveal.forEach((el) => observer.observe(el));
}
 
 
/* ==========================================================================
   11. SMOOTH SCROLL UNTUK LINK NAVBAR (fallback tambahan selain CSS)
   ========================================================================== */
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    const targetId = link.getAttribute("href");
    if (targetId.length > 1) {
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  });
});
 
 
/* ==========================================================================
   12. INISIALISASI — DIJALANKAN SAAT HALAMAN SELESAI DIMUAT
   ========================================================================== */
function init() {
  renderTopupGrid();
  renderTabelHarga();
  isiDropdownRegion();
  isiDropdownPersentase(calcStart, 0);
  isiDropdownPersentase(calcTarget, 25);
  isiDropdownNominal();
  updateEstimasiHarga();
 
  // Aktifkan animasi scroll setelah semua elemen .reveal selesai dirender
  aktifkanScrollReveal();
}
 
document.addEventListener("DOMContentLoaded", init);
 