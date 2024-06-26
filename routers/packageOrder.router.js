const express = require("express");
const PackageOrderController = require("../controllers/packageOrder.controller");
const verify = require("../middlewares/verifyToken");
const router = express.Router();

router.post(
  "/add-order-package/:id",
  verify.verifyToken,
  PackageOrderController.orderPackage
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
router.get(
  "/push-product-order/:packageOrderId",
  PackageOrderController.pushProductOrder
);

router.get("/revenue-week", PackageOrderController.revenueWeekDashboard);
module.exports = router;
