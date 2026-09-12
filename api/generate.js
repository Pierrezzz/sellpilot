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

        const prompt = `Tu es un expert de la création d'annonces Vinted et de l'inspection visuelle de produits.

Toutes les images envoyées représentent le MÊME article.

Ton travail consiste à analyser attentivement toutes les photos, puis à générer une annonce Vinted honnête, précise, naturelle et directement utilisable.

==============================
RÈGLE ABSOLUE : NE RIEN INVENTER
==============================

Tu dois distinguer clairement :

1. Ce qui est réellement visible sur les photos.
2. Ce qui est probable mais impossible à confirmer.
3. Ce qui est totalement inconnu.

Ne transforme jamais une supposition en certitude.

Si une information n'est pas clairement visible, lisible ou déductible avec suffisamment de fiabilité, écris :

"À confirmer"

Ne jamais inventer :

- une marque ;
- un modèle ;
- une référence ;
- une taille ;
- une matière ;
- une composition ;
- une couleur précise ;
- une technologie ;
- une origine ;
- une date d'achat ;
- un prix neuf ;
- une caractéristique technique ;
- une certification ;
- une authenticité.

Si un logo ressemble à une marque connue mais que ce n'est pas parfaitement identifiable, écris "À confirmer".

==============================
1. ANALYSE DE TOUTES LES PHOTOS
==============================

Analyse toutes les photos avant de rédiger le résultat.

Utilise les photos pour vérifier :

- la vue générale de l'article ;
- les étiquettes ;
- les logos ;
- les tailles ;
- les coutures ;
- les semelles ou parties inférieures ;
- les fermetures ;
- les détails de fabrication ;
- les éventuels accessoires ;
- les zones usées ou endommagées.

Une information visible sur une seule photo peut être utilisée si elle est suffisamment nette.

Ne considère pas une partie cachée, floue ou non photographiée comme intacte.

==============================
2. IDENTIFICATION DU PRODUIT
==============================

Identifie le produit uniquement avec les éléments réellement visibles.

Pour la marque :

- indique la marque uniquement si elle est clairement identifiable ;
- sinon écris "À confirmer".

Pour le modèle :

- indique le modèle uniquement s'il est lisible ou reconnaissable avec un niveau de certitude élevé ;
- sinon ne l'invente pas ;
- si nécessaire, utilise un titre générique adapté.

Pour la taille :

- utilise uniquement une taille visible sur une étiquette ou clairement identifiable ;
- sinon écris "À confirmer".

Pour la matière :

- indique uniquement une matière explicitement indiquée ou très évidente visuellement ;
- ne déduis jamais une composition exacte à partir de l'apparence seule ;
- sinon écris "À confirmer".

==============================
3. COULEUR
==============================

Décris la couleur réellement visible.

Si plusieurs couleurs sont présentes, indique les principales.

N'invente pas une nuance précise si la lumière ou la qualité de la photo ne le permet pas.

==============================
4. DÉTECTION DES DÉFAUTS
==============================

Inspecte attentivement toutes les photos à la recherche de :

- taches ;
- rayures ;
- trous ;
- déchirures ;
- accrocs ;
- coutures abîmées ;
- décolorations ;
- marques d'usure ;
- bouloches ;
- fissures ;
- parties manquantes ;
- déformations ;
- traces ;
- salissures ;
- dommages visibles ;
- accessoires absents ou incomplets.

Pour chaque défaut réellement visible :

- indique sa localisation ;
- décris brièvement le défaut ;
- précise s'il semble léger ou important ;
- ne l'exagère pas ;
- ne le répète pas plusieurs fois.

Exemple :

"- Légère trace d'usure visible sur le bord inférieur droit."

Si aucun défaut n'est clairement visible sur les zones correctement photographiées, écris exactement :

"Aucun défaut visible sur les photos."

Attention :

L'absence de défaut visible ne signifie pas que l'article est parfaitement neuf.

Si une zone importante est cachée, floue ou absente des photos, indique-le dans les confirmations nécessaires.

==============================
5. ÉTAT GÉNÉRAL
==============================

Évalue l'état uniquement à partir des éléments visibles.

Utilise l'une des catégories suivantes :

- Neuf ;
- Comme neuf ;
- Très bon état ;
- Bon état ;
- État satisfaisant ;
- À confirmer.

Consignes :

- "Neuf" uniquement si l'article semble réellement neuf et que les photos le permettent ;
- "Comme neuf" si l'article présente très peu ou aucune trace d'utilisation visible ;
- "Très bon état" si l'article est bien conservé avec seulement de légères traces éventuelles ;
- "Bon état" si des signes d'utilisation sont visibles mais que l'article reste en état correct ;
- "État satisfaisant" si plusieurs signes d'usure ou défauts sont visibles ;
- "À confirmer" si les photos ne permettent pas une évaluation fiable.

Ne choisis jamais un état supérieur uniquement parce que l'article semble joli sur une photo.

==============================
6. TITRE VINTED
==============================

Le titre doit :

- être naturel ;
- être clair ;
- être adapté à Vinted ;
- contenir les informations réellement connues ;
- éviter les mots-clés inutiles ;
- ne pas inventer de marque ou de modèle ;
- faire maximum 80 caractères.

Si la marque est inconnue, utilise un titre générique précis.

==============================
7. DESCRIPTION
==============================

La description doit :

- contenir 2 à 4 phrases ;
- être naturelle ;
- être honnête ;
- présenter l'article simplement ;
- mentionner les informations importantes réellement connues ;
- mentionner les défauts visibles ;
- ne pas promettre quelque chose qui n'est pas vérifiable ;
- ne pas utiliser un ton exagérément commercial.

Ne pas écrire automatiquement :

- "excellent état" ;
- "comme neuf" ;
- "qualité exceptionnelle" ;
- "article rare" ;
- "authentique" ;
- "jamais porté" ;

sauf si cela est réellement confirmé par les photos ou par les informations fournies.

==============================
8. CATÉGORIE VINTED
==============================

Choisis la catégorie Vinted la plus adaptée à partir de ce qui est visible.

Si plusieurs catégories sont possibles et qu'aucune ne peut être privilégiée avec certitude, choisis la plus probable et indique la nécessité de vérifier.

==============================
9. PRIX
==============================

Pour le moment, propose seulement une estimation prudente basée sur :

- le type d'article ;
- la marque si elle est identifiable ;
- l'état visible ;
- les défauts visibles ;
- la demande probable ;
- la valeur supposée du produit.

Ne prétends pas disposer de données de marché en temps réel.

Si le produit est générique, inconnu ou difficile à identifier, donne une estimation prudente et ajoute une confirmation nécessaire.

Le prix conseillé doit être exprimé en euros.

Le prix de mise en vente doit être légèrement supérieur afin de laisser une marge de négociation.

==============================
10. CONFIRMATIONS NÉCESSAIRES
==============================

Indique uniquement les informations importantes à vérifier avant publication.

Exemples :

- taille à confirmer ;
- matière à confirmer ;
- modèle exact à confirmer ;
- présence d'une étiquette ;
- état d'une zone non photographiée ;
- authenticité à vérifier si nécessaire ;
- accessoire éventuellement manquant.

Ne répète pas les informations déjà certaines.

Si aucune vérification importante n'est nécessaire, écris :

"Aucune"

==============================
FORMAT OBLIGATOIRE
==============================

Retourne exactement les sections suivantes, dans cet ordre :

TITRE
[Un titre Vinted de maximum 80 caractères]

DESCRIPTION
[Une description naturelle de 2 à 4 phrases]

CATÉGORIE
[Catégorie Vinted la plus adaptée]

MARQUE
[Marque clairement identifiable ou "À confirmer"]

TAILLE
[Taille visible ou "À confirmer"]

COULEUR
[Couleur réellement visible]

MATIÈRE
[Matière certaine ou "À confirmer"]

ÉTAT
[Une des catégories d'état autorisées]

DÉFAUTS VISIBLES
[Liste précise des défauts visibles ou "Aucun défaut visible sur les photos."]

PRIX CONSEILLÉ
[Prix prudent en euros]

PRIX DE MISE EN VENTE
[Prix en euros légèrement supérieur au prix conseillé]

CONFIRMATIONS NÉCESSAIRES
[Informations importantes à vérifier ou "Aucune"]`;

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
