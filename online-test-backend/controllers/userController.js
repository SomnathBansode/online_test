const User = require("../models/User");
const Result = require("../models/Result");
const TestSession = require("../models/TestSession");

exports.listUsers = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 0 } = req.query;
    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};
    const users = await User.find(query)
      .select("name email role isVerified createdAt")
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await User.countDocuments(query);
    res.json({ users, total });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch users", error: err.message });
  }
};

// exports.listUsers = async (req, res) => {
//   try {
//     const { search = "", page = 1, limit = all } = req.query;

//     const query = search
//       ? {
//           $or: [
//             { name: { $regex: search, $options: "i" } },
//             { email: { $regex: search, $options: "i" } },
//           ],
//         }
//       : {};

//     // 👉 Debug log (query + pagination info)
//     console.log("🧩 List Users API called");
//     console.log("🔍 Query:", query);
//     console.log("📄 Page:", page, "Limit:", limit);

//     const users = await User.find(query)
//       .select("name email role isVerified createdAt")
//       .skip((page - 1) * limit)
//       .limit(Number(limit));

//     const total = await User.countDocuments(query);

//     // 👉 Debug log - किती users मिळाले आणि काही sample दाखव
//     console.log(`✅ Users fetched: ${users.length}/${total}`);
//     if (users.length > 0) {
//       console.log("🧑‍💻 Sample users:", users.slice(0, 2)); // पहिल्या दोन दाखव
//     }

//     res.json({ users, total });
//   } catch (err) {
//     console.error("❌ listUsers error:", err);
//     res
//       .status(500)
//       .json({ message: "Failed to fetch users", error: err.message });
//   }
// };

// Update user details (name, email, role, isVerified)
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, isVerified } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, isVerified },
      { new: true, runValidators: true }
    ).select("name email role isVerified createdAt");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update user", error: err.message });
  }
};

// Activate/deactivate user
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.isVerified = !user.isVerified;
    await user.save();
    res.json({ status: user.isVerified ? "active" : "inactive" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update status", error: err.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    // Delete all results by this user
    const resultDelete = await Result.deleteMany({ userId: req.params.id });
    // Delete all test sessions by this user
    const sessionDelete = await TestSession.deleteMany({
      userId: req.params.id,
    });
    res.json({
      message: "User and all related data deleted",
      deletedResults: resultDelete.deletedCount,
      deletedSessions: sessionDelete.deletedCount,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete user", error: err.message });
  }
};
