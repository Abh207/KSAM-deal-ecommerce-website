import { useEffect, useState } from "react";
import { getDeals } from "./services/productService";

function SupabaseTest() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadProducts() {
            try {
                const data = await getDeals();

                setProducts(data);
            } catch (err) {
                console.error(err);

                setError(
                    err.message || "Failed to load products"
                );
            } finally {
                setLoading(false);
            }
        }

        loadProducts();
    }, []);

    if (loading) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    background: "#000",
                    color: "#22FF88",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px"
                }}
            >
                Loading products...
            </div>
        );
    }

    if (error) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    background: "#000",
                    color: "#fff",
                    padding: "40px"
                }}
            >
                <h1 style={{ color: "#ff4444" }}>
                    Supabase Error
                </h1>

                <p>{error}</p>
            </div>
        );
    }

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#000",
                color: "#fff",
                padding: "40px"
            }}
        >
            <h1 style={{ color: "#22FF88" }}>
                Supabase Connection Successful
            </h1>

            <h2>
                Products found: {products.length}
            </h2>

            {products.map((product) => (
                <div
                    key={product.id}
                    style={{
                        marginTop: "20px",
                        padding: "20px",
                        border: "1px solid #333",
                        borderRadius: "12px"
                    }}
                >
                    <h3>{product.name}</h3>

                    <p>
                        Price: ₹
                        {Number(product.price).toLocaleString(
                            "en-IN"
                        )}
                    </p>

                    <p>
                        Discount: {product.discount}%
                    </p>

                    <p>
                        Store: {product.stores?.name}
                    </p>

                    <p>
                        Category: {product.categories?.name}
                    </p>
                </div>
            ))}
        </div>
    );
}

export default SupabaseTest;