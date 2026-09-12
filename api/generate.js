async function searchMarket(query) {

    const response = await fetch(
        "https://api.tavily.com/search",
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                api_key: process.env.TAVILY_API_KEY,
                query: query,
                search_depth: "advanced",
                max_results: 6,
                include_answer: false,
                include_raw_content: false
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.detail ||
            data.error ||
            "Tavily API error"
        );
    }

    return data.results || [];
}


module.exports = async function handler(req, res) {

    if (req.method !== "POST") {

        return res.status(405).json({
            error: "Method not allowed"
        });

    }

    try {

        const { images } = req.body;

        if (
            !images ||
            !Array.isArray(images) ||
            images.length === 0
        ) {

            return res.status(400).json({
                error: "No images provided"
            });

        }

        if (images.length > 10) {

            return res.status(400).json({
                error: "Maximum 10 images allowed"
            });

        }

        const prompt = `Tu es un expert de la création d'annonces Vinted et de l'analyse visuelle de produits.

Toutes les images représentent le MÊME article.

Analyse toutes les photos avant de répondre.

RÈGLE ABSOLUE :
Ne jamais inventer une marque, un modèle, une taille, une matière, une référence, une caractéristique ou une information non visible.

Si une information importante n'est pas clairement identifiable, écris "À confirmer" dans les informations concernées et dans "CONFIRMATIONS NÉCESSAIRES".

==============================
1. ANALYSE DU PRODUIT
==============================

Avant de générer la moindre information, analyse attentivement TOUTES les photos.

Toutes les photos représentent le même article.

FAIS UNE VÉRIFICATION CROISÉE :

- compare les différentes photos entre elles ;
- cherche les informations présentes sur les étiquettes, logos, emballages, inscriptions et références ;
- vérifie si une information visible sur une photo est cohérente avec les autres photos ;
- utilise plusieurs photos lorsqu'elles montrent des angles ou détails différents ;
- ne déduis jamais une information uniquement à partir de l'apparence générale du produit ;
- ne transforme jamais une supposition en information certaine.

ORDRE DE FIABILITÉ DES INFORMATIONS :

1. Texte ou référence clairement lisible sur le produit ou son emballage ;
2. Étiquette clairement visible ;
3. Logo ou marquage clairement identifiable ;
4. Caractéristique directement visible ;
5. Apparence générale du produit.

Si deux photos semblent donner des informations différentes :

- ne choisis pas arbitrairement ;
- considère l'information comme "À confirmer" ;
- indique le point à vérifier dans "CONFIRMATIONS NÉCESSAIRES".

IDENTIFICATION :

Identifie uniquement les informations réellement justifiées par les photos :

- type d'article ;
- marque ;
- modèle ;
- édition ;
- référence ;
- taille ;
- couleur ;
- matière ;
- caractéristiques ;
- accessoires éventuels ;
- état général ;
- défauts visibles.

MARQUE ET MODÈLE :

Ne reconnais une marque ou un modèle que si les éléments visibles permettent raisonnablement de l'identifier.

Une ressemblance visuelle avec un produit connu ne suffit pas.

Si plusieurs modèles sont visuellement similaires et qu'aucun élément ne permet de les distinguer, écris "À confirmer".

RÉFÉRENCE ET ÉDITION :

Lorsqu'une référence, un numéro de modèle, une édition ou une inscription est visible, utilise-la uniquement si elle est suffisamment lisible.

Ne complète jamais une référence partiellement visible avec des caractères supposés.

TAILLE :

N'indique une taille que si elle est visible ou clairement identifiable sur une étiquette.

Ne déduis jamais une taille à partir des dimensions apparentes du produit.

MATIÈRE :

N'indique une matière que si elle est indiquée sur une étiquette ou clairement identifiable.

Ne déduis pas une matière simplement à partir de son apparence.

COULEUR :

Indique la couleur réellement visible.

Si plusieurs couleurs sont présentes, décris les couleurs principales sans inventer de nuance précise.

ACCESSOIRES :

N'indique un accessoire comme inclus que s'il est clairement visible sur les photos.

Ne considère jamais qu'un accessoire est inclus simplement parce qu'il est habituellement fourni avec ce produit.

IMPORTANT :

Une information probable mais non suffisamment vérifiée doit être considérée comme "À confirmer".

Ne jamais inventer une information pour compléter l'annonce.

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

Si aucun défaut n'est clairement visible sur les zones correctement photographiées, écris :

"Aucun défaut visible sur les photos."

Ne considère jamais une zone cachée, floue ou non photographiée comme intacte.

L'état doit être l'une des valeurs suivantes :

- Neuf
- Comme neuf
- Très bon état
- Bon état
- État satisfaisant
- À confirmer

==============================
3. DESCRIPTION VINTED
==============================

La description sera copiée directement dans une annonce Vinted.

Elle doit :

- contenir 1 à 3 phrases ;
- être naturelle et fluide ;
- être courte et agréable à lire ;
- présenter simplement l'article ;
- mentionner son édition, modèle, marque ou caractéristiques uniquement lorsqu'ils sont certains ;
- donner envie d'acheter sans exagérer ;
- être directement prête à publier.

RÈGLE ABSOLUE :

NE JAMAIS DÉCRIRE LES DÉFAUTS DANS LA DESCRIPTION.

Les défauts, accrocs, déchirures, rayures, plis, taches, traces d'usure ou autres imperfections doivent apparaître UNIQUEMENT dans la section :

DÉFAUTS VISIBLES

Ne jamais recopier, résumer ou reformuler les défauts visibles dans la DESCRIPTION.

Ne jamais écrire dans la description :

- "vendu tel que sur les photos" ;
- "voir photos pour les défauts" ;
- "quelques défauts visibles" ;
- "présente des traces d'usure" ;
- "présente quelques marques" ;
- "avec un petit accroc" ;
- "avec une déchirure" ;
- "avec des plis" ;
- toute autre formulation décrivant un défaut.

La description doit rester positive et factuelle, sans cacher volontairement un défaut : les défauts sont simplement réservés à la section DÉFAUTS VISIBLES.

La description ne doit jamais contenir :

- "À confirmer" ;
- "probablement" ;
- "il semble que" ;
- "d'après les photos" ;
- "sous réserve" ;
- "peut-être" ;
- "je ne peux pas confirmer" ;
- "l'état reste à vérifier" ;
- une question ;
- une analyse interne ;
- une information incertaine.

Si la marque, le modèle, la taille ou la matière ne sont pas certains, ne les mentionne pas dans la description.

Les incertitudes doivent apparaître uniquement dans :

CONFIRMATIONS NÉCESSAIRES

N'utilise pas automatiquement :

- "excellent état" ;
- "comme neuf" ;
- "parfait état" ;
- "jamais porté" ;
- "authentique" ;
- "article rare" ;
- "qualité exceptionnelle" ;
- "sans aucun défaut".

==============================
4. TITRE
==============================

Le titre doit :

- être adapté à Vinted ;
- être naturel ;
- contenir uniquement les informations connues ;
- ne pas inventer de marque ou de modèle ;
- faire maximum 80 caractères.

==============================
5. CATÉGORIE ET ATTRIBUTS VINTED
==============================

Détermine la catégorie et les attributs de l'article avec le plus haut niveau de précision possible.

CATÉGORIE :

Choisis la catégorie Vinted la plus précise correspondant réellement à l'article.

Ne choisis pas une catégorie uniquement parce qu'elle est proche.

Exemples :

- un manga doit être classé dans une catégorie liée aux livres / mangas ;
- une montre doit être classée dans une catégorie liée aux montres ;
- une paire de chaussures doit être classée dans une catégorie liée aux chaussures ;
- un vêtement doit être classé selon son type réel ;
- un accessoire doit être classé selon sa fonction réelle.

Si plusieurs catégories sont possibles et qu'aucune ne peut être déterminée avec suffisamment de certitude, choisis la catégorie la plus probable et indique la vérification dans "CONFIRMATIONS NÉCESSAIRES".

ATTRIBUTS :

Pour chaque attribut, utilise uniquement les informations réellement établies par les photos.

MARQUE :
- utilise la marque uniquement si elle est clairement identifiable ;
- sinon : "À confirmer".

TAILLE :
- utilise uniquement la taille visible ou clairement indiquée ;
- ne déduis jamais une taille à partir des dimensions apparentes ;
- pour un article sans taille applicable, indique "Non applicable" lorsque cela est pertinent ;
- sinon : "À confirmer".

COULEUR :
- indique la couleur principale réellement visible ;
- si plusieurs couleurs importantes sont présentes, indique-les de manière simple ;
- n'invente pas de nuance précise.

MATIÈRE :
- indique uniquement une matière clairement indiquée ou suffisamment identifiable ;
- sinon : "À confirmer".

ÉTAT :
Utilise uniquement l'une des valeurs suivantes :

- Neuf
- Comme neuf
- Très bon état
- Bon état
- État satisfaisant
- À confirmer

Ne choisis jamais "Neuf" simplement parce que l'article est encore emballé.

Prends en compte l'état réel du produit ET de son emballage lorsqu'un emballage est présent.

RÈGLE DE COHÉRENCE :

Les informations suivantes doivent être cohérentes entre elles :

- catégorie ;
- marque ;
- taille ;
- couleur ;
- matière ;
- état ;
- description ;
- défauts visibles ;
- mots-clés.

Ne génère jamais une information dans les mots-clés ou la description qui contredit les attributs identifiés.

Si une information n'est pas suffisamment certaine, utilise "À confirmer" plutôt que de faire une supposition.

==============================
6. MOTS-CLÉS VINTED
==============================

Génère entre 5 et 10 mots-clés pertinents pour aider les acheteurs à trouver l'article.

Les mots-clés doivent :

- être directement liés à l'article ;
- être adaptés aux recherches Vinted ;
- utiliser les informations réellement connues ;
- éviter les répétitions ;
- être courts ;
- être séparés par des virgules ;
- ne pas contenir de marque ou de modèle incertain ;
- ne pas exagérer la valeur de l'article.

N'utilise pas de mots-clés comme :

- luxe ;
- rare ;
- premium ;
- collector ;
- authentique ;
- vintage ;

sauf si leur utilisation est réellement justifiée.

Les mots-clés ne doivent pas être inclus dans la description.

==============================
7. PRIX
==============================

Pour le moment, propose une estimation prudente basée sur :

- le type d'article ;
- la marque identifiable ;
- l'état visible ;
- les défauts visibles ;
- la valeur supposée du produit.

Le prix de mise en vente doit être légèrement supérieur au prix conseillé.

IMPORTANT :

Une recherche de marché sera effectuée après ton analyse initiale.

Ne prétends pas avoir utilisé des données de marché dans cette première analyse.

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

Si aucune vérification importante n'est nécessaire, écris :

"Aucune"

==============================
FORMAT OBLIGATOIRE
==============================

Retourne exactement les sections suivantes, dans cet ordre :

TITRE
[Un titre Vinted de maximum 80 caractères]

DESCRIPTION
[Une description naturelle de 1 à 3 phrases, directement copiable]

CATÉGORIE
[Catégorie Vinted la plus adaptée]

MARQUE
[Marque certaine ou "À confirmer"]

TAILLE
[Taille certaine, "Non applicable" ou "À confirmer"]

COULEUR
[Couleur visible]

MATIÈRE
[Matière certaine ou "À confirmer"]

ÉTAT
[Une des catégories d'état autorisées]

DÉFAUTS VISIBLES
[Défauts réellement visibles ou "Aucun défaut visible sur les photos."]

MOTS-CLÉS
[5 à 10 mots-clés séparés par des virgules]

PRIX CONSEILLÉ
[Prix prudent en euros]

PRIX DE MISE EN VENTE
[Prix en euros légèrement supérieur]

CONFIRMATIONS NÉCESSAIRES
[Informations importantes à vérifier ou "Aucune"]`;

        // ==========================================
        // 1. ANALYSE VISUELLE
        // ==========================================

        const response = await fetch(
            "https://api.openai.com/v1/responses",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
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
                                    type: "input_text",
                                    text: prompt
                                },

                                ...images.map(image => ({
                                    type: "input_image",
                                    image_url: image
                                }))

                            ]

                        }
                    ]

                })

            }
        );

        const data = await response.json();

        if (!response.ok) {

            return res.status(response.status).json({
                error:
                    data.error?.message ||
                    "OpenAI API error"
            });

        }

        const text = data.output

            ?.flatMap(
                item => item.content || []
            )

            ?.filter(
                item => item.type === "output_text"
            )

            ?.map(
                item => item.text
            )

            ?.join("\n") || "";

        if (!text) {

            return res.status(500).json({
                error: "No analysis result returned"
            });

        }

        // ==========================================
        // 2. EXTRACTION DES INFORMATIONS
        // ==========================================

        function extractSection(source, start, end) {

            const startIndex =
                source.indexOf(start);

            if (startIndex === -1) {
                return "";
            }

            const contentStart =
                startIndex + start.length;

            const endIndex =
                source.indexOf(
                    end,
                    contentStart
                );

            if (endIndex === -1) {

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

        const titre = extractSection(
            text,
            "TITRE",
            "DESCRIPTION"
        );

        const categorie = extractSection(
            text,
            "CATÉGORIE",
            "MARQUE"
        );

        const marque = extractSection(
            text,
            "MARQUE",
            "TAILLE"
        );

        const taille = extractSection(
            text,
            "TAILLE",
            "COULEUR"
        );

        const etat = extractSection(
            text,
            "ÉTAT",
            "DÉFAUTS VISIBLES"
        );

        // ==========================================
        // 3. RECHERCHE DES COMPARABLES
        // ==========================================

        const searchQueries = [];

        const cleanValue = value => {

            if (!value) {
                return "";
            }

            const normalized =
                value.trim();

            if (
                normalized === "À confirmer" ||
                normalized === "Non applicable"
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

        const baseQuery = [
            cleanTitle,
            cleanBrand,
            cleanCategory
        ]
            .filter(Boolean)
            .join(" ")
            .trim();

        if (baseQuery) {

            searchQueries.push(
                `"${baseQuery}" prix occasion`
            );

            searchQueries.push(
                `"${baseQuery}" Vinted`
            );

            searchQueries.push(
                `"${baseQuery}" Leboncoin eBay`
            );

        }

        let marketResults = [];

        try {

            for (const query of searchQueries) {

                const results =
                    await searchMarket(query);

                marketResults.push(
                    ...results
                );

            }

        } catch (marketError) {

            console.error(
                "Market search error:",
                marketError.message
            );

            // Tavily ne doit jamais empêcher
            // SellPilot de générer une annonce.

            return res.status(200).json({
                result: text
            });

        }

        // ==========================================
        // 4. NETTOYAGE DES COMPARABLES
        // ==========================================

        const uniqueResults = [];

        const seenUrls =
            new Set();

        for (const result of marketResults) {

            if (
                !result ||
                !result.url ||
                seenUrls.has(result.url)
            ) {
                continue;
            }

            seenUrls.add(result.url);

            uniqueResults.push({

                title:
                    result.title || "",

                url:
                    result.url || "",

                content:
                    (result.content || "")
                        .slice(0, 1800)

            });

        }

        const usefulResults =
            uniqueResults.slice(0, 15);

        // ==========================================
        // 5. RECALCUL DU PRIX
        // ==========================================

        if (usefulResults.length > 0) {

            const marketContext =
                usefulResults
                    .map(
                        (result, index) =>
                            `
COMPARABLE ${index + 1}

Titre :
${result.title}

Source :
${result.url}

Informations trouvées :
${result.content}
`
                    )
                    .join("\n");

            const pricingPrompt = `Tu es maintenant responsable de l'estimation du prix de vente d'un article d'occasion.

Tu dois améliorer UNIQUEMENT les deux prix de l'annonce existante.

ARTICLE IDENTIFIÉ :

Titre :
${titre}

Catégorie :
${categorie}

Marque :
${marque}

Taille :
${taille}

État :
${etat}

RÉSULTATS TROUVÉS SUR LE WEB :

${marketContext}

==============================
RÈGLES DE COMPARAISON
==============================

Analyse les résultats avec beaucoup de prudence.

Un résultat trouvé sur le web n'est PAS automatiquement un comparable.

Ignore les résultats qui concernent clairement :

- un produit différent ;
- un autre modèle ;
- une autre édition ;
- une autre référence ;
- un lot alors que notre article est vendu seul ;
- un accessoire au lieu du produit ;
- une taille différente lorsque la taille influence fortement la valeur ;
- un produit neuf lorsque notre article est d'occasion ;
- un produit avec des caractéristiques très différentes.

Donne davantage de poids aux résultats qui correspondent au même :

- produit ;
- modèle ;
- édition ;
- référence ;
- marque.

Les prix affichés en ligne sont des prix demandés et non nécessairement des prix de vente réellement réalisés.

Ne considère donc jamais un prix isolé comme une vérité.

Si plusieurs prix comparables existent :

- identifie la tendance générale ;
- écarte les valeurs manifestement aberrantes ;
- tiens compte de l'état de notre article ;
- tiens compte des défauts visibles ;
- tiens compte de l'édition ou de la référence ;
- tiens compte de la rareté uniquement si elle est réellement établie par les comparables.

Si les résultats sont faibles, contradictoires ou peu pertinents :

- ne force pas une estimation précise ;
- conserve une estimation prudente ;
- utilise les données disponibles uniquement comme indication.

IMPORTANT :

Ne donne jamais un prix simplement parce qu'il apparaît dans un résultat.

Le prix doit être cohérent avec plusieurs éléments lorsque plusieurs comparables fiables existent.

==============================
FORMAT DE SORTIE
==============================

Retourne exactement :

PRIX CONSEILLÉ
[prix en euros]

PRIX DE MISE EN VENTE
[prix en euros légèrement supérieur]

Ne retourne aucune autre section.
Ne retourne aucune explication.
Ne retourne aucun commentaire.`;

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

                                model: "gpt-5-mini",

                                input: pricingPrompt

                            })

                        }
                    );

                const pricingData =
                    await pricingResponse.json();

                if (pricingResponse.ok) {

                    const pricingText =
                        pricingData.output

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
                                item => item.text
                            )

                            ?.join("\n") || "";

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
                            "__END__"
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

                            return res.status(200).json({
                                result: updatedText
                            });

                        }

                    }

                }

            } catch (pricingError) {

                console.error(
                    "Pricing analysis error:",
                    pricingError.message
                );

            }

        }

        // ==========================================
        // 6. FALLBACK
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
            error: error.message
        });

    }

};
