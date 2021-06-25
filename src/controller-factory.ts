import { AccountBalanceController } from './api/controllers/account-balance-controller';
import { VendorDataController } from './api/controllers/vendor-data-controller';
import { JwtHelper } from "./api/controllers/jwt-helper";
import { CustomerDataController } from './api/controllers/customer-data-controller';
export function getApiControllers() {
    const jwtHelper: JwtHelper = new JwtHelper();
    const vendorDataController: VendorDataController = new VendorDataController();
    const customerDataController: CustomerDataController = new CustomerDataController();
    const accountBalanceController: AccountBalanceController = new AccountBalanceController();
    return {
        jwtHelper,
        vendorDataController,
        customerDataController,
        accountBalanceController
    };
}