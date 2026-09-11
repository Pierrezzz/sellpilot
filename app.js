const photoInput = document.getElementById("photo");
const preview = document.getElementById("preview");
const generateButton = document.getElementById("generate");
const result = document.getElementById("result");

photoInput.addEventListener("change", function () {
    const file = this.files[0];

    if (!file) {
        return;
    }

    const imageURL = URL.createObjectURL(file);

    preview.innerHTML = `
        <img src="${imageURL}" alt="Article sélectionné">
    `;

    result.innerHTML = "";
});

generateButton.addEventListener("click", function () {

    if (!photoInput.files.length) {
        result.innerHTML = `
            <p style="color:#dc2626;">
                Ajoute d'abord une photo de ton article.
            </p>
        `;
        return;
    }

    result.innerHTML = `
        <div style="
            padding:20px;
            border:1px solid #e5e7eb;
            border-radius:12px;
            background:#f9fafb;
        ">
            <h3 style="margin-bottom:15px;">
                ✨ Exemple d'annonce générée
            </h3>

            <p>
                <strong>Titre :</strong><br>
                Magnifique article tendance — excellent état
            </p>

            <br>

            <p>
                <strong>Description :</strong><br>
                Article en excellent état, soigneusement conservé.
                Idéal pour compléter une tenue élégante et moderne.
                Envoi rapide et soigneusement emballé.
            </p>

            <br>

            <p>
                <strong>Prix conseillé :</strong>
                25 €
            </p>
        </div>
    `;
});
