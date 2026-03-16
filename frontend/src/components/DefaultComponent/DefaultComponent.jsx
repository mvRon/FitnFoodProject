import React, { use, useEffect } from 'react'
import HeaderComponent from '../HeaderComponent/HeaderComponent'
import FooterComponent from '../FooterComponent/FooterComponent'
import { LayoutContainer, LayoutContent } from './Style'
import { useDispatch, useSelector } from 'react-redux'
import { message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { resetUser } from '../../redux/slice/userSlice'
const DefaultComponent = ({ children }) => {


  return (
    <LayoutContainer>
      <HeaderComponent />
      <LayoutContent>
        {children}
      </LayoutContent>
      <FooterComponent />
    </LayoutContainer>
  )
}

export default DefaultComponent