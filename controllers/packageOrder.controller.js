const db = require("../models");
const createError = require("../utils/error");
const moment = require("moment");
const { Op } = require("sequelize");
module.exports = {
  orderPackage: async (req, res, next) => {
    try {
      const body = req.body;
      const packageId = req.params.id;
      const newOrder = await db.PackageOrder.create({
        ...body,
        packageId: packageId,
      });

      return res.status(201).json({
        success: true,
        messsage: "Add order success",
        order: newOrder,
      });
    } catch (error) {
      return next(createError(res, 500, error.message));
    }
  },

  getPackageOrderByIdPk: async (req, res, next) => {
    try {
      const packageOrderId = req.params.id;
      const packageOrder = await db.PackageOrder.findByPk(packageOrderId);
      return res.json({
        success: true,
        message: "Package Order",
        packageOrder,
      });
    } catch (error) {
      return next(createError(res, 500, error.message));
    }
  },

  getPackageOrderByUserId: async (req, res, next) => {
    try {
      const user = req.user;
      const kidProfiles = await db.KidProfile.findAll();
      const kidIds = kidProfiles
        .filter((kidProfile) => kidProfile.userId === user.userId)
        .map((kidProfile) => kidProfile.id);
      const packageOrders = await db.PackageOrder.findAll({
        where: {
          kidId: {
            [db.Sequelize.Op.in]: kidIds,
          },
        },
      });
      return res.json({
        success: true,
        message: "Get data success",
        packageOrders,
      });
    } catch (error) {
      return next(createError(res, 500, error.message));
    }
  },

  getAllOrder: async (req, res, next) => {
    try {
      const orders = await db.PackageOrder.findAll();
      return res.json({ success: true, orders });
    } catch (error) {
      return next(createError(res, 500, error.message));
    }
  },

  pushPackageInPeriod: async (req, res, next) => {
    try {
      const packageOrderId = req.params.id;
      const body = req.body;
      const packageOrder = await db.PackageOrder.findByPk(packageOrderId);
      const pushPackageOrder = [
        ...packageOrder.packageInPeriodIds,
        body.packageInPeriodId,
      ];
      const updatePackageOrder = await packageOrder.update({
        packageInPeriodIds: pushPackageOrder,
      });
      return res.json({
        success: true,
        message: "Add box success",
        packageOrder: updatePackageOrder,
      });
    } catch (error) {
      return next(createError(res, 500, error.message));
    }
  },

  pushProductOrder: async (req, res, next) => {
    try {
      const { packageOrderId } = req.params;
      const packageOrder = await db.PackageOrder.findByPk(packageOrderId);
      const plainPackageOrder = packageOrder.get({ plain: true });
      const packageInPeriods = await db.PackageInPeriod.findAll();
      const matchingPeriods = packageInPeriods.filter(
        (el) => el.packageOrderId == packageOrderId
      );
      const periodsWithProduct = matchingPeriods.filter(
        (el) => el.status !== "OPEN"
      );

      if (periodsWithProduct.length === 0) {
        return next(createError(res, 404, "Không khớp với cái nào"));
      }
      let packageInPeriodIds = [];
      periodsWithProduct.forEach((period) => {
        if (!packageInPeriodIds.includes(period.id)) {
          packageInPeriodIds.push(period.id);
        }
      });
      packageOrder.packageInPeriodIds = packageInPeriodIds;
      await packageOrder.save();

      return res.json({
        success: true,
        message: "Thêm PeriodId vào thành công",
        packageOrder,
      });
    } catch (error) {
      return next(createError(res, 500, error.message));
    }
  },

  revenueWeekDashboard: async (req, res, next) => {
    try {
      const startOfWeek = moment().startOf("week").toDate();
      const endOfWeek = moment().endOf("week").toDate();

      const startOfLastWeek = moment()
        .subtract(1, "weeks")
        .startOf("week")
        .toDate();
      const endOfLastWeek = moment()
        .subtract(1, "weeks")
        .endOf("week")
        .toDate();

      const ordersThisWeek = await db.PackageOrder.findAll({
        where: {
          createdAt: {
            [Op.between]: [startOfWeek, endOfWeek],
          },
        },
      });

      const ordersLastWeek = await db.PackageOrder.findAll({
        where: {
          createdAt: {
            [Op.between]: [startOfLastWeek, endOfLastWeek],
          },
        },
      });

      const newAccountsThisWeek = await db.User.findAll({
        where: {
          createdAt: {
            [Op.between]: [startOfWeek, endOfWeek],
          },
        },
      });

      let countThisWeek = ordersThisWeek.length;
      let sumMoneyThisWeek = ordersThisWeek.reduce((sum, order) => {
        const totalPrice = parseFloat(order.totalPrice.replace(/,/g, "")) || 0;
        return sum + totalPrice;
      }, 0);

      let sumMoneyLastWeek = ordersLastWeek.reduce((sum, order) => {
        const totalPrice = parseFloat(order.totalPrice.replace(/,/g, "")) || 0;
        return sum + totalPrice;
      }, 0);

      let growthRate = 0;
      if (sumMoneyLastWeek > 0) {
        growthRate =
          ((sumMoneyThisWeek - sumMoneyLastWeek) / sumMoneyLastWeek) * 100;
      }

      let totalNewAccountsThisWeek = newAccountsThisWeek.length;

      return res.json({
        success: true,
        countOrders: countThisWeek,
        sumMoneyInDateRange: sumMoneyThisWeek,
        growthRate,
        totalNewAccountsInDateRange: totalNewAccountsThisWeek,
      });
    } catch (error) {
      return next(createError(res, 500, error.message));
    }
  },
  revenueDateDashboard: async (req, res, next) => {
    try {
      const { startDate, endDate } = req.body;

      if (!startDate || !endDate) {
        return next(
          createError(400, "Both startDate and endDate are required.")
        );
      }

      const start = moment(startDate, "YYYY-MM-DD").startOf("day").toDate();
      const end = moment(endDate, "YYYY-MM-DD").endOf("day").toDate();

      const ordersInDateRange = await db.PackageOrder.findAll({
        where: {
          createdAt: {
            [Op.between]: [start, end],
          },
        },
      });

      const newAccountsInDateRange = await db.User.findAll({
        where: {
          createdAt: {
            [Op.between]: [start, end],
          },
        },
      });

      let countOrders = ordersInDateRange.length;
      let sumMoneyInDateRange = ordersInDateRange.reduce((sum, order) => {
        const totalPrice = parseFloat(order.totalPrice.replace(/,/g, "")) || 0;
        return sum + totalPrice;
      }, 0);

      let totalNewAccountsInDateRange = newAccountsInDateRange.length;

      return res.json({
        success: true,
        countOrders,
        sumMoneyInDateRange,
        totalNewAccountsInDateRange,
      });
    } catch (error) {
      return next(createError(res, 500, error.message));
    }
  },
  revenueMontthDashboard: async (req, res, next) => {
    try {
      const { month } = req.params;
      const startOfMonth = moment(month, "MM").startOf("month").toDate();
      const endOfMonth = moment(month, "MM").endOf("month").toDate();

      const weeks = [];
      let currentWeekStart = startOfMonth;

      while (currentWeekStart <= endOfMonth) {
        const currentWeekEnd = moment(currentWeekStart).endOf("week").toDate();
        weeks.push({
          start: currentWeekStart,
          end: currentWeekEnd > endOfMonth ? endOfMonth : currentWeekEnd,
        });
        currentWeekStart = moment(currentWeekStart)
          .add(1, "weeks")
          .startOf("week")
          .toDate();
      }

      const revenues = await Promise.all(
        weeks.map(async (week, index) => {
          const orders = await db.PackageOrder.findAll({
            where: {
              createdAt: {
                [Op.between]: [week.start, week.end],
              },
            },
          });

          const sumMoney = orders.reduce((sum, order) => {
            const totalPrice =
              parseFloat(order.totalPrice.replace(/,/g, "")) || 0;
            return sum + totalPrice;
          }, 0);

          return {
            [`week${index + 1}`]: sumMoney,
          };
        })
      );

      const data = revenues.reduce((result, weekData) => {
        return { ...result, ...weekData };
      }, {});

      return res.json({
        success: true,
        data,
      });
    } catch (error) {
      return next(createError(res, 500, error.message));
    }
  },
};
