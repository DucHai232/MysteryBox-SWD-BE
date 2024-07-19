const express = require("express");
const ProductController = require("../controllers/product.controller");
const router = express.Router();
const verify = require("../middlewares/verifyToken");
router.post(
  "/create-product",
  verify.verifyToken,
  verify.isStaff,
  ProductController.createProduct
);
router.get(
  "/random-product/:kidId/:packageId",
  ProductController.randomProduct
);
router.get("/get-product", ProductController.getProducts);
router.get("/get-productById/:id", ProductController.getProductById);
router.delete("/delete-productById/:id", ProductController.deleteProduct);
router.put(
  "/update-product/:id",
  verify.verifyToken,
  verify.isStaff,
  ProductController.updateProduct
);

module.exports = router;
