```javascript
// ==========================================
// RECHERCHE TAVILY
// ==========================================

async function searchMarket(query) {

    const controller =
        new AbortController();

    const timeout =
        setTimeout(
            () => controller.abort(),
            8000
        );

    try {

        const response = await fetch(
            "https://api.tavily.com/search",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    api_key:
                        process.env.TAVILY_API_KEY,

                    query: query,

                    search_depth: "advanced",

                    max_results: 5,

                    include_answer: false,

                    include_raw_content: false
                }),

                signal: controller.signal
            }
        );

        const data =
            await response.json();

        if (!response.ok) {

            throw new Error(
                data.detail ||
                data.error ||
                "Tavily API error"
            );

        }

        return data.results || [];

    } finally {

        clearTimeout(timeout);

    }
}


// ==========================================
// HANDLER VERCEL
// ==========================================

module.exports =
    async function handler(req, res) {

        // ----------------------------------
        // METHOD
        // ----------------------------------

        if (req.method !== "POST") {

            return res.status(405).json({
                error: "Method not allowed"
            });

        }


        try {

            // ----------------------------------
            // IMAGES
            // ----------------------------------

            const {
                images
            } = req.body || {};


            if (
                !images ||
                !Array.isArray(images) ||
                images.length === 0
            ) {

                return res.status(400).json({
                    error:
                        "Aucune photo reçue."
                });

            }


            if (images.length > 10) {

                return res.status(400).json({
                    error:
                        "Maximum 10 photos autorisées."
                });

            }


            // ==========================================
            // PROMPT PRINCIPAL
            // ==========================================

            const prompt = `Tu es un expert de la création d'annonces Vinted et de l'analyse visuelle de produits.

Toutes les images représentent le MÊME article.

Analyse toutes les photos avant de répondre.

RÈGLE ABSOLUE :
Ne jamais inventer une marque, un modèle, une taille, une matière, une référence, une caractéristique ou une information non visible.

Si une information importante n'est pas clairement identifiable, écris "À confirmer" dans les informations concernées et dans "CONFIRMATIONS NÉCESSAIRES".

==============================
1. ANALYSE DU PRODUIT
==============================

Analyse attentivement TOUTES les photos.

Compare les différentes photos entre elles.

Cherche les informations présentes sur :

- étiquettes ;
- logos ;
- emballages ;
- inscriptions ;
- références ;
- numéros de modèle.

Vérifie la cohérence des informations entre les photos.

Ne transforme jamais une supposition en information certaine.

ORDRE DE FIABILITÉ :

1. Texte clairement lisible ;
2. Étiquette clairement visible ;
3. Logo clairement identifiable ;
4. Caractéristique directement visible ;
5. Apparence générale.

Si deux photos donnent des informations différentes :

- ne choisis pas arbitrairement ;
- indique "À confirmer" ;
- indique le point à vérifier dans "CONFIRMATIONS NÉCESSAIRES".

IDENTIFICATION :

Identifie uniquement les informations réellement justifiées :

- type d'article ;
- marque ;
- modèle ;
- édition ;
- référence ;
- taille ;
- couleur ;
- matière ;
- caractéristiques ;
- accessoires ;
- état ;
- défauts visibles.

MARQUE ET MODÈLE :

Ne reconnais une marque ou un modèle que si les éléments visibles permettent raisonnablement de l'identifier.

Une ressemblance visuelle ne suffit pas.

RÉFÉRENCE :

N'utilise une référence que si elle est suffisamment lisible.

Ne complète jamais une référence partiellement visible.

TAILLE :

N'indique une taille que si elle est visible ou clairement indiquée.

Ne déduis jamais une taille à partir des dimensions apparentes.

MATIÈRE :

N'indique une matière que si elle est indiquée ou clairement identifiable.

COULEUR :

Indique la couleur réellement visible.

ACCESSOIRES :

N'indique un accessoire comme inclus que s'il est clairement visible.

==============================
2. ÉTAT ET DÉFAUTS
==============================

Recherche notamment :

- taches ;
- trous ;
- déchirures ;
- rayures ;
- accrocs ;
- coutures abîmées ;
- décolorations ;
- traces d'usure ;
- bouloches ;
- fissures ;
- parties manquantes ;
- salissures ;
- accessoires absents.

Ne mentionne qu'un défaut réellement visible.

Pour chaque défaut, indique brièvement sa localisation.

Si aucun défaut n'est clairement visible :

"Aucun défaut visible sur les photos."

Ne considère jamais une zone cachée ou non photographiée comme intacte.

L'état doit être :

- Neuf
- Comme neuf
- Très bon état
- Bon état
- État satisfaisant
- À confirmer

==============================
3. DESCRIPTION VINTED
==============================

La description sera copiée directement dans Vinted.

Elle doit :

- contenir 1 à 3 phrases ;
- être naturelle ;
- être courte ;
- présenter simplement l'article ;
- mentionner uniquement les informations certaines ;
- donner envie d'acheter sans exagérer ;
- être directement prête à publier.

RÈGLE ABSOLUE :

NE JAMAIS DÉCRIRE LES DÉFAUTS DANS LA DESCRIPTION.

Les défauts doivent apparaître UNIQUEMENT dans :

DÉFAUTS VISIBLES

La description ne doit jamais contenir :

- "À confirmer" ;
- "probablement" ;
- "il semble que" ;
- "d'après les photos" ;
- "sous réserve" ;
- "peut-être" ;
- une question ;
- une analyse interne ;
- une information incertaine.

Si marque, modèle, taille ou matière ne sont pas certains, ne les mentionne pas.

Les incertitudes apparaissent uniquement dans :

CONFIRMATIONS NÉCESSAIRES

==============================
4. TITRE
==============================

Le titre doit :

- être adapté à Vinted ;
- être naturel ;
- contenir uniquement les informations connues ;
- ne pas inventer de marque ou modèle ;
- faire maximum 80 caractères.

==============================
5. CATÉGORIE ET ATTRIBUTS
==============================

Détermine la catégorie Vinted la plus précise possible.

MARQUE :
Marque certaine ou "À confirmer".

TAILLE :
Taille certaine, "Non applicable" ou "À confirmer".

COULEUR :
Couleur principale réellement visible.

MATIÈRE :
Matière certaine ou "À confirmer".

ÉTAT :

- Neuf
- Comme neuf
- Très bon état
- Bon état
- État satisfaisant
- À confirmer

==============================
6. MOTS-CLÉS
==============================

Génère entre 5 et 10 mots-clés pertinents.

Ils doivent :

- être directement liés à l'article ;
- être adaptés à Vinted ;
- utiliser uniquement les informations connues ;
- éviter les répétitions ;
- être courts ;
- être séparés par des virgules.

N'utilise pas automatiquement :

- luxe ;
- rare ;
- premium ;
- collector ;
- authentique ;
- vintage.

==============================
7. PRIX
==============================

Pour la première estimation, utilise :

- type d'article ;
- marque ;
- état ;
- défauts ;
- valeur supposée.

Le prix de mise en vente doit être légèrement supérieur au prix conseillé.

Une recherche de marché pourra être effectuée ensuite.

==============================
8. CONFIRMATIONS
==============================

Indique uniquement les informations importantes à vérifier :

- taille ;
- matière ;
- modèle ;
- marque ;
- authenticité ;
- zone non visible ;
- accessoire éventuellement manquant ;
- catégorie exacte.

Si rien n'est important à vérifier :

"Aucune"

==============================
FORMAT OBLIGATOIRE
==============================

TITRE
[Un titre Vinted de maximum 80 caractères]

DESCRIPTION
[Une description naturelle de 1 à 3 phrases]

CATÉGORIE
[Catégorie Vinted]

MARQUE
[Marque ou "À confirmer"]

TAILLE
[Taille, "Non applicable" ou "À confirmer"]

COULEUR
[Couleur]

MATIÈRE
[Matière ou "À confirmer"]

ÉTAT
[État]

DÉFAUTS VISIBLES
[Défauts ou "Aucun défaut visible sur les photos."]

MOTS-CLÉS
[5 à 10 mots-clés séparés par des virgules]

PRIX CONSEILLÉ
[Prix en euros]

PRIX DE MISE EN VENTE
[Prix en euros]

CONFIRMATIONS NÉCESSAIRES
[Informations à vérifier ou "Aucune"]`;


            // ==========================================
            // OPENAI - ANALYSE VISUELLE
            // ==========================================

            const openAIResponse =
                await fetch(
                    "https://api.openai.com/v1/responses",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${process.env.OPENAI_API_KEY}`
                        },

                        body: JSON.stringify({

                            model: "gpt-5-mini",

                            input: [

                                {
                                    role: "user",

                                    content: [

                                        {
                                            type:
                                                "input_text",

                                            text:
                                                prompt
                                        },

                                        ...images.map(
                                            image => ({

                                                type:
                                                    "input_image",

                                                image_url:
                                                    image

                                            })
                                        )

                                    ]

                                }

                            ]

                        })
                    }
                );


            const openAIData =
                await openAIResponse.json();


            if (!openAIResponse.ok) {

                console.error(
                    "OpenAI error:",
                    openAIData
                );

                return res.status(
                    openAIResponse.status
                ).json({

                    error:
                        openAIData.error?.message ||
                        "Erreur OpenAI."

                });

            }


            // ==========================================
            // EXTRAIRE LE TEXTE
            // ==========================================

            const text =
                openAIData.output

                    ?.flatMap(
                        item =>
                            item.content || []
                    )

                    ?.filter(
                        item =>
                            item.type ===
                            "output_text"
                    )

                    ?.map(
                        item =>
                            item.text
                    )

                    ?.join("\n") || "";


            if (!text) {

                return res.status(500).json({

                    error:
                        "OpenAI n'a retourné aucun résultat."

                });

            }


            // ==========================================
            // EXTRACTION
            // ==========================================

            function extractSection(
                source,
                start,
                end
            ) {

                const startIndex =
                    source.indexOf(start);


                if (
                    startIndex === -1
                ) {

                    return "";

                }


                const contentStart =
                    startIndex +
                    start.length;


                if (!end) {

                    return source
                        .slice(contentStart)
                        .trim();

                }


                const endIndex =
                    source.indexOf(
                        end,
                        contentStart
                    );


                if (
                    endIndex === -1
                ) {

                    return source
                        .slice(contentStart)
                        .trim();

                }


                return source
                    .slice(
                        contentStart,
                        endIndex
                    )
                    .trim();

            }


            const titre =
                extractSection(
                    text,
                    "TITRE",
                    "DESCRIPTION"
                );


            const categorie =
                extractSection(
                    text,
                    "CATÉGORIE",
                    "MARQUE"
                );


            const marque =
                extractSection(
                    text,
                    "MARQUE",
                    "TAILLE"
                );


            const taille =
                extractSection(
                    text,
                    "TAILLE",
                    "COULEUR"
                );


            // ==========================================
            // RECHERCHE MARCHÉ
            // ==========================================

            const cleanValue =
                value => {

                    if (!value) {
                        return "";
                    }

                    const normalized =
                        value.trim();

                    if (
                        normalized ===
                            "À confirmer" ||

                        normalized ===
                            "Non applicable"
                    ) {

                        return "";

                    }

                    return normalized;

                };


            const cleanTitle =
                cleanValue(titre);


            const cleanBrand =
                cleanValue(marque);


            const cleanCategory =
                cleanValue(categorie);


            const baseQuery =
                [
                    cleanTitle,
                    cleanBrand,
                    cleanCategory
                ]
                    .filter(Boolean)
                    .join(" ")
                    .trim();


            let marketResults = [];


            // ==========================================
            // TAVILY EST OPTIONNEL
            // ==========================================

            if (
                baseQuery &&
                process.env.TAVILY_API_KEY
            ) {

                const queries = [

                    `"${baseQuery}" prix occasion`,

                    `"${baseQuery}" Vinted`,

                    `"${baseQuery}" Leboncoin`

                ];


                for (
                    const query of queries
                ) {

                    try {

                        const results =
                            await searchMarket(
                                query
                            );


                        if (
                            Array.isArray(
                                results
                            )
                        ) {

                            marketResults.push(
                                ...results
                            );

                        }

                    } catch (error) {

                        console.error(
                            "Tavily search failed:",
                            error.message
                        );

                        // IMPORTANT :
                        // On continue malgré l'erreur.

                    }

                }

            }


            // ==========================================
            // DÉDUPLICATION
            // ==========================================

            const uniqueResults = [];

            const seenUrls =
                new Set();


            for (
                const item
                of marketResults
            ) {

                if (
                    !item ||
                    !item.url ||
                    seenUrls.has(
                        item.url
                    )
                ) {

                    continue;

                }


                seenUrls.add(
                    item.url
                );


                uniqueResults.push({

                    title:
                        item.title || "",

                    url:
                        item.url || "",

                    content:
                        (
                            item.content || ""
                        ).slice(
                            0,
                            1500
                        )

                });

            }


            const usefulResults =
                uniqueResults.slice(
                    0,
                    12
                );


            // ==========================================
            // PRIX AVEC TAVILY
            // ==========================================

            if (
                usefulResults.length > 0
            ) {

                const marketContext =
                    usefulResults
                        .map(
                            (
                                item,
                                index
                            ) => `

COMPARABLE ${index + 1}

Titre :
${item.title}

Source :
${item.url}

Informations :
${item.content}
`
                        )
                        .join("\n");


                const pricingPrompt = `Tu es expert du prix des produits d'occasion.

ARTICLE :

Titre :
${titre}

Catégorie :
${categorie}

Marque :
${marque}

Taille :
${taille}

RÉSULTATS INTERNET :

${marketContext}

Analyse uniquement les comparables réellement pertinents.

Ignore :

- produits différents ;
- modèles différents ;
- éditions différentes ;
- accessoires ;
- lots ;
- produits neufs si notre article est d'occasion ;
- résultats manifestement aberrants.

Les prix trouvés sont des prix demandés, pas nécessairement des prix réellement vendus.

Utilise plusieurs comparables lorsque possible.

Tiens compte de l'état et des défauts de notre article.

Si les résultats sont mauvais ou insuffisants, reste prudent.

Retourne EXACTEMENT :

PRIX CONSEILLÉ
[prix en euros]

PRIX DE MISE EN VENTE
[prix en euros]

Aucune explication.`;


                try {

                    const pricingResponse =
                        await fetch(
                            "https://api.openai.com/v1/responses",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json",

                                    "Authorization":
                                        `Bearer ${process.env.OPENAI_API_KEY}`
                                },

                                body: JSON.stringify({

                                    model:
                                        "gpt-5-mini",

                                    input:
                                        pricingPrompt

                                })

                            }
                        );


                    const pricingData =
                        await pricingResponse.json();


                    if (
                        pricingResponse.ok
                    ) {

                        const pricingText =
                            pricingData.output

                                ?.flatMap(
                                    item =>
                                        item.content ||
                                        []
                                )

                                ?.filter(
                                    item =>
                                        item.type ===
                                        "output_text"
                                )

                                ?.map(
                                    item =>
                                        item.text
                                )

                                ?.join("\n") ||
                                "";


                        const newRecommendedPrice =
                            extractSection(
                                pricingText,
                                "PRIX CONSEILLÉ",
                                "PRIX DE MISE EN VENTE"
                            );


                        const newListingPrice =
                            extractSection(
                                pricingText,
                                "PRIX DE MISE EN VENTE",
                                null
                            );


                        if (
                            newRecommendedPrice &&
                            newListingPrice
                        ) {

                            const pricingStart =
                                text.indexOf(
                                    "PRIX CONSEILLÉ"
                                );


                            const confirmationsStart =
                                text.indexOf(
                                    "CONFIRMATIONS NÉCESSAIRES"
                                );


                            if (
                                pricingStart !== -1 &&
                                confirmationsStart !== -1
                            ) {

                                const beforePricing =
                                    text.slice(
                                        0,
                                        pricingStart
                                    );


                                const confirmations =
                                    text.slice(
                                        confirmationsStart
                                    );


                                const updatedPricing =
                                    `PRIX CONSEILLÉ
${newRecommendedPrice}

PRIX DE MISE EN VENTE
${newListingPrice}`;


                                const updatedText =
                                    beforePricing +
                                    updatedPricing +
                                    "\n\n" +
                                    confirmations;


                                return res.status(
                                    200
                                ).json({

                                    result:
                                        updatedText

                                });

                            }

                        }

                    }

                } catch (pricingError) {

                    console.error(
                        "Pricing error:",
                        pricingError.message
                    );

                }

            }


            // ==========================================
            // FALLBACK NORMAL
            // ==========================================

            return res.status(200).json({

                result: text

            });


        } catch (error) {

            console.error(
                "Generate error:",
                error
            );


            return res.status(500).json({

                error:
                    error.message ||
                    "Erreur serveur."

            });

        }

    };
```
