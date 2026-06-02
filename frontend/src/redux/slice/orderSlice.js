
//Bản cập nhật mới - ở bản này sẽ gọi api để lưu lại cart của người dùng chứ ko còn lưu ở local nữa
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as CartService from '../../services/CartService'

// ======= Async Thunks =======

const getAccessTokenFromState = (state) => {
  const tokenFromRedux = state?.user?.access_token
  if (tokenFromRedux) return tokenFromRedux
  return localStorage.getItem('access_token')
}

// Lấy giỏ hàng từ backend khi người dùng đăng nhập
export const fetchCart = createAsyncThunk('order/fetchCart', async (userId, thunkAPI) => {
  const access_token = getAccessTokenFromState(thunkAPI.getState())
  const data = await CartService.getCart(userId, access_token)
  return data?.data?.items || []
})

// Gửi giỏ hàng lên backend khi người dùng đăng xuất
export const syncCart = createAsyncThunk('order/syncCart', async ({ userId, cartItems }, thunkAPI) => {
  const access_token = getAccessTokenFromState(thunkAPI.getState())
  const latestCartItems = cartItems ?? thunkAPI.getState()?.order?.orderItems ?? []
  const data = await CartService.updateCart(userId, latestCartItems, access_token)
  return data?.data?.items || []
})

export const orderSlice = createSlice({
  name: 'order',
  initialState: {
    orderItems: [],
    orderItemSelected: [],
    shippingAddress: {},
    payementMethod: '',
    itemsPrice: 0,
    shippingPrice: 0,
    taxPrice: 0,
    totalPrice: 0,
    user: '',
    isPaid: false,
    paidAt: '',
    isDelivered: false,
    isSuccessOrder: false
  },
  reducers: {
    addOrder: (state, action) => {
      const { orderItem } = action.payload
      const itemOrder = state.orderItems.find(item => item.product === orderItem.product)
      const stock = Number(orderItem.countInStock ?? itemOrder?.countInStock ?? 0)

      // console.log('orderItem', orderItem)
      // console.log('itemOrder', itemOrder)

      if (itemOrder) {
        const nextAmount = Number(itemOrder.amount || 0) + Number(orderItem.amount || 0)
        if (nextAmount <= stock) {
          itemOrder.amount = nextAmount
          itemOrder.countInStock = stock
          state.isSuccessOrder = true
          state.isErrorOrder = false
        } else {
          state.isSuccessOrder = false
          state.isErrorOrder = true
        }
      } else {
        if (Number(orderItem.amount || 0) <= stock && stock > 0) {
          state.orderItems.push({
            ...orderItem,
            countInStock: stock,
          })
          state.isSuccessOrder = true
          state.isErrorOrder = false
        } else {
          state.isSuccessOrder = false
          state.isErrorOrder = true
        }
      }
    },
    resetOrder: (state) => {
      state.isSuccessOrder = false
    },
    increaseAmount: (state, action) => {
      const { idProduct } = action.payload
      // const itemOrder = state.orderItems.find(item => item.product._id === idProduct)
      const itemOrder = state.orderItems.find(item => item.product === idProduct);
      const itemOrderSelected = state.orderItemSelected.find(item => item.product === idProduct)
      itemOrder.amount++
      if (itemOrderSelected) {
        itemOrderSelected.amount++
      }
    },
    

    decreaseAmount: (state, action) => {
      const { idProduct } = action.payload
      // const itemOrder = state.orderItems.find(item => item.product._id === idProduct)
      const itemOrder = state.orderItems.find(item => item.product === idProduct);
      const itemOrderSelected = state.orderItemSelected.find(item => item.product === idProduct)
      itemOrder.amount--
      if (itemOrderSelected) {
        itemOrderSelected.amount--
      }
    },
    removeOrder: (state, action) => {
      const { idProduct } = action.payload
      // state.orderItems = state.orderItems.filter(item => item.product._id !== idProduct)
      // state.orderItemSelected = state.orderItemSelected.filter(item => item.product._id !== idProduct)
      state.orderItems = state.orderItems.filter(item => item.product !== idProduct)
      state.orderItemSelected = state.orderItemSelected.filter(item => item.product !== idProduct)
    },
    removeAllOrder: (state, action) => {
      const { listChecked } = action.payload
      // state.orderItems = state.orderItems.filter(item => !listChecked.includes(item.product._id))
      // state.orderItemSelected = state.orderItemSelected.filter(item => !listChecked.includes(item.product._id))
      state.orderItems = state.orderItems.filter(item => !listChecked.includes(item.product))
      state.orderItemSelected = state.orderItemSelected.filter(item => !listChecked.includes(item.product))
    },

    selectedOrder: (state, action) => {
      const { listChecked } = action.payload;
      state.orderItemSelected = state.orderItems.filter(order =>
        listChecked.includes(order.product)
      );
    },
    clearOrder: (state) => {
      state.orderItems = []
      state.orderItemSelected = []
      state.shippingAddress = {}
      state.payementMethod = ''
      state.itemsPrice = 0
      state.shippingPrice = 0
      state.taxPrice = 0
      state.totalPrice = 0
      state.user = ''
      state.isPaid = false
      state.paidAt = ''
      state.isDelivered = false
      state.isSuccessOrder = false
    },
    // Nhận dữ liệu giỏ hàng trực tiếp từ socket event (chatbot cart sync)
    setCartFromSocket: (state, action) => {
      state.orderItems = action.payload || []
      state.orderItemSelected = []
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.orderItems = action.payload
      })
      .addCase(syncCart.fulfilled, (state, action) => {
        state.orderItems = action.payload
      })
  }
})


export const {
  addOrder,
  removeOrder,
  increaseAmount,
  decreaseAmount,
  removeAllOrder,
  selectedOrder,
  resetOrder,
  clearOrder
} = orderSlice.actions

export default orderSlice.reducer