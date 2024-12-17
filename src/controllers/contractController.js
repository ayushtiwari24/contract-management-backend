const Contract = require("../models/contractModel");
const { findAll } = require("../models/contractModel");
const db = require("../config/db");

const createContract = async (req, res) => {
  try {
    const { client_name, contract_details, status } = req.body;

    if (!client_name || !contract_details) {
      return res
        .status(400)
        .json({ message: "Client name and contract details are required" });
    }

    // Check if the contract already exists
    const duplicateCheck = await db.query(
      `SELECT * FROM contracts 
       WHERE client_name = $1 AND contract_details ->> 'value' = $2`,
      [client_name, contract_details.value.toString()]
    );

    if (duplicateCheck.rows.length > 0) {
      return res.status(409).json({ message: "Duplicate contract found" });
    }

    // Create new contract if no duplicates
    const newContract = await Contract.create({
      client_name,
      contract_details,
      status: status || "Draft",
    });

    // Emit the event to all connected clients
    const io = req.app.get("io");
    io.emit("contract_created", newContract);

    res.status(201).json(newContract);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating contract" });
  }
};

const getContracts = async (req, res) => {
  const { status, client_name, limit = 5, offset = 0 } = req.query;

  try {
    // Ensure limit and offset are integers
    const parsedLimit = parseInt(limit);
    const parsedOffset = parseInt(offset);

    // Query for total count of records
    const totalResult = await db.query(
      `SELECT COUNT(*) AS total 
       FROM contracts 
       WHERE ($1::text IS NULL OR status = $1) 
       AND ($2::text IS NULL OR client_name ILIKE $2)`,
      [status || null, `%${client_name || ""}%`]
    );
    const total = parseInt(totalResult.rows[0].total);

    // Fetch paginated contracts
    const result = await db.query(
      `SELECT * 
       FROM contracts 
       WHERE ($1::text IS NULL OR status = $1) 
       AND ($2::text IS NULL OR client_name ILIKE $2) 
       ORDER BY created_at DESC
       LIMIT $3 OFFSET $4`,
      [status || null, `%${client_name || ""}%`, parsedLimit, parsedOffset]
    );

    res.json({ contracts: result.rows, total });
  } catch (error) {
    console.error("Error fetching contracts:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getContractById = async (req, res) => {
  try {
    const { id } = req.params;
    const contract = await Contract.findById(id);
    if (!contract) {
      return res.status(404).json({ message: "Contract not found" });
    }
    res.status(200).json(contract);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving contract" });
  }
};
const updateContract = async (req, res) => {
  try {
    const { id } = req.params;
    const { client_name, contract_details, status } = req.body;

    const updatedContract = await Contract.update(id, {
      client_name,
      contract_details,
      status,
    });

    if (!updatedContract) {
      return res.status(404).json({ message: "Contract not found" });
    }

    const io = req.app.get("io");
    io.emit("contract_updated", updatedContract);

    res.status(200).json(updatedContract);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating contract" });
  }
};

const deleteContract = async (req, res) => {
  try {
    const { id } = req.params;
    await Contract.delete(id);

    // Emit the event to all connected clients
    const io = req.app.get("io");
    io.emit("contract_deleted", { id });

    res.status(200).json({ message: "Contract deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting contract" });
  }
};

module.exports = {
  createContract,
  getContracts,
  getContractById,
  updateContract,
  deleteContract,
};
