/* =========================================
   RONQA dz STORE
   APP.JS
========================================= */


/* =========================================
   SUPABASE
========================================= */

const SUPABASE_URL =
"https://qpctjcaygybpanzyweso.supabase.co";

const SUPABASE_KEY =
"sb_publishable_p_iM1Wod_z9W0kfBXAC90w_J8tH85fO";


/* =========================================
   WHATSAPP
========================================= */

const STORE_WHATSAPP =
"213675996957";


/* =========================================
   GLOBAL
========================================= */

let products = [];

let cart = [];

let selectedCategory = "all";


/* =========================================
   LOAD CART
========================================= */

function loadSavedCart(){

    try{

        const saved =
            localStorage.getItem(
                "soukHMD_cart"
            );

        if(saved){

            const parsed =
                JSON.parse(saved);

            if(Array.isArray(parsed)){

                cart = parsed;

            }

        }

    }

    catch(error){

        console.error(
            "خطأ في تحميل السلة:",
            error
        );

        cart = [];

    }
}


/* =========================================
   SAVE CART
========================================= */

function saveCart(){

    try{

        localStorage.setItem(
            "soukHMD_cart",
            JSON.stringify(cart)
        );

    }

    catch(error){

        console.error(
            "خطأ في حفظ السلة:",
            error
        );

    }
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
        text.includes("حق") ||
        text.includes("bag")
    ){

        return "bags";

    }


    if(
        text.includes("حذ") ||
        text.includes("احذ") ||
        text.includes("أحذ") ||
        text.includes("shoe")
    ){

        return "shoes";

    }


    if(
        text.includes("كسسو") ||
        text.includes("اكسسو") ||
        text.includes("إكسسو") ||
        text.includes("accessor")
    ){

        return "accessories";

    }


    return "other";
}


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
   FORMAT PRICE
========================================= */

function formatPrice(price){

    return Number(price || 0)
        .toLocaleString("fr-DZ");
}


/* =========================================
   DELIVERY
========================================= */

function getDeliveryPrice(){

    const wilaya =
        document
        .getElementById("wilaya")
        ?.value
        .trim() || "";


    const city =
        document
        .getElementById("city")
        ?.value
        .trim() || "";


    if(city === "حاسي مسعود"){

        return 0;

    }


    if(wilaya === "ورقلة"){

        return 400;

    }


    if(wilaya !== ""){

        return 700;

    }


    return 0;
}


/* =========================================
   UPDATE DELIVERY
========================================= */

function updateDelivery(){

    const box =
        document.getElementById(
            "deliveryPrice"
        );

    if(!box){
        return;
    }


    const wilaya =
        document
        .getElementById("wilaya")
        ?.value
        .trim() || "";


    const delivery =
        getDeliveryPrice();


    if(!wilaya){

        box.innerText =
            "اختر الولاية";

        return;

    }


    box.innerText =
        delivery === 0
        ?
        "مجاني"
        :
        formatPrice(delivery) + " دج";
}


/* =========================================
   POPULATE CITIES
========================================= */

function populateCities(wilaya){

    const citySelect =
        document.getElementById(
            "city"
        );


    if(!citySelect){
        return;
    }


    citySelect.innerHTML = `
        <option value="">
            🏙️ اختر المدينة / البلدية
        </option>
    `;


    if(!wilaya){

        citySelect.disabled = true;

        updateDelivery();
        updateCart();

        return;
    }


    if(
        typeof isAlgeriaDataReady ===
        "function" &&
        !isAlgeriaDataReady()
    ){

        citySelect.disabled = true;

        citySelect.innerHTML = `
            <option value="">
                ⏳ جاري تحميل البلديات...
            </option>
        `;

        return;
    }


    const cities =
        typeof getCitiesByWilaya ===
        "function"
        ?
        getCitiesByWilaya(wilaya)
        :
        [];


    if(!cities.length){

        citySelect.disabled = true;

        citySelect.innerHTML = `
            <option value="">
                ⚠️ لم يتم العثور على البلديات
            </option>
        `;

        updateDelivery();
        updateCart();

        return;
    }


    citySelect.disabled = false;


    cities.forEach(city => {

        const option =
            document.createElement(
                "option"
            );

        option.value = city;

        option.textContent = city;

        citySelect.appendChild(option);

    });


    updateDelivery();
    updateCart();
}


/* =========================================
   LOCATION EVENTS
========================================= */

function setupLocationEvents(){

    const wilaya =
        document.getElementById(
            "wilaya"
        );


    const city =
        document.getElementById(
            "city"
        );


    if(wilaya){

        wilaya.addEventListener(
            "change",
            function(){

                populateCities(
                    this.value
                );

            }
        );

    }


    if(city){

        city.addEventListener(
            "change",
            function(){

                updateDelivery();
                updateCart();

            }
        );

    }
}


/* =========================================
   LOAD PRODUCTS
========================================= */

async function loadProducts(){

    const box =
        document.getElementById(
            "products"
        );


    if(!box){
        return;
    }


    try{

        box.innerHTML = `
            <div class="loading">
                ⏳ جاري تحميل المنتجات...
            </div>
        `;


        const response =
            await fetch(

                SUPABASE_URL +
                "/rest/v1/Products?select=*",

                {

                    method:"GET",

                    headers:{

                        "apikey":
                            SUPABASE_KEY,

                        "Authorization":
                            "Bearer " +
                            SUPABASE_KEY,

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


        console.log(
            "Products loaded:",
            products
        );


        cart =
            cart.filter(item => {

                const product =
                    products.find(
                        p =>
                        Number(p.id) ===
                        Number(item.id)
                    );


                if(!product){
                    return false;
                }


                item.stock =
                    Number(product.stock) || 0;


                item.price =
                    Number(product.price) || 0;


                return true;

            });


        saveCart();


        showProducts(
            products
        );


        updateCart();

    }

    catch(error){

        console.error(
            "Load products error:",
            error
        );


        box.innerHTML = `

            <div class="empty-products">

                ❌ حدث خطأ في تحميل المنتجات

                <br><br>

                <small>
                    ${escapeHTML(
                        error.message
                    )}
                </small>

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
        !list ||
        list.length === 0
    ){

        box.innerHTML = `
            <div class="empty-products">
                🛍️ لا توجد منتجات حالياً
            </div>
        `;

        return;
    }


    list.forEach(product => {

        const id =
            product.id;

        const name =
            product.name ||
            "منتج";

        const description =
            product.description ||
            "";

        const price =
            Number(product.price) || 0;

        const stock =
            Number(product.stock) || 0;

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

                    <select
                        id="size-${id}">

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


        const stockText =
            stock <= 0
            ?
            "❌ غير متوفر"
            :
            `📦 المخزون: ${stock}`;


        box.innerHTML += `

            <article class="product">

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
                    ${formatPrice(price)} دج
                </div>


                <div class="stock">
                    ${stockText}
                </div>


                ${sizeHTML}


                <button
                    type="button"
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

            </article>
        `;
    });
}


/* =========================================
   CATEGORY
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
        .forEach(btn => {

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

    const searchInput =
        document.getElementById(
            "search"
        );


    const search =
        searchInput
        ?
        searchInput.value
            .trim()
            .toLowerCase()
        :
        "";


    const result =
        products.filter(product => {

            const category =
                getCategory(
                    product.category
                );


            const name =
                String(
                    product.name || ""
                )
                .toLowerCase();


            const description =
                String(
                    product.description || ""
                )
                .toLowerCase();


            return (

                (
                    selectedCategory ===
                    "all" ||

                    category ===
                    selectedCategory
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


/* =========================================
   SEARCH
========================================= */

function setupSearch(){

    const input =
        document.getElementById(
            "search"
        );


    if(!input){
        return;
    }


    input.addEventListener(
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


    const stock =
        Number(product.stock) || 0;


    if(stock <= 0){

        alert(
            "هذا المنتج غير متوفر حالياً"
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
                "👟 اختر مقاس الحذاء أولاً"
            );

            return;
        }


        size =
            select.value;
    }


    const existing =
        cart.find(
            item =>

            Number(item.id) ===
            Number(id)

            &&

            item.size ===
            size
        );


    if(existing){

        if(
            existing.quantity >=
            stock
        ){

            alert(
                "⚠️ وصلت للكمية المتوفرة في المخزون"
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

            stock:stock,

            size:size,

            quantity:1

        });

    }


    saveCart();

    updateCart();

    openCart();
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


    if(!list){
        return;
    }


    list.innerHTML = "";


    let productsTotal = 0;

    let itemCount = 0;


    cart.forEach(
        (item,index) => {

            const subtotal =
                Number(item.price) *
                Number(item.quantity);


            productsTotal +=
                subtotal;


            itemCount +=
                Number(item.quantity);


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

                        ${formatPrice(
                            item.price
                        )}
                        دج

                    </div>


                    <div class="quantity">

                        <button
                            type="button"
                            onclick="
                                changeQuantity(
                                    ${index},
                                    -1
                                )
                            ">

                            −

                        </button>


                        <span>
                            ${item.quantity}
                        </span>


                        <button
                            type="button"
                            onclick="
                                changeQuantity(
                                    ${index},
                                    1
                                )
                            ">

                            +

                        </button>


                        <button
                            type="button"
                            class="remove"
                            onclick="
                                removeItem(
                                    ${index}
                                )
                            ">

                            🗑️

                        </button>

                    </div>

                </div>

            `;
        }
    );


    if(cart.length === 0){

        list.innerHTML = `
            <div class="empty-cart">
                السلة فارغة 🛒
            </div>
        `;

    }


    const delivery =
        getDeliveryPrice();


    const finalTotal =
        productsTotal +
        delivery;


    if(count){

        count.innerText =
            itemCount;

    }


    const productsTotalBox =
        document.getElementById(
            "productsTotal"
        );


    if(productsTotalBox){

        productsTotalBox.innerText =
            formatPrice(
                productsTotal
            ) +
            " دج";

    }


    const deliveryBox =
        document.getElementById(
            "deliveryPrice"
        );


    if(deliveryBox){

        const wilaya =
            document
            .getElementById(
                "wilaya"
            )
            ?.value
            .trim() || "";


        if(!wilaya){

            deliveryBox.innerText =
                "اختر الولاية";

        }

        else if(delivery === 0){

            deliveryBox.innerText =
                "مجاني";

        }

        else{

            deliveryBox.innerText =
                formatPrice(
                    delivery
                ) +
                " دج";

        }

    }


    const finalTotalBox =
        document.getElementById(
            "finalTotal"
        );


    if(finalTotalBox){

        finalTotalBox.innerText =
            formatPrice(
                finalTotal
            ) +
            " دج";

    }


    saveCart();
}


/* =========================================
   CHANGE QUANTITY
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


    const product =
        products.find(
            p =>
            Number(p.id) ===
            Number(item.id)
        );


    const currentStock =
        product
        ?
        Number(product.stock) || 0
        :
        Number(item.stock) || 0;


    const newQuantity =
        Number(item.quantity) +
        Number(change);


    if(newQuantity <= 0){

        removeItem(index);

        return;
    }


    if(newQuantity > currentStock){

        alert(
            "⚠️ لا توجد كمية كافية في المخزون"
        );

        return;
    }


    item.stock =
        currentStock;


    item.quantity =
        newQuantity;


    saveCart();

    updateCart();
}


/* =========================================
   REMOVE
========================================= */

function removeItem(index){

    if(
        index < 0 ||
        index >= cart.length
    ){

        return;
    }


    cart.splice(
        index,
        1
    );


    saveCart();

    updateCart();
}


/* =========================================
   CLEAR
========================================= */

function clearCart(){

    if(cart.length === 0){
        return;
    }


    if(
        !confirm(
            "هل تريد إفراغ سلة المشتريات؟"
        )
    ){

        return;
    }


    cart = [];

    saveCart();

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


    document.body.style.overflow =
        "hidden";
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


    document.body.style.overflow =
        "";
}


/* =========================================
   SEND ORDER
========================================= */

function sendOrder(){

    if(cart.length === 0){

        alert(
            "🛒 السلة فارغة"
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


    if(!name){

        alert(
            "👤 اكتب اسم الزبون"
        );

        return;
    }


    if(!phone){

        alert(
            "📞 اكتب رقم الهاتف"
        );

        return;
    }


    const phoneClean =
        phone.replace(
            /[\s\-]/g,
            ""
        );


    if(
        !/^0[567]\d{8}$/.test(
            phoneClean
        )
    ){

        alert(
            "📞 أدخل رقم هاتف جزائري صحيح"
        );

        return;
    }


    if(!wilaya){

        alert(
            "📍 اختر الولاية"
        );

        return;
    }


    if(!city){

        alert(
            "🏙️ اختر المدينة / البلدية"
        );

        return;
    }


    if(!address){

        alert(
            "🏠 اكتب العنوان"
        );

        return;
    }


    let productsTotal = 0;


    let message =
        "السلام عليكم، أريد تأكيد هذا الطلب:\n\n";


    message +=
        "🧾 *معلومات الزبون*\n";


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


    if(note){

        message +=
            "📝 ملاحظة: " +
            note +
            "\n";
    }


    message +=
        "\n🛍️ *المنتجات*\n";


    cart.forEach(item => {

        const subtotal =
            Number(item.price) *
            Number(item.quantity);


        productsTotal +=
            subtotal;


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
            formatPrice(
                subtotal
            ) +
            " دج\n";

    });


    const delivery =
        getDeliveryPrice();


    const finalTotal =
        productsTotal +
        delivery;


    message +=
        "\n🛍️ مجموع المنتجات: " +
        formatPrice(
            productsTotal
        ) +
        " دج";


    message +=
        "\n🚚 التوصيل: " +
        (
            delivery === 0
            ?
            "مجاني"
            :
            formatPrice(
                delivery
            ) +
            " دج"
        );


    message +=
        "\n💰 *المجموع النهائي: " +
        formatPrice(
            finalTotal
        ) +
        " دج*";


    message +=
        "\n\nشكراً لثقتكم بـ RONQA dz STORE ❤️";


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


/* =========================================
   KEYBOARD
========================================= */

function setupKeyboard(){

    document.addEventListener(
        "keydown",
        function(event){

            if(
                event.key ===
                "Escape"
            ){

                closeCart();

            }

        }
    );
}


/* =========================================
   ALGERIA READY
========================================= */

document.addEventListener(
    "algeriaDataReady",
    function(){

        console.log(
            "✅ تم تجهيز بيانات البلديات"
        );

        const wilaya =
            document
            .getElementById(
                "wilaya"
            )
            ?.value
            .trim() || "";


        if(wilaya){

            populateCities(
                wilaya
            );

        }

    }
);


/* =========================================
   ALGERIA ERROR
========================================= */

document.addEventListener(
    "algeriaDataError",
    function(event){

        console.error(
            "فشل تحميل بيانات البلديات:",
            event.detail
        );


        const city =
            document.getElementById(
                "city"
            );


        if(city){

            city.disabled =
                true;

            city.innerHTML = `
                <option value="">
                    ⚠️ تعذر تحميل البلديات
                </option>
            `;
        }

    }
);


/* =========================================
   START
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function(){

        console.log(
            "🚀 RONQA dz STORE started"
        );


        loadSavedCart();

        setupLocationEvents();

        setupSearch();

        setupKeyboard();

        updateCart();

        updateDelivery();

        loadProducts();

    }
);