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
        const code = await sock.requestPairingCode('8801727671230'); // আপনার ফোন নাম্বার
        console.log(`\n\n============================================`);
        console.log(`✅ আপনার পেয়ারিং কোডটি হলো: ${code}`);
        console.log(`============================================\n\n`);
    }

    let userSteps = {};
    const footer = "\n\n➖➖➖➖➖➖➖➖\n✨ মেনুতে ফিরে যেতে টাইপ করুন: Menu";

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").toLowerCase();
        
        if (from === ADMIN_NUMBER && text.startsWith('/approve')) {
            const parts = text.split(' ');
            const targetJid = parts[1].includes('@s.whatsapp.net') ? parts[1] : parts[1] + '@s.whatsapp.net';
            await sock.sendMessage(targetJid, { text: `🎉 অভিনন্দন! আপনার পেমেন্ট এপ্রুভ হয়েছে।\n\nপ্যানেল লিংক: ${PANEL_LINK} 📥\n\nশুভ গেমিং! 🎮` });
            await sock.sendMessage(from, { text: "✅ লিংক কাস্টমারের কাছে পাঠানো হয়েছে।" });
            return;
        }

        if (userSteps[from]?.step === 'name') {
            userSteps[from] = { name: text, step: 'bkash' };
            await sock.sendMessage(from, { text: "✅ দারুণ! এবার আপনার বিকাশের লাস্ট ৪টি সংখ্যা লিখুন।" + footer });
        } else if (userSteps[from]?.step === 'bkash') {
            userSteps[from].bkash = text;
            userSteps[from].step = 'tid';
            await sock.sendMessage(from, { text: "💳 পেমেন্ট প্রায় শেষ! এবার আপনার বিকাশ ট্রানজেকশন আইডি লিখুন।" + footer });
        } else if (userSteps[from]?.step === 'tid') {
            const finalData = `🔔 *নতুন পেমেন্ট রিকোয়েস্ট!* 🔔\n\n👤 কাস্টমার: ${userSteps[from].name}\n📱 কাস্টমার নাম্বার: ${from}\n📱 বিকাশ লাস্ট ৪ ডিজিট: ${userSteps[from].bkash}\n🔢 ট্রানজেকশন আইডি: ${text}\n\nলিংক পাঠাতে রিপ্লাই দিন:\n/approve ${from}`;
            await sock.sendMessage(ADMIN_NUMBER, { text: finalData });
            await sock.sendMessage(from, { text: "🎉 আপনার তথ্য জমা হয়েছে! একটু অপেক্ষা করুন, এডমিন আপনার পেমেন্ট চেক করছেন। পেমেন্ট তথ্য সঠিক হলে খুব শীঘ্রই আপনাকে প্যানেল লিংক দেওয়া হবে। ⏳✨" + footer });
            delete userSteps[from];
        } else if (text.includes('hi') || text.includes('menu')) {
            await sock.sendMessage(from, { text: "আসসালামু আলাইকুম! 🌟 আমি Boss-এর ডিজিটাল অ্যাসিস্ট্যান্ট।\n\n১. এডমিনের সাথে যোগাযোগ: Help 🛠️\n২. প্যানেল রিভিউ: Review 🎥\n৩. প্যানেল ক্রয়: Buy Panel 💎" + footer });
        } else if (text.includes('buy panel')) {
            userSteps[from] = { step: 'name' };
            await sock.sendMessage(from, { text: "💰 প্যানেল ৩ মাসের জন্য ৩৫০ টাকা। বিকাশ নম্বর: 01727671230\n\nটাকা পাঠিয়ে প্রমাণস্বরূপ আপনার নাম লিখুন। ✍️" + footer });
        } else if (text.includes('review')) {
            await sock.sendMessage(from, { text: "আমাদের প্যানেলের রিভিউ ভিডিওগুলো দেখতে নিচে ক্লিক করুন: 🎥\n\n🏆 টুর্নামেন্ট: https://vt.tiktok.com/ZSCT4xTxb/\n💎 BRCS: https://vt.tiktok.com/ZSCT4Sawu/" + footer });
        } else if (text.includes('help')) {
            await sock.sendMessage(from, { text: "আপনার রিকোয়েস্টটি অ্যাডমিনের কাছে পাঠানো হয়েছে। তিনি খুব দ্রুত আপনার সাথে সরাসরি যোগাযোগ করবেন। 📞⏳" });
            await sock.sendMessage(ADMIN_NUMBER, { text: `⚠️ কাস্টমার রিকোয়েস্ট: ${from.split('@')[0]} আপনার সাথে সরাসরি কথা বলতে চায়!` });
        }
    });
}
connectToWhatsApp();
