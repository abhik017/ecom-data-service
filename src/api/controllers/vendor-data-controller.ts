import express = require('express');
import httpStatus = require("http-status");
import itemDetails from '../models/item-model';

export class VendorDataController {
    public async pushItemData(request: any, response: express.Response) {
        try {
            const payload: any = request.payload;
            if( !payload || payload.role !== "vendor" || !payload.aud ) {
                throw "This is an unauthorized request!";
            }
            const itemInfo = request.body;
            if( !itemInfo.itemName || !itemInfo.buyPrice || !itemInfo.vendorEmail || itemInfo.vendorEmail !== payload.aud || !itemInfo.quantity || isNaN(parseInt(itemInfo.quantity)) || parseInt(itemInfo.quantity) < 0 || parseFloat(itemInfo.quantity) % 1 !== 0 || isNaN(parseFloat(itemInfo.buyPrice)) || parseFloat(itemInfo.buyPrice) < 0 ) {
                throw "The provided information is either invalid or insufficient!"
            }
            const obj = await itemDetails.findOne({itemName: itemInfo.itemName, buyPrice: itemInfo.buyPrice, vendorEmail: payload.aud}) ;
            if(obj) {
                await itemDetails.updateOne({itemName: itemInfo.itemName, buyPrice: itemInfo.buyPrice, vendorEmail: payload.aud}, {quantity: parseInt(obj.quantity) + parseInt(itemInfo.quantity)});
                console.log("Item updated in the database!");
                response.status(httpStatus.OK).send("Item updated!");
            }
            else {
                const dbData = new itemDetails({
                itemName: itemInfo.itemName,
                itemId: itemInfo.vendorEmail + Date.now(),
                buyPrice: parseFloat(itemInfo.buyPrice),
                quantity: parseInt(itemInfo.quantity),
                description: itemInfo.description,
                vendorEmail: itemInfo.vendorEmail,
                img: itemInfo.img // to be recieved in the form of base64 string
                });
                await dbData.save();
                console.log("Item saved in the database!");
                response.status(httpStatus.OK).send("Item saved!");
            }
        } catch(err) {
            console.log(err);
            response.status(httpStatus.BAD_REQUEST).send(err.toString() + " Invalid Request!");
        }
    }
    public async editItemData(request: any, response: express.Response) {
        try {
            const payload: any = request.payload;
            if(!payload || payload.role !== "vendor" || !payload.aud) {
                throw "This is an unauthorized  request!";
            }
            const itemInfo = request.body;
            if( !itemInfo.vendorEmail || !itemInfo.itemId || (itemInfo.quantity && (isNaN(parseInt(itemInfo.quantity)) || parseInt(itemInfo.quantity) < 0) || parseFloat(itemInfo.quantity) % 1 !== 0) || (itemInfo.buyPrice && (isNaN(parseFloat(itemInfo.buyPrice)) || parseFloat(itemInfo.buyPrice) < 0))) {
                throw "The provided information is either invalid or insufficient!"
            }
            const dbData = await itemDetails.findOne({itemId: itemInfo.itemId});
            if(payload.aud !== dbData.vendorEmail) {
                throw "This is an unauthorized  request!";
            }
            const updatedData: any = {};
            const keys = ["itemName", "itemId", "img", "description", "vendorEmail", "quantity", "buyPrice"];
            for(let i = 0; i < keys.length; i++) {
                const key = keys[i] as keyof typeof updatedData;
                if( itemInfo[key] && itemInfo[key] !== updatedData[key] ) {
                    updatedData[key] = itemInfo[key];
                }
            }
            await itemDetails.updateOne({itemId: itemInfo.itemId}, updatedData);
            response.status(httpStatus.OK).send("Item updated!");
        } catch(err) {
            console.log(err);
            response.status(httpStatus.BAD_REQUEST).send(err.toString() + " Invalid Request!");
        }
    }
    public async fetchVendorItems(request: any, response: express.Response) {
        try {
            const payload = request.payload;
            if(!payload || payload.role !== "vendor" || !payload.aud) {
                throw "This is an unauthorized  request!";
            }
            const itemsArray = await itemDetails.find({vendorEmail: payload.aud});
            response.status(httpStatus.OK).send({
                itemsArray: itemsArray
            });
        } catch(err) {
            console.log(err);
            response.status(httpStatus.BAD_REQUEST).send(err.toString() + " Invalid Request!");
        }
    }

    public async deleteItem(request: any, response: express.Response) {
        try {
            const payload = request.payload;
            if(!payload || payload.role !== "vendor" || !payload.aud) {
                throw "This is an unauthorized  request!";
            }
            const itemInfo = request.body;
            if(!itemInfo || !itemInfo.itemId || !itemInfo.vendorEmail || itemInfo.vendorEmail !== payload.aud) {
                throw "The provided information is either invalid or insufficient!";
            }
            await itemDetails.deleteOne({itemId: itemInfo.itemId});
            response.status(httpStatus.OK).send("The item has been deleted successfully!");
        } catch(err) {
            console.log(err);
            response.status(httpStatus.BAD_REQUEST).send(err.toString() + " Could not remove the item!");
        }
    }
 }