const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const privateKey = fs.readFileSync(path.join(__dirname, '../private.pem'), 'utf8');

const generateToken = (payload) => {
    // Thêm option algorithm là RS256
    return jwt.sign(payload, privateKey, { algorithm: 'RS256', expiresIn: '1h' });
};