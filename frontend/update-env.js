const fs = require('fs');
const os = require('os');
const path = require('path');

// 1. Get the Local IPv4 Address
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // Skip over non-IPv4 and internal (loopback) addresses
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

const localIP = getLocalIP();
const envPath = path.join(__dirname, '.env');
const port = 5000;
const newBackendUrl = `http://${localIP}:${port}`;

// 2. Read and Update the .env file
if (fs.existsSync(envPath)) {
    let content = fs.readFileSync(envPath, 'utf8');
    const regex = /^BACKEND_URL=.*$/m;
    
    if (regex.test(content)) {
        content = content.replace(regex, `BACKEND_URL=${newBackendUrl}`);
        console.log(`✅ Updated .env: BACKEND_URL set to ${newBackendUrl}`);
    } else {
        // If the key doesn't exist yet, append it
        content += `\nBACKEND_URL=${newBackendUrl}`;
        console.log(`➕ Added to .env: BACKEND_URL=${newBackendUrl}`);
    }

    fs.writeFileSync(envPath, content);
} else {
    console.error('❌ .env file not found!');
}