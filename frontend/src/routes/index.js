import AdminPage from "../pages/AdminPage/AdminPage";
import HomePage from "../pages/HomePage/HomePage";
import LoginPage from "../pages/LoginPage/LoginPage";
import OrderPage from "../pages/OrderPage/OrderPage";
import ProductDetailPage from "../pages/ProductDetailPage/ProductDetailPage";
import ProfileUserPage from "../pages/ProfileUserPage/ProfileUserPage";
import RegisterPage from "../pages/RegisterPage/RegisterPage";
import TypeProductPage from "../pages/TypeProductPage/TypeProductPage";


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
    {
        path: '/system/admin',
        page: AdminPage,
        isShowHeader: true,
        isPrivate: false
    },
    {
        path: '/product/:type',
        page: TypeProductPage,
        isPrivate: false,
        isShowHeader: true
    },
    {
        path: '/profileUser',
        page: ProfileUserPage,
        isPrivate: false,
        isShowHeader: true
    },
]