'use strict';

module.exports = () => {
    return async (ctx, next) => {
        if (ctx.request.url === '/admin/license-limit-information') {
            ctx.body = {
                permittedSeats: -1,
                currentSeats: 1,
                isHostedOnStrapiCloud: false,
                licenseType: 'MIT',
            };
        } else {
            return next();
        }
    };
};
