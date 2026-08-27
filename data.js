/* =========================================
   SOUK HMD / RONQA
   DATA.JS
   69 WILAYAS + 1541 COMMUNES
========================================= */

const ALGERIA_DATA = {};

let algeriaDataReady = false;


/* =========================================
   LOAD ALGERIA DATA
========================================= */

async function loadAlgeriaData(){

    try{

        console.log(
            "⏳ جاري تحميل بيانات الولايات والبلديات..."
        );


        /*
         * تحميل الملفين:
         * main.json = الولايات
         * communes.json = البلديات
         */

        const [wilayasResponse, communesResponse] =
        await Promise.all([

            fetch(
                "https://mohamed-gp.github.io/algeria_69_wilayas/main.json",
                {
                    cache:"no-cache"
                }
            ),

            fetch(
                "https://mohamed-gp.github.io/algeria_69_wilayas/communes.json",
                {
                    cache:"no-cache"
                }
            )

        ]);


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


        /* =====================================
           التحقق من البيانات
        ===================================== */

        if(
            !wilayasData ||
            !Array.isArray(
                wilayasData.wilayas
            )
        ){

            throw new Error(
                "ملف الولايات غير صحيح"
            );

        }


        if(
            !communesData ||
            !Array.isArray(
                communesData.communes
            )
        ){

            throw new Error(
                "ملف البلديات غير صحيح"
            );

        }


        /* =====================================
           تفريغ البيانات القديمة
        ===================================== */

        Object.keys(ALGERIA_DATA)
        .forEach(
            key => {

                delete ALGERIA_DATA[key];

            }
        );


        /* =====================================
           إنشاء خريطة ID → اسم الولاية
        ===================================== */

        const wilayaMap = {};


        wilayasData.wilayas.forEach(
            wilaya => {

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

            }
        );


        console.log(
            "عدد الولايات:",
            Object.keys(wilayaMap).length
        );


        /* =====================================
           إنشاء الولايات داخل ALGERIA_DATA
        ===================================== */

        Object.values(wilayaMap)
        .forEach(
            wilayaName => {

                ALGERIA_DATA[
                    wilayaName
                ] = [];

            }
        );


        /* =====================================
           إضافة البلديات
        ===================================== */

        communesData.communes.forEach(
            commune => {

                if(!commune){

                    return;

                }


                const wilayaId =
                Number(
                    commune.wilaya_id
                );


                const wilayaName =
                wilayaMap[
                    wilayaId
                ];


                if(!wilayaName){

                    return;

                }


                if(
                    commune.name_ar
                ){

                    ALGERIA_DATA[
                        wilayaName
                    ].push(
                        commune.name_ar
                    );

                }

            }
        );


        /* =====================================
           حذف التكرار + ترتيب
        ===================================== */

        Object.keys(ALGERIA_DATA)
        .forEach(
            wilayaName => {

                ALGERIA_DATA[
                    wilayaName
                ] =
                [
                    ...new Set(
                        ALGERIA_DATA[
                            wilayaName
                        ]
                    )
                ]
                .sort(
                    (a,b) =>
                    a.localeCompare(
                        b,
                        "ar"
                    )
                );

            }
        );


        /* =====================================
           الحالة النهائية
        ===================================== */

        algeriaDataReady = true;


        console.log(
            "✅ تم تحميل بيانات الجزائر بنجاح"
        );


        console.log(
            "🏛️ الولايات:",
            Object.keys(
                ALGERIA_DATA
            ).length
        );


        let totalCities = 0;


        Object.values(
            ALGERIA_DATA
        )
        .forEach(
            cities => {

                totalCities +=
                cities.length;

            }
        );


        console.log(
            "🏙️ البلديات:",
            totalCities
        );


        /*
         * مثال للتأكد
         */

        console.log(
            "بلديات ورقلة:",
            ALGERIA_DATA["ورقلة"]
        );


        console.log(
            "بلديات تقرت:",
            ALGERIA_DATA["تقرت"]
        );


        console.log(
            "بلديات حاسي مسعود:",
            ALGERIA_DATA["ورقلة"]
        );


        /* =====================================
           إرسال حدث جاهزية البيانات
        ===================================== */

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
   GET CITIES
========================================= */

function getCitiesByWilaya(
    wilaya
){

    if(!wilaya){

        return [];

    }


    return (
        ALGERIA_DATA[
            wilaya
        ] ||
        []
    );

}


/* =========================================
   CHECK READY
========================================= */

function isAlgeriaDataReady(){

    return algeriaDataReady;

}


/* =========================================
   START
========================================= */

loadAlgeriaData();
