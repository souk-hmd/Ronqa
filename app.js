RONQA — app.js

/* =========================
   SUPABASE
========================= */

const SUPABASE_URL =
"https://qpctjcaygybpanzyweso.supabase.co";

const SUPABASE_KEY =
"sb_publishable_p_iM1Wod_z9W0kfBXAC90w_J8tH85fO";

const STORE_WHATSAPP =
"213675996957";


let products = [];
let cart = [];
let selectedCategory = "all";


/* =========================
   CATEGORY
========================= */

function getCategory(value){

    const text =
    String(value || "")
    .trim()
    .toLowerCase();

    if(
        text.includes("حق")
    ){
        return "bags";
    }

    if(
        text.includes("حذ") ||
        text.includes("احذ") ||
        text.includes("أحذ")
    ){
        return "shoes";
    }

    if(
        text.includes("كسسو") ||
        text.includes("اكسسو") ||
        text.includes("إكسسو")
    ){
        return "accessories";
    }

    return "other";
}


/* =========================
   ESCAPE HTML
========================= */

function escapeHTML(text){

    return String(text)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");
}


/* =========================
   LOAD PRODUCTS
========================= */

async function loadProducts(){

    const box =
    document.getElementById("products");

    if(!box)return;

    box.innerHTML = `
        <div class="loading">
            ⏳ جاري تحميل المنتجات...
        </div>
    `;

    try{

        const response =
        await fetch(
            SUPABASE_URL +
            "/rest/v1/Products?select=*",
            {
                method:"GET",

                headers:{
                    "apikey":SUPABASE_KEY,
                    "Authorization":
                    "Bearer " + SUPABASE_KEY,
                    "Content-Type":
                    "application/json"
                }
            }
        );


        if(!response.ok){

            const errorText =
            await response.text();

            throw new Error(
                "HTTP " +
                response.status +
                " - " +
                errorText
            );
        }


        products =
        await response.json();


        if(!Array.isArray(products)){

            throw new Error(
                "بيانات المنتجات غير صحيحة"
            );
        }


        showProducts(products);

    }
    catch(error){

        console.error(
            "Supabase Error:",
            error
        );


        box.innerHTML = `

            <div
                style="
                grid-column:1/-1;
                text-align:center;
                padding:40px;
                color:#c00;">

                ❌ تعذر تحميل المنتجات

                <br><br>

                <small>
                    ${escapeHTML(error.message)}
                </small>

            </div>
        `;
    }
}


/* =========================
   SHOW PRODUCTS
========================= */

function showProducts(list){

    const box =
    document.getElementById("products");

    if(!box)return;

    box.innerHTML = "";


    if(!list || list.length === 0){

        box.innerHTML = `

            <div
                style="
                grid-column:1/-1;
                text-align:center;
                padding:40px;">

                لا توجد منتجات في هذا التصنيف.

            </div>
        `;

        return;
    }


    list.forEach(product=>{

        const id =
        product.id;

        const name =
        product.name || "منتج";

        const description =
        product.description || "";

        const price =
        Number(product.price) || 0;

        const stock =
        Number(product.stock) || 0;

        const image =
        String(
            product.image_url || ""
        ).trim();

        const category =
        getCategory(product.category);


        let imageHTML = "";


        if(image){

            imageHTML = `

                <img
                    src="${escapeHTML(image)}"
                    alt="${escapeHTML(name)}"
                    loading="lazy"
                    onerror="
                    this.style.display='none';
                    this.nextElementSibling.style.display='flex';
                    ">

                <div
                    class="no-image"
                    style="display:none">

                    🛍️

                </div>
            `;

        }
        else{

            imageHTML = `

                <div class="no-image">
                    🛍️
                </div>

            `;
        }


        let sizeHTML = "";


        if(category === "shoes"){

            sizeHTML = `

                <div class="size-box">

                    <select id="size-${id}">

                        <option value="">
                            اختر المقاس
                        </option>

                        <option value="36">36</option>
                        <option value="37">37</option>
                        <option value="38">38</option>
                        <option value="39">39</option>
                        <option value="40">40</option>
                        <option value="41">41</option>
                        <option value="42">42</option>
                        <option value="43">43</option>
                        <option value="44">44</option>
                        <option value="45">45</option>

                    </select>

                </div>
            `;
        }


        box.innerHTML += `

            <div class="product">

                <div class="product-image">

                    ${imageHTML}

                </div>


                <h3>
                    ${escapeHTML(name)}
                </h3>


                <p class="description">
                    ${escapeHTML(description)}
                </p>


                <div class="price">

                    ${price.toLocaleString("fr-DZ")}
                    دج

                </div>


                <div class="stock">

                    📦 المخزون:
                    ${stock}

                </div>


                ${sizeHTML}


                <button
                    class="add"
                    onclick="addToCart(${Number(id)})"
                    ${stock <= 0 ? "disabled" : ""}>

                    ${
                        stock <= 0
                        ? "غير متوفر"
                        : "🛒 أضف إلى السلة"
                    }

                </button>

            </div>
        `;
    });
}


/* =========================
   CATEGORY FILTER
========================= */

function setCategory(category,button){

    selectedCategory =
    category;


    document
    .querySelectorAll(".category")
    .forEach(btn=>{

        btn.classList.remove("active");

    });


    if(button){

        button.classList.add("active");

    }


    filterProducts();
}


/* =========================
   FILTER PRODUCTS
========================= */

function filterProducts(){

    const search =
    document
    .getElementById("search")
    .value
    .trim()
    .toLowerCase();


    const result =
    products.filter(product=>{

        const category =
        getCategory(product.category);


        const name =
        String(
            product.name || ""
        ).toLowerCase();


        const description =
        String(
            product.description || ""
        ).toLowerCase();


        return (

            (
                selectedCategory === "all" ||
                category === selectedCategory
            )

            &&

            (
                name.includes(search) ||
                description.includes(search)
            )

        );

    });


    showProducts(result);
}


/* =========================
   SEARCH
========================= */

document.addEventListener(
"DOMContentLoaded",
function(){

    const search =
    document.getElementById("search");

    if(search){

        search.addEventListener(
            "input",
            filterProducts
        );

    }

    loadProducts();

    updateCart();

    if(
        typeof loadWilayas ===
        "function"
    ){

        loadWilayas();

    }

});


/* =========================
   ADD TO CART
========================= */

function addToCart(id){

    const product =
    products.find(
        p =>
        Number(p.id) === Number(id)
    );


    if(!product){

        alert(
            "المنتج غير موجود"
        );

        return;
    }


    const category =
    getCategory(
        product.category
    );


    let size = "";


    if(category === "shoes"){

        const select =
        document.getElementById(
            "size-" + id
        );


        if(
            !select ||
            !select.value
        ){

            alert(
                "اختر مقاس الحذاء أولاً"
            );

            return;
        }


        size =
        select.value;
    }


    const existing =
    cart.find(item=>

        Number(item.id) ===
        Number(id)

        &&

        item.size === size

    );


    if(existing){

        if(
            existing.quantity >=
            Number(product.stock)
        ){

            alert(
                "وصلت للكمية المتوفرة"
            );

            return;
        }


        existing.quantity++;

    }
    else{

        cart.push({

            id:id,

            name:
            product.name ||
            "منتج",

            price:
            Number(product.price) || 0,

            stock:
            Number(product.stock) || 0,

            size:size,

            quantity:1

        });
    }


    updateCart();

    openCart();
}


/* =========================
   UPDATE CART
========================= */

function updateCart(){

    const list =
    document.getElementById(
        "cartList"
    );

    const count =
    document.getElementById(
        "cartCount"
    );

    const totalBox =
    document.getElementById(
        "total"
    );

    const subtotalBox =
    document.getElementById(
        "subtotal"
    );

    const deliveryTotalBox =
    document.getElementById(
        "deliveryTotal"
    );


    if(
        !list ||
        !count ||
        !totalBox
    ){

        return;
    }


    list.innerHTML = "";


    let subtotal = 0;

    let itemCount = 0;


    cart.forEach(
    (item,index)=>{

        const itemSubtotal =
        item.price *
        item.quantity;


        subtotal +=
        itemSubtotal;


        itemCount +=
        item.quantity;


        list.innerHTML += `

            <div class="cart-item">

                <div class="cart-item-name">

                    ${escapeHTML(
                        item.name
                    )}

                </div>


                ${
                    item.size
                    ?
                    `<div>
                        📏 المقاس:
                        ${escapeHTML(
                            item.size
                        )}
                    </div>`
                    :
                    ""
                }


                <div class="cart-item-price">

                    ${item.price.toLocaleString("fr-DZ")}
                    دج

                </div>


                <div class="quantity">

                    <button
                        onclick="
                        changeQuantity(
                            ${index},
                            -1
                        )">

                        −

                    </button>


                    <span>
                        ${item.quantity}
                    </span>


                    <button
                        onclick="
                        changeQuantity(
                            ${index},
                            1
                        )">

                        +

                    </button>


                    <button
                        class="remove"
                        onclick="
                        removeItem(
                            ${index}
                        )">

                        🗑️

                    </button>

                </div>

            </div>
        `;
    });


    if(cart.length === 0){

        list.innerHTML = `

            <div
                style="
                text-align:center;
                padding:40px;
                color:#777;">

                السلة فارغة 🛒

            </div>
        `;
    }


    const deliveryPrice =
    getDeliveryPrice();


    const finalTotal =
    subtotal +
    deliveryPrice;


    count.innerText =
    itemCount;


    if(subtotalBox){

        subtotalBox.innerText =
        "المنتجات: " +
        subtotal.toLocaleString("fr-DZ") +
        " دج";
    }


    if(deliveryTotalBox){

        deliveryTotalBox.innerText =
        "التوصيل: " +
        deliveryPrice.toLocaleString("fr-DZ") +
        " دج";
    }


    totalBox.innerText =
    "المجموع النهائي: " +
    finalTotal.toLocaleString("fr-DZ") +
    " دج";
}


/* =========================
   DELIVERY PRICE
========================= */

function getDeliveryPrice(){

    const delivery =
    document.getElementById(
        "delivery"
    );


    const price =
    document.getElementById(
        "deliveryPrice"
    );


    if(
        !delivery ||
        !price
    ){

        return 0;
    }


    if(!delivery.value){

        return 0;
    }


    return Math.max(
        0,
        Number(price.value) || 0
    );
}


/* =========================
   QUANTITY
========================= */

function changeQuantity(
    index,
    change
){

    const item =
    cart[index];


    if(!item)return;


    const newQuantity =
    item.quantity +
    change;


    if(newQuantity <= 0){

        removeItem(index);

        return;
    }


    if(
        newQuantity >
        item.stock
    ){

        alert(
            "لا توجد كمية كافية في المخزون"
        );

        return;
    }


    item.quantity =
    newQuantity;


    updateCart();
}


/* =========================
   REMOVE ITEM
========================= */

function removeItem(index){

    cart.splice(index,1);

    updateCart();
}


/* =========================
   CLEAR CART
========================= */

function clearCart(){

    cart = [];

    updateCart();
}


/* =========================
   OPEN CART
========================= */

function openCart(){

    const panel =
    document.getElementById(
        "cartPanel"
    );

    const overlay =
    document.getElementById(
        "overlay"
    );


    if(panel){

        panel.classList.add(
            "open"
        );
    }


    if(overlay){

        overlay.classList.add(
            "show"
        );
    }
}


/* =========================
   CLOSE CART
========================= */

function closeCart(){

    const panel =
    document.getElementById(
        "cartPanel"
    );

    const overlay =
    document.getElementById(
        "overlay"
    );


    if(panel){

        panel.classList.remove(
            "open"
        );
    }


    if(overlay){

        overlay.classList.remove(
            "show"
        );
    }
}


/* =========================
   SEND ORDER
========================= */

function sendOrder(){

    if(cart.length === 0){

        alert(
            "السلة فارغة"
        );

        return;
    }


    const name =
    document
    .getElementById(
        "customerName"
    )
    .value
    .trim();


    const phone =
    document
    .getElementById(
        "customerPhone"
    )
    .value
    .trim();


    const wilaya =
    document
    .getElementById(
        "wilaya"
    )
    .value
    .trim();


    const city =
    document
    .getElementById(
        "city"
    )
    .value
    .trim();


    const address =
    document
    .getElementById(
        "address"
    )
    .value
    .trim();


    const note =
    document
    .getElementById(
        "note"
    )
    .value
    .trim();


    const delivery =
    document
    .getElementById(
        "delivery"
    )
    .value;


    if(!name){

        alert(
            "اكتب اسم الزبون"
        );

        return;
    }


    if(!phone){

        alert(
            "اكتب رقم الهاتف"
        );

        return;
    }


    if(!wilaya){

        alert(
            "اختر الولاية"
        );

        return;
    }


    if(!city){

        alert(
            "اختر المدينة / البلدية"
        );

        return;
    }


    if(!address){

        alert(
            "اكتب العنوان"
        );

        return;
    }


    if(!delivery){

        alert(
            "اختر طريقة التوصيل"
        );

        return;
    }


    const deliveryPrice =
    getDeliveryPrice();


    let subtotal = 0;


    let message =
    "السلام عليكم، أريد تأكيد هذا الطلب:\n\n";


    message +=
    "👤 الاسم: " +
    name +
    "\n";


    message +=
    "📞 الهاتف: " +
    phone +
    "\n";


    message +=
    "📍 الولاية: " +
    wilaya +
    "\n";


    message +=
    "🏙️ المدينة / البلدية: " +
    city +
    "\n";


    message +=
    "🏠 العنوان: " +
    address +
    "\n";


    message +=
    "🚚 طريقة التوصيل: " +
    (
        delivery === "home"
        ?
        "توصيل للمنزل"
        :
        "استلام من المكتب"
    ) +
    "\n";


    message +=
    "💵 سعر التوصيل: " +
    deliveryPrice +
    " دج\n";


    if(note){

        message +=
        "📝 ملاحظة: " +
        note +
        "\n";
    }


    message +=
    "\n🛍️ المنتجات:\n";


    cart.forEach(item=>{

        const itemSubtotal =
        item.price *
        item.quantity;


        subtotal +=
        itemSubtotal;


        message +=
        "• " +
        item.name +
        " × " +
        item.quantity;


        if(item.size){

            message +=
            " | المقاس: " +
            item.size;
        }


        message +=
        " = " +
        itemSubtotal +
        " دج\n";
    });


    const finalTotal =
    subtotal +
    deliveryPrice;


    message +=
    "\n💰 المنتجات: " +
    subtotal +
    " دج\n";


    message +=
    "🚚 التوصيل: " +
    deliveryPrice +
    " دج\n";


    message +=
    "💵 المجموع النهائي: " +
    finalTotal +
    " دج";


    const url =
    "https://wa.me/" +
    STORE_WHATSAPP +
    "?text=" +
    encodeURIComponent(
        message
    );


    window.open(
        url,
        "_blank"
    );
      }
