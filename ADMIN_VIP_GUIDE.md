# 🛠️ Panduan Admin VIP Management

## 📋 Daftar Command Admin VIP

Sebagai admin, Anda dapat mengatur status VIP user menggunakan command berikut:

### 🔧 Command VIP Management

| Command | Format | Deskripsi |
|---------|--------|-----------|
| `/setvip` | `/setvip <user_id> <true/false>` | Set status VIP user |
| `/checkvip` | `/checkvip <user_id>` | Cek status VIP user |
| `/listvip` | `/listvip` | Lihat daftar semua user VIP |
| `/removevip` | `/removevip <user_id>` | Hapus status VIP user |
| `/adminhelp` | `/adminhelp` | Bantuan command admin |

### 📝 Contoh Penggunaan

#### 1. Set User sebagai VIP
```
/setvip 123456789 true
```
**Hasil:** User dengan ID 123456789 akan menjadi VIP

#### 2. Hapus Status VIP User
```
/setvip 123456789 false
```
**Hasil:** User dengan ID 123456789 tidak lagi VIP

#### 3. Cek Status VIP User
```
/checkvip 123456789
```
**Hasil:** Menampilkan status VIP user (✅ VIP atau ❌ Regular)

#### 4. Lihat Semua User VIP
```
/listvip
```
**Hasil:** Menampilkan daftar semua user VIP dengan tanggal set

#### 5. Hapus Status VIP (Alternatif)
```
/removevip 123456789
```
**Hasil:** User dengan ID 123456789 tidak lagi VIP

### 🔍 Cara Mendapatkan User ID

#### Method 1: Forward Message
1. User mengirim pesan ke bot
2. Admin forward pesan tersebut
3. User ID akan terlihat di pesan forward

#### Method 2: Reply Message
1. User mengirim pesan ke bot
2. Admin reply pesan tersebut
3. User ID dapat diakses dari context

#### Method 3: Manual Input
1. Tanya user untuk memberikan User ID mereka
2. User dapat menggunakan bot @userinfobot untuk mendapatkan ID

### ⚠️ Catatan Penting

1. **Admin ID:** Saat ini admin ID yang terdaftar adalah `6265283380`
2. **Hanya Admin:** Hanya user dengan ID yang terdaftar yang dapat menggunakan command ini
3. **Permanen:** Status VIP akan tersimpan permanen sampai dihapus manual
4. **Database:** Data VIP disimpan di Firebase Realtime Database

### 🗄️ Struktur Database VIP

```json
{
  "vip_users": {
    "123456789": {
      "isVIP": true,
      "updatedAt": 1703123456789
    }
  }
}
```

### 🚀 Fitur VIP yang Didapat

Setelah user menjadi VIP, mereka mendapatkan:

- 🏠 Room pribadi eksklusif
- 👤 Avatar tanpa batas karakter  
- ⚡ Prioritas join room
- 🎨 Fitur chat lanjutan
- 🎯 Dukungan prioritas
- 📊 Statistik chat pribadi
- 🔒 Room VIP khusus
- 🎬 Kirim video tanpa batas
- 🏗️ Buat room custom

### 🔧 Troubleshooting

#### Error: "Anda tidak memiliki akses admin"
- Pastikan User ID Anda terdaftar di `ADMIN_IDS` array
- Cek file `command/admin-commands.js` line 5

#### Error: "User tidak ditemukan"
- Pastikan User ID yang dimasukkan benar
- User harus sudah pernah menggunakan bot (ada di database)

#### Error: "Gagal mengubah status VIP"
- Cek koneksi database Firebase
- Pastikan ada akses write ke database

### 📞 Support

Jika ada masalah dengan command admin VIP, silakan:
1. Cek log error di console
2. Pastikan semua dependency terinstall
3. Restart bot jika diperlukan

---

**Dibuat oleh:** AnonTalk Bot Team  
**Versi:** 1.0.0  
**Update:** December 2024 