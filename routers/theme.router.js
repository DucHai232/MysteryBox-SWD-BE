const express = require("express");
const ThemeController = require("../controllers/theme.controller");
const verify = require("../middlewares/verifyToken");
const router = express.Router();

router.post(
  "/create-theme",
  verify.verifyToken,
  verify.isStaff,
  ThemeController.createTheme
);

router.get("/get-themes", ThemeController.getThemes);

router.patch(
  "/delete-theme/:id",
  verify.verifyToken,
  verify.isStaff,
  ThemeController.deleteTheme
);

router.put(
  "/update-theme/:id",
  verify.verifyToken,
  verify.isStaff,
  ThemeController.updateTheme
);
module.exports = router;
