// src/endpoints/currentUser.js
import express from 'express';
import payload from 'payload';

const router = express.Router();

const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user.id; // Giả sử bạn đang sử dụng middleware xác thực để thêm thông tin người dùng vào req

        const user = await payload.findByID({
            collection: 'users',
            id: userId,
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export default (app) => {
    router.get('/currentUser', getCurrentUser);
    app.use('/api', router);
};
