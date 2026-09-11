const photo=document.getElementById("photo"),drop=document.getElementById("drop"),preview=document.getElementById("preview"),generate=document.getElementById("generate"),result=document.getElementById("result"),listing=document.getElementById("listing"),copy=document.getElementById("copy");
drop.addEventListener("click",()=>photo.click());
photo.addEventListener("change",()=>{
 const f=photo.files[0]; if(!f)return;
 const url=URL.createObjectURL(f);
 preview.innerHTML=`<img src="${url}" alt="Objet">`;
 preview.classList.remove("hidden"); generate.disabled=false;
});
generate.addEventListener("click",()=>{
 generate.disabled=true; generate.textContent="Analyse en cours…";
 setTimeout(()=>{
   listing.innerHTML=`<h3>Objet à vendre</h3><p><b>Titre :</b> Article en excellent état — à saisir</p><p><b>Description :</b> Je vends cet article en très bon état. Il a été soigneusement conservé et est prêt à être utilisé. N'hésitez pas à me contacter pour toute question ou photo supplémentaire.</p><p><b>Prix conseillé :</b> 35–45 €</p><p><b>Mots-clés :</b> occasion, excellent état, rapide, bonne affaire</p>`;
   result.classList.remove("hidden"); generate.textContent="Générer mon annonce →"; generate.disabled=false;
 },900);
});
copy.addEventListener("click",async()=>{
 const text=listing.innerText;
 await navigator.clipboard.writeText(text);
 copy.textContent="Copié ✓"; setTimeout(()=>copy.textContent="Copier",1500);
});