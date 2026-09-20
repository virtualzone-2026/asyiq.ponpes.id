// schemas/index.ts

// =========================================================
// SCHEMA UTAMA
// =========================================================

import program from './program';
import news from './news';
import category from './category';
import donationTransaction from './donationTransaction';
import laporan from './laporan';

// =========================================================
// FUNDRAISER
// =========================================================

// Data pendaftaran / profil fundraiser
import fundraiser from './fundraiser';

// Data pengajuan & riwayat penarikan komisi fundraiser
import fundraiserWithdrawal from './fundraiserWithdrawal';

// =========================================================
// DAFTAR SELURUH SCHEMA
// =========================================================

export const schemaTypes = [
  // Program donasi
  program,

  // Laporan yayasan / penyaluran
  laporan,

  // Kategori berita / artikel
  category,

  // Berita & artikel
  news,

  // Transaksi donasi
  donationTransaction,

  // =======================================================
  // FUNDRAISER
  // =======================================================

  // Profil / pendaftaran fundraiser
  fundraiser,

  // Pengajuan & histori pencairan komisi
  fundraiserWithdrawal,
];