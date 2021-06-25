import mongoose from "mongoose";


const Schema = mongoose.Schema;

const watchlistedItemModel = new Schema({
    itemId: String,
    customerEmail: String,
});

const watchlistedItemDetails = mongoose.model("watchlistedItemModel", watchlistedItemModel);

export default watchlistedItemDetails;

