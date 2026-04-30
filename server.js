const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// الإعدادات
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname))); 

// الاتصال بقاعدة البيانات MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ DB Connection Error:', err));

// تعريف هيكل بيانات المستخدم
const userSchema = new mongoose.Schema({
    uid: { type: String, required: true, unique: true },
    username: { type: String, default: "Pi Pioneer" },
    balance: { type: Number, default: 10.0 }, // رصيد هدية عند التسجيل
    lastLogin: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// مسار الصفحة الرئيسية
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// مسار تسجيل الدخول وحفظ البيانات
app.post('/api/user/login', async (req, res) => {
    const { uid, username } = req.body;
    if (!uid) return res.status(400).json({ success: false });

    try {
        let user = await User.findOne({ uid });
        if (!user) {
            user = new User({ uid, username, balance: 10.0 });
            await user.save();
        }
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// تشغيل السيرفر
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
