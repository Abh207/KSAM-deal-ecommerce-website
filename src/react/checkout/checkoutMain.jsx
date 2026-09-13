import React, {
    useMemo,
    useState
} from "react";

import {
    createRoot
} from "react-dom/client";

import "./checkout.css";


import paymentData from "../../api/paymentMethods.json";



/* =========================================================
   CONSTANTS
========================================================= */

const CART_KEY = "cartProductLS";


/* =========================================================
   GET CART
========================================================= */

function getCart() {

    try {

        return JSON.parse(
            localStorage.getItem(CART_KEY)
        ) || [];

    } catch (error) {

        console.error(
            "Unable to read cart:",
            error
        );

        return [];

    }

}


/* =========================================================
   CHECKOUT COMPONENT
========================================================= */

function Checkout() {


    /* =====================================================
       CART
    ===================================================== */

    const [cart] = useState(
        getCart
    );


    /* =====================================================
       CHECKOUT STEP
    ===================================================== */

    const [activeStep, setActiveStep] =
        useState(1);


    const [selectedPayment, setSelectedPayment] =
    useState("");

    const [paymentStatus, setPaymentStatus] =
    useState("");

const [orderId, setOrderId] =
    useState("");

    /* =====================================================
       ADDRESS
    ===================================================== */

    const [address, setAddress] =
        useState({

            name: "",

            phone: "",

            alternatePhone: "",

            house: "",

            street: "",

            landmark: "",

            city: "",

            state: "",

            pincode: "",

            country: "India",

            addressType: "Home",

            instructions: "",

            deliveryPreference: "Anytime"

        });


    /* =====================================================
       LOCATION STATUS
    ===================================================== */

    const [locationStatus, setLocationStatus] =
        useState("");


    /* =====================================================
       COUPON
    ===================================================== */

    const [coupon, setCoupon] =
        useState("");

    const [couponApplied, setCouponApplied] =
        useState(false);


    /* =====================================================
       FORM ERROR
    ===================================================== */

    const [formError, setFormError] =
        useState("");


    /* =====================================================
       ADDRESS CHANGE
    ===================================================== */

    const handleAddressChange = (event) => {

        const {
            name,
            value
        } = event.target;


        setAddress((previous) => ({

            ...previous,

            [name]: value

        }));


        setFormError("");

    };


    /* =====================================================
       CART CALCULATION
    ===================================================== */

    const subtotal = useMemo(() => {

        return cart.reduce(
            (total, product) => {

                const price =
                    Number(
                        product.price || 0
                    );


                const quantity =
                    Number(
                        product.quantity || 1
                    );


                return (
                    total +
                    price * quantity
                );

            },
            0
        );

    }, [cart]);


    /* =====================================================
       DELIVERY
    ===================================================== */

    const deliveryCharge =
        subtotal >= 999
            ? 0
            : 49;


    /* =====================================================
       COUPON DISCOUNT
    ===================================================== */

    const discount =
        couponApplied
            ? Math.min(
                subtotal * 0.10,
                200
            )
            : 0;


    /* =====================================================
       TAX
    ===================================================== */

    const taxableAmount =
        Math.max(
            subtotal - discount,
            0
        );


    const tax =
        taxableAmount * 0.05;


    /* =====================================================
       FINAL TOTAL
    ===================================================== */

    const grandTotal =
        taxableAmount +
        deliveryCharge +
        tax;


    /* =====================================================
       ITEM COUNT
    ===================================================== */

    const totalItems =
        cart.reduce(
            (total, product) => {

                return (
                    total +
                    Number(
                        product.quantity || 1
                    )
                );

            },
            0
        );


    /* =====================================================
       LOCATION UI
    ===================================================== */

    const handleUseLocation = () => {

        setLocationStatus(
            "Location permission can be connected here."
        );

    };


    /* =====================================================
       VALIDATE ADDRESS
    ===================================================== */

    const validateAddress = () => {


        if (
            !address.name.trim() ||
            !address.phone.trim() ||
            !address.house.trim() ||
            !address.street.trim() ||
            !address.city.trim() ||
            !address.state.trim() ||
            !address.pincode.trim()
        ) {

            setFormError(
                "Please complete all required delivery details."
            );

            return false;

        }


        if (
            !/^[0-9]{10}$/.test(
                address.phone
            )
        ) {

            setFormError(
                "Please enter a valid 10-digit mobile number."
            );

            return false;

        }


        if (
            address.alternatePhone &&
            !/^[0-9]{10}$/.test(
                address.alternatePhone
            )
        ) {

            setFormError(
                "Please enter a valid alternate mobile number."
            );

            return false;

        }


        if (
            !/^[0-9]{6}$/.test(
                address.pincode
            )
        ) {

            setFormError(
                "Please enter a valid 6-digit pincode."
            );

            return false;

        }


        return true;

    };


    /* =====================================================
       CONTINUE TO REVIEW
    ===================================================== */

    const handleContinue = () => {

        if (!validateAddress()) {

            window.scrollTo({
                top: 250,
                behavior: "smooth"
            });

            return;

        }


        setActiveStep(2);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    };


    /* =====================================================
       EDIT ADDRESS
    ===================================================== */

    const handleEditAddress = () => {

        setActiveStep(1);

        window.scrollTo({
            top: 150,
            behavior: "smooth"
        });

    };





    /* =====================================================
   PAYMENT SELECTION
===================================================== */

const handlePaymentSelect = (paymentId) => {

    setSelectedPayment(paymentId);

};





const handleProcessPayment = () => {

    if (!selectedPayment) {

        alert("Please select a payment method.");

        return;

    }

    if (!validateAddress()) {

        setActiveStep(1);

        window.scrollTo({
            top: 150,
            behavior: "smooth"
        });

        return;

    }

    const newOrderId =
        "KSAM-" +
        Date.now();

    setOrderId(newOrderId);

    /* =========================================
       CASH ON DELIVERY
    ========================================= */

    if (selectedPayment === "cod") {

        const order = {

            orderId: newOrderId,

            customer: address,

            products: cart,

            subtotal: subtotal,

            deliveryCharge: deliveryCharge,

            discount: discount,

            tax: tax,

            grandTotal: grandTotal,

            paymentMethod: "Cash on Delivery",

            paymentStatus: "COD",

            orderStatus: "Confirmed",

            createdAt:
                new Date().toISOString()

        };

        localStorage.setItem(
            "ksamLastOrder",
            JSON.stringify(order)
        );

        localStorage.removeItem(
            CART_KEY
        );

        window.location.href =
            "./orderSuccess.html";

        return;

    }


    /* =========================================
       RAZORPAY ONLINE PAYMENT
    ========================================= */

    if (
        typeof window.Razorpay ===
        "undefined"
    ) {

        alert(
            "Payment gateway could not be loaded. Please refresh the page."
        );

        return;

    }


    const options = {

        key: "rzp_test_TbQFNEdiyvVwDt",

        amount:
            Math.round(
                grandTotal * 100
            ),

        currency: "INR",

        name: "KSAM Deal",

        description:
            "KSAM Deal Order " +
            newOrderId,

        image:
            `${import.meta.env.BASE_URL}products/hero-product19.png`,

        handler: function (response) {

            const order = {

                orderId: newOrderId,

                customer: address,

                products: cart,

                subtotal: subtotal,

                deliveryCharge:
                    deliveryCharge,

                discount: discount,

                tax: tax,

                grandTotal: grandTotal,

                paymentMethod:
                    selectedPayment,

                paymentStatus:
                    "Paid",

                razorpayPaymentId:
                    response.razorpay_payment_id,

                razorpayOrderId:
                    response.razorpay_order_id ||
                    "",

                razorpaySignature:
                    response.razorpay_signature ||
                    "",

                orderStatus:
                    "Confirmed",

                createdAt:
                    new Date().toISOString()

            };


            localStorage.setItem(
                "ksamLastOrder",
                JSON.stringify(order)
            );


            localStorage.removeItem(
                CART_KEY
            );


            setPaymentStatus(
                "Payment Successful"
            );


            window.location.href =
                "./orderSuccess.html";

        },


        prefill: {

            name:
                address.name,

            contact:
                address.phone

        },


        notes: {

            orderId:
                newOrderId,

            city:
                address.city,

            pincode:
                address.pincode

        },


        theme: {

            color: "#16c965"

        }

    };


    const razorpay =
        new window.Razorpay(
            options
        );


    razorpay.on(
        "payment.failed",
        function () {

            setPaymentStatus(
                "Payment Failed"
            );

            alert(
                "Payment failed. Please try again."
            );

        }
    );


    razorpay.open();

};


    /* =====================================================
       COUPON
    ===================================================== */

    const handleCoupon = () => {

        const code =
            coupon
                .trim()
                .toUpperCase();


        if (
            code === "KSAM10"
        ) {

            setCouponApplied(true);

        } else {

            setCouponApplied(false);

            alert(
                "Invalid coupon. Try KSAM10."
            );

        }

    };


    /* =====================================================
       EMPTY CART
    ===================================================== */

    if (cart.length === 0) {

        return (

            <div className="checkout-empty">

                <div className="checkout-empty-icon">
                    🛒
                </div>


                <h1>
                    Your cart is empty
                </h1>


                <p>
                    Add products to your cart
                    before checkout.
                </p>


                <button
                    onClick={() => {

                        window.location.href =
                            "./Product.html";

                    }}
                >
                    Continue Shopping
                </button>

            </div>

        );

    }


    /* =====================================================
       MAIN
    ===================================================== */

    return (

        <div className="checkout-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <header className="checkout-header">


                <div className="checkout-brand">


                    <div className="checkout-logo">
                        K
                    </div>


                    <div>

                        <h1>
                            KSAM DEAL
                        </h1>

                        <span>
                            Premium Shopping
                        </span>

                    </div>


                </div>


                <div className="checkout-header-right">


                    <div className="secure-badge">

                        <span>
                            🔒
                        </span>

                        <div>

                            <strong>
                                Secure Checkout
                            </strong>

                            <small>
                                100% protected
                            </small>

                        </div>

                    </div>


                    <button
                        className="back-cart-button"
                        onClick={() => {

                            window.location.href =
                                "./addToCart.html";

                        }}
                    >
                        ← Cart
                    </button>


                </div>

            </header>



            {/* =================================================
                PROGRESS
            ================================================= */}

            <section className="checkout-progress-wrapper">


                <div className="checkout-progress">


                    <div
                        className={
                            activeStep >= 1
                                ? "progress-item active"
                                : "progress-item"
                        }
                    >

                        <div className="progress-circle">
                            {activeStep > 1
                                ? "✓"
                                : "1"}
                        </div>

                        <span>
                            Delivery
                        </span>

                    </div>


                    <div
                        className={
                            activeStep >= 2
                                ? "progress-connector active"
                                : "progress-connector"
                        }
                    />


                    <div
                        className={
                            activeStep >= 2
                                ? "progress-item active"
                                : "progress-item"
                        }
                    >

                        <div className="progress-circle">
                            2
                        </div>

                        <span>
                            Review
                        </span>

                    </div>


                    <div className="progress-connector" />


                    <div className="progress-item">

                        <div className="progress-circle">
                            3
                        </div>

                        <span>
                            Payment
                        </span>

                    </div>


                </div>

            </section>



            {/* =================================================
                MAIN
            ================================================= */}

            <main className="checkout-layout">


                {/* =================================================
                    LEFT COLUMN
                ================================================= */}

                <div className="checkout-content">


                    {/* =============================================
                        DELIVERY ADDRESS CARD
                    ============================================= */}

                    <section className="checkout-card">


                        <div className="card-top">


                            <div className="card-icon green">
                                📍
                            </div>


                            <div className="card-heading">

                                <span>
                                    STEP 1 • DELIVERY
                                </span>

                                <h2>
                                    Delivery Address
                                </h2>

                                <p>
                                    Tell us where you want your
                                    order delivered.
                                </p>

                            </div>


                        </div>



                        {/* =========================================
                            LOCATION BUTTON
                        ========================================= */}

                        <div className="location-banner">


                            <div className="location-banner-icon">
                                📍
                            </div>


                            <div className="location-banner-text">

                                <strong>
                                    Delivering to your location?
                                </strong>

                                <span>
                                    Use your location to make
                                    address entry easier.
                                </span>


                                {locationStatus && (

                                    <small>
                                        {locationStatus}
                                    </small>

                                )}

                            </div>


                            <button
                                type="button"
                                onClick={
                                    handleUseLocation
                                }
                            >
                                Use My Location
                            </button>


                        </div>



                        {/* =========================================
                            FORM
                        ========================================= */}

                        <div className="address-form">


                            {/* NAME */}

                            <div className="form-group">

                                <label>
                                    Full Name
                                    <span>*</span>
                                </label>

                                <div className="input-with-icon">

                                    <span>
                                        👤
                                    </span>

                                    <input
                                        type="text"
                                        name="name"
                                        value={
                                            address.name
                                        }
                                        onChange={
                                            handleAddressChange
                                        }
                                        placeholder="Enter full name"
                                    />

                                </div>

                            </div>



                            {/* PHONE */}

                            <div className="form-row">


                                <div className="form-group">

                                    <label>
                                        Mobile Number
                                        <span>*</span>
                                    </label>

                                    <div className="input-with-icon">

                                        <span>
                                            📱
                                        </span>

                                        <input
                                            type="tel"
                                            name="phone"
                                            maxLength="10"
                                            value={
                                                address.phone
                                            }
                                            onChange={
                                                handleAddressChange
                                            }
                                            placeholder="10-digit mobile"
                                        />

                                    </div>

                                </div>



                                <div className="form-group">

                                    <label>
                                        Alternate Number
                                        <small>
                                            Optional
                                        </small>
                                    </label>

                                    <div className="input-with-icon">

                                        <span>
                                            ☎️
                                        </span>

                                        <input
                                            type="tel"
                                            name="alternatePhone"
                                            maxLength="10"
                                            value={
                                                address.alternatePhone
                                            }
                                            onChange={
                                                handleAddressChange
                                            }
                                            placeholder="Optional number"
                                        />

                                    </div>

                                </div>


                            </div>



                            {/* HOUSE */}

                            <div className="form-row">


                                <div className="form-group">

                                    <label>
                                        House / Flat / Building
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="house"
                                        value={
                                            address.house
                                        }
                                        onChange={
                                            handleAddressChange
                                        }
                                        placeholder="House No. / Flat No."
                                    />

                                </div>


                                <div className="form-group">

                                    <label>
                                        Street / Area
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="street"
                                        value={
                                            address.street
                                        }
                                        onChange={
                                            handleAddressChange
                                        }
                                        placeholder="Street, locality or area"
                                    />

                                </div>


                            </div>



                            {/* LANDMARK */}

                            <div className="form-group">

                                <label>
                                    Landmark
                                    <small>
                                        Optional
                                    </small>
                                </label>

                                <input
                                    type="text"
                                    name="landmark"
                                    value={
                                        address.landmark
                                    }
                                    onChange={
                                        handleAddressChange
                                    }
                                    placeholder="Nearby landmark"
                                />

                            </div>



                            {/* CITY STATE PIN */}

                            <div className="form-row three">


                                <div className="form-group">

                                    <label>
                                        City
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="city"
                                        value={
                                            address.city
                                        }
                                        onChange={
                                            handleAddressChange
                                        }
                                        placeholder="City"
                                    />

                                </div>


                                <div className="form-group">

                                    <label>
                                        State
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="state"
                                        value={
                                            address.state
                                        }
                                        onChange={
                                            handleAddressChange
                                        }
                                        placeholder="State"
                                    />

                                </div>


                                <div className="form-group">

                                    <label>
                                        Pincode
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="pincode"
                                        maxLength="6"
                                        value={
                                            address.pincode
                                        }
                                        onChange={
                                            handleAddressChange
                                        }
                                        placeholder="6-digit PIN"
                                    />

                                </div>


                            </div>



                            {/* COUNTRY */}

                            <div className="form-group">

                                <label>
                                    Country
                                </label>

                                <div className="country-field">

                                    <span>
                                        🇮🇳
                                    </span>

                                    <strong>
                                        India
                                    </strong>

                                    <small>
                                        Currently shipping within India
                                    </small>

                                </div>

                            </div>



                            {/* ADDRESS TYPE */}

                            <div className="form-group">

                                <label>
                                    Save Address As
                                </label>


                                <div className="address-type-options">


                                    <button
                                        type="button"
                                        className={
                                            address.addressType ===
                                            "Home"
                                                ? "selected"
                                                : ""
                                        }
                                        onClick={() =>
                                            setAddress(
                                                previous => ({
                                                    ...previous,
                                                    addressType:
                                                        "Home"
                                                })
                                            )
                                        }
                                    >
                                        🏠
                                        <span>
                                            Home
                                        </span>
                                    </button>


                                    <button
                                        type="button"
                                        className={
                                            address.addressType ===
                                            "Work"
                                                ? "selected"
                                                : ""
                                        }
                                        onClick={() =>
                                            setAddress(
                                                previous => ({
                                                    ...previous,
                                                    addressType:
                                                        "Work"
                                                })
                                            )
                                        }
                                    >
                                        🏢
                                        <span>
                                            Work
                                        </span>
                                    </button>


                                    <button
                                        type="button"
                                        className={
                                            address.addressType ===
                                            "Other"
                                                ? "selected"
                                                : ""
                                        }
                                        onClick={() =>
                                            setAddress(
                                                previous => ({
                                                    ...previous,
                                                    addressType:
                                                        "Other"
                                                })
                                            )
                                        }
                                    >
                                        📌
                                        <span>
                                            Other
                                        </span>
                                    </button>


                                </div>

                            </div>



                            {/* DELIVERY PREFERENCE */}

                            <div className="form-group">

                                <label>
                                    Preferred Delivery Time
                                </label>


                                <div className="delivery-options">


                                    {[
                                        "Anytime",
                                        "Morning",
                                        "Afternoon",
                                        "Evening"
                                    ].map(
                                        (option) => (

                                            <button
                                                type="button"
                                                key={option}
                                                className={
                                                    address.deliveryPreference ===
                                                    option
                                                        ? "selected"
                                                        : ""
                                                }
                                                onClick={() =>
                                                    setAddress(
                                                        previous => ({
                                                            ...previous,
                                                            deliveryPreference:
                                                                option
                                                        })
                                                    )
                                                }
                                            >

                                                {option ===
                                                    "Anytime"
                                                    && "🕐"}

                                                {option ===
                                                    "Morning"
                                                    && "🌅"}

                                                {option ===
                                                    "Afternoon"
                                                    && "☀️"}

                                                {option ===
                                                    "Evening"
                                                    && "🌆"}

                                                <span>
                                                    {option}
                                                </span>

                                            </button>

                                        )
                                    )}

                                </div>

                            </div>



                            {/* INSTRUCTIONS */}

                            <div className="form-group">

                                <label>
                                    Delivery Instructions
                                    <small>
                                        Optional
                                    </small>
                                </label>

                                <textarea
                                    name="instructions"
                                    rows="3"
                                    value={
                                        address.instructions
                                    }
                                    onChange={
                                        handleAddressChange
                                    }
                                    placeholder="Example: Leave the package at the security desk."
                                />

                            </div>



                            {/* ERROR */}

                            {formError && (

                                <div className="form-error">

                                    ⚠️

                                    <span>
                                        {formError}
                                    </span>

                                </div>

                            )}



                            {/* CONTINUE */}

                            <button
                                type="button"
                                className="continue-button"
                                onClick={
                                    handleContinue
                                }
                            >

                                <span>
                                    Continue to Review
                                </span>

                                <strong>
                                    →
                                </strong>

                            </button>


                        </div>

                    </section>



                    {/* =============================================
                        REVIEW CARD
                    ============================================= */}

                    <section
                        className={
                            activeStep >= 2
                                ? "checkout-card"
                                : "checkout-card locked-card"
                        }
                    >


                        <div className="card-top">

                            <div className="card-icon gold">
                                📦
                            </div>


                            <div className="card-heading">

                                <span>
                                    STEP 2 • REVIEW
                                </span>

                                <h2>
                                    Review Your Address
                                </h2>

                            </div>

                        </div>



                        {activeStep >= 2 ? (

                            <div className="address-preview">


                                <div className="preview-header">

                                    <div>

                                        <strong>
                                            {address.addressType}
                                        </strong>

                                        <span>
                                            Saved Delivery Address
                                        </span>

                                    </div>


                                    <button
                                        type="button"
                                        onClick={
                                            handleEditAddress
                                        }
                                    >
                                        Edit
                                    </button>

                                </div>


                                <div className="preview-body">

                                    <strong>
                                        {address.name}
                                    </strong>


                                    <p>

                                        {address.house},
                                        {" "}
                                        {address.street}

                                        <br />

                                        {address.landmark &&
                                            `${address.landmark}, `}

                                        {address.city},
                                        {" "}
                                        {address.state}
                                        {" - "}
                                        {address.pincode}

                                        <br />

                                        {address.country}

                                    </p>


                                    <span>
                                        📱 {address.phone}
                                    </span>


                                </div>


                            </div>

                        ) : (

                            <div className="locked-message">

                                🔒

                                <span>
                                    Complete your delivery
                                    address to continue.
                                </span>

                            </div>

                        )}

                    </section>



                    {/* =============================================
                        PAYMENT CARD
                    ============================================= */}

                    <section
                        className={
                            activeStep >= 2
                                ? "checkout-card"
                                : "checkout-card locked-card"
                        }
                    >


                        <div className="card-top">


                            <div className="card-icon black">
                                💳
                            </div>


                            <div className="card-heading">

                                <span>
                                    STEP 3 • PAYMENT
                                </span>

                                <h2>
                                    Choose Payment Method
                                </h2>

                                <p>
                                    Secure payment options will
                                    appear here.
                                </p>

                            </div>


                        </div>


                        <div className="payment-methods-list">

    <button
        type="button"
        className={`payment-method ${
            selectedPayment === "upi" ? "selected" : ""
        }`}
        onClick={() => handlePaymentSelect("upi")}
    >
        <div className="payment-method-icon">📱</div>

        <div className="payment-method-info">
            <strong>UPI</strong>
            <span>Google Pay • PhonePe • Paytm • BHIM</span>
        </div>

        <div className="payment-radio">
            {selectedPayment === "upi" ? "●" : "○"}
        </div>
    </button>


    <button
        type="button"
        className={`payment-method ${
            selectedPayment === "card" ? "selected" : ""
        }`}
        onClick={() => handlePaymentSelect("card")}
    >
        <div className="payment-method-icon">💳</div>

        <div className="payment-method-info">
            <strong>Credit / Debit Card</strong>
            <span>Visa • Mastercard • RuPay</span>
        </div>

        <div className="payment-radio">
            {selectedPayment === "card" ? "●" : "○"}
        </div>
    </button>


    <button
        type="button"
        className={`payment-method ${
            selectedPayment === "netbanking" ? "selected" : ""
        }`}
        onClick={() => handlePaymentSelect("netbanking")}
    >
        <div className="payment-method-icon">🏦</div>

        <div className="payment-method-info">
            <strong>Net Banking</strong>
            <span>SBI • HDFC • ICICI • Axis</span>
        </div>

        <div className="payment-radio">
            {selectedPayment === "netbanking" ? "●" : "○"}
        </div>
    </button>


    <button
        type="button"
        className={`payment-method ${
            selectedPayment === "cod" ? "selected" : ""
        }`}
        onClick={() => handlePaymentSelect("cod")}
    >
        <div className="payment-method-icon">💵</div>

        <div className="payment-method-info">
            <strong>Cash on Delivery</strong>
            <span>Pay when your order arrives</span>
        </div>

        <div className="payment-radio">
            {selectedPayment === "cod" ? "●" : "○"}
        </div>
    </button>

</div>

        
                        <button
    type="button"
    className="process-payment-button"
    onClick={handleProcessPayment}
    disabled={
        activeStep < 2 ||
        !selectedPayment
    }
>
    🔒 Process to Pay ₹
    {grandTotal.toFixed(2)}
</button>


                    </section>


                </div>



                {/* =================================================
                    RIGHT ORDER SUMMARY
                ================================================= */}

                <aside className="checkout-sidebar">


                    <div className="summary-card">


                        {/* SUMMARY HEADER */}

                        <div className="summary-header">


                            <div>

                                <span>
                                    KSAM DEAL
                                </span>

                                <h2>
                                    Order Summary
                                </h2>

                            </div>


                            <div className="summary-items">

                                {totalItems}
                                {" "}
                                Items

                            </div>


                        </div>



                        {/* PRODUCTS */}

                        <div className="summary-products">


                            {cart.map(
                                (
                                    product,
                                    index
                                ) => {

                                    const quantity =
                                        Number(
                                            product.quantity ||
                                            1
                                        );


                                    const price =
                                        Number(
                                            product.price ||
                                            0
                                        );


                                    return (

                                        <div
                                            className="summary-product"
                                            key={
                                                product.id ||
                                                index
                                            }
                                        >


                                            <div className="summary-product-image">


                                                <img
                                                    src={
                                                        product.image ||
                                                        ""
                                                    }
                                                    alt={
                                                        product.name ||
                                                        "Product"
                                                    }
                                                />


                                                <span>
                                                    {quantity}
                                                </span>


                                            </div>


                                            <div className="summary-product-details">


                                                <strong>
                                                    {
                                                        product.name ||
                                                        "Product"
                                                    }
                                                </strong>


                                                <small>
                                                    {
                                                        product.category ||
                                                        "Product"
                                                    }
                                                </small>


                                                <b>
                                                    ₹
                                                    {
                                                        (
                                                            price *
                                                            quantity
                                                        ).toFixed(2)
                                                    }
                                                </b>


                                            </div>


                                        </div>

                                    );

                                }
                            )}

                        </div>



                        {/* FREE DELIVERY */}

                        <div className="free-delivery-box">


                            <span>
                                🚚
                            </span>


                            <div>

                                <strong>
                                    {deliveryCharge === 0
                                        ? "Free Delivery unlocked!"
                                        : "Free delivery on ₹999+"}
                                </strong>

                                <small>
                                    Fast & reliable delivery
                                </small>

                                {deliveryCharge > 0 && (

                                    <div className="delivery-progress">

                                        <div
                                            style={{
                                                width:
                                                    `${Math.min(
                                                        subtotal /
                                                        999 *
                                                        100,
                                                        100
                                                    )}%`
                                            }}
                                        />

                                    </div>

                                )}

                            </div>


                        </div>



                        {/* COUPON */}

                        <div className="coupon-section">


                            <div className="coupon-title">

                                🏷️

                                <strong>
                                    Apply Coupon
                                </strong>

                            </div>


                            <div className="coupon-input">


                                <input
                                    type="text"
                                    value={coupon}
                                    onChange={(
                                        event
                                    ) =>
                                        setCoupon(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter coupon code"
                                    disabled={
                                        couponApplied
                                    }
                                />


                                <button
                                    type="button"
                                    onClick={
                                        handleCoupon
                                    }
                                >
                                    {couponApplied
                                        ? "✓"
                                        : "Apply"}
                                </button>


                            </div>


                            <small>
                                Use
                                {" "}
                                <strong>
                                    KSAM10
                                </strong>
                                {" "}
                                for 10% off
                            </small>


                        </div>



                        {/* TOTALS */}

                        <div className="summary-totals">


                            <div>

                                <span>
                                    Subtotal
                                </span>

                                <strong>
                                    ₹
                                    {subtotal.toFixed(2)}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Delivery
                                </span>

                                <strong
                                    className={
                                        deliveryCharge === 0
                                            ? "free"
                                            : ""
                                    }
                                >
                                    {deliveryCharge === 0
                                        ? "FREE"
                                        : `₹${deliveryCharge.toFixed(
                                            2
                                        )}`}
                                </strong>

                            </div>


                            {couponApplied && (

                                <div className="discount-row">

                                    <span>
                                        Coupon Discount
                                    </span>

                                    <strong>
                                        -₹
                                        {discount.toFixed(
                                            2
                                        )}
                                    </strong>

                                </div>

                            )}


                            <div>

                                <span>
                                    Tax
                                </span>

                                <strong>
                                    ₹
                                    {tax.toFixed(2)}
                                </strong>

                            </div>


                        </div>



                        {/* GRAND TOTAL */}

                        <div className="grand-total">


                            <div>

                                <span>
                                    Total Payable
                                </span>

                                <small>
                                    Inclusive of applicable taxes
                                </small>

                            </div>


                            <strong>
                                ₹
                                {grandTotal.toFixed(2)}
                            </strong>


                        </div>



                        {/* SAVINGS */}

                        <div className="savings-box">

                            🎉

                            <span>
                                You saved
                                {" "}
                                ₹
                                {discount.toFixed(2)}
                                {" "}
                                with current offers
                            </span>

                        </div>



                        {/* TRUST */}

                        <div className="trust-grid">


                            <div>
                                🔒
                                <span>
                                    Secure
                                </span>
                            </div>


                            <div>
                                🚚
                                <span>
                                    Reliable
                                </span>
                            </div>


                            <div>
                                💚
                                <span>
                                    Trusted
                                </span>
                            </div>


                        </div>


                    </div>

                </aside>


            </main>

        </div>

    );

}


/* =========================================================
   RENDER
========================================================= */

createRoot(
    document.getElementById(
        "checkout-root"
    )
).render(
    <Checkout />
);