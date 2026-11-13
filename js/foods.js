'use strict';
/* OliWeight — table des ingrédients pour 100 g (fiche #19)
   Sources : Fichier canadien sur les éléments nutritifs (Santé Canada) pour les aliments courants ;
   tables de composition de la FAO pour l'Afrique de l'Ouest (feuilles, crème de palme, poissons séchés).
   Valeurs arrondies, pour estimer : une valeur d'étiquette saisie par la personne remplace la table.
   [clé, nom, catégorie, kcal/100 g, protéines g/100 g, unités pratiques [[libellé, grammes]]] */
const FOODS_RAW = [
  // Viandes, poissons, œufs (cuits sauf mention)
  ['poulet', 'Poulet sans peau (cuit)', 'P', 165, 31, [['portion (paume)', 120]]],
  ['boeuf', 'Bœuf maigre (cuit)', 'P', 217, 26, [['portion (paume)', 120]]],
  ['dindon', 'Dindon haché maigre (cuit)', 'P', 203, 27, [['portion', 120]]],
  ['porc', 'Porc maigre (cuit)', 'P', 242, 27, [['portion', 120]]],
  ['tilapia', 'Poisson blanc / tilapia (cuit)', 'P', 128, 26, [['portion', 150]]],
  ['maquereau', 'Maquereau (cuit)', 'P', 262, 24, [['portion', 130]]],
  ['saumon', 'Saumon (cuit)', 'P', 206, 22, [['portion', 130]]],
  ['truite', 'Truite (cuite)', 'P', 168, 24, [['portion', 130]]],
  ['sardines', 'Sardines en conserve égouttées', 'P', 208, 25, [['boîte', 90]]],
  ['thon', 'Thon pâle en conserve (eau)', 'P', 116, 26, [['boîte', 120]]],
  ['hareng-fume', 'Hareng fumé sans peau', 'P', 217, 24, [['filet', 50]]],
  ['crevettes', 'Crevettes (cuites)', 'P', 99, 24, [['portion', 100]]],
  ['crevettes-sechees', 'Crevettes séchées', 'P', 260, 55, [['c. à soupe', 8]]],
  ['ecrevisses', 'Écrevisses séchées / moulues', 'P', 290, 60, [['c. à soupe', 8]]],
  ['poisson-seche', 'Poisson séché / fumé', 'P', 300, 60, [['morceau', 30]]],
  ['oeuf', 'Œuf', 'P', 143, 13, [['œuf', 50]]],
  ['jambon', 'Jambon maigre', 'P', 145, 21, [['tranche', 25]]],
  // Féculents (cuits sauf mention)
  ['riz', 'Riz blanc (cuit)', 'F', 130, 2.7, [['tasse', 160]]],
  ['riz-brun', 'Riz brun (cuit)', 'F', 123, 2.7, [['tasse', 160]]],
  ['pates', 'Pâtes / spaghetti (cuits)', 'F', 158, 5.8, [['tasse', 140]]],
  ['plantain', 'Plantain bouilli', 'F', 116, 0.8, [['plantain entier', 180]]],
  ['plantain-frit', 'Plantain mûr frit', 'F', 250, 1.5, [['½ plantain', 90]]],
  ['taro', 'Taro bouilli', 'F', 142, 0.5, [['tasse en morceaux', 140]]],
  ['manioc', 'Manioc bouilli', 'F', 135, 1.2, [['tasse en morceaux', 140]]],
  ['baton-manioc', 'Bâton de manioc', 'F', 150, 1, [['bâton', 250]]],
  ['couscous-mais', 'Couscous de maïs (boule)', 'F', 120, 2.5, [['boule (poing)', 150]]],
  ['pomme-de-terre', 'Pomme de terre bouillie', 'F', 87, 1.9, [['moyenne', 150]]],
  ['patate-douce', 'Patate douce (cuite)', 'F', 90, 2, [['moyenne', 150]]],
  ['pain-complet', 'Pain complet', 'F', 247, 13, [['tranche', 35]]],
  ['haricots', 'Haricots (cuits)', 'F', 127, 8.7, [['tasse', 175]]],
  ['lentilles', 'Lentilles (cuites)', 'F', 116, 9, [['tasse', 200]]],
  ['pois-chiches', 'Pois chiches (cuits)', 'F', 164, 8.9, [['tasse', 160]]],
  ['avoine', 'Flocons d’avoine (secs)', 'F', 379, 13, [['tasse', 80]]],
  ['mais', 'Maïs en grains', 'F', 86, 3.3, [['tasse', 145]]],
  ['farine-mais', 'Farine de maïs (sèche)', 'F', 361, 7, [['tasse', 120]]],
  // Laitiers
  ['lait', 'Lait 1 %', 'O', 42, 3.4, [['verre', 250]]],
  ['yaourt-grec', 'Yaourt grec nature 0 %', 'O', 59, 10, [['tasse', 230]]],
  ['yaourt', 'Yaourt nature 2 %', 'O', 63, 5, [['pot', 175]]],
  ['fromage', 'Fromage cheddar', 'O', 403, 25, [['portion (2 dés)', 30]]],
  ['feta', 'Féta', 'O', 264, 14, [['portion', 30]]],
  ['whey', 'Protéine whey (poudre)', 'O', 400, 80, [['dose', 30]]],
  // Légumes, feuilles, fruits (crus sauf mention)
  ['feuilles-manioc', 'Feuilles de manioc pilées', 'L', 60, 5, [['paquet', 500]]],
  ['ndole', 'Feuilles de ndolé (lavées)', 'L', 50, 4.5, [['paquet', 500]]],
  ['okok', 'Feuilles d’okok / eru', 'L', 70, 5, [['paquet', 250]]],
  ['epinards', 'Épinards', 'L', 23, 2.9, [['botte', 250]]],
  ['gombo', 'Gombo', 'L', 33, 1.9, [['tasse', 100]]],
  ['tomate', 'Tomate', 'L', 18, 0.9, [['moyenne', 120]]],
  ['oignon', 'Oignon', 'L', 40, 1.1, [['moyen', 110]]],
  ['legumes', 'Légumes variés', 'L', 30, 1.5, [['tasse', 120]]],
  ['avocat', 'Avocat', 'L', 160, 2, [['avocat', 150]]],
  ['banane', 'Banane', 'L', 89, 1.1, [['banane', 120]]],
  ['fruit', 'Fruit (pomme, orange…)', 'L', 52, 0.4, [['fruit', 150]]],
  ['petits-fruits', 'Petits fruits', 'L', 50, 0.7, [['tasse', 140]]],
  // Matières grasses, épicerie
  ['huile', 'Huile végétale', 'E', 884, 0, [['c. à soupe', 14]]],
  ['huile-palme', 'Huile de palme', 'E', 884, 0, [['c. à soupe', 14]]],
  ['creme-palme', 'Crème de palme (noix de palme)', 'E', 535, 2, [['boîte', 400]]],
  ['beurre-arachide', 'Beurre / pâte d’arachide', 'E', 588, 25, [['c. à soupe', 16]]],
  ['arachides', 'Arachides grillées', 'E', 585, 24, [['poignée', 30]]],
  ['amandes', 'Amandes', 'E', 579, 21, [['poignée', 30]]],
  ['chia', 'Graines de chia', 'E', 486, 17, [['c. à soupe', 12]]],
  ['lait-coco', 'Lait de coco léger', 'E', 70, 0.5, [['tasse', 240]]],
  ['mayonnaise', 'Mayonnaise', 'E', 680, 1, [['c. à soupe', 14]]],
  ['miel', 'Miel', 'E', 304, 0.3, [['c. à thé', 7]]],
  ['sucre', 'Sucre', 'E', 387, 0, [['c. à thé', 4]]],
  ['houmous', 'Houmous', 'E', 166, 8, [['c. à soupe', 15]]],
  ['assaisonnement', 'Épices, ail, cube, sel', 'E', 0, 0, [['c. à thé', 5]]],
];
const FOODS = Object.fromEntries(
  FOODS_RAW.map(([k, nom, cat, kcal, prot, units]) => [k, {k, nom, cat, kcal, prot, units: [['g', 1], ...units]}]),
);
// Accompagnements proposés dans le calculateur de portion
const SIDES = ['taro', 'manioc', 'plantain', 'riz', 'baton-manioc', 'couscous-mais', 'pomme-de-terre'];
// Budget du jour (personnalisé si possible) et part du moment selon le nombre de repas (energy.js)
function dayTarget() {
  return kcalTarget() ?? Math.round((kcalMin() + kcalLimit()) / 2);
}
function slotBudget(slot) {
  return Math.round(dayTarget() * slotShare(slot));
}
