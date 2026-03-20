import HomePage from "../pages/HomePage/HomePage";
import LoginPage from "../pages/LoginPage/LoginPage";
import OrderPage from "../pages/OrderPage/OrderPage";
import ProductDetailPage from "../pages/ProductDetailPage/ProductDetailPage";
import RegisterPage from "../pages/RegisterPage/RegisterPage";


export const routes = [
    {
        path: '/',
        page: HomePage,
        isShowHeader: true,
        isPrivate: false
    },
    {
        path: '/login',
        page: LoginPage,
        isShowHeader: true,
        isPrivate: false
    },
    {
        path: '/register',
        page: RegisterPage,
        isShowHeader: true,
        isPrivate: false
    },
    {
        path: '/productDetail/:id',
        page: ProductDetailPage,
        isShowHeader: true,
        isPrivate: false
    },
    {
        path: '/order',
        page: OrderPage,
        isShowHeader: true,
        isPrivate: false
    },
]