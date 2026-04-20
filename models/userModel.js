const db = require("../config/db");

const createUser = async (name, email, password) => {
  const [result] = await db.query(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    [name, email, password],
  );

  return {
    id: result.insertId,
    name,
    email,
  };
};

const getAllUsers = async () => {
  const [rows] = await db.query(
    "SELECT id, name, email, created_at FROM users ORDER BY id DESC",
  );
  return rows;
};

const findUserByEmail = async (email) => {
  const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
  return rows[0];
};

const findUserById = async (id) => {
  const [rows] = await db.query(
    "SELECT id, name, email, created_at FROM users WHERE id = ?",
    [id],
  );
  return rows[0];
};

module.exports = {
  createUser,
  getAllUsers,
  findUserByEmail,
  findUserById,
};
