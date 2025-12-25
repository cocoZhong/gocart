"use client";
import Banner from "@/components/Banner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "@/lib/features/product/productSlice";
import { useUser } from "@clerk/nextjs";
import { updateCart, fetchCart } from "@/lib/features/cart/cartSlice";
import { fetchAddress } from "@/lib/features/address/addressSlice";
import { fetchUserRatings } from "@/lib/features/rating/ratingSlice";
export default function PublicLayout({ children }) {
    const dispatch = useDispatch();
    const { user } = useUser();
    const cardItems = useSelector((state) => state.cart.cartItems);
    useEffect(() => {
        dispatch(fetchProducts({}));
    }, []);
    useEffect(() => {
        if (user) {
            dispatch(fetchCart());
            dispatch(fetchAddress());
            dispatch(fetchUserRatings());
        }
    }, [user]);
    useEffect(() => {
        user && dispatch(updateCart());
    }, [cardItems]);

    return (
        <>
            <Banner />
            <Navbar />
            {children}
            <Footer />
        </>
    );
}
