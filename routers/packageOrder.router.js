const express = require("express");
const PackageOrderController = require("../controllers/packageOrder.controller");
const verify = require("../middlewares/verifyToken");
const router = express.Router();

router.post(
  "/add-order-package/:id",
  verify.verifyToken,
  PackageOrderController.orderPackage
);

router.patch(
  "/update-status/:id",
  verify.verifyToken,
  PackageOrderController.updateStatus
);

router.get(
  "/get-packageorderbyuserid",
  verify.verifyToken,
  PackageOrderController.getPackageOrderByUserId
);

router.get(
  "/get-packageorderbyidpk/:id",
  verify.verifyToken,
  PackageOrderController.getPackageOrderByIdPk
);

router.patch(
  "/push-packageinperiod/:id",
  verify.verifyToken,
  PackageOrderController.pushPackageInPeriod
);

router.get(
  "/get-all-order",
  verify.verifyToken,
  verify.isStaff,
  PackageOrderController.getAllOrder
);

router.post(
  "/get-order-by-date",
  verify.verifyToken,
  verify.isStaff,
  PackageOrderController.getOrderByDate
);
router.get(
  "/push-product-order/:packageOrderId",
  PackageOrderController.pushProductOrder
);

router.get(
  "/revenue-week",
  verify.verifyToken,
  verify.isAdmin,
  PackageOrderController.revenueWeekDashboard
);
router.post(
  "/revenue-date",
  verify.verifyToken,
  verify.isAdmin,
  PackageOrderController.revenueDateDashboard
);
router.get(
  "/revenue-month/:month",
  verify.verifyToken,
  verify.isAdmin,
  PackageOrderController.revenueMontthDashboard
);
module.exports = router;
