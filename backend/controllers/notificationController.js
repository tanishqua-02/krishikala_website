import Notification from "../models/Notification.js";

// Helper — create a notification (used internally by other controllers)
export const createNotification = async (userId, type, title, message, meta = {}) => {
  try {
    await Notification.create({ user: userId, type, title, message, meta });
  } catch {}
};

// GET /api/notifications  — my notifications
export const getMyNotifications = async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort("-createdAt").limit(50);
  const unreadCount = await Notification.countDocuments({ user: req.user._id, read: false });
  res.status(200).json({ success: true, notifications, unreadCount });
};

// PUT /api/notifications/read-all
export const markAllRead = async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
  res.status(200).json({ success: true });
};

// PUT /api/notifications/:id/read
export const markRead = async (req, res) => {
  await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { read: true });
  res.status(200).json({ success: true });
};
