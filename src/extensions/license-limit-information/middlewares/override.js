// ./src/extensions/license-limit-information/middlewares/override.js
module.exports = (config, { strapi }) => {
    strapi.server.routes['GET /admin/license-limit-information'] = async (ctx) => {
        ctx.body = {
            permittedSeats: -1,
            currentSeats: 1,
            isHostedOnStrapiCloud: false,
            licenseType: 'MIT',
        };
    };
};
