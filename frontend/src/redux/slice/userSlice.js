import { createSlice } from '@reduxjs/toolkit'
// import { orderSlice } from './orderSlice'

const initialState = {
    id: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    avatar: '',
    access_token: '',
    isAdmin: false,
    city: '',
    refresh_token: '' //byRon
}


export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        updateUser: (state, acction) => {
            const { _id = '', name = '', email = '', phone = '', address = '', avatar = '', access_token , isAdmin, city= '', refresh_token = ''} = acction.payload
            state.id = _id
            state.name = name
            state.email = email
            state.phone = phone
            state.address = address
            state.avatar = avatar
            state.access_token = localStorage.getItem('access_token')
            state.isAdmin = isAdmin
            state.city = city
            state.refresh_token = refresh_token 

        },
        resetUser: (state) => {
            state.id = ""
            state.name = ""
            state.email = ""
            state.phone = ""
            state.address = ""
            state.avatar = ""
            state.access_token = localStorage.clear()
            state.isAdmin = false
            state.city = ""
            state.refresh_token = "" 
        }

    }
})

// Action creators are generated for each case reducer function
export const { updateUser, resetUser } = userSlice.actions

export default userSlice.reducer