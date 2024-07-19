const db = require("../models");
const createError = require("../utils/error");
module.exports = {
  createMysteryBox: async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
      const body = req.body;
      const newBox = await db.MysteryBox.create(body, { transaction });
      const productsId = body.productsId;
      if (productsId && Array.isArray(productsId)) {
        for (const productId of productsId) {
          const product = await db.Product.findByPk(productId, { transaction });
          if (product) {
            product.quantity -= 1;
            if (product.quantity < 0) {
              throw new Error(
                `Product ID ${productId} has insufficient quantity.`
              );
            }
            await product.save({ transaction });
          } else {
            throw new Error(`Product ID ${productId} not found.`);
          }
        }
      }
      await transaction.commit();
      return res
        .status(201)
        .json({ success: true, message: "Create Box Success", box: newBox });
    } catch (error) {
      await transaction.rollback();
      return next(createError(res, 500, error.message));
    }
  },
  getMysteryBox: async (req, res, next) => {
    try {
      const mysteryBoxs = await db.MysteryBox.findAll();
      return res.json({
        success: true,
        message: "Get Data Success",
        mysteryBoxs,
      });
    } catch (error) {
      return next(createError(res, 500, error.message));
    }
  },
  getMysteryBoxCondition: async (req, res, next) => {
    try {
      const body = req.body;
      const birthDate = new Date(body.yob);
      const age = new Date().getFullYear() - birthDate.getFullYear();
      const mysteryBoxs = await db.MysteryBox.findAll();
      const filterBoxByThemeId = mysteryBoxs.filter(
        (el) => el.themeId == body.themeId
      );
      const filterBoxByAge = filterBoxByThemeId.filter((el) => {
        const [minAge, maxAge] = el.age.split("-").map(Number);
        return age >= minAge && age <= maxAge;
      });
      return res.json({
        success: true,
        message: "Get Data Success",
        mysteryBoxs:
          filterBoxByAge.length > 0 ? filterBoxByAge : filterBoxByThemeId,
      });
    } catch (error) {
      return next(createError(res, 500, error.message));
    }
  },
  updateBox: async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;

      const box = await db.MysteryBox.findByPk(id);

      if (!box) {
        return next(createError(res, 404, "Box not found"));
      }
      await box.update(body);
      return res
        .status(200)
        .json({ success: true, message: "Box updated successfully", box });
    } catch (error) {
      return next(createError(res, 500, error.message));
    }
  },
  getMysteryBoxById: async (req, res, next) => {
    try {
      const boxId = req.params.id;
      const mysteryBoxs = await db.MysteryBox.findAll();
      const box = mysteryBoxs.filter((box) => box.id == boxId);
      return res.json({
        success: true,
        message: "Get Data Success",
        box,
      });
    } catch (error) {
      return next(createError(res, 500, error.message));
    }
  },
};
