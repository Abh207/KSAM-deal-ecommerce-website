import React from "react";
import { createRoot } from "react-dom/client";
import "./orderSuccess.css";

function OrderSuccess() {

    const order =
        JSON.parse(
            localStorage.getItem(
                "ksamLastOrder"
            )
        );

    if (!order) {

        return (

            <div className="success-page">

                <h1>
                    No Order Found
                </h1>

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


    return (

        <div className="success-page">

            <div className="success-card">

                <div className="success-icon">
                    ✓
                </div>

                <h1>
                    Order Placed Successfully!
                </h1>

                <p>
                    Thank you for shopping with KSAM Deal.
                </p>


                <div className="success-order">

                    <div>
                        <span>
                            Order ID
                        </span>

                        <strong>
                            {order.orderId}
                        </strong>
                    </div>


                    <div>
                        <span>
                            Payment
                        </span>

                        <strong>
                            {order.paymentStatus === "Paid"
                                ? "Paid"
                                : "Cash on Delivery"}
                        </strong>
                    </div>


                    <div>
                        <span>
                            Amount
                        </span>

                        <strong>
                            ₹{Number(
                                order.grandTotal
                            ).toFixed(2)}
                        </strong>
                    </div>

                </div>


                <div className="customer-details">

                    <h3>
                        Delivery Details
                    </h3>

                    <p>
                        <strong>
                            {order.customer.name}
                        </strong>
                    </p>

                    <p>
                        {order.customer.house},{" "}
                        {order.customer.street}
                    </p>

                    <p>
                        {order.customer.city},{" "}
                        {order.customer.state}
                        {" - "}
                        {order.customer.pincode}
                    </p>

                    <p>
                        📱 {order.customer.phone}
                    </p>

                </div>


                <button
                    className="success-button"
                    onClick={() => {
                        window.location.href =
                            "./index.html";
                    }}
                >
                    Continue Shopping →
                </button>

            </div>

        </div>

    );

}


createRoot(
    document.getElementById(
        "order-success-root"
    )
).render(
    <OrderSuccess />
);