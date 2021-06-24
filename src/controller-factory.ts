import { VendorDataController } from './api/controllers/vendor-data-controller';
import { JwtHelper } from "./api/controllers/jwt-helper";
export function getApiControllers() {
    const jwtHelper: JwtHelper = new JwtHelper();
    const vendorDataController: VendorDataController = new VendorDataController();
    return {
        jwtHelper, vendorDataController
    };
}