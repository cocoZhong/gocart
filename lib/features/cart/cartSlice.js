import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { getHeader } from "@/utils";
let debounceTimer;
export const fetchCart = createAsyncThunk(
    "cart/fetchCart",
    async (_, thunkAPI) => {
        try {
            const header = await getHeader();
            const { data } = await axios.get("/api/cart", header);
            return data.cart;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);
export const updateCart = createAsyncThunk(
    "cart/updateCart",
    async (_, thunkAPI) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
            try {
                const header = await getHeader();
                const cartItems = thunkAPI.getState().cart.cartItems;
                await axios.post("/api/cart", { cart: cartItems }, header);
            } catch (error) {
                return thunkAPI.rejectWithValue(error);
            }
        }, 1000);
    }
);
const cartSlice = createSlice({
    name: "cart",
    initialState: {
        total: 0,
        cartItems: {},
    },
    reducers: {
        addToCart: (state, action) => {
            const { productId } = action.payload;
            if (state.cartItems[productId]) {
                state.cartItems[productId]++;
            } else {
                state.cartItems[productId] = 1;
            }
            state.total += 1;
        },
        removeFromCart: (state, action) => {
            const { productId } = action.payload;
            if (state.cartItems[productId]) {
                state.cartItems[productId]--;
                if (state.cartItems[productId] === 0) {
                    delete state.cartItems[productId];
                }
            }
            state.total -= 1;
        },
        deleteItemFromCart: (state, action) => {
            const { productId } = action.payload;
            state.total -= state.cartItems[productId]
                ? state.cartItems[productId]
                : 0;
            delete state.cartItems[productId];
        },
        clearCart: (state) => {
            state.cartItems = {};
            state.total = 0;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchCart.fulfilled, (state, action) => {
            state.cartItems = action.payload.cart;
            state.total = Object.values(action.payload.cart).reduce(
                (acc, item) => acc + item,
                0
            );
        });
    },
});

export const { addToCart, removeFromCart, clearCart, deleteItemFromCart } =
    cartSlice.actions;

export default cartSlice.reducer;
