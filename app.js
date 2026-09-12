const photoInput = document.getElementById("photo");
const preview = document.getElementById("preview");
const generateButton = document.getElementById("generate");
const result = document.getElementById("result");

let selectedImages = [];
let currentData = {};


// ================================
// PHOTO
// ================================

photoInput.addEventListener("change", function () {

    const files = Array.from(this.files);

    if (!files.length) {
        return;
    }

    selectedImages = files;

    displayImagePreviews();

    result.innerHTML = "";
});


// ================================
// APERCU DES PHOTOS
// ================================

function displayImagePreviews() {

    preview.innerHTML = `
        <div class="preview-header">
            <span>
                ${selectedImages.length}
                photo${selectedImages.length > 1 ? "s" : ""}
                sélectionnée${selectedImages.length > 1 ? "s" : ""}
            </span>
        </div>

        <div class="preview-grid">

            ${selectedImages.map((file, index) => {

                const imageURL = URL.createObjectURL(file);

                return `
                    <div class="preview-item">

                        <img
                            src="${imageURL}"
                            alt="Photo ${index + 1}"
                        >

                        <span>
                            Photo ${index + 1}
                        </span>

                    </div>
                `;

            }).join("")}

        </div>
    `;
}


// ================================
// GENERATION
// ================================

generateButton.addEventListener("click", async function () {

    if (!selectedImages.length) {

        result.innerHTML = `
            <p class="error-message">
                Ajoute d'abord au moins une photo de ton article.
            </p>
        `;

        return;
    }

    generateButton.disabled = true;
    generateButton.textContent = "Analyse en cours...";

    result.innerHTML = `
        <div class="loading">

            <div class="spinner"></div>

            <p>
                SellPilot analyse tes
                ${selectedImages.length}
                photo${selectedImages.length > 1 ? "s" : ""}...
            </p>

        </div>
    `;

    try {

        const images = await Promise.all(
            selectedImages.map(file => compressImage(file))
        );

        const response = await fetch("/api/generate", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                images: images
            })

        });

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.error || "Erreur lors de la génération"
            );

        }

        displayResult(data.result);

        generateButton.textContent =
            "Générer à nouveau";

        generateButton.disabled = false;

    } catch (error) {

        console.error(error);

        result.innerHTML = `
            <div class="error-box">

                <strong>
                    Une erreur est survenue
                </strong>

                <p>
                    ${escapeHTML(error.message)}
                </p>

            </div>
        `;

        generateButton.textContent =
            "Réessayer";

        generateButton.disabled = false;
    }
});


// ================================
// COMPRESSER UNE IMAGE
// ================================

function compressImage(file) {

    return new Promise((resolve, reject) => {

        const reader = new FileReader();

        reader.onload = function (event) {

            const img = new Image();

            img.onload = function () {

                const maxWidth = 1600;
                const maxHeight = 1600;

                let width = img.width;
                let height = img.height;

                if (width > maxWidth || height > maxHeight) {

                    const ratio = Math.min(
                        maxWidth / width,
                        maxHeight / height
                    );

                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }

                const canvas =
                    document.createElement("canvas");

                canvas.width = width;
                canvas.height = height;

                const ctx =
                    canvas.getContext("2d");

                ctx.drawImage(
                    img,
                    0,
                    0,
                    width,
                    height
                );

                const compressedImage =
                    canvas.toDataURL(
                        "image/jpeg",
                        0.82
                    );

                resolve(compressedImage);
            };

            img.onerror = function () {

                reject(
                    new Error(
                        "Impossible de traiter une des images."
                    )
                );

            };

            img.src = event.target.result;
        };

        reader.onerror = function () {

            reject(
                new Error(
                    "Impossible de lire une des images."
                )
            );

        };

        reader.readAsDataURL(file);
    });
}


// ================================
// AFFICHER LE RESULTAT
// ================================

function displayResult(text) {

    currentData = {

        titre: extractSection(
            text,
            "TITRE",
            "DESCRIPTION"
        ),

        description: extractSection(
            text,
            "DESCRIPTION",
            "CATÉGORIE"
        ),

        categorie: extractSection(
            text,
            "CATÉGORIE",
            "MARQUE"
        ),

        marque: extractSection(
            text,
            "MARQUE",
            "TAILLE"
        ),

        taille: extractSection(
            text,
            "TAILLE",
            "COULEUR"
        ),

        couleur: extractSection(
            text,
            "COULEUR",
            "MATIÈRE"
        ),

        matiere: extractSection(
            text,
            "MATIÈRE",
            "ÉTAT"
        ),

        etat: extractSection(
            text,
            "ÉTAT",
            "DÉFAUTS VISIBLES"
        ),

        defauts: extractSection(
            text,
            "DÉFAUTS VISIBLES",
            "MOTS-CLÉS"
        ),

        motsCles: extractSection(
            text,
            "MOTS-CLÉS",
            "PRIX CONSEILLÉ"
        ),

        prix: extractSection(
            text,
            "PRIX CONSEILLÉ",
            "PRIX DE MISE EN VENTE"
        ),

        prixVente: extractSection(
            text,
            "PRIX DE MISE EN VENTE",
            "CONFIRMATIONS NÉCESSAIRES"
        ),

        confirmations: extractSection(
            text,
            "CONFIRMATIONS NÉCESSAIRES",
            null
        )
    };


    result.innerHTML = `

        <div class="result-header">

            <h2>
                ✨ Ton annonce est prête
            </h2>

            <button
                class="copy-all-button"
                onclick="copyAll()"
            >
                📋 Copier tout
            </button>

        </div>


        <!-- TITRE -->

        <div class="result-card">

            <div class="card-header">

                <span>
                    Titre
                </span>

                <button
                    onclick="copyText(getTitle())"
                >
                    Copier
                </button>

            </div>

            <input
                id="editable-title"
                class="editable-title"
                value="${escapeAttribute(currentData.titre)}"
            />

        </div>


        <!-- DESCRIPTION -->

        <div class="result-card">

            <div class="card-header">

                <span>
                    Description
                </span>

                <button
                    onclick="copyText(getDescription())"
                >
                    Copier
                </button>

            </div>

            <textarea
                id="editable-description"
                class="editable-description"
            >${escapeHTML(currentData.description)}</textarea>

        </div>


        <!-- INFORMATIONS -->

        <div class="info-grid">

            <div class="info-card">
                <span>Catégorie</span>
                <strong>${escapeHTML(currentData.categorie)}</strong>
            </div>

            <div class="info-card">
                <span>Marque</span>
                <strong>${escapeHTML(currentData.marque)}</strong>
            </div>

            <div class="info-card">
                <span>Taille</span>
                <strong>${escapeHTML(currentData.taille)}</strong>
            </div>

            <div class="info-card">
                <span>Couleur</span>
                <strong>${escapeHTML(currentData.couleur)}</strong>
            </div>

            <div class="info-card">
                <span>Matière</span>
                <strong>${escapeHTML(currentData.matiere)}</strong>
            </div>

            <div class="info-card">
                <span>État</span>
                <strong>${escapeHTML(currentData.etat)}</strong>
            </div>

        </div>


        <!-- DEFAUTS VISIBLES -->

        <div class="result-card defect-card">

            <div class="card-header">

                <span>
                    🔎 Défauts visibles
                </span>

            </div>

            <div class="card-content">

                ${escapeHTML(currentData.defauts)}

            </div>

        </div>


        <!-- MOTS-CLES -->

        <div class="result-card keywords-card">

            <div class="card-header">

                <span>
                    🔑 Mots-clés Vinted
                </span>

                <button
                    onclick="copyKeywords()"
                >
                    Copier
                </button>

            </div>

            <div class="card-content keywords-content">

                ${escapeHTML(currentData.motsCles)}

            </div>

        </div>


        <!-- PRIX -->

        <div class="price-container">

            <div class="price-card">

                <span>
                    Prix conseillé
                </span>

                <strong>
                    ${escapeHTML(currentData.prix)}
                </strong>

            </div>

            <div class="price-card highlight">

                <span>
                    Prix de mise en vente
                </span>

                <strong>
                    ${escapeHTML(currentData.prixVente)}
                </strong>

            </div>

        </div>


        <!-- CONFIRMATIONS -->

        <div class="result-card confirmation-card">

            <div class="card-header">

                <span>
                    À vérifier
                </span>

            </div>

            <div class="card-content">

                ${escapeHTML(currentData.confirmations)}

            </div>

        </div>


        <!-- ACTIONS -->

        <div class="result-actions">

            <button
                class="copy-all-button"
                onclick="copyAll()"
            >
                📋 Copier l'annonce
            </button>

            <button
                class="new-listing-button"
                onclick="newListing()"
            >
                ＋ Nouvelle annonce
            </button>

        </div>
    `;
}


// ================================
// EXTRACTION DES SECTIONS
// ================================

function extractSection(text, start, end) {

    const escapedStart =
        start.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    if (end) {

        const escapedEnd =
            end.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        const regex = new RegExp(
            escapedStart +
            "\\s*([\\s\\S]*?)(?=" +
            escapedEnd +
            ")",
            "i"
        );

        const match = text.match(regex);

        return match
            ? match[1].trim()
            : "À confirmer";
    }

    const regex = new RegExp(
        escapedStart +
        "\\s*([\\s\\S]*)",
        "i"
    );

    const match = text.match(regex);

    return match
        ? match[1].trim()
        : "Aucune";
}


// ================================
// TITRE MODIFIE
// ================================

function getTitle() {

    const element =
        document.getElementById("editable-title");

    return element
        ? element.value.trim()
        : currentData.titre;
}


// ================================
// DESCRIPTION MODIFIEE
// ================================

function getDescription() {

    const element =
        document.getElementById("editable-description");

    return element
        ? element.value.trim()
        : currentData.description;
}


// ================================
// MOTS-CLES
// ================================

function getKeywords() {

    return currentData.motsCles || "";
}

function copyKeywords() {

    copyText(getKeywords());
}


// ================================
// COPIER
// ================================

async function copyText(text) {

    try {

        await navigator.clipboard.writeText(text);

        showCopyMessage();

    } catch (error) {

        console.error(
            "Erreur de copie :",
            error
        );

    }
}


// ================================
// COPIER L'ANNONCE COMPLETE
// ================================

async function copyAll() {

    const title = getTitle();

    const description =
        getDescription();

    const fullText = `

${title}

${description}

`.trim();

    await copyText(fullText);
}


// ================================
// MESSAGE COPIE
// ================================

function showCopyMessage() {

    const message =
        document.createElement("div");

    message.className =
        "copy-message";

    message.textContent =
        "✓ Copié !";

    document.body.appendChild(message);

    setTimeout(() => {

        message.remove();

    }, 1800);
}


// ================================
// NOUVELLE ANNONCE
// ================================

function newListing() {

    selectedImages = [];
    currentData = {};

    photoInput.value = "";

    preview.innerHTML = "";

    result.innerHTML = "";

    generateButton.disabled = false;

    generateButton.textContent =
        "Générer mon annonce";

    window.scrollTo({
        top:
            document.querySelector(".generator").offsetTop - 80,
        behavior: "smooth"
    });
}


// ================================
// SECURITE HTML
// ================================

function escapeHTML(text) {

    return String(text)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");
}


// ================================
// SECURITE ATTRIBUT
// ================================

function escapeAttribute(text) {

    return String(text)

        .replace(/&/g, "&amp;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/\n/g, " ")

        .replace(/\r/g, "");
}
