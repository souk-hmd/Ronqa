/* =========================================
   SOUK HMD / RONQA
   DATA.JS
   بيانات الولايات والبلديات
========================================= */

const ALGERIA_DATA = {};

/* حالة تحميل البيانات */
let algeriaDataReady = false;


/* =========================================
   LOAD ALGERIA DATA
========================================= */

async function loadAlgeriaData(){

    try{

        const response = await fetch(
            "https://mohamed-gp.github.io/algeria_69_wilayas/communes.json",
            {
                method: "GET",
                cache: "no-cache"
            }
        );

        if(!response.ok){

            throw new Error(
                "HTTP " + response.status
            );

        }


        const data = await response.json();


        if(
            !data ||
            !Array.isArray(data.communes)
        ){

            throw new Error(
                "بيانات البلديات غير صحيحة"
            );

        }


        /* تفريغ البيانات القديمة */

        Object.keys(ALGERIA_DATA).forEach(
            key => delete ALGERIA_DATA[key]
        );


        /* =====================================
           إنشاء قائمة الولايات
        ===================================== */

        data.communes.forEach(commune => {

            const wilayaId =
                commune.wilaya_id;


            const wilaya =
                Array.isArray(data.wilayas)
                ?
                data.wilayas.find(
                    w =>
                    Number(w.id) ===
                    Number(wilayaId)
                )
                :
                null;


            if(!wilaya){

                return;

            }


            const wilayaName =
                wilaya.name_ar;


            if(!wilayaName){

                return;

            }


            if(!ALGERIA_DATA[wilayaName]){

                ALGERIA_DATA[wilayaName] = [];

            }


            if(commune.name_ar){

                ALGERIA_DATA[wilayaName].push(
                    commune.name_ar
                );

            }

        });


        /* =====================================
           إزالة التكرار + ترتيب البلديات
        ===================================== */

        Object.keys(ALGERIA_DATA).forEach(
            wilaya => {

                ALGERIA_DATA[wilaya] =
                    [...new Set(
                        ALGERIA_DATA[wilaya]
                    )].sort(
                        (a,b) =>
                        a.localeCompare(
                            b,
                            "ar"
                        )
                    );

            }
        );


        algeriaDataReady = true;


        console.log(
            "تم تحميل بيانات الجزائر:",
            Object.keys(ALGERIA_DATA).length,
            "ولاية"
        );


        console.log(
            "ALGERIA_DATA:",
            ALGERIA_DATA
        );


        /*
         * إذا كان app.js ينتظر هذه البيانات
         * نقوم بإرسال حدث مخصص
         */

        document.dispatchEvent(
            new CustomEvent(
                "algeriaDataReady"
            )
        );


        return ALGERIA_DATA;

    }


    catch(error){

        console.error(
            "خطأ في تحميل بيانات الولايات:",
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
        ALGERIA_DATA[wilaya] ||
        []
    );

}


/* =========================================
   CHECK DATA READY
========================================= */

function isAlgeriaDataReady(){

    return algeriaDataReady;

}


/* =========================================
   START
========================================= */

loadAlgeriaData();
