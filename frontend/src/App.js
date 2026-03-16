import React, { Fragment, useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import { routes } from './routes'
import { useDispatch, useSelector } from 'react-redux'
// import * as UserService from './services/UserService'
// import { isJsonString } from './utils'
import { jwtDecode } from "jwt-decode";
import { resetUser, updateUser } from './redux/slice/userSlice'
import LoadingComponent from './components/LoadingComponent/LoadingComponent'
import DefaultComponent from './components/DefaultComponent/DefaultComponent'
import { message } from 'antd'
import { fetchCart } from './redux/slice/orderSlice'



function App() {

  const user = useSelector((state) => state.user)
  

  return (

    <div>
      <LoadingComponent isPending={false}>
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

