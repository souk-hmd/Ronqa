/* =========================================
   RONQA - APP.JS
========================================= */


/* =========================================
   SUPABASE
========================================= */

const SUPABASE_URL =
"https://qpctjcaygybpanzyweso.supabase.co";

const SUPABASE_KEY =
"sb_publishable_p_iM1Wod_z9W0kfBXAC90w_J8tH85fO";

const STORE_WHATSAPP =
"213675996957";


/* =========================================
   VARIABLES
========================================= */

let products = [];
let cart = [];
let selectedCategory = "all";


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(text){

    return String(text || "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");

}


/* =========================================
   CATEGORY
========================================= */

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


/* =========================================
   LOAD PRODUCTS
========================================= */

async function loadProducts(){

    const box =
    document.getElementById("products");

    if(!box){
        console.error(
            "Element #products not found"
        );
        return;
    }


    box.innerHTML = `
        <div style="
            grid-column:1/-1;
            text-align:center;
            padding:40px;
            font-size:18px;">
            
            ⏳ جاري تحميل المنتجات...
            
        </div>
    `;


    try{

        const url =
        SUPABASE_URL +
        "/rest/v1/Products?select=*";


        console.log(
            "Supabase URL:",
            url
        );


        const response =
        await fetch(
            url,
            {
                method:"GET",

                headers:{
                    "apikey":SUPABASE_KEY,
                    "Authorization":
                    "Bearer " + SUPABASE_KEY,
                    "Content-Type":
                    "application/json",
                    "Accept":
                    "application/json"
                }
            }
        );


        console.log(
            "Supabase status:",
            response.status
        );


        const responseText =
        await response.text();


        console.log(
            "Supabase response:",
            responseText
        );


        if(!response.ok){

            throw new Error(
                "HTTP " +
                response.status +
                ": " +
                responseText
            );

        }


        let data;


        try{

            data =
            JSON.parse(
                responseText
            );

        }
        catch(parseError){

            throw new Error(
                "Supabase لم يرجع بيانات JSON صحيحة"
            );

        }


        if(!Array.isArray(data)){

            throw new Error(
                "بيانات المنتجات ليست قائمة"
            );

        }


        products = data;


        console.log(
            "Products loaded:",
            products.length
        );


        showProducts(products);

    }
    catch(error){

        console.error(
            "LOAD PRODUCTS ERROR:",
            error
        );


        box.innerHTML = `

            <div style="
                grid-column:1/-1;
                text-align:center;
                padding:40px;">

                <div style="
                    font-size:45px;
                    margin-bottom:15px;">
                    
                    ❌
                    
                </div>

                <h3>
                    تعذر تحميل المنتجات
                </h3>

                <p style="
                    color:#777;
                    margin-top:10px;
                    direction:ltr;
                    word-break:break-word;">
                    
                    ${escapeHTML(
                        error.message
                    )}
                    
                </p>

            </div>

        `;
    }
}


/* =========================================
   SHOW PRODUCTS
========================================= */

function showProducts(list){

    const box =
    document.getElementById(
        "products"
    );


    if(!box){
        return;
    }


    box.innerHTML = "";


    if(
        !Array.isArray(list) ||
        list.length === 0
    ){

        box.innerHTML = `

            <div style="
                grid-column:1/-1;
                text-align:center;
                padding:40px;">

                لا توجد منتجات في هذا التصنيف 🛍️

            </div>

        `;

        return;
    }


    list.forEach(product=>{

        const id =
        product.id;

        const name =
        product.name ||
        "منتج";

        const description =
        product.description ||
        "";

        const price =
        Number(product.price) ||
        0;

        const stock =
        Number(product.stock) ||
        0;

        const image =
        String(
            product.image_url || ""
        ).trim();

        const category =
        getCategory(
            product.category
        );


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
                    "
                >

                <div
                    class="no-image"
                    style="display:none;">
                    
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


        if(
            category === "shoes"
        ){

            sizeHTML = `

                <div class="size-box">

                    <select
                        id="size-${id}">

                        <option value="">
                            اختر المقاس
                        </option>

                        <option value="36">
                            36
                        </option>

                        <option value="37">
                            37
                        </option>

                        <option value="38">
                            38
                        </option>

                        <option value="39">
                            39
                        </option>

                        <option value="40">
                            40
                        </option>

                        <option value="41">
                            41
                        </option>

                        <option value="42">
                            42
                        </option>

                        <option value="43">
                            43
                        </option>

                        <option value="44">
                            44
                        </option>

                        <option value="45">
                            45
                        </option>

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
                        ?
                        "غير متوفر"
                        :
                        "🛒 أضف إلى السلة"
                    }

                </button>

            </div>

        `;
    });
}


/* =========================================
   CATEGORY BUTTON
========================================= */

function setCategory(
    category,
    button
){

    selectedCategory =
    category;


    document
    .querySelectorAll(
        ".category"
    )
    .forEach(btn=>{

        btn.classList.remove(
            "active"
        );

    });


    if(button){

        button.classList.add(
            "active"
        );

    }


    filterProducts();
}


/* =========================================
   FILTER
========================================= */

function filterProducts(){

    const searchElement =
    document.getElementById(
        "search"
    );


    const search =
    searchElement
    ?
    searchElement.value
    .trim()
    .toLowerCase()
    :
    "";


    const result =
    products.filter(product=>{

        const category =
        getCategory(
            product.category
        );


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
                selectedCategory ===
                "all"
                ||
                category ===
                selectedCategory
            )

            &&

            (
                name.includes(
                    search
                )
                ||
                description.includes(
                    search
                )
            )

        );

    });


    showProducts(result);
}


/* =========================================
   SEARCH
========================================= */

function setupSearch(){

    const search =
    document.getElementById(
        "search"
    );


    if(!search){
        return;
    }


    search.addEventListener(
        "input",
        filterProducts
    );
}


/* =========================================
   ADD TO CART
========================================= */

function addToCart(id){

    const product =
    products.find(
        p =>
        Number(p.id) ===
        Number(id)
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


    if(
        category === "shoes"
    ){

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
            Number(product.price) ||
            0,

            stock:
            Number(product.stock) ||
            0,

            size:size,

            quantity:1

        });

    }


    updateCart();

    openCart();
}


/* =========================================
   DELIVERY PRICE
========================================= */

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
        !price ||
        !delivery.value
    ){

        return 0;
    }


    return Math.max(
        0,
        Number(
            price.value
        ) || 0
    );
}


/* =========================================
   UPDATE CART
========================================= */

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
                    `
                    <div>
                        📏 المقاس:
                        ${escapeHTML(
                            item.size
                        )}
                    </div>
                    `
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


    if(
        cart.length === 0
    ){

        list.innerHTML = `

            <div style="
                text-align:center;
                padding:40px;
                color:#777;">

                السلة فارغة 🛒

            </div>

        `;
    }


    const delivery =
    getDeliveryPrice();


    const finalTotal =
    subtotal +
    delivery;


    count.innerText =
    itemCount;


    const subtotalBox =
    document.getElementById(
        "subtotal"
    );


    const deliveryBox =
    document.getElementById(
        "deliveryTotal"
    );


    if(subtotalBox){

        subtotalBox.innerText =
        "المنتجات: " +
        subtotal.toLocaleString(
            "fr-DZ"
        ) +
        " دج";
    }


    if(deliveryBox){

        deliveryBox.innerText =
        "التوصيل: " +
        delivery.toLocaleString(
            "fr-DZ"
        ) +
        " دج";
    }


    totalBox.innerText =
    "المجموع النهائي: " +
    finalTotal.toLocaleString(
        "fr-DZ"
    ) +
    " دج";
}


/* =========================================
   QUANTITY
========================================= */

function changeQuantity(
    index,
    change
){

    const item =
    cart[index];


    if(!item){
        return;
    }


    const newQuantity =
    item.quantity +
    change;


    if(
        newQuantity <= 0
    ){

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


/* =========================================
   REMOVE
========================================= */

function removeItem(index){

    cart.splice(
        index,
        1
    );

    updateCart();
}


/* =========================================
   CLEAR
========================================= */

function clearCart(){

    cart = [];

    updateCart();
}


/* =========================================
   OPEN CART
========================================= */

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


/* =========================================
   CLOSE CART
========================================= */

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


/* =========================================
   SEND ORDER
========================================= */

function sendOrder(){

    if(
        cart.length === 0
    ){

        alert(
            "السلة فارغة"
        );

        return;
    }


    const getValue =
    id => {

        const element =
        document.getElementById(
            id
        );

        return element
        ?
        element.value.trim()
        :
        "";

    };


    const name =
    getValue(
        "customerName"
    );


    const phone =
    getValue(
        "customerPhone"
    );


    const wilaya =
    getValue(
        "wilaya"
    );


    const city =
    getValue(
        "city"
    );


    const address =
    getValue(
        "address"
    );


    const note =
    getValue(
        "note"
    );


    const deliveryElement =
    document.getElementById(
        "delivery"
    );


    const delivery =
    deliveryElement
    ?
    deliveryElement.value
    :
    "";


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

        
