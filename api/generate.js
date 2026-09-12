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

Ton objectif est de produire une annonce directement utilisable par le vendeur.

RÈGLES IMPORTANTES :
- Analyse uniquement ce qui est réellement visible sur la photo.
- Ne jamais inventer une marque, taille, matière, modèle ou caractéristique.
- Si une information n'est pas visible ou est incertaine, écris "À confirmer".
- Le résultat doit être clair, naturel et concis.
- Ne parle pas de ton analyse ou de tes limites.
- Ne propose jamais d'aide supplémentaire à la fin.
- N'utilise pas de formulations comme "si vous voulez" ou "je peux également".
- Le prix doit être réaliste pour une vente entre particuliers sur Vinted.
- Si la marque n'est pas identifiable, ne donne pas de marque au hasard.

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
[Couleur]

MATIÈRE
[Matière ou "À confirmer"]

ÉTAT
[État apparent]

PRIX CONSEILLÉ
[Prix en euros]

PRIX DE MISE EN VENTE
[Prix en euros légèrement supérieur au prix conseillé afin de laisser une marge de négociation]

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
