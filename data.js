/* =========================================
   RONQA dz STORE
   DATA.JS
   تحميل الولايات والبلديات الجزائرية
========================================= */

const ALGERIA_DATA = {};

let algeriaDataReady = false;


/* =========================================
   مصادر البيانات
========================================= */

const WILAYAS_URL =
"https://mohamed-gp.github.io/algeria_69_wilayas/main.json";

const COMMUNES_URL =
"https://mohamed-gp.github.io/algeria_69_wilayas/communes.json";


/* =========================================
   إنشاء قائمة الولايات
========================================= */

const ALGERIA_WILAYAS = [
    "أدرار",
    "الشلف",
    "الأغواط",
    "أم البواقي",
    "باتنة",
    "بجاية",
    "بسكرة",
    "بشار",
    "البليدة",
    "البويرة",
    "تمنراست",
    "تبسة",
    "تلمسان",
    "تيارت",
    "تيزي وزو",
    "الجزائر",
    "الجلفة",
    "جيجل",
    "سطيف",
    "سعيدة",
    "سكيكدة",
    "سيدي بلعباس",
    "عنابة",
    "قالمة",
    "قسنطينة",
    "المدية",
    "مستغانم",
    "المسيلة",
    "معسكر",
    "ورقلة",
    "وهران",
    "البيض",
    "إليزي",
    "برج بوعريريج",
    "بومرداس",
    "الطارف",
    "تندوف",
    "تيسمسيلت",
    "الوادي",
    "خنشلة",
    "سوق أهراس",
    "تيبازة",
    "ميلة",
    "عين الدفلى",
    "النعامة",
    "عين تموشنت",
    "غرداية",
    "غليزان",

    "تيميمون",
    "برج باجي مختار",
    "أولاد جلال",
    "بني عباس",
    "إن صالح",
    "إن قزام",
    "تقرت",
    "جانت",
    "المغير",
    "المنيعة"
];


/* =========================================
   ملء قائمة الولايات
========================================= */

function populateWilayas(){

    const select =
        document.getElementById("wilaya");

    if(!select){
        return;
    }

    select.innerHTML = `
        <option value="">
            📍 اختر الولاية
        </option>
    `;

    ALGERIA_WILAYAS.forEach(wilaya => {

        const option =
            document.createElement("option");

        option.value = wilaya;
        option.textContent = wilaya;

        select.appendChild(option);

    });

}


/* =========================================
   تحميل البيانات
========================================= */

async function loadAlgeriaData(){

    try{

        console.log(
            "⏳ جاري تحميل بيانات الولايات والبلديات..."
        );


        const responses =
            await Promise.all([

                fetch(
                    WILAYAS_URL,
                    {
                        cache:"no-cache"
                    }
                ),

                fetch(
                    COMMUNES_URL,
                    {
                        cache:"no-cache"
                    }
                )

            ]);


        const wilayasResponse =
            responses[0];

        const communesResponse =
            responses[1];


        if(!wilayasResponse.ok){

            throw new Error(
                "فشل تحميل الولايات: HTTP " +
                wilayasResponse.status
            );

        }


        if(!communesResponse.ok){

            throw new Error(
                "فشل تحميل البلديات: HTTP " +
                communesResponse.status
            );

        }


        const wilayasData =
            await wilayasResponse.json();


        const communesData =
            await communesResponse.json();


        if(
            !wilayasData ||
            !Array.isArray(wilayasData.wilayas)
        ){

            throw new Error(
                "ملف الولايات غير صحيح"
            );

        }


        if(
            !communesData ||
            !Array.isArray(communesData.communes)
        ){

            throw new Error(
                "ملف البلديات غير صحيح"
            );

        }


        Object.keys(ALGERIA_DATA)
            .forEach(key => {

                delete ALGERIA_DATA[key];

            });


        const wilayaMap = {};


        wilayasData.wilayas.forEach(wilaya => {

            if(
                wilaya &&
                wilaya.id &&
                wilaya.name_ar
            ){

                wilayaMap[
                    Number(wilaya.id)
                ] =
                    wilaya.name_ar;

            }

        });


        Object.values(wilayaMap)
            .forEach(wilayaName => {

                ALGERIA_DATA[
                    wilayaName
                ] = [];

            });


        communesData.communes.forEach(commune => {

            if(!commune){
                return;
            }


            const wilayaId =
                Number(commune.wilaya_id);


            const wilayaName =
                wilayaMap[wilayaId];


            if(!wilayaName){
                return;
            }


            if(commune.name_ar){

                ALGERIA_DATA[
                    wilayaName
                ].push(
                    commune.name_ar
                );

            }

        });


        Object.keys(ALGERIA_DATA)
            .forEach(wilayaName => {

                ALGERIA_DATA[wilayaName] =
                    [
                        ...new Set(
                            ALGERIA_DATA[
                                wilayaName
                            ]
                        )
                    ].sort(
                        (a,b) =>
                            a.localeCompare(
                                b,
                                "ar"
                            )
                    );

            });


        algeriaDataReady = true;


        console.log(
            "✅ تم تحميل بيانات الجزائر بنجاح"
        );


        console.log(
            "🏛️ الولايات:",
            Object.keys(ALGERIA_DATA).length
        );


        let totalCities = 0;


        Object.values(ALGERIA_DATA)
            .forEach(cities => {

                totalCities += cities.length;

            });


        console.log(
            "🏙️ البلديات:",
            totalCities
        );


        document.dispatchEvent(
            new CustomEvent(
                "algeriaDataReady"
            )
        );


        return ALGERIA_DATA;

    }

    catch(error){

        console.error(
            "❌ خطأ في تحميل بيانات الجزائر:",
            error
        );


        algeriaDataReady = false;


        document.dispatchEvent(
            new CustomEvent(
                "algeriaDataError",
                {
                    detail:error
                }
            )
        );


        return {};

    }

}


/* =========================================
   الحصول على البلديات
========================================= */

function getCitiesByWilaya(wilaya){

    if(!wilaya){
        return [];
    }

    return ALGERIA_DATA[wilaya] || [];

}


/* =========================================
   حالة البيانات
========================================= */

function isAlgeriaDataReady(){

    return algeriaDataReady;

}


/* =========================================
   START
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function(){

        populateWilayas();

        loadAlgeriaData();

    }
);