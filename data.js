const ALGERIA_DATA = {};

async function loadAlgeriaData(){

try{

const response = await fetch(
"https://mohamed-gp.github.io/algeria_69_wilayas/communes.json"
);

if(!response.ok){
throw new Error("HTTP " + response.status);
}

const data = await response.json();

if(!data || !Array.isArray(data.communes)){
throw new Error("بيانات البلديات غير صحيحة");
}

data.communes.forEach(commune=>{

const wilaya =
commune.wilaya_id;

const wilayaName =
data.wilayas?.find(
w => Number(w.id) === Number(wilaya)
)?.name_ar;

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

console.log(
"تم تحميل بيانات الجزائر:",
Object.keys(ALGERIA_DATA).length,
"ولاية"
);

return ALGERIA_DATA;

}

catch(error){

console.error(
"خطأ في تحميل بيانات الولايات:",
error
);

return {};

}

}
