import { createSlice } from '@reduxjs/toolkit'

export const productSlice = createSlice({
  name: 'products',
  initialState: {
    search: ''
  },
  reducers: {
    searchProduct: (state, action) => {
      state.search = action.payload
    }
  }
})

// Action creators are generated for each case reducer function
export const { searchProduct } = productSlice.actions

export default productSlice.reducer