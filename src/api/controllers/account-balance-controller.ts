import httpStatus from "http-status";
import express = require("express");
import userDetails from "../models/user-model";

export class AccountBalanceController {
    public async addBalance(request: any, response: express.Response) {
        try {
            const payload = request.payload;
            if(!payload || payload.role !== "customer" || !payload.aud) {
                throw "This is an unauthorized request!";
            }
            const amountInfo = request.body;
            if(!amountInfo || !amountInfo.amount || isNaN(parseFloat(amountInfo.amount)) || parseFloat(amountInfo.amount) < 0) {
                throw "The provided information is either insufficient or is invalid!";
            }
            const userInfo = await userDetails.findOne({email: payload.aud});
            await userDetails.updateOne({email: payload.aud}, {
                accountBalance: parseFloat(userInfo.accountBalance) + parseFloat(amountInfo.amount)
            });
            response.status(httpStatus.OK).send("Funds will reflect shortly in your account!");
        } catch(err) {
            console.log(err);
            response.status(httpStatus.BAD_REQUEST).send(err.toString() + " If you find that amount from your bank account has been deducted, call customer care!");
        }
    }
    public async withdrawBalance(request: any, response: express.Response) {
        try {
            const payload = request.payload;
            if( !payload || !payload.aud) {
                throw "This is an unauthorized request!";
            }
            const amountInfo = request.body;
            if( !amountInfo || !amountInfo.amount || isNaN(parseFloat(amountInfo.amount)) || parseFloat(amountInfo.amount) < 0) {
                throw "The provided information is either insufficient or is invalid!";
            }
            const userInfo = await userDetails.findOne({email: payload.aud});
            if (userInfo.accountBalance < amountInfo.amount) {
                throw "Insufficient funds in the account!";
            }
            await userDetails.updateOne({email: payload.aud}, {
                accountBalance: parseFloat(userInfo.accountBalance) - parseFloat(amountInfo.amount)
            });
            response.status(httpStatus.OK).send("Funds will reflect shortly in your account!");
        } catch(err) {
            console.log(err);
            response.status(httpStatus.BAD_REQUEST).send(err.toString() + " If you find that amount from your account has been deducted, call customer care!");
        }
    }
}