const photoInput = document.getElementById("photo");
const preview = document.getElementById("preview");
const generateButton = document.getElementById("generate");
const result = document.getElementById("result");

let selectedImage = null;


// Afficher la photo sélectionnée
photoInput.addEventListener("change", function () {
    const file = this.files[0];

    if (!file) {
        return;
    }

    selectedImage = file;

    const imageURL = URL.createObjectURL(file);

    preview.innerHTML = `
        <img src="${imageURL}" alt="Article sélectionné">
    `;

    result.innerHTML = "";
});


// Générer l'annonce avec l'IA
generateButton.addEventListener("click", async function () {

    if (!selectedImage) {
        result.innerHTML = `
            <p style="color:#dc2626;">
                Ajoute d'abord une photo de ton article.
            </p>
        `;
        return;
    }

    generateButton.disabled = true;
    generateButton.textContent = "Analyse en cours...";

    result.innerHTML = `
        <p style="color:#667085;">
            ✨ SellPilot analyse ton article...
        </p>
    `;

    try {

        // Convertir la photo en Base64
        const reader = new FileReader();

        reader.onload = async function () {

            const base64Image = reader.result;

            const response = await fetch("/api/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    image: base64Image
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Erreur lors de la génération"
                );
            }

            result.innerHTML = `
                <div style="
                    padding:20px;
                    border:1px solid #e5e7eb;
                    border-radius:12px;
                    background:#f9fafb;
                    white-space:pre-wrap;
                    line-height:1.6;
                ">
                    ${escapeHTML(data.result)}
                </div>
            `;

            generateButton.textContent = "Générer à nouveau";
            generateButton.disabled = false;
        };

        reader.readAsDataURL(selectedImage);

    } catch (error) {

        result.innerHTML = `
            <p style="color:#dc2626;">
                Une erreur est survenue : ${error.message}
            </p>
        `;

        generateButton.textContent = "Réessayer";
        generateButton.disabled = false;
    }
});


// Éviter d'afficher du HTML provenant de la réponse IA
function escapeHTML(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
