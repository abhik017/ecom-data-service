import express = require("express");
import httpStatus = require("http-status");
import jwt = require("jsonwebtoken");
export class JwtHelper {
    public async verifyAsyncToken(request: any, response: express.Response) {
        try {
            const authHeader: string | undefined = request.headers["authorization"];
            if( !authHeader ) {
                throw "The auth token is missing!";
            }
            const authToken: string | undefined = (authHeader.split(' '))[2];
            jwt.verify(authToken, process.env.ACCESS_TOKEN_SECRET as string, (err, payload) => {
                if(err) {
                    response.status(httpStatus.UNAUTHORIZED).send("The user is unauthorized!");
                } else {
                    request.payload = payload;
                }
            });
        } catch(err) {
            console.log(err);
            response.status(httpStatus.UNAUTHORIZED).send("The user cannot be authorized!");
        }
    }
}