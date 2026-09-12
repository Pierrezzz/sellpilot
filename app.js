const photoInput = document.getElementById("photo");
const preview = document.getElementById("preview");
const generateButton = document.getElementById("generate");
const result = document.getElementById("result");

let selectedImage = null;
let currentData = {};


// ================================
// PHOTO
// ================================

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


// ================================
// GENERATION
// ================================

generateButton.addEventListener("click", async function () {

    if (!selectedImage) {

        result.innerHTML = `
            <p class="error-message">
                Ajoute d'abord une photo de ton article.
            </p>
        `;

        return;
    }

    generateButton.disabled = true;
    generateButton.textContent = "Analyse en cours...";

    result.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>SellPilot analyse ton article...</p>
        </div>
    `;

    try {

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

            displayResult(data.result);

            generateButton.textContent = "Générer à nouveau";
            generateButton.disabled = false;

        };

        reader.readAsDataURL(selectedImage);

    } catch (error) {

        result.innerHTML = `
            <div class="error-box">

                <strong>Une erreur est survenue</strong>

                <p>
                    ${escapeHTML(error.message)}
                </p>

            </div>
        `;

        generateButton.textContent = "Réessayer";
        generateButton.disabled = false;
    }
});


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
// RECUPERER TITRE MODIFIE
// ================================

function getTitle() {

    const element =
        document.getElementById("editable-title");

    return element
        ? element.value.trim()
        : currentData.titre;
}


// ================================
// RECUPERER DESCRIPTION MODIFIEE
// ================================

function getDescription() {

    const element =
        document.getElementById("editable-description");

    return element
        ? element.value.trim()
        : currentData.description;
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

    selectedImage = null;
    currentData = {};

    photoInput.value = "";

    preview.innerHTML = "";

    result.innerHTML = "";

    generateButton.disabled = false;

    generateButton.textContent =
        "Générer mon annonce";

    window.scrollTo({
        top: document.querySelector(".generator").offsetTop - 80,
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

        .replace(/\\/g, "\\\\")

        .replace(/'/g, "\\'")

        .replace(/\n/g, "\\n")

        .replace(/\r/g, "");
}
