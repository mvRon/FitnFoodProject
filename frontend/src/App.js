import React, { Fragment, useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import { routes } from './routes'
import { useDispatch, useSelector } from 'react-redux'
import * as UserService from './services/UserService'
import { isJsonString } from './utils'
import { jwtDecode } from "jwt-decode";
import { resetUser, updateUser } from './redux/slice/userSlice'
import LoadingComponent from './components/LoadingComponent/LoadingComponent'
import DefaultComponent from './components/DefaultComponent/DefaultComponent'
import { message } from 'antd'
import { fetchCart } from './redux/slice/orderSlice'



function App() {

  const dispatch = useDispatch()
  const user = useSelector((state) => state.user)

  const [isLoading, setIsLoading] = useState(false)


  useEffect(() => {
    setIsLoading(true)
    const { storageData, decoded } = handleDecoded()
    if (decoded?.id) {
      handleGetDetailUser(storageData)
      dispatch(fetchCart(decoded?.id))
    }
    setIsLoading(false)

  }, [])

  const handleGetDetailUser = async (token) => {
    let storageRefreshToken = localStorage.getItem('refresh_token');
    const refresh_token = JSON.parse(storageRefreshToken);
    const res = await UserService.getDetailUser(token);
    dispatch(updateUser({ ...res?.data, access_token: token, refresh_token: refresh_token }));
    setIsLoading(false)
  };


  const handleDecoded = () => {
    let storageData = localStorage.getItem('access_token');
    let decoded = {};

    try {
      if (storageData && storageData !== 'undefined' && isJsonString(storageData)) {
        const parsed = JSON.parse(storageData);
        decoded = jwtDecode(parsed);
        return { decoded, storageData: parsed };
      }
    } catch (error) {
      console.error("Lỗi parse access_token:", error);
    }

    return { decoded: {}, storageData: null };
  };


  UserService.axiosJWT.interceptors.request.use(async (config) => {
    const currentTime = new Date()

    const { decoded, storageData } = handleDecoded()
    let storageRefreshToken = localStorage.getItem('refresh_token'); //byRon
    const refresh_token = JSON.parse(storageRefreshToken); //byRon
    const decodedRefreshToken = jwtDecode(refresh_token);
    // console.log("Token cũ trước khi gọi API /refreshToken", storageData);


    if (decoded?.exp < currentTime.getTime() / 1000) {
      if (decodedRefreshToken?.exp > currentTime.getTime() / 1000) { //byRon
        const data = await UserService.refreshToken(refresh_token) //byRon
        config.headers['token'] = `Bearer ${data?.access_token}` //byRon
        //byRon
        localStorage.removeItem('access_token')
        console.log('data', data)
        dispatch(updateUser({ ...user, access_token: data.access_token }))  // cập nhật Redux
        localStorage.setItem('access_token', JSON.stringify(data?.access_token))


      } else {
        dispatch(resetUser()) //byRon
      }




    }
    return config
  }, (err) => {
    return Promise.reject(err)
  })




  UserService.axiosJWT.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config

      if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
        originalRequest._retry = true

        // Clear localStorage + Redux
        localStorage.removeItem('access_token')
        dispatch(resetUser())
      }

      return Promise.reject(error)
    }
  )


  return (

    <div>
      <LoadingComponent isPending={isLoading}>
        <Router>
          <Routes>
            {routes.map((route) => {
              const Page = route.page
              const isCheckAuth = !route.isPrivate || user?.isAdmin
              const Layout = route.isShowHeader ? DefaultComponent : Fragment
              return (
                <Route key={route.path} path={isCheckAuth ? route.path : undefined} element={
                  <Layout>
                    <Page />
                  </Layout>
                } />
              )
            })}
          </Routes>
        </Router>
      </LoadingComponent>
    </div>
  )
}

export default App

