const express = require("express");
const MysteryBoxController = require("../controllers/mysterybox.controller");
const router = express.Router();
const verify = require("../middlewares/verifyToken");

router.post(
  "/create-mysterybox",
  verify.verifyToken,
  verify.isStaff,
  MysteryBoxController.createMysteryBox
);
router.get("/get-mysterybox", MysteryBoxController.getMysteryBox);
router.get("/get-mysterybox/:id", MysteryBoxController.getMysteryBoxById);
router.post(
  "/get-mysterybox-condition",
  MysteryBoxController.getMysteryBoxCondition
);

router.put("/update-box", MysteryBoxController.updateBox);

module.exports = router;
