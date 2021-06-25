import express from 'express';
import httpStatus = require("http-status");
import itemDetails from '../models/item-model';
import purchasedItemDetails from '../models/purchased-item-model';
import userDetails from '../models/user-model';
import watchlistedItemDetails from '../models/watchlisted-item-model';
export class CustomerDataController {
    public async fetchItems(request: any, response: express.Response) {
        try {
            const payload = request.payload;
            if( !payload || payload.role !== "customer") {
                throw "This is an unauthorized request!";
            }
            const itemsArray = await itemDetails.find({quantity: { $gte: 1 }});
            response.status(httpStatus.OK).send({
                itemsArray: itemsArray
            });
        } catch(err) {
            console.log(err);
            response.status(httpStatus.BAD_REQUEST).send(err.toString() + " Invalid Request!");
        }
    }
    public async purchasedItems(request: any, response: express.Response) {
        try {
            const payload = request.payload;
            if( !payload || payload.role !== "customer" || !payload.aud) {
                throw "This is an unauthorized request!";
            }
            const purchasedItemsArray = await purchasedItemDetails.find({customerEmail: payload.aud});
            const itemsArray: any = [];
            for(const purchasedItemObject of purchasedItemsArray) {
                const purchasedQuantity = purchasedItemObject.quantity;
                const itemId = purchasedItemObject.itemId;
                try {
                    const item = await itemDetails.findOne({itemId: itemId});
                    item.quantity = purchasedQuantity;
                    itemsArray.push(item);
                } catch(err) {
                    console.log(err);
                }
            }
            response.status(httpStatus.OK).send({
                itemsArray: itemsArray
            });
        } catch(err) {
            console.log(err);
            response.status(httpStatus.BAD_REQUEST).send(err.toString() + " Invalid Request!");
        }
    }

    public async buyItem(request: any, response: express.Response) {
        try {
            const payload = request.payload;
            if( !payload || payload.role !== "customer" || !payload.aud) {
                throw "This is an unauthorized request!";
            }
            const itemInfo = request.body;
            if( !itemInfo || !itemInfo.itemId || !itemInfo.quantity || isNaN(parseInt(itemInfo.quantity)) || parseInt(itemInfo.quantity) < 0 || parseFloat(itemInfo.quantity) % 1 !== 0) {
                throw "The provided information is either insufficient or is invalid!";
            }
            const customerInfo = await userDetails.findOne({email: payload.aud});
            const customerBalance = customerInfo.accountBalance;
            const fetchedItemInfo = await itemDetails.findOne({itemId: itemInfo.itemId});
            const vendorEmail = fetchedItemInfo.vendorEmail;
            const itemPrice = fetchedItemInfo.buyPrice;
            const itemQuantity = fetchedItemInfo.quantity;
            const vendorInfo = await userDetails.findOne({email: vendorEmail});
            const vendorBalance = vendorInfo.accountBalance;
            if( !itemPrice || !vendorEmail || vendorBalance === undefined || !itemQuantity ) {
                throw "There was an error in fetching item details!";
            } else if( !customerBalance || customerBalance < itemInfo.quantity * itemPrice ) {
                response.status(httpStatus.BAD_REQUEST).send("Insufficient funds in the account!");
                return;
            } else if( itemQuantity < itemInfo.quantity ) {
                response.status(httpStatus.BAD_REQUEST).send("The specified quantity of the item is not available!");
                return;
            } else {
                await userDetails.updateOne({email: payload.aud}, {accountBalance: customerBalance - (itemInfo.quantity * itemPrice)});
                await userDetails.updateOne({email: vendorEmail}, {accountBalance: vendorBalance + (itemInfo.quantity * itemPrice)});
                await itemDetails.updateOne({itemId: itemInfo.itemId}, {quantity: itemQuantity - itemInfo.quantity});
                const dbdata = new purchasedItemDetails({
                    itemId: itemInfo.itemId,
                    quantity: parseInt(itemInfo.quantity),
                    vendorEmail: vendorEmail,
                    customerEmail: payload.aud,
                    purchaseDate: Date.now()
                });
                await dbdata.save();
                response.status(httpStatus.OK).send("Item purchased!");
            }
        } catch(err) {
            console.log(err);
            response.status(httpStatus.BAD_REQUEST).send(err.toString() + " Invalid Request! If you find that account balance has been deducted, call customer care!");
        }
    }
    public async addToWatchlist(request: any, response: express.Response) {
        try {
            const payload = request.payload;
            if( !payload || payload.role !== "customer" || !payload.aud) {
                throw "This is an unauthorized request!";
            }
            const itemInfo = request.body;
            if( !itemInfo || !itemInfo.itemId ) {
                throw "The provided information is either insufficient or is invalid!";
            }
            const obj = await watchlistedItemDetails.findOne({itemId: itemInfo.itemId});
            if(obj) {
                throw "The item is already in the watchlist!";
            }
            const dbdata = new watchlistedItemDetails({
                itemId: itemInfo.itemId,
                customerEmail: payload.aud
            });
            await dbdata.save();
            response.status(httpStatus.OK).send("Item added in the watchlist!");
        } catch(err) {
            console.log(err);
            response.status(httpStatus.BAD_REQUEST).send(err.toString() + " Could not add the item to the watchlist!");
        }
    }

    public async fetchWatchlist(request: any, response: express.Response) {
        try {
            const payload = request.payload;
            if( !payload || payload.role !== "customer" || !payload.aud) {
                throw "This is an unauthorized request!";
            }
            const items = await watchlistedItemDetails.find({customerEmail: payload.aud});
            const itemsArray: any = [];
            for(const item of items) {
                try {
                    const itemId = item.itemId;
                    const obj = await itemDetails.findOne({itemId: itemId});
                    if(obj) {
                        itemsArray.push(obj);
                    }
                } catch (err) {
                    console.log(err);
                }
            }
            response.status(httpStatus.OK).send({
                itemsArray: itemsArray
            });
        } catch(err) {
            console.log(err);
            response.status(httpStatus.BAD_REQUEST).send(err.toString() + " Could not fetch the watchlist!");
        }
    }

    public async deleteWatchlistItem(request: any, response: express.Response) {
        try {
            const payload = request.payload;
            if( !payload || payload.role !== "customer" || !payload.aud) {
                throw "This is an unauthorized request!";
            }
            const itemInfo = request.body;
            if(!itemInfo || !itemInfo.itemId) {
                throw "The provided information is either insufficient or is invalid!";
            }
            await watchlistedItemDetails.deleteOne({itemId: itemInfo.itemId});
            response.status(httpStatus.OK).send("Item deleted from the watchlist!");
        } catch(err) {
            console.log(err);
            response.status(httpStatus.BAD_REQUEST).send(err.toString() + " Could not delete the Item!");
        }
    }
}