import { supabase } from "../../supabaseClient";

export async function getDeals() {
    const { data, error } = await supabase
        .from("products")
        .select(`
            *,
            stores (
                name,
                website,
                logo_url
            ),
            categories (
                name
            )
        `)
        .order("created_at", {
            ascending: false
        });

    if (error) {
        console.error("Failed to fetch deals:", error);
        throw error;
    }

    /*
    ------------------------------------------
    Convert Supabase database format
    into the format used by DealCard
    ------------------------------------------
    */

    const deals = (data || []).map((product) => {

        return {
            id: product.id,

            name: product.name,

            price: Number(product.price || 0),

            oldPrice: Number(
                product.old_price ??
                product.oldPrice ??
                product.price ??
                0
            ),

            discount: Number(
                product.discount || 0
            ),

            rating: Number(
                product.rating || 0
            ),

            category:
                product.categories?.name ||
                "Other",

            store:
                product.stores?.name ||
                "Unknown Store",

            url:
                product.url ||
                product.product_url ||
                product.product_link ||
                product.stores?.website ||
                "#",

            image:
                product.image ||
                product.image_url ||
                product.imageUrl ||
                "/phone-image.png",

            storeWebsite:
                product.stores?.website ||
                "#",

            storeLogo:
                product.stores?.logo_url ||
                null
        };
    });

    console.log(
        "KSAM DEAL - Supabase products:",
        deals
    );

    return deals;
}