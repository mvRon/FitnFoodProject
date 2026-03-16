import { combineReducers, configureStore } from "@reduxjs/toolkit";
import userReducer from './slice/userSlice'
import productReducer from './slice/productSlice'
import orderReducer from './slice/orderSlice'
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER
} from 'redux-persist'

import storage from 'redux-persist/lib/storage'

const persistConfig = {
    key: 'root',
    storage,
    blacklist: ['product', 'user']
}

const rootReducer = combineReducers({
    product: productReducer,
    user: userReducer,
    order: orderReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleWare) =>
        getDefaultMiddleWare({
            serializableCheck: {
                ignoreActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
            }
        })
})

export let persistor = persistStore(store)