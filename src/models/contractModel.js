const db = require("../config/db");

const Contract = {
  create: async (data) => {
    const query = `
            INSERT INTO contracts (client_name, contract_details, status)
            VALUES ($1, $2, $3) RETURNING *;
        `;
    const values = [
      data.client_name,
      data.contract_details,
      data.status || "Draft",
    ];
    const result = await db.query(query, values);
    return result.rows[0];
  },
  findAll: async () => {
    const result = await db.query("SELECT * FROM contracts;");
    return result.rows;
  },
  findById: async (id) => {
    const result = await db.query("SELECT * FROM contracts WHERE id = $1", [
      id,
    ]);
    return result.rows[0];
  },
  update: async (id, data) => {
    const query = `
      UPDATE contracts 
      SET client_name = $1, contract_details = $2, status = $3, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $4 RETURNING *`;
    const values = [data.client_name, data.contract_details, data.status, id];
    const result = await db.query(query, values);
    return result.rows[0];
  },
  delete: async (id) => {
    await db.query("DELETE FROM contracts WHERE id = $1", [id]);
  },
  findWithFilters: async ({ status, client_name, limit, offset }) => {
    let query = "SELECT * FROM contracts WHERE 1=1"; // Base query
    const params = [];

    // Add filters dynamically
    if (status) {
      query += " AND status = $1";
      params.push(status);
    }
    if (client_name) {
      query += ` AND client_name ILIKE $${params.length + 1}`;
      params.push(`%${client_name}%`);
    }

    // Add pagination
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${
      params.length + 2
    }`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    return result.rows;
  },
};

module.exports = Contract;
