import mongoose from "mongoose";


const Schema = mongoose.Schema;

const itemModel = new Schema({
    itemName: String,
    itemId: String,
    buyPrice: String,
    quantity: Number,
    description: String,
    vendorEmail: String,
    img: String // to be recieved in the form of base64 string
});

const itemDetails = mongoose.model("itemModel", itemModel);

export default itemDetails;

