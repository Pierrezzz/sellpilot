const photoInput = document.getElementById("photo");
const preview = document.getElementById("preview");
const generateButton = document.getElementById("generate");
const result = document.getElementById("result");

let selectedImages = [];
let currentData = {};

const MAX_IMAGES = 10;


// ================================
// PHOTO UPLOAD
// ================================

if (photoInput) {

    photoInput.addEventListener("change", function (event) {

        const files = Array.from(event.target.files || []);

        if (!files.length) {
            return;
        }

        const imageFiles = files.filter(file =>
            file.type && file.type.startsWith("image/")
        );

        if (!imageFiles.length) {

            if (result) {
                result.innerHTML = `
                    <div class="error-box">
                        <strong>Aucune image valide</strong>
                        <p>
                            Sélectionne au moins une photo au format JPG,
                            PNG, HEIC ou WEBP.
                        </p>
                    </div>
                `;
            }

            return;
        }

        /*
         * On ajoute les nouvelles photos aux photos déjà sélectionnées.
         * Cela permet de sélectionner les photos en plusieurs fois.
         */
        const availableSlots =
            MAX_IMAGES - selectedImages.length;

        const filesToAdd =
            imageFiles.slice(0, availableSlots);

        selectedImages = [
            ...selectedImages,
            ...filesToAdd
        ];

        displayImagePreviews();

        if (result) {
            result.innerHTML = "";
        }

        /*
         * Permet de sélectionner à nouveau les mêmes photos
         * après une suppression.
         */
        photoInput.value = "";

    });

}


// ================================
// APERCU DES PHOTOS
// ================================

function displayImagePreviews() {

    if (!preview) {
        return;
    }

    preview.innerHTML = "";

    if (!selectedImages.length) {
        return;
    }


    // ================================
    // HEADER
    // ================================

    const header =
        document.createElement("div");

    header.className =
        "preview-header";

    header.innerHTML = `
        <span>
            ${selectedImages.length}
            photo${selectedImages.length > 1 ? "s" : ""}
            sélectionnée${selectedImages.length > 1 ? "s" : ""}
        </span>

        <span>
            ${MAX_IMAGES - selectedImages.length}
            restante${MAX_IMAGES - selectedImages.length > 1 ? "s" : ""}
        </span>
    `;

    preview.appendChild(header);


    // ================================
    // GRILLE
    // ================================

    const grid =
        document.createElement("div");

    grid.className =
        "preview-grid";


    selectedImages.forEach((file, index) => {

        const item =
            document.createElement("div");

        item.className =
            "preview-item";


        // IMAGE

        const image =
            document.createElement("img");

        image.alt =
            `Photo ${index + 1}`;

        image.loading =
            "lazy";

        image.style.width =
            "100%";

        image.style.height =
            "100%";

        image.style.objectFit =
            "cover";


        const imageURL =
            URL.createObjectURL(file);

        image.src =
            imageURL;


        image.onload = function () {

            URL.revokeObjectURL(imageURL);

        };


        image.onerror = function () {

            URL.revokeObjectURL(imageURL);

            image.alt =
                "Impossible d'afficher cette image";

        };


        // NUMERO DE PHOTO

        const label =
            document.createElement("span");

        label.textContent =
            `Photo ${index + 1}`;


        // BOUTON SUPPRIMER

        const deleteButton =
            document.createElement("button");

        deleteButton.type =
            "button";

        deleteButton.className =
            "delete-photo-button";

        deleteButton.setAttribute(
            "aria-label",
            `Supprimer la photo ${index + 1}`
        );

        deleteButton.innerHTML =
            "×";


        deleteButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();
                event.stopPropagation();

                removeImage(index);

            }
        );


        item.appendChild(image);
        item.appendChild(label);
        item.appendChild(deleteButton);

        grid.appendChild(item);

    });


    preview.appendChild(grid);


    // ================================
    // MESSAGE MAXIMUM
    // ================================

    if (selectedImages.length >= MAX_IMAGES) {

        const maxMessage =
            document.createElement("div");

        maxMessage.className =
            "preview-limit";

        maxMessage.textContent =
            "Maximum de 10 photos atteint.";

        preview.appendChild(maxMessage);

    }

}


// ================================
// SUPPRIMER UNE PHOTO
// ================================

function removeImage(index) {

    if (
        index < 0 ||
        index >= selectedImages.length
    ) {
        return;
    }

    selectedImages.splice(index, 1);

    displayImagePreviews();

}


// ================================
// GENERATION
// ================================

if (generateButton) {

    generateButton.addEventListener(
        "click",
        async function () {

            if (!selectedImages.length) {

                result.innerHTML = `
                    <p class="error-message">
                        Ajoute d'abord au moins une photo de ton article.
                    </p>
                `;

                return;
            }


            generateButton.disabled =
                true;

            generateButton.textContent =
                "Analyse en cours...";


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

                // ================================
                // COMPRESSION DES PHOTOS
                // ================================

                const images =
                    await Promise.all(
                        selectedImages.map(
                            file =>
                                compressImage(file)
                        )
                    );


                // ================================
                // ENVOI API
                // ================================

                const response =
                    await fetch(
                        "/api/generate",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                images: images
                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.error ||
                        "Erreur lors de la génération"
                    );

                }


                if (!data.result) {

                    throw new Error(
                        "SellPilot n'a reçu aucun résultat."
                    );

                }


                displayResult(
                    data.result
                );


                generateButton.textContent =
                    "Générer à nouveau";

                generateButton.disabled =
                    false;


            } catch (error) {

                console.error(
                    "SellPilot error:",
                    error
                );


                result.innerHTML = `
                    <div class="error-box">

                        <strong>
                            Une erreur est survenue
                        </strong>

                        <p>
                            ${escapeHTML(
                                error.message ||
                                "Erreur inconnue"
                            )}
                        </p>

                    </div>
                `;


                generateButton.textContent =
                    "Réessayer";

                generateButton.disabled =
                    false;

            }

        }
    );

}


// ================================
// COMPRESSER UNE IMAGE
// ================================

function compressImage(file) {

    return new Promise(
        (resolve, reject) => {

            if (!file) {

                reject(
                    new Error(
                        "Fichier image invalide."
                    )
                );

                return;
            }


            const reader =
                new FileReader();


            reader.onload =
                function (event) {

                    const img =
                        new Image();


                    img.onload =
                        function () {

                            const maxWidth =
                                1600;

                            const maxHeight =
                                1600;


                            let width =
                                img.naturalWidth ||
                                img.width;

                            let height =
                                img.naturalHeight ||
                                img.height;


                            if (
                                !width ||
                                !height
                            ) {

                                reject(
                                    new Error(
                                        "Dimensions d'image invalides."
                                    )
                                );

                                return;
                            }


                            if (
                                width > maxWidth ||
                                height > maxHeight
                            ) {

                                const ratio =
                                    Math.min(
                                        maxWidth / width,
                                        maxHeight / height
                                    );


                                width =
                                    Math.round(
                                        width * ratio
                                    );

                                height =
                                    Math.round(
                                        height * ratio
                                    );

                            }


                            const canvas =
                                document.createElement(
                                    "canvas"
                                );


                            canvas.width =
                                width;

                            canvas.height =
                                height;


                            const ctx =
                                canvas.getContext(
                                    "2d"
                                );


                            if (!ctx) {

                                reject(
                                    new Error(
                                        "Impossible de traiter l'image."
                                    )
                                );

                                return;
                            }


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


                            if (
                                !compressedImage ||
                                compressedImage ===
                                "data:,"
                            ) {

                                reject(
                                    new Error(
                                        "Impossible de compresser l'image."
                                    )
                                );

                                return;
                            }


                            resolve(
                                compressedImage
                            );

                        };


                    img.onerror =
                        function () {

                            reject(
                                new Error(
                                    "Impossible de traiter une des images."
                                )
                            );

                        };


                    img.src =
                        event.target.result;

                };


            reader.onerror =
                function () {

                    reject(
                        new Error(
                            "Impossible de lire une des images."
                        )
                    );

                };


            reader.readAsDataURL(
                file
            );

        }
    );
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
                value="${escapeAttribute(
                    currentData.titre
                )}"
            />

        </div>


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
            >${escapeHTML(
                currentData.description
            )}</textarea>

        </div>


        <div class="info-grid">

            <div class="info-card">
                <span>Catégorie</span>
                <strong>
                    ${escapeHTML(
                        currentData.categorie
                    )}
                </strong>
            </div>

            <div class="info-card">
                <span>Marque</span>
                <strong>
                    ${escapeHTML(
                        currentData.marque
                    )}
                </strong>
            </div>

            <div class="info-card">
                <span>Taille</span>
                <strong>
                    ${escapeHTML(
                        currentData.taille
                    )}
                </strong>
            </div>

            <div class="info-card">
                <span>Couleur</span>
                <strong>
                    ${escapeHTML(
                        currentData.couleur
                    )}
                </strong>
            </div>

            <div class="info-card">
                <span>Matière</span>
                <strong>
                    ${escapeHTML(
                        currentData.matiere
                    )}
                </strong>
            </div>

            <div class="info-card">
                <span>État</span>
                <strong>
                    ${escapeHTML(
                        currentData.etat
                    )}
                </strong>
            </div>

        </div>


        <div class="result-card defect-card">

            <div class="card-header">

                <span>
                    🔎 Défauts visibles
                </span>

            </div>

            <div class="card-content">

                ${escapeHTML(
                    currentData.defauts
                )}

            </div>

        </div>


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

                ${escapeHTML(
                    currentData.motsCles
                )}

            </div>

        </div>


        <div class="price-container">

            <div class="price-card">

                <span>
                    Prix conseillé
                </span>

                <strong>
                    ${escapeHTML(
                        currentData.prix
                    )}
                </strong>

            </div>

            <div class="price-card highlight">

                <span>
                    Prix de mise en vente
                </span>

                <strong>
                    ${escapeHTML(
                        currentData.prixVente
                    )}
                </strong>

            </div>

        </div>


        <div class="result-card confirmation-card">

            <div class="card-header">

                <span>
                    À vérifier
                </span>

            </div>

            <div class="card-content">

                ${escapeHTML(
                    currentData.confirmations
                )}

            </div>

        </div>


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

function extractSection(
    text,
    start,
    end
) {

    const escapedStart =
        start.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );


    if (end) {

        const escapedEnd =
            end.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );


        const regex =
            new RegExp(
                escapedStart +
                "\\s*([\\s\\S]*?)(?=" +
                escapedEnd +
                ")",
                "i"
            );


        const match =
            text.match(regex);


        return match
            ? match[1].trim()
            : "À confirmer";

    }


    const regex =
        new RegExp(
            escapedStart +
            "\\s*([\\s\\S]*)",
            "i"
        );


    const match =
        text.match(regex);


    return match
        ? match[1].trim()
        : "Aucune";
}


// ================================
// TITRE MODIFIE
// ================================

function getTitle() {

    const element =
        document.getElementById(
            "editable-title"
        );

    return element
        ? element.value.trim()
        : currentData.titre;
}


// ================================
// DESCRIPTION MODIFIEE
// ================================

function getDescription() {

    const element =
        document.getElementById(
            "editable-description"
        );

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

    copyText(
        getKeywords()
    );
}


// ================================
// COPIER
// ================================

async function copyText(text) {

    try {

        await navigator.clipboard.writeText(
            text
        );

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

    const title =
        getTitle();

    const description =
        getDescription();


    const fullText = `

${title}

${description}

`.trim();


    await copyText(
        fullText
    );
}


// ================================
// MESSAGE COPIE
// ================================

function showCopyMessage() {

    const message =
        document.createElement(
            "div"
        );


    message.className =
        "copy-message";


    message.textContent =
        "✓ Copié !";


    document.body.appendChild(
        message
    );


    setTimeout(
        () => {

            message.remove();

        },
        1800
    );
}


// ================================
// NOUVELLE ANNONCE
// ================================

function newListing() {

    selectedImages = [];

    currentData = {};


    if (photoInput) {
        photoInput.value = "";
    }

    if (preview) {
        preview.innerHTML = "";
    }

    if (result) {
        result.innerHTML = "";
    }


    if (generateButton) {

        generateButton.disabled =
            false;

        generateButton.textContent =
            "Générer mon annonce";

    }


    const generator =
        document.querySelector(
            ".generator"
        );


    if (generator) {

        window.scrollTo({

            top:
                generator.offsetTop - 80,

            behavior:
                "smooth"

        });

    }

}


// ================================
// SECURITE HTML
// ================================

function escapeHTML(text) {

    return String(text)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// ================================
// SECURITE ATTRIBUT
// ================================

function escapeAttribute(text) {

    return String(text)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /\n/g,
            " "
        )

        .replace(
            /\r/g,
            ""
        );

}
