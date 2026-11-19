# Parcours

**Version 1.0.0**

Prototype public d'aide à l'audit UX de parcours web à partir d'une URL.

## Objectif

Cartographier les étapes principales d'un parcours, repérer les frictions et produire une synthèse fondée sur des règles d'accessibilité, de données personnelles, de consentement et de conversion.

## Règles incluses dans la démonstration

- Navigation clavier et focus visible
- Contraste, zoom et structure du contenu
- Étiquettes, aides et erreurs de formulaires
- Consentement aux cookies équilibré
- Finalités et minimisation des données
- Gestion durable des préférences
- Prix totaux, récurrence et frais visibles
- Actions principales explicites
- Erreurs récupérables
- Preuves de confiance accessibles
- Chargement visible et reprise sûre
- Suppression des étapes non nécessaires

## Parcours disponibles

- Achat: découverte, choix, panier, paiement, confirmation
- Compte: accès, identité, consentement, vérification, activation

La version actuelle est une démonstration locale. Elle simule les résultats à partir de l'URL saisie. Elle n'effectue aucun crawl réel, ne transmet aucune donnée à un service tiers et ne constitue pas un avis juridique.

## Lancer le prototype

```powershell
python -m http.server 4173
```

Puis ouvrir `http://localhost:4173`.
