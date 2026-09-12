module.exports = async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {
        const { image } = req.body;

        if (!image) {
            return res.status(400).json({
                error: "No image provided"
            });
        }

        const response = await fetch(
            "https://api.openai.com/v1/responses",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: "gpt-5-mini",
                    input: [
                        {
                            role: "user",
                            content: [
                                {
                                    type: "input_text",
                                    text: `Analyse cette photo comme un assistant spécialisé dans la création d'annonces Vinted.

Ton objectif est de produire une annonce directement utilisable par le vendeur, tout en réalisant une inspection visuelle précise de l'article.

RÈGLES IMPORTANTES :

1. ANALYSE VISUELLE
- Analyse uniquement ce qui est réellement visible sur la photo.
- Ne jamais inventer une information.
- Ne jamais déduire un défaut simplement parce qu'il pourrait exister.
- Si un détail est trop petit, flou ou caché, ne le considère pas comme visible.
- Une caractéristique non visible doit être indiquée "À confirmer".

2. DÉTECTION DES DÉFAUTS
Inspecte attentivement l'article à la recherche de :
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

Si aucun défaut n'est clairement visible, écris :
"Aucun défaut visible sur la photo."

IMPORTANT :
L'absence de défaut visible ne signifie pas que l'article est sans défaut.
Ne dis jamais "aucun défaut" si certaines parties importantes de l'article sont cachées ou non visibles.

3. ÉTAT
Évalue l'état uniquement à partir de ce qui est visible :
- Neuf
- Comme neuf
- Très bon état
- Bon état
- État satisfaisant
- À confirmer

Si l'état réel ne peut pas être déterminé avec suffisamment de certitude, utilise "À confirmer".

4. INFORMATIONS PRODUIT
- Ne jamais inventer une marque.
- Ne jamais inventer une taille.
- Ne jamais inventer une matière.
- Ne jamais inventer un modèle.
- Si une information n'est pas clairement visible, écris "À confirmer".

5. ANNONCE
Le titre doit être naturel, attractif et adapté à Vinted.
Maximum 80 caractères.

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
[Liste des défauts réellement visibles ou "Aucun défaut visible sur la photo."]

PRIX CONSEILLÉ
[Prix en euros]

PRIX DE MISE EN VENTE
[Prix en euros légèrement supérieur au prix conseillé]

CONFIRMATIONS NÉCESSAIRES
[Uniquement les informations importantes que le vendeur devrait vérifier avant de publier. S'il n'y en a aucune, écrire "Aucune"]`
                                },
                                {
                                    type: "input_image",
                                    image_url: image
                                }
                            ]
                        }
                    ]
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                error: data.error?.message || "OpenAI API error"
            });
        }

        const text = data.output
            ?.flatMap(item => item.content || [])
            ?.filter(item => item.type === "output_text")
            ?.map(item => item.text)
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
