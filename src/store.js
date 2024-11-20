import { configureStore } from "@reduxjs/toolkit";
import departmentsReducer  from './features/departmentsSlice'

const store = configureStore({
    reducer: {
        deparments: departmentsReducer,
    }
})

export default store;