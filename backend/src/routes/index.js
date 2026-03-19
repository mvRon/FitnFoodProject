const UserRouter = require('./UserRouter');
const ProductRouter = require('./ProductRouter');
const CategoryRouter = require('./CategoryRouter');
const CartRouter = require('./CartRouter');
const OrderRouter = require('./OrderRouter');
const DiscountRouter = require('./DiscountRouter');
const InventoryRouter = require('./InventoryRouter');



const routes = (app) => {
    app.use('/api/user', UserRouter);
    app.use('/api/product', ProductRouter);
    app.use('/api/category', CategoryRouter);
    app.use('/api/cart', CartRouter);
    app.use('/api/order', OrderRouter);
    app.use('/api/discount', DiscountRouter);
    app.use('/api/inventory', InventoryRouter);



};

module.exports = routes;