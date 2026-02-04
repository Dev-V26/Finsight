import Notification from "../models/Notification.js";

export const getAnomalies = async (req, res) => {
  const items = await Notification.find({
    userId: req.user.id,
    kind: "unusual_activity",
  })
    .sort({ createdAt: -1 })
    .limit(10);

  res.json(items);
};

export const markRead = async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { read: true });
  res.json({ success: true });
};
