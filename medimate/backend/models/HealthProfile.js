const pool = require("../config/database");        // 复用全局 Pool

const toDb = (v) => (v === "" || v === undefined ? null : v);

module.exports = {
  /* ---------- 读取 ---------- */
  async get(ownerId) {
    const { rows } = await pool.query(
      "SELECT * FROM health_profile WHERE owner_id = $1 LIMIT 1",
      [ownerId]
    );
    return rows[0] || null;
  },

  /* ---------- 插入 / 更新 ---------- */
  async upsert(ownerId, data) {
    const {
      height,
      weight,
      gender,
      age,
      family_history,
      allergen_history,
    } = data;

    const { rows } = await pool.query(
      `INSERT INTO health_profile
         (owner_id, height, weight, gender, age,
          family_history, allergen_history)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (owner_id)
       DO UPDATE SET
         height            = COALESCE(EXCLUDED.height,  health_profile.height),
         weight            = COALESCE(EXCLUDED.weight,  health_profile.weight),
         gender            = COALESCE(EXCLUDED.gender,  health_profile.gender),
         age               = COALESCE(EXCLUDED.age,     health_profile.age),
         family_history    = COALESCE(EXCLUDED.family_history,   health_profile.family_history),
         allergen_history  = COALESCE(EXCLUDED.allergen_history, health_profile.allergen_history),
         updated_at        = NOW()
       RETURNING *`,
      [
        ownerId,
        toDb(height),
        toDb(weight),
        toDb(gender),
        age ? Number(age) : null,
        family_history || null,
        allergen_history || null,
      ]
    );

    return rows[0];
  },
};
