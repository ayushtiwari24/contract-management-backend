const express = require("express");
const {
  createContract,
  getContracts,
  getContractById,
  updateContract,
  deleteContract,
} = require("../controllers/contractController");

const router = express.Router();

router.post("/contracts", createContract);
router.get("/contracts", getContracts); // Ensure this matches the import
router.get("/contracts/:id", getContractById);
router.put("/contracts/:id", updateContract);
router.delete("/contracts/:id", deleteContract);

module.exports = router;
