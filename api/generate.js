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

Identifie uniquement les informations réellement visibles :

- type d'article ;
- marque ;
- modèle ;
- taille ;
- couleur ;
- matière ;
- caractéristiques ;
- accessoires éventuels ;
- état général ;
- défauts visibles.

Analyse toutes les photos ensemble et utilise les détails visibles sur chaque image.

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

Exemple de bonne description :

"One Piece tome 100, édition collector Glénat, encore sous film plastique. Un exemplaire idéal pour les collectionneurs."

Exemple interdit :

"One Piece tome 100, édition collector Glénat, encore sous film plastique. Le film présente un accroc et quelques plis sur la tranche."

Dans cet exemple, les défauts doivent uniquement être indiqués dans DÉFAUTS VISIBLES.

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
5. CATÉGORIE
==============================

Choisis la catégorie Vinted la plus adaptée.

Si la catégorie exacte est incertaine, choisis la plus probable et ajoute une vérification dans "CONFIRMATIONS NÉCESSAIRES".

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

Ne prétends pas utiliser des données de marché en temps réel.

Le prix de mise en vente doit être légèrement supérieur au prix conseillé.

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
[Une description naturelle de 2 à 4 phrases, directement copiable]

CATÉGORIE
[Catégorie Vinted la plus adaptée]

MARQUE
[Marque certaine ou "À confirmer"]

TAILLE
[Taille certaine ou "À confirmer"]

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
