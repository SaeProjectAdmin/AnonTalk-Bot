const cfg = require('./config')
const getLangCode = (lang) => {
    if (lang == 'Indonesia' || lang == 'indonesia') return 'id'
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
/start => memulai bot / ꦩꦼꦩꦸꦭꦻꦧꦺꦴꦠ꧀
/join => bergabung ke room publik / ꦧꦼꦂꦒꦧꦸꦁꦏꦼꦫꦸꦩ꧀ꦥꦸꦧ꧀ꦭꦶꦏ꧀꧈ꦄꦕꦏ꧀
/join <room_id> => bergabung ke room publik <room_id>
/exit => keluar dari room / ꦏꦼꦭꦸꦮꦂꦝꦫꦶꦫꦸꦩ꧀
/rooms => menampilkan semua room di bahasamu
/avatar => mengubah avatar / ꦩꦼꦁꦔ꧀ꦒꦤ꧀ꦠꦶꦄꦥ꦳ꦠꦂ
/lang => mengubah bahasa / ꦩꦼꦁꦔ꧀ꦒꦤ꧀ꦠꦶꦧꦲꦱ
/donate => memberikan donasi / ꦩꦼꦩ꧀ꦧꦼꦫꦶꦏꦤ꧀ꦢꦺꦴꦤꦱꦶ`
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
/start => start bot / ꦩꦼꦩꦸꦭꦻꦧꦺꦴꦠ꧀
/join => join to a public room / ꦧꦼꦂꦒꦧꦸꦁꦏꦼꦫꦸꦩ꧀ꦥꦸꦧ꧀ꦭꦶꦏ꧀꧈ꦄꦕꦏ꧀
/join <room_id> => join to a specific public room
/exit => exit from room / ꦏꦼꦭꦸꦮꦂꦝꦫꦶꦫꦸꦩ꧀
/rooms => show all public room in this language
/avatar => change your avatar / ꦩꦼꦁꦔ꧀ꦒꦤ꧀ꦠꦶꦄꦥ꦳ꦠꦂ
/lang => change your language / ꦩꦼꦁꦔ꧀ꦒꦤ꧀ꦠꦶꦧꦲꦱ
/donate => make a donation / ꦩꦼꦩ꧀ꦧꦼꦫꦶꦏꦤ꧀ꦢꦺꦴꦤꦱꦶ`
        }
    }

    return text_lang[getLangCode(lang)]
}