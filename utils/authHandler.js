const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Đọc public key
const publicKey = fs.readFileSync(path.join(__dirname, '../public.pem'), 'utf8');

const checkLogin = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Lấy token từ header "Bearer <token>"

    if (!token) return res.status(401).json({ message: "Không có token, từ chối truy cập." });

    try {
        // Chỉ định rõ thuật toán RS256 để verify
        const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
        req.user = decoded; 
        next();
    } catch (error) {
        return res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn." });
    }
};

module.exports = { checkLogin };