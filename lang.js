const cfg = require('./config')
const getLangCode = (lang) => {
    if (lang == 'Indonesia' || lang == 'indonesia') return 'id'
    if (lang == 'Jawa' || lang == 'jawa') return 'jw'
    return 'en'
}
module.exports = (lang, par1 = '', par2 = '', par3 = '', par4 = '') => {
    const text_lang = {
        id: {
            "welcome": `Selamat datang di ${cfg.BOT_NAME}. Semoga betah.`,
            "registered": `Kamu telah terdaftar, tap /join untuk bergabung ke room atau /help untuk menampilkan semua perintah.`,
            "other_join": `${par1} bergabung ke room.`,
            "other_left": `${par1} meninggalkan room.`,
            "join": `Kamu bergabung ke room.`,
            "left": `Kamu meninggalkan room.`,
            "people": `Sekarang ada ${par1} orang di sini`,
            "other_people": `Ada ${par1} orang lain di sini.`,
            "change_ava": `Perubahan avatar menjadi ${par1} berhasil.`,
            "change_lang": `Perubahan bahasa menjadi ${par1} berhasil.`,
            "other_change_ava": `${par1} mengubah avatar menjadi ${par2}`,
            "to_botak": `Kamu menjadi botak.`,
            "other_to_botak": `${par1} menjadi botak.`,
            "current_ava": `Avatar kamu saat ini: ${par1}\nKirim emoji (misal: 🖌 atau 🎁) untuk mengubah avatar atau /cancel untuk membatalkan, /drop untuk menghapus.`,
            "invalid_ava": `Kirim emoji, woy. Misal: 🖌 atau 🎁`,
            "current_lang": `Bahasa kamu saat ini: ${par1}\nSilakan pilih bahasamu atau /cancel untuk membatalkan.`,
            "closed_room": `Room ${par1} tutup atau belum dibuka. Room dibuka pada ${par2}`,
            "donate": `Terima kasih. Silakan kunjungi ${par1}`,
            "rooms": `Daftar room. \n${par1}`,
            "join_room": `Kamu bergabung ke room ${par1}.`,
            "room_full": `Gagal bergabung ke room. Room ${par1} penuh atau tidak tersedia.`,
            "not_in_room": `Kamu tidak ada di room`,
            "cancel": `OK. Dibatalkan.`,
            "invalid_cancel": `Tidak ada yang perlu dibatalkan.`,
            "left_admin": `Kamu mengakhiri chat admin.`,
            "join_admin": `Kamu terhubung dengan Admin AnonTalkID. \r\nSilakan sampaikan saran, kritik, atau keluhan tentang bot.\r\nUntuk mengakhiri tap /exit`,
            "list": `Di sini ada: \n${par1}`,
            "nonvip": `Kamu bukan pengguna VIP.`,
            "new_private": `Kamu baru saja membuat room privat dan sekarang kamu berada di room privat.\nKamu dapat mengundang temanmu dengan cara /invite [nickname].`,
            "invitation": `${par2} mengundangmu ke room private ${par1}. Terima?`,
            "invite_friend": `Menunggu ${par1}`,
            "invitation_rejected": `${par1} menolak undanganmu.`,
            "invitation_accepted": `${par1} bergabung melalui undangan.`,
            "invitation_sent": `${par1} mengundang ${par2}`,
            "current_nickname": `Your current nicname: ${par1}\nPlease send your new nickname or /cancel to cancel, /drop to remove.`,
            "invalid_nickname": `Invalid nickname. Nickname must 6-16 character and only alphanumeric and underscore.`,
            "exist_nickname": `Nickname already exist.`,
            "drop_nickname": `Your nickname has removed.`,
            "change_nickname": `Nickname changed to ${par1} successfully.`,
            "invalid_command": `Tidak mengenali perintahmu.\nCoba tap /join untuk gabung ke room.\nTap /help untuk menampilkan semua perintah.`,
            "help": `Perintah:
/start => memulai bot
/join => bergabung ke room publik
/join <room_id> => bergabung ke room publik <room_id>
/exit => keluar dari room
/rooms => menampilkan semua room di bahasamu
/avatar => mengubah avatar
/lang => mengubah bahasa
/donate => memberikan donasi`,
            // New enhanced messages
            "room_categories": `📂 Kategori Room:\n${par1}`,
            "vip_room_access": `👑 Akses Room VIP berhasil!`,
            "vip_priority_join": `⚡ Prioritas VIP: Kamu bergabung ke room penuh.`,
            "room_info": `📋 Informasi Room:\n🏷️ Nama: ${par1}\n👥 Anggota: ${par2}/${par3}\n🏷️ Kategori: ${par4}`,
            "select_language": `🌐 Pilih bahasa yang kamu inginkan:`,
            "language_changed": `✅ Bahasa berhasil diubah ke ${par1}`,
            "vip_features": `👑 Fitur VIP Aktif:\n• 🏠 Room VIP eksklusif\n• ⚡ Prioritas join\n• 🎨 Avatar khusus\n• 📊 Statistik pribadi`,
            "vip_upgrade": `💎 Upgrade ke VIP untuk fitur eksklusif!`,
            "room_full_vip": `👑 Room penuh, tapi kamu VIP! Kamu mendapat prioritas.`,
            "custom_room_created": `🏗️ Room custom berhasil dibuat: ${par1}`,
            "invalid_room_id": `❌ ID Room tidak valid atau tidak ditemukan.`,
            "room_category_general": `💬 Umum`,
            "room_category_chill": `😌 Santai`,
            "room_category_random": `🎲 Acak`,
            "room_category_gaming": `🎮 Game`,
            "room_category_music": `🎵 Musik`,
            "room_category_tech": `💻 Teknologi`,
            "room_category_sports": `⚽ Olahraga`,
            "room_category_food": `🍕 Makanan`,
            "room_category_vip": `👑 VIP`
        },

        en: {
            "welcome": `Welcome to ${cfg.BOT_NAME}. Enjoy in chat room.`,
            "registered": `You are already registered, tap /join to join to a room or /help to show all commands.`,
            "other_join": `${par1} just joined the room.`,
            "other_left": `${par1} left the room.`,
            "join": `You just joined the room.`,
            "left": `You left the room.`,
            "people": `There are ${par1} people here now.`,
            "other_people": `There are ${par1} others here.`,
            "change_ava": `Avatar changed to ${par1} successfully`,
            "change_lang": `Language changed to ${par1} successfully`,
            "other_change_ava": `${par1} has change avatar to ${par2}`,
            "to_botak": `You become a botak.`,
            "other_to_botak": `${par1} become a botak.`,
            "current_ava": `Your current avatar: ${par1}\nPlease send an emoticon (e.g: 🦋 or 🦄) to change your avatar or /cancel to cancel, /drop to remove.`,
            "invalid_ava": `Please send an emotion. E.g: 🦋 or 🦄`,
            "current_lang": `Your current language: ${par1}\nPlease choose your language or /cancel to cancel.`,
            "closed_room": `Room ${par1} is closed. Room will be opened on ${par2}`,
            "donate": `Thank you. Please visit ${par1}`,
            "rooms": `Room list: \n${par1}`,
            "join_room": `You just joined to ${par1} room.`,
            "room_full": `Failed to join the room. Room ${par1} is full or unavailable.`,
            "not_in_room": `You are not in any room.`,
            "cancel": `OK. Canceled.`,
            "invalid_cancel": `Nothing to cancel.`,
            "left_admin": `You are disconnected from AnonTalkID admin.`,
            "join_admin": `You just connected to AnonTalkID admin.`,
            "list": `People in this room: \n${par1}`,
            "nonvip": `You are not a VIP user.`,
            "new_private": `You just created a private room, and you are in a private room now.\nYou can invite your friend by type /invite [nickname].`,
            "invitation": `${par2} invite you to a private room [${par1}]. Accept?`,
            "invite_friend": `Waiting for ${par1}`,
            "invitation_rejected": `${par1} reject your invitation.`,
            "invitation_accepted": `${par1} just joined by invitation.`,
            "invitation_sent": `${par1} just invited ${par2}`,
            "current_nickname": `Your current nicname: ${par1}\nPlease send your new nickname or /cancel to cancel, /drop to remove.`,
            "invalid_nickname": `Invalid nickname. Nickname must 6-16 character and only alphanumeric and underscore.`,
            "exist_nickname": `Nickname already exist.`,
            "drop_nickname": `Your nickname has removed.`,
            "change_nickname": `Nickname changed to ${par1} successfully.`,
            "invalid_command": `Invalid command.\nTap /join to join a room, /help to show all commands.`,
            "help": `All Commands:
/start => start bot
/join => join to a public room
/join <room_id> => join to a specific public room
/exit => exit from room
/rooms => show all public room in this language
/avatar => change your avatar
/lang => change your language
/donate => make a donation`,
            // New enhanced messages
            "room_categories": `📂 Room Categories:\n${par1}`,
            "vip_room_access": `👑 VIP Room access successful!`,
            "vip_priority_join": `⚡ VIP Priority: You joined a full room.`,
            "room_info": `📋 Room Information:\n🏷️ Name: ${par1}\n👥 Members: ${par2}/${par3}\n🏷️ Category: ${par4}`,
            "select_language": `🌐 Choose your preferred language:`,
            "language_changed": `✅ Language successfully changed to ${par1}`,
            "vip_features": `👑 Active VIP Features:\n• 🏠 Exclusive VIP rooms\n• ⚡ Priority joining\n• 🎨 Special avatars\n• 📊 Personal statistics`,
            "vip_upgrade": `💎 Upgrade to VIP for exclusive features!`,
            "room_full_vip": `👑 Room is full, but you're VIP! You get priority.`,
            "custom_room_created": `🏗️ Custom room created successfully: ${par1}`,
            "invalid_room_id": `❌ Invalid or not found room ID.`,
            "room_category_general": `💬 General`,
            "room_category_chill": `😌 Chill`,
            "room_category_random": `🎲 Random`,
            "room_category_gaming": `🎮 Gaming`,
            "room_category_music": `🎵 Music`,
            "room_category_tech": `💻 Tech`,
            "room_category_sports": `⚽ Sports`,
            "room_category_food": `🍕 Food`,
            "room_category_vip": `👑 VIP`
        },

        jw: {
            "welcome": `Sugeng rawuh ing ${cfg.BOT_NAME}. Semoga betah.`,
            "registered": `Sampeyan wis kadaptar, pencet /join kanggo gabung menyang kamar utawa /help kanggo nampilake kabeh perintah.`,
            "other_join": `${par1} gabung menyang kamar.`,
            "other_left": `${par1} ninggal kamar.`,
            "join": `Sampeyan gabung menyang kamar.`,
            "left": `Sampeyan ninggal kamar.`,
            "people": `Saiki ana ${par1} wong ing kene`,
            "other_people": `Ana ${par1} wong liyane ing kene.`,
            "change_ava": `Ganti avatar dadi ${par1} sukses.`,
            "change_lang": `Ganti basa dadi ${par1} sukses.`,
            "other_change_ava": `${par1} ganti avatar dadi ${par2}`,
            "to_botak": `Sampeyan dadi botak.`,
            "other_to_botak": `${par1} dadi botak.`,
            "current_ava": `Avatar sampeyan saiki: ${par1}\nKirim emoji (kayata: 🖌 utawa 🎁) kanggo ganti avatar utawa /cancel kanggo mbatalake, /drop kanggo mbusak.`,
            "invalid_ava": `Kirim emoji, woy. Kayata: 🖌 utawa 🎁`,
            "current_lang": `Basa sampeyan saiki: ${par1}\nMangga pilih basa sampeyan utawa /cancel kanggo mbatalake.`,
            "closed_room": `Kamar ${par1} tutup utawa durung dibuka. Kamar dibuka ing ${par2}`,
            "donate": `Matur nuwun. Mangga kunjungi ${par1}`,
            "rooms": `Daftar kamar. \n${par1}`,
            "join_room": `Sampeyan gabung menyang kamar ${par1}.`,
            "room_full": `Gagal gabung menyang kamar. Kamar ${par1} kebak utawa ora kasedhiya.`,
            "not_in_room": `Sampeyan ora ana ing kamar`,
            "cancel": `OK. Dibatalke.`,
            "invalid_cancel": `Ora ana sing kudu dibatalake.`,
            "left_admin": `Sampeyan mungkasi chat admin.`,
            "join_admin": `Sampeyan kehubung karo Admin AnonTalkID. \r\nMangga sampaikake saran, kritik, utawa keluhan babagan bot.\r\nKanggo mungkasi pencet /exit`,
            "list": `Ing kene ana: \n${par1}`,
            "nonvip": `Sampeyan dudu pangguna VIP.`,
            "new_private": `Sampeyan mung gawe kamar pribadi lan saiki sampeyan ana ing kamar pribadi.\nSampeyan bisa ngundang kancane kanthi cara /invite [nickname].`,
            "invitation": `${par2} ngundang sampeyan menyang kamar pribadi ${par1}. Terima?`,
            "invite_friend": `Nunggu ${par1}`,
            "invitation_rejected": `${par1} nolak undangan sampeyan.`,
            "invitation_accepted": `${par1} gabung liwat undangan.`,
            "invitation_sent": `${par1} ngundang ${par2}`,
            "current_nickname": `Nickname sampeyan saiki: ${par1}\nMangga kirim nickname anyar sampeyan utawa /cancel kanggo mbatalake, /drop kanggo mbusak.`,
            "invalid_nickname": `Nickname ora valid. Nickname kudu 6-16 karakter lan mung alfanumerik lan underscore.`,
            "exist_nickname": `Nickname wis ana.`,
            "drop_nickname": `Nickname sampeyan wis dibusak.`,
            "change_nickname": `Nickname diganti dadi ${par1} sukses.`,
            "invalid_command": `Ora ngerti perintah sampeyan.\nCoba pencet /join kanggo gabung menyang kamar.\nPencet /help kanggo nampilake kabeh perintah.`,
            "help": `Perintah:
/start => miwiti bot
/join => gabung menyang kamar publik
/join <room_id> => gabung menyang kamar publik <room_id>
/exit => metu saka kamar
/rooms => nampilake kabeh kamar ing basa sampeyan
/avatar => ganti avatar sampeyan
/lang => ganti basa sampeyan
/donate => menehi donasi`,
            // New enhanced messages
            "room_categories": `📂 Kategori Kamar:\n${par1}`,
            "vip_room_access": `👑 Akses Kamar VIP sukses!`,
            "vip_priority_join": `⚡ Prioritas VIP: Sampeyan gabung menyang kamar kebak.`,
            "room_info": `📋 Informasi Kamar:\n🏷️ Jeneng: ${par1}\n👥 Anggota: ${par2}/${par3}\n🏷️ Kategori: ${par4}`,
            "select_language": `🌐 Pilih basa sing sampeyan pengin:`,
            "language_changed": `✅ Basa sukses diganti menyang ${par1}`,
            "vip_features": `👑 Fitur VIP Aktif:\n• 🏠 Kamar VIP eksklusif\n• ⚡ Prioritas gabung\n• 🎨 Avatar khusus\n• 📊 Statistik pribadi`,
            "vip_upgrade": `💎 Upgrade menyang VIP kanggo fitur eksklusif!`,
            "room_full_vip": `👑 Kamar kebak, nanging sampeyan VIP! Sampeyan entuk prioritas.`,
            "custom_room_created": `🏗️ Kamar custom sukses digawe: ${par1}`,
            "invalid_room_id": `❌ ID Kamar ora valid utawa ora ditemokake.`,
            "room_category_general": `💬 Umum`,
            "room_category_chill": `😌 Santai`,
            "room_category_random": `🎲 Acak`,
            "room_category_gaming": `🎮 Game`,
            "room_category_music": `🎵 Musik`,
            "room_category_tech": `💻 Teknologi`,
            "room_category_sports": `⚽ Olahraga`,
            "room_category_food": `🍕 Panganan`,
            "room_category_vip": `👑 VIP`
        }
    }

    return text_lang[getLangCode(lang)]
}