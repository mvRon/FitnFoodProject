import AdminPage from "../pages/AdminPage/AdminPage";
import HomePage from "../pages/HomePage/HomePage";
import LoginPage from "../pages/LoginPage/LoginPage";
import OrderPage from "../pages/OrderPage/OrderPage";
import PaymentPage from "../pages/PaymentPage/PaymentPage";
import ProductDetailPage from "../pages/ProductDetailPage/ProductDetailPage";
import ProfileUserPage from "../pages/ProfileUserPage/ProfileUserPage";
import RegisterPage from "../pages/RegisterPage/RegisterPage";
import TypeProductPage from "../pages/TypeProductPage/TypeProductPage";
import OrderSuccessPage from "../pages/OrderSuccessPage/OrderSuccessPage";
import OrderListPage from "../pages/OrderListPage/OrderListPage";
import OrderDetailPage from "../pages/OrderDetailPage/OrderDetailPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage/ResetPasswordPage";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";



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
        isPrivate: true
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
    {
        path: '/payment',
        page: PaymentPage,
        isPrivate: false,
        isShowHeader: true
    },
    {
        path: '/orderSuccess',
        page: OrderSuccessPage,
        isPrivate: false,
        isShowHeader: true
    },
    {
        path: '/myOrder',
        page: OrderListPage,
        isPrivate: false,
        isShowHeader: true
    },
    {
        path: '/orderDetail/:orderId',
        page: OrderDetailPage,
        isPrivate: false,
        isShowHeader: true
    },
    {
        path: '/forgot-password',
        page: ForgotPasswordPage,
        isPrivate: false,
        isShowHeader: true
    },
    {
        path: '/reset-password',
        page: ResetPasswordPage,
        isPrivate: false,
        isShowHeader: true
    },
    {
        path: '*',
        page: NotFoundPage,
        isShowHeader: true,
        isPrivate: false
    }
]