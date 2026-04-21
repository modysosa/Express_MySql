const db = require("../config/db");

const createUser = async (name, email, password, isAdmin = false) => {
  const [result] = await db.query(
    "INSERT INTO users (name, email, password, admin) VALUES (?, ?, ?, ?)",
    [name, email, password, isAdmin],
  );

  return {
    id: result.insertId,
    name,
    email,
    admin: isAdmin,
  };
};

const getAllUsers = async () => {
  const [rows] = await db.query(
    "SELECT id, name, email, admin, created_at FROM users ORDER BY id DESC",
  );
  return rows;
};

const findUserByEmail = async (email) => {
  const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
  return rows[0];
};

const findUserById = async (id) => {
  const [rows] = await db.query(
    "SELECT id, name, email, admin, created_at FROM users WHERE id = ?",
    [id],
  );
  return rows[0];
};

const updateUserAdmin = async (id, isAdmin) => {
  const [result] = await db.query("UPDATE users SET admin = ? WHERE id = ?", [
    isAdmin,
    id,
  ]);
  return result.affectedRows > 0;
};

const updateUser = async (id, name, email) => {
  const [result] = await db.query(
    "UPDATE users SET name = ?, email = ? WHERE id = ?",
    [name, email, id]
  );
  return result.affectedRows > 0;
};

const updateUserPassword = async (id, password) => {
  const [result] = await db.query(
    "UPDATE users SET password = ? WHERE id = ?",
    [password, id],
  );
  return result.affectedRows > 0;
};

const deleteUser = async (id) => {
  const [result] = await db.query("DELETE FROM users WHERE id = ?", [id]);
  return result.affectedRows > 0;
};

module.exports = {
  createUser,
  getAllUsers,
  findUserByEmail,
  findUserById,
  updateUserAdmin,
  updateUser,
  updateUserPassword,
  deleteUser,
};

