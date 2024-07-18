const db = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const createError = require("../utils/error");
module.exports = {
  register: async (req, res, next) => {
    try {
      const body = req.body;
      const salt = bcrypt.genSaltSync(10);
      const hashPassword = bcrypt.hashSync(body.password, salt);
      const user = await db.User.findOne({
        where: { username: body.username },
      });
      const checkPhone = await db.User.findOne({
        where: { phone: body.phone },
      });
      if (checkPhone) {
        return next(
          createError(res, 401, "This phone number is already in use")
        );
      }
      if (user) {
        return next(createError(res, 401, "User already exists"));
      }

      const newUser = await db.User.create({ ...body, password: hashPassword });
      return res.status(201).json({
        success: true,
        message: "Sign Up Successfully",
        user: newUser,
      });
    } catch (error) {
      return next(createError(res, 500, error.message));
    }
  },
  login: async (req, res, next) => {
    try {
      const body = req.body;
      const user = await db.User.findOne({
        where: { username: body.username },
      });
      if (!user) {
        return next(createError(res, 401, "User already exists"));
      }
      const comparePassword = bcrypt.compareSync(body.password, user.password);
      if (!comparePassword)
        return next(createError(res, 401, "Password or account is incorrect"));
      const isBanned = await db.User.findOne({
        where: { username: body.username, status: false },
      });
      if (isBanned)
        return next(
          createError(res, 403, "Your account is blocked by the administrator")
        );
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
      const { password, ...otherDetails } = user.toJSON();
      return res.json({
        success: true,
        message: "Login successfully",
        accessToken: token,
        user: otherDetails,
      });
    } catch (error) {
      return next(createError(res, 500, error.message));
    }
  },
};
