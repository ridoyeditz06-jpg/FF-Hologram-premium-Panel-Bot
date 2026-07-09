// একটি সেট তৈরি করা যা বোটকে পজ রাখবে
let pausedChats = new Set();

sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;

    const from = msg.key.remoteJid;
    const isFromMe = msg.key.fromMe; // আপনি নিজে মেসেজ পাঠালে
    const rawText = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
    const command = rawText.trim().toLowerCase();

    const footer = "\n\n━━━━━━━━━━━━━━━━━━\n📌 *মেনুতে ফিরতে টাইপ করুন:* `Menu`";

    // ১. মেনু লিখলে বোট আবার সচল হবে
    if (command === 'menu') {
        pausedChats.delete(from); // পজ মোড বন্ধ
        await sock.sendMessage(from, { text: "✨ *আসসালামু আলাইকুম!* ✨\n\nRIDOY RAJ FF HOLOGRAM PANEL-এ স্বাগতম। 🎮\nআপনাকে আজ কীভাবে সাহায্য করতে পারি? 👇\n\n📋 *প্যানেল:* `Panel`\n👤 *সাপোর্ট:* `Support`" + footer });
        return;
    }

    // ২. আপনি (অ্যাডমিন) মেসেজ পাঠালে বোট পজ হয়ে যাবে
    if (isFromMe) {
        pausedChats.add(from); // বোট পজ (বট আর কথা বলবে না)
        await sock.sendMessage(from, { text: rawText + footer });
        return;
    }

    // ৩. যদি চ্যাট পজ থাকে, তবে বট কোনো অটো-রিপ্লাই দিবে না
    if (pausedChats.has(from)) {
        return; 
    }

    // ৪. সাধারণ কমান্ড লজিক (বট সচল থাকলে)
    if (command === 'hi' || command === 'hello' || command === 'start') {
        await sock.sendMessage(from, { text: "✨ *আসসালামু আলাইকুম!* ✨\n\nRIDOY RAJ FF HOLOGRAM PANEL-এ স্বাগতম। 🎮\nআমি বসের ডিজিটাল অ্যাসিস্ট্যান্ট! কীভাবে সাহায্য করতে পারি? 👇\n\n📋 *প্যানেল:* `Panel`\n👤 *সাপোর্ট:* `Support`" + footer });
    } 
    else if (command === 'panel') {
        await sock.sendMessage(from, { text: "🛡️ *প্যানেলসমূহ:* 🛡️\n\n✅ অ্যান্টি-ব্যান ও অ্যান্টি-ব্ল্যাকলিস্ট\n✅ মেইন আইডি ১০০% সেফ\n\n💰 *প্রাইস লিস্ট:* 💰\n🏆 টুর্নামেন্ট প্যানেল: ৩৫০ টাকা\n💎 BRCS প্যানেল: ৩০০ টাকা\n💥 *অফার:* দুটি ৪০০ টাকা!\n\n🎥 *রিভিউ ভিডিও:* `Tournament` / `Brcs`\n🛒 *ক্রয় করতে:* `Buy`" + footer });
    }
    else if (command === 'tournament') {
        await sock.sendMessage(from, { text: "🏆 *টুর্নামেন্ট প্যানেল রিভিউ ভিডিও:* 🏆\n\nhttps://vt.tiktok.com/ZSCEKFmpx/" + footer });
    }
    else if (command === 'brcs') {
        await sock.sendMessage(from, { text: "💎 *BRCS প্যানেল রিভিউ ভিডিও:* 💎\n\nhttps://vt.tiktok.com/ZSCEwcvDU/" + footer });
    }
    else if (command === 'buy') {
        await sock.sendMessage(from, { text: "💳 *পেমেন্ট পদ্ধতি:* 💳\n\nবিকাশ নম্বর: `01727671230`\n\nপেমেন্ট সম্পন্ন করে নিচের তথ্যগুলো পাঠান:\n১. আপনার নাম:\n২. বিকাশ লাস্ট ৪ ডিজিট:\n৩. ট্রানজেকশন আইডি:" + footer });
    }
    else if (command === 'support') {
        pausedChats.add(from); // সাপোর্ট মানেই পজ মোড
        await sock.sendMessage(from, { text: "✅ *সাপোর্ট মোড সক্রিয়!* ✅\n\nআমি আপনাকে অ্যাডমিনের সাথে কানেক্ট করে দিচ্ছি। আপনি এখন মেসেজ করুন, অ্যাডমিন সরাসরি কথা বলছেন। ⏳" });
    }
});
