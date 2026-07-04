const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve all images and static files directly from this folder
app.use(express.static(__dirname));

// Simulated Database
const USER_DB = {
    client: { username: 'client123', password: 'clientpassword', role: 'Client', contactEmail: 'midhungb7@gmail.com', contactPhone: '+91 7397578218' },
    admin: { username: 'admin123', password: 'adminpassword', role: 'Admin', contactEmail: 'admin.eco@gmail.com', contactPhone: '+91 7397570000' }
};

let activeSessions = {};

// 1. Initial Username & Password Check
app.post('/api/login', (req, res) => {
    const { username, password, portalType } = req.body;
    const targetKey = portalType.toLowerCase();
    const userProfile = USER_DB[targetKey];

    if (!userProfile || userProfile.username !== username || userProfile.password !== password) {
        return res.status(401).json({ error: 'Invalid username or password. Please verify credentials and try again.' });
    }

    const generatedOTP = Math.floor(1000 + Math.random() * 9000).toString();
    const sessionId = Math.random().toString(36).substring(2, 15);

    activeSessions[sessionId] = { username: userProfile.username, role: userProfile.role, otp: generatedOTP, timestamp: Date.now() };

    return res.status(200).json({
        sessionId: sessionId,
        contactEmail: userProfile.contactEmail,
        contactPhone: userProfile.contactPhone,
        simulatedOTP: generatedOTP
    });
});

// 2. Channel Verification Code Dispatch
app.post('/api/dispatch-otp', (req, res) => {
    const { sessionId, channel } = req.body;
    const session = activeSessions[sessionId];
    if (!session) return res.status(440).json({ error: 'Session expired. Please restart login process.' });

    return res.status(200).json({ message: `OTP code securely sent via ${channel.toUpperCase()}`, otp: session.otp });
});

// 3. Final OTP Authentication & Redirect Rule
app.post('/api/verify-otp', (req, res) => {
    const { sessionId, enteredOTP } = req.body;
    const session = activeSessions[sessionId];

    if (!session) return res.status(440).json({ error: 'Session expired.' });
    if (session.otp !== enteredOTP) return res.status(401).json({ error: 'Incorrect verification OTP code.' });

    return res.status(200).json({
        user: session.username,
        role: session.role,
        redirectUrl: session.role === 'Admin' ? '/admin-panel' : '/client-panel'
    });
});

// Default fallback rule to serve your HTML page
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'fsd_exe-3_index.html'));
});

app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`  Eco Mold Server Online: http://localhost:${PORT}`);
    console.log(`  Client Login: username: client123 | password: clientpassword`);
    console.log(`  Admin Login:  username: admin123  | password: adminpassword`);
    console.log(`=======================================================`);
}); 
