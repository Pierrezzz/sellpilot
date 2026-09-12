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


        // Limite de sécurité
        if (images.length > 10) {

            return res.status(400).json({
                error: "Maximum 10 images allowed"
            });

        }


        const prompt = `Analyse ces photos comme un assistant spécialisé dans la création d'annonces Vinted.

IMPORTANT :
Toutes les photos représentent le MÊME article.

Ton objectif est de produire une annonce directement utilisable par le vendeur, tout en réalisant une inspection visuelle précise de l'article.

RÈGLES IMPORTANTES :

1. ANALYSE DE TOUTES LES PHOTOS

- Analyse toutes les photos avant de prendre une décision.
- Utilise les différentes photos pour compléter les informations visibles.
- Une photo peut montrer un détail qui n'est pas visible sur les autres.
- Ne considère jamais une information comme certaine si elle n'est pas réellement visible.
- Ne jamais inventer une information.
- Si une information n'est pas visible ou reste incertaine, écris "À confirmer".

2. DÉTECTION DES DÉFAUTS

Inspecte attentivement toutes les photos à la recherche de :

- taches
- rayures
- trous
- déchirures
- accrocs
- coutures abîmées
- décolorations
- marques d'usure
- bouloches
- fissures
- parties manquantes
- déformations
- traces ou dommages visibles

Pour chaque défaut réellement visible :

- indique précisément où il se trouve
- décris brièvement son importance
- ne l'exagère jamais
- ne le mentionne qu'une seule fois même s'il apparaît sur plusieurs photos

Si aucun défaut n'est clairement visible sur les parties correctement visibles de l'article, écris :

"Aucun défaut visible sur les photos."

IMPORTANT :
L'absence de défaut visible ne signifie pas que l'article est sans défaut.

Ne dis jamais "aucun défaut" si une partie importante de l'article est cachée, floue ou non visible.

3. ÉTAT

Évalue l'état uniquement à partir de ce qui est réellement visible :

- Neuf
- Comme neuf
- Très bon état
- Bon état
- État satisfaisant
- À confirmer

Si certaines parties importantes ne sont pas visibles et empêchent une évaluation fiable, utilise "À confirmer".

4. INFORMATIONS PRODUIT

- Ne jamais inventer une marque.
- Ne jamais inventer une taille.
- Ne jamais inventer une matière.
- Ne jamais inventer un modèle.
- Ne jamais inventer une caractéristique.
- Si une information n'est pas clairement visible, écris "À confirmer".

5. ANNONCE

Le titre doit être :

- naturel
- attractif
- adapté à Vinted
- maximum 80 caractères

La description doit :

- faire 2 à 4 phrases
- être naturelle
- être honnête
- mentionner les défauts visibles lorsqu'il y en a
- ne pas prétendre que l'article est parfait si ce n'est pas vérifiable

6. PRIX

Propose un prix réaliste pour une vente entre particuliers sur Vinted.

Le prix doit tenir compte :

- de la catégorie
- de l'état visible
- de la marque si elle est identifiable
- des défauts visibles
- de la valeur probable du produit

Le prix de mise en vente doit être légèrement supérieur au prix conseillé afin de laisser une marge de négociation.

7. CONFIRMATIONS

Indique uniquement les informations importantes que le vendeur devrait vérifier avant de publier l'annonce.

Ne répète pas inutilement les informations déjà certaines.

Retourne exactement le format suivant :

TITRE
[Un titre Vinted attractif de maximum 80 caractères]

DESCRIPTION
[Une description naturelle de 2 à 4 phrases, prête à copier-coller sur Vinted]

CATÉGORIE
[Catégorie Vinted la plus adaptée]

MARQUE
[Marque ou "À confirmer"]

TAILLE
[Taille ou "À confirmer"]

COULEUR
[Couleur réellement visible]

MATIÈRE
[Matière ou "À confirmer"]

ÉTAT
[État apparent]

DÉFAUTS VISIBLES
[Liste des défauts réellement visibles ou "Aucun défaut visible sur les photos."]

PRIX CONSEILLÉ
[Prix en euros]

PRIX DE MISE EN VENTE
[Prix en euros légèrement supérieur au prix conseillé]

CONFIRMATIONS NÉCESSAIRES
[Uniquement les informations importantes que le vendeur devrait vérifier avant de publier. S'il n'y en a aucune, écrire "Aucune"]`;


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


        return res.status(200).json({
            result: text
        });


    } catch (error) {

        return res.status(500).json({
            error: error.message
        });

    }
};
