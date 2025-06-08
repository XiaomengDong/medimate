const { Pool } = require("pg");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

module.exports = {
  async create({ ownerId, date, type, value, note }) {
    const { rows } = await pool.query(
      `INSERT INTO health_data (owner_id, date, type, value, note)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [ownerId, date, type, value, note]
    );
    return rows[0];
  },

  async list(ownerId, { from, to, type } = {}) {
    const clauses = ["owner_id = $1"];
    const params = [ownerId];
    if (from) { clauses.push(`date >= $${params.push(from)}`); }
    if (to)   { clauses.push(`date <= $${params.push(to)}`); }
    if (type) { clauses.push(`type = $${params.push(type)}`); }

    const { rows } = await pool.query(
      `SELECT * FROM health_data WHERE ${clauses.join(" AND ")} ORDER BY date DESC`,
      params
    );
    return rows;
  },

  async getById(id, ownerId) {
    const { rows } = await pool.query(
      `SELECT * FROM health_data WHERE id = $1 AND owner_id = $2`,
      [id, ownerId]
    );
    return rows[0];
  },

  async update(id, ownerId, fields) {
    const cols = [];
    const params = [];
    let i = 1;
    for (const [k, v] of Object.entries(fields)) {
      cols.push(`${k} = $${i++}`);
      params.push(v);
    }
    params.push(id, ownerId);
    const { rows } = await pool.query(
      `UPDATE health_data SET ${cols.join(", ")} WHERE id = $${i++} AND owner_id = $${i} RETURNING *`,
      params
    );
    return rows[0];
  },

  async remove(id, ownerId) {
    await pool.query(`DELETE FROM health_data WHERE id = $1 AND owner_id = $2`, [id, ownerId]);
  },
};