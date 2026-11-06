"use strict";

const dataVila = [
  {
    id: "vila-pinus",
    nama: "Vila Pinus",
    tipeKamar: "2 kamar tidur",
    lokasi: "Cisarua, Puncak",
    hargaPerMalam: 850000,
    fasilitas: ["Dapur", "Taman", "Parkir"],
    tersedia: true,
    maksimalTamu: 6
  },
  {
    id: "vila-keluarga",
    nama: "Vila Keluarga",
    tipeKamar: "3 kamar tidur",
    lokasi: "Cipanas, Puncak",
    hargaPerMalam: 1250000,
    fasilitas: ["Wi-Fi", "Kolam renang", "Ruang keluarga"],
    tersedia: true,
    maksimalTamu: 10
  },
  {
    id: "vila-kebun",
    nama: "Vila Kebun",
    tipeKamar: "1 kamar tidur",
    lokasi: "Tugu Utara, Puncak",
    hargaPerMalam: 650000,
    fasilitas: ["Teras", "Pemandangan kebun", "Parkir"],
    tersedia: false,
    maksimalTamu: 4
  }
];

const KUNCI_PESANAN = "vilaPermai.pesanan";
const KUNCI_NAMA = "vilaPermai.namaTerakhir";
const elemen = {
  daftarVila: document.getElementById("daftar-vila"),
  dropdownVila: document.getElementById("pilihan-vila"),
  pencarian: document.getElementById("pencarian-vila"),
  form: document.getElementById("form-pemesanan"),
  nama: document.getElementById("nama-tamu"),
  checkin: document.getElementById("tanggal-masuk"),
  checkout: document.getElementById("tanggal-keluar"),
  tamu: document.getElementById("jumlah-tamu"),
  tombolCek: document.getElementById("tombol-cek"),
  pesanRender: document.getElementById("pesan-render"),
  pesanForm: document.getElementById("pesan-form"),
  pesanPenyimpanan: document.getElementById("pesan-penyimpanan"),
  vilaKosong: document.getElementById("vila-tidak-ditemukan"),
  daftarPesanan: document.getElementById("daftar-pesanan"),
  pesananKosong: document.getElementById("pesanan-kosong"),
  status: document.getElementById("status-pemesanan"),
  ringkasanVila: document.getElementById("ringkasan-vila"),
  ringkasanMalam: document.getElementById("ringkasan-malam"),
  ringkasanHarga: document.getElementById("ringkasan-harga"),
  ringkasanTotal: document.getElementById("ringkasan-total")
};

let daftarPesanan = [];

// Mengubah angka biaya menjadi format Rupiah.
function formatRupiah(nilai) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(nilai);
}

// Mengosongkan elemen dengan API DOM yang kompatibel luas.
function kosongkanElemen(target) {
  while (target.firstChild) {
    target.removeChild(target.firstChild);
  }
}

// Mengambil tanggal hari ini dalam format yang dapat dibandingkan.
function tanggalHariIni() {
  const sekarang = new Date();
  const tahun = sekarang.getFullYear();
  const bulan = String(sekarang.getMonth() + 1).padStart(2, "0");
  const hari = String(sekarang.getDate()).padStart(2, "0");
  return `${tahun}-${bulan}-${hari}`;
}

// Memastikan tanggal masukan benar-benar ada di kalender.
function tanggalValid(tanggal) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal)) {
    return false;
  }
  const [tahun, bulan, hari] = tanggal.split("-").map(Number);
  return new Date(Date.UTC(tahun, bulan - 1, hari)).toISOString().slice(0, 10) === tanggal;
}

// Menghitung selisih malam tanpa terpengaruh perubahan zona waktu.
function hitungJumlahMalam(tanggalMasuk, tanggalKeluar) {
  if (!tanggalValid(tanggalMasuk) || !tanggalValid(tanggalKeluar)) {
    return 0;
  }
  const [tahunMasuk, bulanMasuk, hariMasuk] = tanggalMasuk.split("-").map(Number);
  const [tahunKeluar, bulanKeluar, hariKeluar] = tanggalKeluar.split("-").map(Number);
  const awal = Date.UTC(tahunMasuk, bulanMasuk - 1, hariMasuk);
  const akhir = Date.UTC(tahunKeluar, bulanKeluar - 1, hariKeluar);
  return akhir > awal ? (akhir - awal) / 86400000 : 0;
}

// Menampilkan kartu vila dengan elemen DOM yang aman.
function renderVila(kataKunci = "") {
  try {
    kosongkanElemen(elemen.daftarVila);
    const kunci = kataKunci.trim().toLocaleLowerCase("id-ID");
    const hasil = dataVila.filter((vila) => {
      const teks = [vila.nama, vila.tipeKamar, vila.lokasi, ...vila.fasilitas]
        .join(" ")
        .toLocaleLowerCase("id-ID");
      return teks.includes(kunci);
    });

    hasil.forEach((vila) => {
      const kartu = document.createElement("article");
      kartu.className = "villa-card";

      const judul = document.createElement("h3");
      judul.textContent = vila.nama;
      kartu.appendChild(judul);

      const tipe = document.createElement("p");
      tipe.className = "villa-card__type";
      tipe.textContent = vila.tipeKamar;
      kartu.appendChild(tipe);

      const lokasi = document.createElement("p");
      lokasi.className = "villa-card__location";
      lokasi.textContent = vila.lokasi;
      kartu.appendChild(lokasi);

      const harga = document.createElement("p");
      harga.className = "villa-card__price";
      harga.appendChild(document.createTextNode(formatRupiah(vila.hargaPerMalam)));
      const satuMalam = document.createElement("span");
      satuMalam.textContent = " / malam";
      harga.appendChild(satuMalam);
      kartu.appendChild(harga);

      const judulFasilitas = document.createElement("p");
      judulFasilitas.className = "villa-card__subtitle";
      judulFasilitas.textContent = "Fasilitas";
      kartu.appendChild(judulFasilitas);

      const fasilitas = document.createElement("ul");
      fasilitas.className = "villa-card__facilities";
      vila.fasilitas.forEach((namaFasilitas) => {
        const item = document.createElement("li");
        item.textContent = namaFasilitas;
        fasilitas.appendChild(item);
      });
      kartu.appendChild(fasilitas);

      const status = document.createElement("p");
      status.className = vila.tersedia
        ? "villa-card__status"
        : "villa-card__status villa-card__status--unavailable";
      status.textContent = vila.tersedia ? "Tersedia untuk dipesan" : "Tidak tersedia";
      kartu.appendChild(status);
      elemen.daftarVila.appendChild(kartu);
    });

    elemen.vilaKosong.hidden = hasil.length > 0;
    elemen.pesanRender.hidden = true;
  } catch (kesalahan) {
    kosongkanElemen(elemen.daftarVila);
    elemen.vilaKosong.hidden = true;
    elemen.pesanRender.textContent = "Daftar vila gagal ditampilkan. Silakan muat ulang halaman.";
    elemen.pesanRender.hidden = false;
  }
}

// Mengisi pilihan vila dari data yang tersedia.
function isiDropdownVila() {
  try {
    kosongkanElemen(elemen.dropdownVila);
    const pilihanAwal = document.createElement("option");
    pilihanAwal.value = "";
    pilihanAwal.textContent = "Pilih vila";
    elemen.dropdownVila.appendChild(pilihanAwal);
    dataVila.forEach((vila) => {
      const pilihan = document.createElement("option");
      pilihan.value = vila.id;
      pilihan.textContent = `${vila.nama} — ${formatRupiah(vila.hargaPerMalam)} per malam`;
      elemen.dropdownVila.appendChild(pilihan);
    });
  } catch (kesalahan) {
    elemen.pesanRender.textContent = "Pilihan vila gagal dimuat. Silakan muat ulang halaman.";
    elemen.pesanRender.hidden = false;
  }
}

// Memperbarui ringkasan biaya secara langsung.
function hitungTotalHarga() {
  const vila = dataVila.find((item) => item.id === elemen.dropdownVila.value);
  const malam = hitungJumlahMalam(elemen.checkin.value, elemen.checkout.value);
  const jumlahTamu = Number(elemen.tamu.value);

  elemen.ringkasanVila.textContent = vila ? vila.nama : "—";
  elemen.ringkasanMalam.textContent = malam > 0 ? `${malam} malam` : "—";
  elemen.ringkasanHarga.textContent = vila ? `${formatRupiah(vila.hargaPerMalam)} / malam` : "—";
  elemen.ringkasanTotal.textContent = vila && malam > 0 ? formatRupiah(vila.hargaPerMalam * malam) : "—";
  elemen.status.classList.remove("summary__status--success");

  if (!vila || malam < 1 || !Number.isInteger(jumlahTamu) || jumlahTamu < 1) {
    elemen.status.textContent = "Lengkapi tanggal, jumlah tamu, dan pilihan vila untuk melihat perkiraan biaya.";
    return null;
  }
  if (!vila.tersedia) {
    elemen.status.textContent = "Vila ini sedang tidak tersedia dan tidak dapat dipesan.";
    return null;
  }
  if (jumlahTamu > 10) {
    elemen.status.textContent = "Jumlah tamu harus antara 1 sampai 10.";
    return null;
  }
  if (jumlahTamu > vila.maksimalTamu) {
    elemen.status.textContent = `Kapasitas vila ini maksimal ${vila.maksimalTamu} tamu.`;
    return null;
  }
  elemen.status.textContent = "Perkiraan biaya diperbarui. Periksa ketersediaan sebelum mengirim pesanan.";
  return {
    vila,
    malam,
    total: vila.hargaPerMalam * malam
  };
}

// Memeriksa isi formulir dan menampilkan kesalahan per kolom.
function validasiForm(perluNama = true) {
  const kesalahan = {
    nama: "",
    checkin: "",
    checkout: "",
    tamu: "",
    vila: ""
  };
  const nama = elemen.nama.value.trim();
  const checkin = elemen.checkin.value;
  const checkout = elemen.checkout.value;
  const jumlahTamu = Number(elemen.tamu.value);
  const vila = dataVila.find((item) => item.id === elemen.dropdownVila.value);

  if (perluNama && !nama) {
    kesalahan.nama = "Nama tamu wajib diisi.";
  }
  if (!checkin) {
    kesalahan.checkin = "Tanggal check-in wajib diisi.";
  } else if (checkin < tanggalHariIni() || !tanggalValid(checkin)) {
    kesalahan.checkin = "Tanggal check-in tidak boleh di masa lalu atau tidak valid.";
  }
  if (!checkout) {
    kesalahan.checkout = "Tanggal check-out wajib diisi.";
  } else if (!tanggalValid(checkout) || checkout < tanggalHariIni() || (checkin && hitungJumlahMalam(checkin, checkout) < 1)) {
    kesalahan.checkout = "Tanggal check-out harus setelah check-in.";
  }
  if (!elemen.tamu.value || !Number.isInteger(jumlahTamu) || jumlahTamu < 1 || jumlahTamu > 10) {
    kesalahan.tamu = "Jumlah tamu harus antara 1 sampai 10.";
  }
  if (!vila) {
    kesalahan.vila = "Silakan pilih vila.";
  } else if (!vila.tersedia) {
    kesalahan.vila = "Vila ini tidak tersedia dan tidak bisa dipesan.";
  } else if (Number.isInteger(jumlahTamu) && jumlahTamu >= 1 && jumlahTamu <= 10 && jumlahTamu > vila.maksimalTamu) {
    kesalahan.tamu = `Kapasitas vila ini maksimal ${vila.maksimalTamu} tamu.`;
  }

  Object.entries(kesalahan).forEach(([kolom, pesan]) => {
    const tempatPesan = document.getElementById(`error-${kolom}`);
    tempatPesan.textContent = pesan;
    const kontrol = kolom === "nama"
      ? elemen.nama
      : kolom === "checkin"
        ? elemen.checkin
        : kolom === "checkout"
          ? elemen.checkout
          : kolom === "tamu"
            ? elemen.tamu
            : elemen.dropdownVila;
    kontrol.setAttribute("aria-invalid", pesan ? "true" : "false");
  });

  return {
    valid: Object.values(kesalahan).every((pesan) => !pesan),
    vila,
    nama,
    checkin,
    checkout,
    jumlahTamu
  };
}

// Memfilter kartu berdasarkan nama, tipe kamar, dan fasilitas.
function filterVila() {
  renderVila(elemen.pencarian.value);
}

// Menyimpan pesanan baru di daftar dan penyimpanan lokal.
function simpanPesanan(data) {
  try {
    const biaya = data.vila.hargaPerMalam * hitungJumlahMalam(data.checkin, data.checkout);
    const pesanan = {
      nama: data.nama,
      vila: data.vila.nama,
      checkin: data.checkin,
      checkout: data.checkout,
      jumlahTamu: data.jumlahTamu,
      malam: hitungJumlahMalam(data.checkin, data.checkout),
      total: biaya
    };
    daftarPesanan.unshift(pesanan);
    localStorage.setItem(KUNCI_PESANAN, JSON.stringify(daftarPesanan));
    localStorage.setItem(KUNCI_NAMA, data.nama);
    tampilkanPesanan();
    elemen.pesanForm.className = "form__message";
    elemen.pesanForm.textContent = "Pesanan berhasil dicatat pada perangkat ini. Silakan hubungi Pak Hendra untuk konfirmasi.";
  } catch (kesalahan) {
    daftarPesanan.shift();
    elemen.pesanPenyimpanan.textContent = "Pesanan tidak dapat disimpan di peramban ini. Pastikan penyimpanan peramban diizinkan, lalu coba lagi.";
    elemen.pesanPenyimpanan.hidden = false;
  }
}

// Memuat nama tamu terakhir dan pesanan dari penyimpanan lokal.
function muatPesanan() {
  try {
    const namaTersimpan = localStorage.getItem(KUNCI_NAMA);
    const pesananTersimpan = localStorage.getItem(KUNCI_PESANAN);
    if (namaTersimpan) {
      elemen.nama.value = namaTersimpan;
    }
    if (pesananTersimpan) {
      const hasil = JSON.parse(pesananTersimpan);
      if (!Array.isArray(hasil) || hasil.some((item) => !item || typeof item.nama !== "string" || typeof item.total !== "number")) {
        throw new Error("Data pesanan tersimpan tidak sesuai.");
      }
      daftarPesanan = hasil;
    }
  } catch (kesalahan) {
    daftarPesanan = [];
    elemen.pesanPenyimpanan.textContent = "Data pesanan sebelumnya tidak dapat dibaca. Daftar dimulai kembali dari kosong.";
    elemen.pesanPenyimpanan.hidden = false;
  }
  tampilkanPesanan();
}

// Menampilkan daftar pesanan yang sudah tersimpan.
function tampilkanPesanan() {
  kosongkanElemen(elemen.daftarPesanan);
  daftarPesanan.forEach((pesanan) => {
    const item = document.createElement("li");
    item.className = "order-item";
    const judul = document.createElement("strong");
    judul.textContent = `${pesanan.nama} — ${pesanan.vila}`;
    item.appendChild(judul);
    const tanggal = document.createElement("p");
    tanggal.textContent = `${pesanan.checkin} sampai ${pesanan.checkout} · ${pesanan.jumlahTamu} tamu`;
    item.appendChild(tanggal);
    const biaya = document.createElement("p");
    biaya.textContent = `${pesanan.malam} malam · Total ${formatRupiah(pesanan.total)}`;
    item.appendChild(biaya);
    elemen.daftarPesanan.appendChild(item);
  });
  elemen.pesananKosong.hidden = daftarPesanan.length > 0;
}

// Memeriksa ketersediaan vila dan menampilkan rincian perkiraan.
function cekKetersediaan() {
  elemen.pesanForm.textContent = "";
  const hasilValidasi = validasiForm(false);
  const ringkasan = hitungTotalHarga();
  if (!hasilValidasi.valid) {
    elemen.pesanForm.textContent = "Periksa kembali kolom yang masih salah sebelum melanjutkan.";
    return;
  }
  if (!ringkasan) {
    elemen.pesanForm.textContent = "Vila tidak tersedia untuk pemesanan ini.";
    return;
  }
  elemen.status.textContent = `Vila tersedia untuk ${ringkasan.malam} malam. Perkiraan total: ${formatRupiah(ringkasan.total)}.`;
  elemen.status.classList.add("summary__status--success");
}

// Menghubungkan kontrol formulir dengan perhitungan dan pemesanan.
function pasangPemantauFormulir() {
  [elemen.checkin, elemen.checkout, elemen.tamu, elemen.dropdownVila].forEach((kontrol) => {
    kontrol.addEventListener("input", hitungTotalHarga);
    kontrol.addEventListener("change", hitungTotalHarga);
  });
  elemen.nama.addEventListener("input", () => {
    document.getElementById("error-nama").textContent = "";
    elemen.nama.setAttribute("aria-invalid", "false");
  });
  elemen.pencarian.addEventListener("input", filterVila);
  elemen.tombolCek.addEventListener("click", cekKetersediaan);
  elemen.form.addEventListener("submit", (peristiwa) => {
    peristiwa.preventDefault();
    elemen.pesanForm.className = "form__message form__message--error form__field--wide";
    elemen.pesanForm.textContent = "";
    elemen.pesanPenyimpanan.hidden = true;
    const hasilValidasi = validasiForm();
    const ringkasan = hitungTotalHarga();
    if (!hasilValidasi.valid || !ringkasan) {
      elemen.pesanForm.textContent = "Pesanan belum dapat dikirim. Perbaiki kolom yang ditandai dan pastikan vila tersedia.";
      return;
    }
    simpanPesanan({
      nama: hasilValidasi.nama,
      checkin: hasilValidasi.checkin,
      checkout: hasilValidasi.checkout,
      jumlahTamu: hasilValidasi.jumlahTamu,
      vila: hasilValidasi.vila
    });
  });
}

// Menyiapkan halaman dan batas tanggal formulir.
function mulaiAplikasi() {
  const hariIni = tanggalHariIni();
  elemen.checkin.min = hariIni;
  elemen.checkout.min = hariIni;
  renderVila();
  isiDropdownVila();
  muatPesanan();
  pasangPemantauFormulir();
  hitungTotalHarga();
}

mulaiAplikasi();
