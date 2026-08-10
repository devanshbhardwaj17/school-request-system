const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { getRequests, saveRequests } = require("../db");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();

const DIRECTOR_VISIBLE = ["pending", "approved", "rejected", "in_stock", "out_of_stock", "delivered"];
const STORE_VISIBLE = ["approved", "in_stock", "out_of_stock", "delivered"];
const STORE_EDITABLE_STATUSES = ["in_stock", "out_of_stock", "delivered"];

router.use(authenticate);

function addHistory(request, status, user, note) {
  request.history.push({
    status,
    changedBy: user.name,
    changedByRole: user.role,
    at: new Date().toISOString(),
    note: note || undefined,
  });
}

// ---- CREATE a request (teacher only) ----
router.post("/", requireRole("teacher"), (req, res) => {
  const { itemName, quantity, note } = req.body || {};

  if (!itemName || !String(itemName).trim()) {
    return res.status(400).json({ message: "Item name is required." });
  }
  const qty = Number(quantity);
  if (!Number.isFinite(qty) || qty <= 0) {
    return res.status(400).json({ message: "Quantity must be a positive number." });
  }

  const requests = getRequests();

  const newRequest = {
    id: uuidv4(),
    itemName: String(itemName).trim(),
    quantity: qty,
    note: note ? String(note).trim() : "",
    status: "pending",
    createdBy: { id: req.user.id, name: req.user.name },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    history: [],
  };
  addHistory(newRequest, "pending", req.user, "Request submitted");

  requests.unshift(newRequest);
  saveRequests(requests);

  res.status(201).json(newRequest);
});

// ---- LIST requests (role-aware visibility) ----
router.get("/", (req, res) => {
  const requests = getRequests();
  const { role, id } = req.user;

  let visible;
  if (role === "teacher") {
    visible = requests.filter((r) => r.createdBy.id === id);
  } else if (role === "director") {
    visible = requests.filter((r) => DIRECTOR_VISIBLE.includes(r.status));
  } else if (role === "store_manager") {
    visible = requests.filter((r) => STORE_VISIBLE.includes(r.status));
  } else {
    visible = [];
  }

  res.json(visible);
});

// ---- DIRECTOR decision: approve or reject a pending request ----
router.patch("/:id/decision", requireRole("director"), (req, res) => {
  const { decision, note } = req.body || {};
  if (!["approved", "rejected"].includes(decision)) {
    return res.status(400).json({ message: "Decision must be 'approved' or 'rejected'." });
  }

  const requests = getRequests();
  const request = requests.find((r) => r.id === req.params.id);
  if (!request) return res.status(404).json({ message: "Request not found." });

  if (request.status !== "pending") {
    return res.status(409).json({
      message: `This request is already '${request.status.replace("_", " ")}' and can no longer be changed.`,
    });
  }

  request.status = decision;
  request.updatedAt = new Date().toISOString();
  addHistory(request, decision, req.user, note);

  saveRequests(requests);
  res.json(request);
});

// ---- STORE MANAGER: update fulfillment status ----
router.patch("/:id/store-status", requireRole("store_manager"), (req, res) => {
  const { status, note } = req.body || {};
  if (!STORE_EDITABLE_STATUSES.includes(status)) {
    return res.status(400).json({ message: "Status must be one of: in_stock, out_of_stock, delivered." });
  }

  const requests = getRequests();
  const request = requests.find((r) => r.id === req.params.id);
  if (!request) return res.status(404).json({ message: "Request not found." });

  if (request.status === "delivered") {
    return res.status(409).json({ message: "This request has already been delivered and is locked." });
  }

  if (!STORE_VISIBLE.includes(request.status)) {
    return res.status(409).json({ message: "This request has not been approved by the director yet." });
  }

  request.status = status;
  request.updatedAt = new Date().toISOString();
  addHistory(request, status, req.user, note);

  saveRequests(requests);
  res.json(request);
});

module.exports = router;
