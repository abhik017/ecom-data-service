import apiControllersFactory = require("../../controller-factory");
import express = require("express");
import httpStatus = require("http-status");

export function routes(app: express.Express) {
    const { jwtHelper, vendorDataController, customerDataController, accountBalanceController } = apiControllersFactory.getApiControllers();
    app.route("/").get( async (req: any, res: any) => {
       await jwtHelper.verifyAsyncToken(req, res);
       if(!res.headersSent && (!req.payload || !(req.payload.role !== "vendor" || req.payload.role !== "customer"))) {
            res.status(httpStatus.BAD_REQUEST).send("Invalid input!");
       } else if(!res.headersSent) {
           if(req.payload.role === "vendor") {
                res.redirect("/v0/vendor/get-my-items");
            } else {
                res.redirect("/v0/customer/shop");
            }
       }
    });
    app.route("/v0/vendor/item").post( async (req, res) => {
        await jwtHelper.verifyAsyncToken(req, res);
        if(!res.headersSent) {
            vendorDataController.pushItemData(req, res);
        }
    })
    .patch( async(req, res) => {
        await jwtHelper.verifyAsyncToken(req, res);
        if(!res.headersSent) {
            vendorDataController.editItemData(req, res);
        }
    })
    .delete(async(req, res) => {
        await jwtHelper.verifyAsyncToken(req, res);
        if(!res.headersSent) {
            vendorDataController.deleteItem(req, res);
        }
    });
    app.route("/v0/vendor/get-my-items").get( async(req: any, res: any) => {
        if(!req.payload) {
            await jwtHelper.verifyAsyncToken(req, res);
        }
        if(!res.headersSent) {
            vendorDataController.fetchVendorItems(req, res);
        }
    });
    app.route("/v0/customer/shop").get( async(req: any, res: any) => {
        if(!req.payload) {
            await jwtHelper.verifyAsyncToken(req, res);
        }
        if(!res.headersSent) {
            customerDataController.fetchItems(req, res);
        }
    });
    app.route("/v0/customer/item").post(async(req, res) => {
        await jwtHelper.verifyAsyncToken(req, res);
        if(!res.headersSent) {
            customerDataController.buyItem(req, res);
        }
    })
    .get(async(req, res) => {
        await jwtHelper.verifyAsyncToken(req, res);
        if(!res.headersSent) {
            customerDataController.purchasedItems(req, res);
        }
    });
    app.route("/v0/customer/watchlist").post(async(req, res) => {
        await jwtHelper.verifyAsyncToken(req, res);
        if(!res.headersSent) {
            customerDataController.addToWatchlist(req, res);
        }
    })
    .get(async(req, res) => {
        await jwtHelper.verifyAsyncToken(req, res);
        if(!res.headersSent) {
            customerDataController.fetchWatchlist(req, res);
        }
    })
    .delete(async(req, res) => {
        await jwtHelper.verifyAsyncToken(req, res);
        if(!res.headersSent) {
            customerDataController.deleteWatchlistItem(req, res);
        }
    });
    app.route("/v0/add-balance").post(async(req, res) => {
        await jwtHelper.verifyAsyncToken(req, res);
        if(!res.headersSent) {
            accountBalanceController.addBalance(req, res);
        }
    });
    app.route("/v0/withdraw-balance").post(async(req, res) => {
        await jwtHelper.verifyAsyncToken(req, res);
        if(!res.headersSent) {
            accountBalanceController.withdrawBalance(req, res);
        }
    });
}