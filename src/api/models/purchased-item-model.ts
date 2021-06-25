import mongoose from "mongoose";


const Schema = mongoose.Schema;

const purchasedItemModel = new Schema({
    itemId: String,
    quantity: Number,
    vendorEmail: String,
    customerEmail: String,
    purchaseDate: String,
});

const purchasedItemDetails = mongoose.model("purchasedItemModel", purchasedItemModel);

export default purchasedItemDetails;

