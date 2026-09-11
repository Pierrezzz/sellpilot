export default async function handler(req, res) {
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
                                    text: `Analyse cette photo comme un vendeur Vinted.

Identifie au mieux :
- type d'article
- marque
- modèle
- couleur
- taille
- état apparent
- catégorie Vinted
- prix de vente conseillé

Puis génère :
1. un titre Vinted court et attractif
2. une description naturelle
3. les informations structurées
4. un prix conseillé en euros

Ne prétends pas connaître une information qui n'est pas visible. Si une information est incertaine, indique "à confirmer".`
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
}
