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
                <p>${escapeHTML(error.message)}</p>
            </div>
        `;

        generateButton.textContent = "Réessayer";
        generateButton.disabled = false;
    }
});


// Afficher le résultat sous forme de cartes
function displayResult(text) {

    const sections = {
        titre: extractSection(text, "TITRE", "DESCRIPTION"),
        description: extractSection(text, "DESCRIPTION", "CATÉGORIE"),
        categorie: extractSection(text, "CATÉGORIE", "MARQUE"),
        marque: extractSection(text, "MARQUE", "TAILLE"),
        taille: extractSection(text, "TAILLE", "COULEUR"),
        couleur: extractSection(text, "COULEUR", "MATIÈRE"),
        matiere: extractSection(text, "MATIÈRE", "ÉTAT"),
        etat: extractSection(text, "ÉTAT", "PRIX CONSEILLÉ"),
        prix: extractSection(text, "PRIX CONSEILLÉ", "PRIX DE MISE EN VENTE"),
        prixVente: extractSection(text, "PRIX DE MISE EN VENTE", "CONFIRMATIONS NÉCESSAIRES"),
        confirmations: extractSection(text, "CONFIRMATIONS NÉCESSAIRES", null)
    };

    result.innerHTML = `
        <div class="result-header">
            <h2>✨ Ton annonce est prête</h2>
            <button class="copy-all-button" onclick="copyAll()">
                📋 Copier tout
            </button>
        </div>

        <div class="result-card">
            <div class="card-header">
                <span>Titre</span>
                <button onclick="copyText('${escapeAttribute(sections.titre)}')">
                    Copier
                </button>
            </div>
            <div class="card-content title-content">
                ${escapeHTML(sections.titre)}
            </div>
        </div>

        <div class="result-card">
            <div class="card-header">
                <span>Description</span>
                <button onclick="copyText('${escapeAttribute(sections.description)}')">
                    Copier
                </button>
            </div>
            <div class="card-content description-content">
                ${escapeHTML(sections.description)}
            </div>
        </div>

        <div class="info-grid">

            <div class="info-card">
                <span>Catégorie</span>
                <strong>${escapeHTML(sections.categorie)}</strong>
            </div>

            <div class="info-card">
                <span>Marque</span>
                <strong>${escapeHTML(sections.marque)}</strong>
            </div>

            <div class="info-card">
                <span>Taille</span>
                <strong>${escapeHTML(sections.taille)}</strong>
            </div>

            <div class="info-card">
                <span>Couleur</span>
                <strong>${escapeHTML(sections.couleur)}</strong>
            </div>

            <div class="info-card">
                <span>Matière</span>
                <strong>${escapeHTML(sections.matiere)}</strong>
            </div>

            <div class="info-card">
                <span>État</span>
                <strong>${escapeHTML(sections.etat)}</strong>
            </div>

        </div>

        <div class="price-container">

            <div class="price-card">
                <span>Prix conseillé</span>
                <strong>${escapeHTML(sections.prix)}</strong>
            </div>

            <div class="price-card highlight">
                <span>Prix de mise en vente</span>
                <strong>${escapeHTML(sections.prixVente)}</strong>
            </div>

        </div>

        <div class="result-card confirmation-card">
            <div class="card-header">
                <span>À vérifier</span>
            </div>
            <div class="card-content">
                ${escapeHTML(sections.confirmations)}
            </div>
        </div>
    `;

    window.currentTitle = sections.titre;
    window.currentDescription = sections.description;
    window.currentFullResult = text;
}


// Extraire une section du résultat IA
function extractSection(text, start, end) {

    const escapedStart = start.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    if (end) {
        const escapedEnd = end.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        const regex = new RegExp(
            escapedStart + "\\s*([\\s\\S]*?)(?=" + escapedEnd + ")",
            "i"
        );

        const match = text.match(regex);

        return match ? match[1].trim() : "À confirmer";
    }

    const regex = new RegExp(
        escapedStart + "\\s*([\\s\\S]*)",
        "i"
    );

    const match = text.match(regex);

    return match ? match[1].trim() : "Aucune";
}


// Copier un texte
async function copyText(text) {

    try {

        await navigator.clipboard.writeText(text);

        showCopyMessage();

    } catch (error) {

        console.error("Erreur de copie :", error);

    }
}


// Copier toute l'annonce
async function copyAll() {

    const fullText = `
${window.currentTitle}

${window.currentDescription}

Prix conseillé : ${extractSection(
        window.currentFullResult,
        "PRIX CONSEILLÉ",
        "PRIX DE MISE EN VENTE"
    )}

Prix de mise en vente : ${extractSection(
        window.currentFullResult,
        "PRIX DE MISE EN VENTE",
        "CONFIRMATIONS NÉCESSAIRES"
    )}
`.trim();

    await copyText(fullText);
}


// Message après copie
function showCopyMessage() {

    const message = document.createElement("div");

    message.className = "copy-message";
    message.textContent = "✓ Copié !";

    document.body.appendChild(message);

    setTimeout(() => {
        message.remove();
    }, 1800);
}


// Sécuriser le HTML
function escapeHTML(text) {

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// Sécuriser les attributs HTML
function escapeAttribute(text) {

    return String(text)
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "");
}
