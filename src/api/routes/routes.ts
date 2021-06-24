import apiControllersFactory = require("../../controller-factory");
import express = require("express");

export function routes(app: express.Express) {
    const { jwtHelper, vendorDataController } = apiControllersFactory.getApiControllers();
    app.route("/v0/").post( async (req, res) => {
        jwtHelper.verifyAsyncToken(req, res) 
    });
    app.route("/v0/vendor/item").post( async (req, res) => {
        await jwtHelper.verifyAsyncToken(req, res);
        vendorDataController.pushItemData(req, res);
    })
    .patch( async(req, res) => {
        await jwtHelper.verifyAsyncToken(req, res);
        vendorDataController.editItemData(req, res);
    });
    app.route("/v0/vendor/get-my-items").get( async(req, res) => {
        await jwtHelper.verifyAsyncToken(req, res);
        vendorDataController.fetchVendorItems(req, res);
    });
}