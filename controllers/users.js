let userModel = require('../schemas/users');
const bcrypt = require('bcrypt');
exports.changePassword = async (req, res) => {
    try {
        // req.user được gán từ middleware authHandler sau khi verify token thành công
        const userId = req.user.id; 
        const { oldPassword, newPassword } = req.body;

        // 1. Validate dữ liệu cơ bản
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ mật khẩu cũ và mới." });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: "Mật khẩu mới phải có ít nhất 6 ký tự." });
        }
        // (Lưu ý: Nếu project của bạn dùng thư viện Joi trong thư mục schemas, 
        // hãy đưa logic validate vào schema thay vì viết tay thế này cho chuẩn form nhé).

        // 2. Lấy thông tin user từ DB
        // Giả sử hàm findUserById là hàm truy vấn DB của bạn
        const user = await findUserById(userId); 
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng." });
        }

        // 3. Kiểm tra mật khẩu cũ có khớp không
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Mật khẩu cũ không chính xác." });
        }

        // 4. Mã hóa mật khẩu mới và lưu vào DB
        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        // Cập nhật password mới vào DB
        // await updateUserPassword(userId, hashedNewPassword);

        return res.status(200).json({ message: "Đổi mật khẩu thành công!" });

    } catch (error) {
        return res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};
module.exports = {
    CreateAnUser: function (username, password,
        email, role, fullname, avatar, status, logincount) {
        return new userModel(
            {
                username: username,
                password: password,
                email: email,
                fullName: fullname,
                avatarUrl: avatar,
                status: status,
                role: role,
                loginCount: logincount
            }
        )
    },
    FindByUsername: async function (username) {
        return await userModel.findOne({
            username: username,
            isDeleted: false
        })
    },
    FailLogin: async function (user) {
        user.loginCount++;
        if (user.loginCount == 3) {
            user.loginCount = 0;
            user.lockTime = new Date(Date.now() + 60 * 60 * 1000)
        }
        await user.save()
    },
    SuccessLogin: async function (user) {
        user.loginCount = 0;
        await user.save()
    },
    GetAllUser: async function () {
        return await userModel
            .find({ isDeleted: false }).populate({
                path: 'role',
                select: 'name'
            })
    },
    FindById: async function (id) {
        try {
            let getUser = await userModel
                .findOne({ isDeleted: false, _id: id }).populate({
                    path: 'role',
                    select: 'name'
                })
            return getUser;
        } catch (error) {
            return false
        }
    }
}