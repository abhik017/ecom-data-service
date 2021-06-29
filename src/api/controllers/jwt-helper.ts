import express = require("express");
import httpStatus = require("http-status");
import jwt = require("jsonwebtoken");
export class JwtHelper {
    public async verifyAccessToken(request: any, response: express.Response, isResponseNeeded: boolean = false) {
        try {
            const authHeader: string | undefined = request.headers["authorization"];
            const authToken: any = authHeader && (authHeader.split(' '))[1];
            if( !authToken || authToken === undefined ) {
                throw "The auth token is missing!";
            }
            jwt.verify(authToken, process.env.ACCESS_TOKEN_SECRET as string, (err: any, payload: any) => {
                if(err) {
                    response.status(httpStatus.UNAUTHORIZED).send("The user is unauthorized!");
                } else {
                    request.payload = payload;
                    if(isResponseNeeded) {
                        response.status(httpStatus.OK).send();
                    }
                }
            });
        } catch(err) {
            console.log(err);
            response.status(httpStatus.UNAUTHORIZED).send("The user cannot be authorized!");
        }
    }
    public async getAccessFromRefreshToken(request: any, response: express.Response) {
        try {
            const requestBody = request.body;
            const refreshToken = requestBody.refreshToken;
            if( !requestBody || !refreshToken ) {
                throw "The refresh token is missing!";
            }
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string, async (err: any, payload: any) => {
                if(err) {
                    response.status(httpStatus.UNAUTHORIZED).send("The user is unauthorized!");
                } else {
                    const accessToken = await this.signAccessToken(payload.aud, payload.role);
                    response.status(httpStatus.OK).send({
                        accessToken: accessToken,
                        refreshToken: refreshToken,
                        role: payload.role
                    });
                }
            });
        } catch(err) {
            console.log(err);
            response.status(httpStatus.UNAUTHORIZED).send("The user cannot be authorized!");
        }
    }

    private async signAccessToken(userEmail: string, userRole: string) {
        return new Promise((resolve, reject) => {
            const payload = {
                role: userRole // "vendor" or "customer"
            };
            const secret: string = process.env.ACCESS_TOKEN_SECRET as string;
            const options = {
                expiresIn: "10m",
                issuer: "e-com.com",
                audience: userEmail
            };
            jwt.sign(payload, secret, options, (err: any, token: any) => {
                if(err) {
                    console.log(err);
                    reject("Internal Server Error!");
                }
                resolve(token);
            });
        });
    }
}