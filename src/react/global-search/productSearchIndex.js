/* =========================================================
   KSAM DEAL
   CENTRAL PRODUCT SEARCH INDEX
   =========================================================

   Automatically searches all:

   *-products.json

   Example:

   clothes-products.json
   shoes-products.json
   audio-products.json
   watch-products.json
   etc.

   Adding a new *-products.json file automatically
   makes its products searchable.
========================================================= */


/* =========================================================
   LOAD ALL PRODUCT JSON FILES
========================================================= */

const productFiles = import.meta.glob(
    "../../api/*-products.json",
    {
        eager: true,
        import: "default"
    }
);


/* =========================================================
   IMAGE PATH
========================================================= */

export const getSearchImagePath = (image) => {

    if (!image) {
        return "";
    }

    /*
       JSON normally contains:

       /products/audio/audio1.png

       GitHub Pages needs:

       /KSAM-deal-ecommerce-website/products/audio/audio1.png
    */

    return `${import.meta.env.BASE_URL}${image.replace(/^\/+/, "")}`;
};


/* =========================================================
   SOURCE CATEGORY
========================================================= */

const detectCategory = (product, fileName) => {

    const category =
        product.category ||
        product.type ||
        product.department ||
        product.productType ||
        "";

    if (category) {
        return String(category);
    }


    const file = fileName.toLowerCase();


    if (
        file.includes("shoe") ||
        file.includes("footwear")
    ) {
        return "Shoes";
    }


    if (
        file.includes("cloth") ||
        file.includes("fashion") ||
        file.includes("dress")
    ) {
        return "Clothes";
    }


    if (
        file.includes("audio") ||
        file.includes("speaker") ||
        file.includes("earbud")
    ) {
        return "Audio";
    }


    if (
        file.includes("watch")
    ) {
        return "Watches";
    }


    if (
        file.includes("beauty") ||
        file.includes("cosmetic")
    ) {
        return "Beauty";
    }


    if (
        file.includes("gadget") ||
        file.includes("electronic")
    ) {
        return "Gadgets";
    }


    return "Products";
};


/* =========================================================
   SOURCE PAGE
========================================================= */

const detectSourcePage = (product, fileName) => {

    /*
       If JSON explicitly contains page/url,
       use that first.
    */

    const explicitPage =
        product.page ||
        product.productPage ||
        product.sourcePage ||
        product.url;


    if (explicitPage) {

        return String(explicitPage);

    }


    const file = fileName.toLowerCase();


    if (
        file.includes("shoe")
    ) {
        return "./shoes.html";
    }


    if (
        file.includes("cloth") ||
        file.includes("fashion")
    ) {
        return "./clothes.html";
    }


    if (
        file.includes("audio") ||
        file.includes("gadget")
    ) {
        return "./audio.html";
    }


    if (
        file.includes("watch")
    ) {
        return "./watchshop.html";
    }


    if (
        file.includes("beauty")
    ) {
        return "./beauty.html";
    }


    return "./Product.html";
};


/* =========================================================
   NORMALIZE PRODUCT
========================================================= */

const normalizeProduct = (
    product,
    fileName,
    index
) => {

    const normalized = {

        /* =========================
           BASIC INFORMATION
        ========================= */

        id:
            product.id ||
            `${fileName}-${index}`,

        name:
            product.name ||
            product.title ||
            "Unnamed Product",

        title:
            product.title ||
            product.name ||
            "Unnamed Product",

        brand:
            product.brand ||
            "KSAM Deal",


        /* =========================
           CATEGORY
        ========================= */

        category:
            detectCategory(
                product,
                fileName
            ),


        type:
            product.type ||
            product.productType ||
            "",


        gender:
            product.gender ||
            "",


        department:
            product.department ||
            "",


        /* =========================
           PRICE
        ========================= */

        price:
            Number(
                product.price ??
                product.salePrice ??
                product.currentPrice ??
                0
            ),


        oldPrice:
            Number(
                product.oldPrice ??
                product.originalPrice ??
                product.mrp ??
                0
            ),


        discount:
            Number(
                product.discount ??
                product.discountPercent ??
                0
            ),


        /* =========================
           RATING
        ========================= */

        rating:
            Number(
                product.rating ??
                0
            ),


        reviews:
            Number(
                product.reviews ??
                product.reviewCount ??
                0
            ),


        /* =========================
           IMAGE
        ========================= */

        image:
            product.image ||
            product.thumbnail ||
            (
                Array.isArray(product.images)
                    ? product.images[0]
                    : ""
            ) ||
            "",


        images:
            Array.isArray(product.images)
                ? product.images
                : product.image
                    ? [product.image]
                    : [],


        /* =========================
           DESCRIPTION
        ========================= */

        description:
            product.description ||
            "",


        /* =========================
           EXTRA INFORMATION
        ========================= */

        badge:
            product.badge ||
            "",


        color:
            product.color ||
            "",


        material:
            product.material ||
            "",


        stock:
            Number(
                product.stock ??
                product.quantity ??
                0
            ),


        features:
            Array.isArray(product.features)
                ? product.features
                : [],


        sizes:
            Array.isArray(product.sizes)
                ? product.sizes
                : [],


        tags:
            Array.isArray(product.tags)
                ? product.tags
                : [],


        /* =========================
           PRODUCT FLAGS
        ========================= */

        featured:
            Boolean(product.featured),


        trending:
            Boolean(product.trending),


        newArrival:
            Boolean(product.newArrival),


        /* =========================
           SOURCE
        ========================= */

        sourceFile:
            fileName,


        sourcePage:
            detectSourcePage(
                product,
                fileName
            )

    };


    /* =====================================================
       SEARCH TEXT

       Everything here becomes searchable.
    ===================================================== */

    normalized.searchText = [

        normalized.name,

        normalized.title,

        normalized.brand,

        normalized.category,

        normalized.type,

        normalized.gender,

        normalized.department,

        normalized.description,

        normalized.color,

        normalized.material,

        normalized.badge,

        normalized.price,

        normalized.oldPrice,

        normalized.discount,

        normalized.rating,

        ...(normalized.features || []),

        ...(normalized.sizes || []),

        ...(normalized.tags || [])

    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();


    return normalized;
};


/* =========================================================
   EXTRACT PRODUCTS FROM JSON
========================================================= */

const extractProducts = (data) => {

    if (!data) {
        return [];
    }


    /*
       Case 1:

       [
         {...},
         {...}
       ]
    */

    if (Array.isArray(data)) {

        return data;

    }


    /*
       Case 2:

       {
          products: [...]
       }
    */

    if (
        Array.isArray(data.products)
    ) {

        return data.products;

    }


    /*
       Case 3:

       {
          featuredProducts: [...]
       }
    */

    if (
        Array.isArray(data.featuredProducts)
    ) {

        return data.featuredProducts;

    }


    return [];
};


/* =========================================================
   BUILD CENTRAL PRODUCT DATABASE
========================================================= */

const buildProductIndex = () => {

    const allProducts = [];


    Object.entries(productFiles).forEach(
        ([filePath, module]) => {

            const data =
                module?.default ||
                module;


            if (!data) {
                return;
            }


            const products =
                extractProducts(data);


            const fileName =
                filePath
                    .split("/")
                    .pop() ||
                "products.json";


            products.forEach(
                (product, index) => {

                    if (!product) {
                        return;
                    }


                    allProducts.push(
                        normalizeProduct(
                            product,
                            fileName,
                            index
                        )
                    );

                }
            );

        }
    );


    /* =====================================================
       REMOVE DUPLICATE PRODUCTS
    ===================================================== */

    const uniqueProducts = [];

    const ids = new Set();


    allProducts.forEach(
        (product) => {

            const uniqueId =
                `${product.sourceFile}-${product.id}`;


            if (
                !ids.has(uniqueId)
            ) {

                ids.add(uniqueId);

                uniqueProducts.push(
                    product
                );

            }

        }
    );


    return uniqueProducts;
};


/* =========================================================
   FINAL PRODUCT DATABASE
========================================================= */

export const ALL_PRODUCTS =
    buildProductIndex();


/* =========================================================
   DEBUG

   Open browser console and you should see:

   KSAM SEARCH INDEX:  XX products
========================================================= */

console.log(
    "KSAM SEARCH INDEX:",
    ALL_PRODUCTS.length,
    "products loaded"
);


/* =========================================================
   SEARCH PRODUCTS
========================================================= */

export const searchProducts = (
    query,
    options = {}
) => {

    const {

        category = "All",

        minPrice = 0,

        maxPrice = Infinity,

        sort = "relevance"

    } = options;


    const cleanQuery =
        String(query || "")
            .trim()
            .toLowerCase();


    /*
       Convert:

       "wireless earbuds"

       into:

       ["wireless", "earbuds"]
    */

    const words =
        cleanQuery
            ? cleanQuery.split(/\s+/)
            : [];


    let results =
        ALL_PRODUCTS.filter(
            (product) => {

                /* =========================
                   SEARCH
                ========================= */

                const matchesSearch =
                    words.length === 0 ||
                    words.every(
                        (word) =>
                            product.searchText
                                .includes(word)
                    );


                /* =========================
                   CATEGORY
                ========================= */

                const matchesCategory =
                    category === "All" ||
                    product.category
                        .toLowerCase()
                        .includes(
                            String(category)
                                .toLowerCase()
                        );


                /* =========================
                   PRICE
                ========================= */

                const matchesPrice =
                    product.price >=
                        Number(minPrice) &&

                    product.price <=
                        Number(maxPrice);


                return (
                    matchesSearch &&
                    matchesCategory &&
                    matchesPrice
                );

            }
        );


    /* =====================================================
       SORT
    ===================================================== */

    if (sort === "price-low") {

        results.sort(
            (a, b) =>
                a.price - b.price
        );

    }


    if (sort === "price-high") {

        results.sort(
            (a, b) =>
                b.price - a.price
        );

    }


    if (sort === "rating") {

        results.sort(
            (a, b) =>
                b.rating - a.rating
        );

    }


    if (sort === "discount") {

        results.sort(
            (a, b) =>
                b.discount - a.discount
        );

    }


    /*
       Relevance:

       Products whose NAME contains
       the complete search query appear first.
    */

    if (
        sort === "relevance" &&
        cleanQuery
    ) {

        results.sort(
            (a, b) => {

                const aName =
                    a.name.toLowerCase();

                const bName =
                    b.name.toLowerCase();


                const aExact =
                    aName.includes(
                        cleanQuery
                    );

                const bExact =
                    bName.includes(
                        cleanQuery
                    );


                if (
                    aExact &&
                    !bExact
                ) {
                    return -1;
                }


                if (
                    !aExact &&
                    bExact
                ) {
                    return 1;
                }


                return (
                    b.rating -
                    a.rating
                );

            }
        );

    }


    return results;
};


/* =========================================================
   SEARCH SUGGESTIONS
========================================================= */

export const getSearchSuggestions = (
    query,
    limit = 8
) => {

    const cleanQuery =
        String(query || "")
            .trim()
            .toLowerCase();


    if (!cleanQuery) {

        return [];

    }


    const words =
        cleanQuery.split(/\s+/);


    return ALL_PRODUCTS
        .filter(
            (product) =>
                words.every(
                    (word) =>
                        product.searchText
                            .includes(word)
                )
        )
        .slice(0, limit);
};


/* =========================================================
   CATEGORY LIST
========================================================= */

export const getSearchCategories = () => {

    return [
        "All",

        ...new Set(

            ALL_PRODUCTS
                .map(
                    (product) =>
                        product.category
                )
                .filter(Boolean)

        )

    ];

};


/* =========================================================
   GET PRODUCT BY ID
========================================================= */

export const getSearchProductById = (
    id
) => {

    return ALL_PRODUCTS.find(
        (product) =>
            String(product.id) ===
            String(id)
    );

};


/* =========================================================
   GET PRODUCTS BY CATEGORY
========================================================= */

export const getProductsByCategory = (
    category
) => {

    if (
        !category ||
        category === "All"
    ) {

        return ALL_PRODUCTS;

    }


    return ALL_PRODUCTS.filter(
        (product) =>
            product.category
                .toLowerCase()
                .includes(
                    String(category)
                        .toLowerCase()
                )
    );

};