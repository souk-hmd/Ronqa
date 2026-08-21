const SUPABASE_URL =
"https://qpctjcaygybpanzyweso.supabase.co";

const SUPABASE_KEY =
"sb_publishable_p_iM1Wod_z9W0kfBXAC90w_J8tH85fO";

async function loadProducts(){

    const box =
    document.getElementById("products");

    box.innerHTML = `
        <div style="
        grid-column:1/-1;
        text-align:center;
        padding:40px;">
        ⏳ جاري الاتصال بقاعدة البيانات...
        </div>
    `;

    try{

        const url =
        SUPABASE_URL +
        "/rest/v1/Products?select=*&apikey=" +
        encodeURIComponent(SUPABASE_KEY);

        const response =
        await fetch(url,{
            method:"GET",
            headers:{
                "apikey":SUPABASE_KEY,
                "Authorization":"Bearer "+SUPABASE_KEY
            }
        });

        const text =
        await response.text();

        console.log("STATUS:",response.status);
        console.log("RESPONSE:",text);

        if(!response.ok){

            throw new Error(
                "Supabase: HTTP " +
                response.status +
                " - " +
                text
            );
        }

        const data =
        JSON.parse(text);

        if(!Array.isArray(data)){

            throw new Error(
                "البيانات ليست قائمة منتجات"
            );
        }

        products = data;

        showProducts(products);

    }
    catch(error){

        console.error(error);

        box.innerHTML = `
            <div style="
            grid-column:1/-1;
            text-align:center;
            padding:40px;">

            ❌ خطأ في تحميل المنتجات

            <br><br>

            <small style="
            direction:ltr;
            display:block;
            word-break:break-word;
            color:red;">

            ${escapeHTML(error.message)}

            </small>

            </div>
        `;
    }
}


let products = [];
let cart = [];
let selectedCategory = "all";


function escapeHTML(text){

    return String(text || "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");

}


function getCategory(value){

    const text =
    String(value || "")
    .trim()
    .toLowerCase();

    if(text.includes("حق"))
        return "bags";

    if(
        text.includes("حذ") ||
        text.includes("احذ") ||
        text.includes("أحذ")
    )
        return "shoes";

    if(
        text.includes("كسسو") ||
        text.includes("اكسسو") ||
        text.includes("إكسسو")
    )
        return "accessories";

    return "other";
}


function showProducts(list){

    const box =
    document.getElementById("products");

    box.innerHTML = "";

    if(!list.length){

        box.innerHTML = `
        <div style="
        grid-column:1/-1;
        text-align:center;
        padding:40px;">

        لا توجد منتجات.

        </div>`;

        return;
    }

    list.forEach(product=>{

        const id = product.id;

        const name =
        product.name || "منتج";

        const description =
        product.description || "";

        const price =
        Number(product.price) || 0;

        const stock =
        Number(product.stock) || 0;

        const image =
        String(product.image_url || "").trim();

        const category =
        getCategory(product.category);

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

            </div>`;
        }

        let imageHTML = "";

        if(image){

            imageHTML = `
            <img
            src="${escapeHTML(image)}"
            alt="${escapeHTML(name)}"
            style="
            width:100%;
            height:100%;
            object-fit:contain;"
            onerror="this.style.display='none';"
            >`;

        }else{

            imageHTML = `
            <div class="no-image">
            🛍️
            </div>`;
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
        📦 المخزون: ${stock}
        </div>

        ${sizeHTML}

        <button
        class="add"
        onclick="addToCart(${id})"
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


function setCategory(category,button){

    selectedCategory = category;

    document
    .querySelectorAll(".category")
    .forEach(btn=>{
        btn.classList.remove("active");
    });

    button.classList.add("active");

    filterProducts();
}


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
        String(product.name || "")
        .toLowerCase();

        const description =
        String(product.description || "")
        .toLowerCase();

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


document
.getElementById("search")
.addEventListener(
"input",
filterProducts
);


/* السلة */

function addToCart(id){

    const product =
    products.find(
    p => Number(p.id) === Number(id)
    );

    if(!product) return;

    const category =
    getCategory(product.category);

    let size = "";

    if(category === "shoes"){

        const select =
        document.getElementById(
        "size-"+id
        );

        if(!select || !select.value){

            alert(
            "اختر مقاس الحذاء أولاً"
            );

            return;
        }

        size = select.value;
    }

    const existing =
    cart.find(item =>
    Number(item.id) === Number(id)
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

    }else{

        cart.push({

        id:id,

        name:
        product.name || "منتج",

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


function updateCart(){

    const list =
    document.getElementById("cartList");

    const count =
    document.getElementById("cartCount");

    const totalBox =
    document.getElementById("total");

    if(!list) return;

    list.innerHTML = "";

    let total = 0;
    let countItems = 0;

    cart.forEach((item,index)=>{

        const subtotal =
        item.price * item.quantity;

        total += subtotal;
        countItems += item.quantity;

        list.innerHTML += `

        <div class="cart-item">

        <div class="cart-item-name">
        ${escapeHTML(item.name)}
        </div>

        ${
        item.size
        ?
        `<div>📏 المقاس: ${item.size}</div>`
        :
        ""
        }

        <div class="cart-item-price">
        ${item.price.toLocaleString("fr-DZ")}
        دج
        </div>

        <div class="quantity">

        <button
        onclick="changeQuantity(${index},-1)">
        −
        </button>

        <span>
        ${item.quantity}
        </span>

        <button
        onclick="changeQuantity(${index},1)">
        +
        </button>

        <button
        class="remove"
        onclick="removeItem(${index})">
        🗑️
        </button>

        </div>

        </div>
        `;
    });

    if(!cart.length){

        list.innerHTML = `
        <div style="
        text-align:center;
        padding:40px;">
        السلة فارغة 🛒
        </div>`;
    }

    count.innerText = countItems;

    totalBox.innerText =
    "المجموع: " +
    total.toLocaleString("fr-DZ") +
    " دج";
}


function changeQuantity(index,change){

    const item = cart[index];

    if(!item) return;

    const quantity =
    item.quantity + change;

    if(quantity <= 0){

        removeItem(index);

        return;
    }

    if(quantity > item.stock){

        alert(
        "لا توجد كمية كافية في المخزون"
        );

        return;
    }

    item.quantity = quantity;

    updateCart();
}


function removeItem(index){

    cart.splice(index,1);

    updateCart();
}


function clearCart(){

    cart = [];

    updateCart();
}


function openCart(){

    document
    .getElementById("cartPanel")
    .classList.add("open");

    document
    .getElementById("overlay")
    .classList.add("show");
}


function closeCart(){

    document
    .getElementById("cartPanel")
    .classList.remove("open");

    document
    .getElementById("overlay")
    .classList.remove("show");
}


/* WhatsApp */

function sendOrder(){

    if(!cart.length){

        alert("السلة فارغة");

        return;
    }

    const name =
    document.getElementById(
    "customerName"
    ).value.trim();

    const phone =
    document.getElementById(
    "customerPhone"
    ).value.trim();

    const wilaya =
    document.getElementById(
    "wilaya"
    ).value.trim();

    const city =
    document.getElementById(
    "city"
    ).value.trim();

    const address =
    document.getElementById(
    "address"
    ).value.trim();

    const note =
    document.getElementById(
    "note"
    ).value.trim();

    if(!name){

        alert("اكتب اسم الزبون");
        return;
    }

    if(!phone){

        alert("اكتب رقم الهاتف");
        return;
    }

    if(!wilaya){

        alert("اختر الولاية");
        return;
    }

    if(!city){

        alert("اكتب المدينة");
        return;
    }

    if(!address){

        alert("اكتب العنوان");
        return;
    }

    let total = 0;

    let message =
    "السلام عليكم، أريد تأكيد هذا الطلب:\n\n";

    message +=
    "👤 الاسم: "+name+"\n";

    message +=
    "📞 الهاتف: "+phone+"\n";

    message +=
    "📍 الولاية: "+wilaya+"\n";

    message +=
    "🏙️ المدينة: "+city+"\n";

    message +=
    "🏠 العنوان: "+address+"\n";

    if(note){

        message +=
        "📝 ملاحظة: "+note+"\n";
    }

    message +=
    "\n🛍️ المنتجات:\n";

    cart.forEach(item=>{

        const subtotal =
        item.price * item.quantity;

        total += subtotal;

        message +=
        "• "+item.name+
        " × "+item.quantity;

        if(item.size){

            message +=
            " | المقاس: "+item.size;
        }

        message +=
        " = "+subtotal+" دج\n";
    });

    message +=
    "\n💰 المجموع: "+total+" دج";

    const url =
    "https://wa.me/213675996957?text="+
    encodeURIComponent(message);

    window.open(url,"_blank");
}


/* تشغيل */

loadProducts();

updateCart();
