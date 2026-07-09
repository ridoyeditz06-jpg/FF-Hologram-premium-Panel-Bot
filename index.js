const express = require('express');
const app = express();
const { makeWASocket, useMultiFileAuthState, delay } = require('@whiskeysockets/baileys');

const PORT = process.env.PORT || 3000;
const ADMIN_NUMBER = '8801727671230@s.whatsapp.net';
const PANEL_LINK = 'https://t.me/+oe_rcewUi142ZmNl';

app.get('/', (req, res) => res.send('Bot is running! ⚡'));
app.listen(PORT);

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const sock = makeWASocket({ 
        auth: state, 
        printQRInTerminal: false,
        browser: ["Ridoy Raj Bot", "Chrome", "1.0.0"] 
    });

    sock.ev.on('creds.update', saveCreds);

    // পেয়ারিং কোড জেনারেটর
    if (!sock.authState.creds.registered) {
        await delay(3000);
        const code = await sock.requestPairingCode('8801727671230');
        console.log(`\n\n✅ পেয়ারিং কোড: ${code}\n\n`);
    }

    let userSteps = {};
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const from = msg.key.remoteJid;
        const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").toLowerCase();
        
        if (from === ADMIN_NUMBER && text.startsWith('/approve')) {
            const targetJid = text.split(' ')[1].includes('@s.whatsapp.net') ? text.split(' ')[1] : text.split(' ')[1] + '@s.whatsapp.net';
            await sock.sendMessage(targetJid, { text: `🎉 অভিনন্দন! আপনার পেমেন্ট এপ্রুভ হয়েছে।\n\nপ্যানেল লিংক: ${PANEL_LINK} 📥` });
            await sock.sendMessage(from, { text: "✅ লিংক পাঠানো হয়েছে।" });
            return;
        }

        if (userSteps[from]?.step === 'name') {
            userSteps[from] = { name: text, step: 'bkash' };
            await sock.sendMessage(from, { text: "✅ দারুণ! এবার আপনার বিকাশের লাস্ট ৪টি সংখ্যা লিখুন।" });
        } else if (userSteps[from]?.step === 'bkash') {
            userSteps[from].bkash = text;
            userSteps[from].step = 'tid';
            await sock.sendMessage(from, { text: "💳 পেমেন্ট প্রায় শেষ! এবার আপনার বিকাশ ট্রানজেকশন আইডি লিখুন।" });
        } else if (userSteps[from]?.step === 'tid') {
            await sock.sendMessage(ADMIN_NUMBER, { text: `🔔 পেমেন্ট রিকোয়েস্ট!\n👤 ${userSteps[from].name}\n📱 ${from}\n🔢 ${text}\n\nলিংক পাঠাতে লিখুন: /approve ${from}` });
            await sock.sendMessage(from, { text: "🎉 আপনার তথ্য জমা হয়েছে! এডমিন চেক করছেন। ⏳" });
            delete userSteps[from];
        } else if (text.includes('hi') || text.includes('menu')) {
            await sock.sendMessage(from, { text: "আসসালামু আলাইকুম! 🌟\n১. Help 🛠️\n২. Review 🎥\n৩. Buy Panel 💎" });
        } else if (text.includes('buy panel')) {
            userSteps[from] = { step: 'name' };
            await sock.sendMessage(from, { text: "💰 প্যানেল ৩৫০ টাকা। বিকাশ নম্বর: 01727671230। টাকা পাঠিয়ে আপনার নাম লিখুন।" });
        } else if (text.includes('review')) {
            await sock.sendMessage(from, { text: "আমাদের প্যানেলের রিভিউ ভিডিওগুলো দেখুন: 🎥\n\n💎 BRCs প্যানেল: https://vt.tiktok.com/ZSCEbxUM9/\n🏆 টুর্নামেন্ট প্যানেল: https://vt.tiktok.com/ZSCEbSDUG/" });
        }
    });
}
connectToWhatsApp();
