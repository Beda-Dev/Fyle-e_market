# Guide Maquette Figma - Eburnie

Ce document décrit la structure et les composants de chaque page de l'application Eburnie pour la création de maquettes Figma.

---

## 🎨 Design System

### Couleurs
- **Primary (Orange)** : `#F97316` (brand-orange)
- **Secondary (Brun)** : `#73442A` (brand-brown)
- **Background** : Blanc / Gris clair
- **Texte** : Noir / Gris foncé
- **Succès** : Vert
- **Erreur** : Rouge

### Typographie
- **Font Heading** : Poppins (400, 500, 600, 700)
- **Font Body** : Inter (400, 500, 600)

### Composants UI
- Boutons : Primary (orange), Outline, Ghost, Destructive
- Inputs : Rounded-lg avec focus ring orange
- Cards : Fond blanc avec bordure
- Badges : Status indicators

---

## 📄 Pages

### 1. Page d'accueil (`/`)

#### Header
- Logo Eburnie (gauche)
- Navigation : Produits, Catégories, Favoris (centre)
- Actions : Panier (avec badge count), Profil/Login (droite)
- Mobile : Menu hamburger

#### Hero Section
- **Gauche** :
  - Titre principal (H1) : "Votre destination shopping en ligne"
  - Sous-titre : Description courte
  - Boutons : "Voir les produits" (Primary), "En savoir plus" (Outline)
- **Droite** : Image hero (produit ou lifestyle)
- **Features** (en bas) :
  - Livraison Rapide + icône Truck
  - Paiement Sécurisé + icône CreditCard
  - Support 24/7 + icône Headphones

#### Catégories (Section)
- Titre : "Nos catégories"
- Grid de cartes avec :
  - Image catégorie
  - Nom catégorie
  - Nombre de produits

#### Produits Populaires (Section)
- Titre : "Produits populaires"
- Grid de cartes produit (voir composant ProductCard)
- Bouton "Voir tout" → /products

#### Promo Banners (Section)
- 2-3 bannières promotionnelles avec :
  - Image de fond
  - Texte promo
  - Bouton CTA

#### Témoignages (Section)
- Titre : "Ce que disent nos clients"
- Grid de témoignages avec :
  - Avatar
  - Nom + Rôle
  - Citation
  - Étoiles

#### Footer (Composant Footer)
- Colonne Brand : Logo + slogan + contact
- Colonne Boutique : Liens vers produits, catégories, favoris
- Colonne Mon compte : Profil, commandes, panier
- Colonne Entreprise : À propos, contact
- Copyright en bas

---

### 2. Page Catalogue Produits (`/products`)

#### Header (identique accueil)

#### Barre de recherche et filtres
- **Haut** : Barre de recherche avec icône
- **Gauche** (Sidebar) :
  - Filtre catégories (checkboxes)
  - Filtre prix (range slider)
  - Filtre disponibilité (en stock)
  - Filtre nouveautés
  - Bouton "Appliquer"
- **Droite** : Grid de produits

#### Grid Produits
- Composant ProductCard pour chaque produit
- Pagination en bas

---

### 3. Page Détail Produit (`/products/[slug]`)

#### Header (identique accueil)

#### Breadcrumb
- Accueil > Produits > [Nom produit]

#### Contenu Principal
- **Gauche** (2/3) :
  - Galerie d'images (image principale + thumbnails)
  - Boutons zoom/navigation
- **Droite** (1/3) :
  - Titre produit (H1)
  - Prix (actuel + barré si promo)
  - Badge : Nouveau / Promo / En stock
  - Description
  - Sélecteur quantité (- 1 +)
  - Boutons : Ajouter au panier (Primary), Ajouter aux favoris (Outline)
  - Avantages :
    - Livraison rapide + icône
    - Paiement sécurisé + icône
    - Retour facile + icône

#### Tabs (en bas)
- **Description** : Texte long
- **Informations** : Caractéristiques
- **Livraison** : Frais 2 500 FCFA, partout en CI

#### Produits similaires
- Grid de 4 produits similaires

---

### 4. Page Panier (`/cart`)

#### Header (identique accueil)

#### Contenu
- **Titre** : "Mon panier"

Si panier vide :
- Icône ShoppingBag grande
- "Votre panier est vide"
- Bouton "Commencer vos achats" → /products

Si panier avec items :
- **Liste d'items** :
  - Image produit
  - Nom + catégorie
  - Prix
  - Sélecteur quantité
  - Bouton supprimer (X)
- **Récapitulatif** (sticky droite ou bas) :
  - Sous-total
  - Livraison : 2 500 FCFA
  - Total (en gras, orange)
  - Bouton "Passer la commande" → /checkout

---

### 5. Page Checkout (`/checkout`)

#### Header (identique accueil)

#### Progress Steps
- 3 étapes : Livraison → Paiement → Confirmation
- Étape active en orange, passées en vert

#### Formulaire Livraison
- **Informations personnelles** :
  - Prénom
  - Nom
  - Email
  - Téléphone
- **Adresse** :
  - Adresse
  - Ville
  - Note optionnelle
- **Récapitulatif commande** :
  - Liste des produits
  - Sous-total
  - Livraison : 2 500 FCFA
  - Total
- **Bouton** : "Confirmer la commande"

#### Confirmation (après soumission)
- Icône Check grande (vert)
- "Commande confirmée !"
- "Merci pour votre commande"
- Numéro de commande
- Boutons : "Continuer mes achats", "Suivre ma commande"

---

### 6. Page Login (`/login`)

#### Layout (split screen)
- **Gauche** (50%) :
  - Fond orange clair `#F9DEC9`
  - Logo Eburnie
  - Illustration ou image lifestyle
- **Droite** (50%) :
  - Formulaire centré
  - Titre : "Connexion"
  - Champs :
    - Email
    - Mot de passe (avec icône œil)
  - Lien "Mot de passe oublié ?" → /forgot-password
  - Bouton "Se connecter"
  - Lien "Pas encore de compte ? S'inscrire" → /register

---

### 7. Page Register (`/register`)

#### Layout (split screen - identique login)
- **Gauche** : Fond orange clair + logo
- **Droite** :
  - Formulaire
  - Titre : "Créer un compte"
  - Champs :
    - Prénom
    - Nom
    - Email
    - Téléphone
    - Mot de passe
    - Confirmer mot de passe
  - Bouton "S'inscrire"
  - Lien "Déjà un compte ? Se connecter" → /login

---

### 8. Page Mot de passe oublié (`/forgot-password`)

#### Header (identique accueil)

#### Contenu centré
- Icône Mail
- Titre : "Mot de passe oublié ?"
- Description : "Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe."
- Champ : Email
- Bouton "Envoyer le lien"
- Lien "Retour à la connexion" → /login

---

### 9. Page Réinitialisation mot de passe (`/reset-password`)

#### Header (identique accueil)

#### Contenu centré
- Icône Lock
- Titre : "Nouveau mot de passe"
- Champs :
  - Nouveau mot de passe
  - Confirmer le mot de passe
- Bouton "Réinitialiser"
- Lien "Retour à la connexion" → /login

---

### 10. Page Profil (`/profile`)

#### Header (identique accueil)

#### Contenu
- **Titre** : "Mon profil"
- **Tabs** :
  - **Informations** :
    - Formulaire : Prénom, Nom, Email, Téléphone
    - Bouton "Enregistrer"
  - **Adresses** :
    - Liste des adresses
    - Bouton "Ajouter une adresse"
  - **Commandes** : Redirige vers /orders

---

### 11. Page Mes Commandes (`/orders`)

#### Header (identique accueil)

#### Contenu
- **Titre** : "Mes commandes"
- **Liste de commandes** (cards) :
  - Numéro commande
  - Date
  - Statut (badge)
  - Total
  - Bouton "Voir détails"

#### Détails commande (modal ou page)
- Informations commande
- Liste des produits
- Adresse de livraison
- Statut avec timeline

---

### 12. Page Favoris (`/favorites`)

#### Header (identique accueil)

#### Contenu
- **Titre** : "Mes favoris"

Si vide :
- Icône Heart
- "Aucun favori pour le moment"
- Bouton "Découvrir les produits" → /products

Si avec items :
- Grid de ProductCard avec bouton supprimer

---

### 13. Page Contact (`/contact`)

#### Header (identique accueil)

#### Contenu
- **Titre** : "Contactez-nous"
- **Layout** (2 colonnes) :
  - **Gauche** :
    - Informations contact (téléphone, email, adresse)
    - Formulaire :
      - Nom
      - Email
      - Sujet
      - Message
      - Bouton "Envoyer"
  - **Droite** :
    - Carte avec adresse (Map placeholder)
    - Horaires d'ouverture

---

### 14. Page À propos (`/about`)

#### Header (identique accueil)

#### Contenu
- **Titre** : "À propos de Eburnie"
- **Sections** :
  - Notre histoire
  - Notre mission
  - Nos valeurs
  - Notre équipe
- Images et textes

---

### 15. Page Admin Dashboard (`/admin`)

#### Header Admin
- Logo + "Admin"
- Navigation : Dashboard, Produits, Commandes, Paramètres
- Logout

#### Contenu
- **Stats cards** (4) :
  - Chiffre d'affaires
  - Commandes
  - Produits
  - Clients
- **Commandes récentes** (tableau)
- **Produits en stock faible** (liste)
- **Actions rapides** (cards avec icônes) :
  - Ajouter produit
  - Voir commandes
  - Gérer produits
  - Paramètres

---

### 16. Page Admin Produits (`/admin/products`)

#### Header Admin

#### Contenu
- **Titre** : "Gestion des produits"
- **Barre d'outils** :
  - Bouton "Ajouter un produit"
  - Barre de recherche
- **Tableau** :
  - Image
  - Nom
  - Catégorie
  - Prix
  - Stock
  - Statut (actif/inactif)
  - Actions : Modifier, Supprimer

---

### 17. Page Admin Nouveau Produit (`/admin/products/new`)

#### Header Admin
- Bouton retour

#### Formulaire
- **Images** :
  - Zone upload (drag & drop)
  - Bouton camera (mobile)
  - Gallery des images uploadées
- **Informations** :
  - Nom
  - Slug (auto-généré)
  - Description
- **Prix** :
  - Prix
  - Prix original (optionnel)
- **Catégorie** : Dropdown
- **Stock** : Nombre
- **Options** :
  - Toggle "Nouveau"
  - Toggle "Mis en avant"
  - Toggle "Actif"
- **Boutons** : Annuler, Enregistrer

---

### 18. Page Admin Modifier Produit (`/admin/products/[id]/edit`)

#### Identique Nouveau Produit
- Pré-rempli avec données existantes
- Images existantes affichées avec possibilité de supprimer

---

### 19. Page Admin Commandes (`/admin/orders`)

#### Header Admin

#### Contenu
- **Titre** : "Gestion des commandes"
- **Tableau** :
  - Numéro commande
  - Client (nom + email)
  - Date
  - Articles (nombre)
  - Total
  - Statut (badge)
  - Action : Voir détails

---

### 20. Page Admin Paramètres (`/admin/settings`)

#### Header Admin

#### Contenu
- **Titre** : "Paramètres du site"
- **Formulaire** :
  - Service client (téléphone)
  - Email de contact
  - WhatsApp
  - Slogan
  - Localisation
- **Bouton** : Enregistrer

---

## 🔔 Toast Notifications

Les toasts s'affichent en bas à droite de l'écran :

- **Succès** : Fond blanc, texte noir, bordure verte
- **Erreur** : Fond rouge clair, texte rouge foncé, bordure rouge
- Contenu : Titre + description optionnelle
- Bouton X pour fermer
- Auto-dismiss après 5 secondes

---

## 📱 Responsive

### Mobile (< 768px)
- Header : Menu hamburger
- Grids : 1 colonne
- Sidebar filtres : Drawer ou accordéon
- Tables : Scroll horizontal ou cards

### Tablet (768px - 1024px)
- Grids : 2 colonnes
- Sidebar : Collapsible

### Desktop (> 1024px)
- Grids : 3-4 colonnes
- Sidebar : Visible

---

## 🎯 Notes importantes

- Frais de livraison fixes à 2 500 FCFA
- Pas de livraison gratuite
- Newsletter commentée (non affichée)
- Table orders et order_items (pas Order/OrderItem)
