'use strict';
/* OliWeight — constantes, repas de base, calories, options */
var SYNC_KEY = 'oliweight.sync',
  DATA_PATH = 'data/oliweight.json',
  MENU_PATH = 'menus/cycle.json',
  syncTimer = null,
  syncBusy = false,
  BLOCS = {1: [1, 2], 3: [3, 4], 5: [5, 6]};
const APP_VERSION = '3.1.0';
const KEY = 'oliweight.v2';
const LEGACY_KEYS = ['oliweight.v1', 'zen.v1'];
const REASONS = [
  'Portion plus grosse',
  'Plus d’huile',
  'Plus de sucre',
  'Ingrédient remplacé',
  'Pas eu le temps',
  'Très faim',
  'Pas faim',
  'Fatigue',
  'Autre',
];
const SLOTS = ['Petit-déjeuner · 9 h', 'Collation · 11 h', 'Dîner · 13 h', 'Collation · 15 h 30', 'Souper · 17 h'];
const SLOT_SHORT = ['Petit-déj.', 'Collation 11 h', 'Dîner', 'Collation 15 h 30', 'Souper'];
const STATUS_LABEL = {done: 'Respecté', partial: 'Partiel', replaced: 'Remplacé', skipped: 'Sauté'};
const CATS = {
  L: 'Fruits et légumes',
  P: 'Viandes et poissons',
  O: 'Œufs et produits laitiers',
  F: 'Féculents',
  E: 'Épicerie',
};
const SALADE = [
  'L:Laitue',
  'L:Chou rouge',
  'L:Tomates',
  'L:Concombre',
  'L:Carottes',
  'L:Oignons',
  'L:Ail',
  'E:Vinaigre',
  'E:Huile végétale',
];
// Menus semaine 1 (mêmes codes que la version 1)
const NEW_MEALS = {
  P6: {
    nom: 'Crêpes protéinées Flourish',
    details:
      '⅔ de tasse de mélange Flourish chocolat (75 g, 1 portion) + eau selon l’emballage → 3 ou 4 crêpes, poêle antiadhésive sans beurre (ou 1 c. à thé d’huile).\nGarniture : ½ banane en rondelles + ½ tasse de petits fruits. Pas de sirop ; 1 c. à thé de sirop d’érable au maximum si elle en veut.\nVérifier les calories sur le sac : la recette a changé selon les lots.',
    ing: ['E:Mélange à crêpes protéiné Flourish', 'L:Bananes', 'L:Petits fruits surgelés'],
    kcal: 365,
  },
  C5: {
    nom: 'Mini-crêpes protéinées Flourish',
    details:
      '⅓ de tasse de mélange Flourish chocolat (38 g, une demi-portion) + eau selon l’emballage → 2 petites crêpes, poêle antiadhésive sans beurre.\nAvec ½ tasse de petits fruits. Pas de sirop.',
    ing: ['E:Mélange à crêpes protéiné Flourish', 'L:Petits fruits surgelés'],
    kcal: 175,
  },
  DCR: {
    nom: 'Épinards sautés aux crevettes',
    details:
      '200 g de crevettes crues décortiquées (environ 160 g une fois cuites, bien cuites jusqu’à ce qu’elles soient roses) + 3 tasses d’épinards frais (90 g) + ½ oignon, 2 gousses d’ail, 1 tomate + 1 c. à soupe d’huile.\nAvec ¾ de plantain bouilli (135 g) ou 1 gros taro (180 g cuit).\nRapide : 15 minutes. Peut se préparer pour 2 jours.',
    ing: [
      'P:Crevettes crues décortiquées',
      'L:Épinards',
      'L:Oignons',
      'L:Ail',
      'L:Tomates',
      'E:Huile végétale',
      'F:Plantains',
    ],
    kcal: 490,
  },
  C1: {
    nom: 'Fruit + amandes',
    details: '1 fruit entier (pas de jus) + 15 g d’amandes nature (environ 12).',
    ing: ['L:Fruits', 'E:Amandes nature'],
    kcal: 170,
  },
  P3: {
    nom: 'Yaourt grec, fruit, œuf',
    details:
      '¾ de tasse de yaourt grec nature (175 g) + 1 fruit + 1 c. à soupe de noix hachées (10 g) + 1 œuf + 1 tranche de pain complet.',
    ing: ['O:Yaourt grec nature', 'L:Fruits', 'O:Œufs', 'F:Pain complet'],
    kcal: 445,
  },
  P4: {
    nom: 'Gruau aux petits fruits',
    details:
      '½ tasse de flocons d’avoine (40 g) cuits dans 1 tasse de lait 1 % (250 ml) + ½ tasse de petits fruits frais ou surgelés + 1 c. à soupe de graines de chia ou de noix hachées (10 g) + cannelle.\nAvec 1 œuf dur à côté. Pas de sucre ajouté : les fruits suffisent.',
    ing: ['F:Flocons d’avoine', 'O:Lait 1 %', 'L:Petits fruits surgelés', 'E:Graines de chia', 'O:Œufs', 'E:Cannelle'],
    kcal: 450,
  },
  P5: {
    nom: 'Omelette aux légumes',
    details:
      'Omelette de 2 œufs avec épinards, poivron, oignon et tomate (1 c. à thé d’huile) + ¼ d’avocat + 1 tranche de pain complet + 1 fruit.',
    ing: ['O:Œufs', 'L:Épinards', 'L:Poivrons', 'L:Oignons', 'L:Tomates', 'F:Pain complet', 'L:Fruits'],
    kcal: 430,
  },
};
const DEFAULT_MEALS = {
  P1: {
    nom: 'Salade + sardines + œuf',
    details:
      'Salade (laitue, chou rouge, tomate, concombre, carotte, oignon, ail, épices) + vinaigrette 1 c. à soupe d’huile + vinaigre.\n1 boîte de sardines égouttées + 1 œuf + 1 tranche de pain complet.\nMayo : 1 c. à thé maximum.',
    ing: [...SALADE, 'P:Sardines en boîte', 'O:Œufs', 'F:Pain complet'],
  },
  P2: {
    nom: 'Salade + œufs, avocat, fromage',
    details:
      'Salade composée (laitue, chou rouge, tomate, concombre, carotte, oignon, ail, épices), environ 2 tasses + vinaigrette 1 c. à soupe d’huile + vinaigre.\n2 œufs + ¼ d’avocat + 30 g de fromage + 1 tranche de pain complet.\nDimanche : 1 petite pomme de terre au four (100 g, taille d’un œuf) au lieu du pain.',
    ing: [...SALADE, 'O:Œufs', 'L:Avocats', 'O:Fromage', 'F:Pain complet', 'F:Pommes de terre'],
  },
  P3: {
    nom: 'Yaourt grec, fruit, œuf',
    details: '¾ de tasse de yaourt grec nature + 1 fruit + 1 œuf + 1 tranche de pain complet.',
    ing: ['O:Yaourt grec nature', 'L:Fruits', 'O:Œufs', 'F:Pain complet'],
  },
  C1: {nom: 'Fruit entier', details: '1 fruit entier (pas de jus).', ing: ['L:Fruits']},
  C2: {
    nom: 'Whey + fruit',
    details:
      '1 dose de whey dans de l’eau ou du lait 1 % + 1 fruit.\nLe soir, seulement si faim et avant 21 h : un verre de lait ou un yaourt nature.',
    ing: ['E:Whey (sans caféine)', 'O:Lait 1 %', 'L:Fruits'],
  },
  C3: {
    nom: 'Pouding de chia au yaourt',
    details:
      '1 c. à soupe rase de graines de chia (12 g) + ½ tasse de lait 1 % (125 ml) + ⅓ de tasse de yaourt grec nature 0 % ou 2 % (80 g) + 1 c. à thé de miel (7 g).\nMélanger le chia et le lait, laisser gonfler au frigo au moins 2 h (idéalement la veille), puis ajouter le yaourt et le miel.\nEnviron 200 kcal, 14 g de protéines et 5 g de fibres. Boire un verre d’eau avec.',
    ing: ['E:Graines de chia', 'O:Yaourt grec nature', 'O:Lait 1 %', 'E:Miel'],
  },
  D1: {
    nom: 'Poulet grillé, gombo sauté',
    details:
      'Poulet grillé (taille de la paume, environ 120 g) + gombo sauté + 2 petites pommes de terre bouillies (150 g en tout, chacune de la taille d’un œuf).',
    ing: ['P:Poulet', 'L:Gombo', 'F:Pommes de terre'],
  },
  D2: {
    nom: 'Haricots aux légumes',
    details:
      '¾ de tasse de haricots cuits (130 g) préparés avec tomate, oignon et carotte + salade de crudités.\nLes haricots comptent à la fois comme protéine et comme féculent : pas de riz ni de pain en plus.\nAvec des haricots secs : ⅓ de tasse (60 g) par portion avant cuisson.',
    ing: ['F:Haricots', 'L:Tomates', 'L:Oignons', 'L:Carottes'],
  },
  D3: {
    nom: 'Bol méditerranéen',
    details: 'Poulet (environ 100 g) + ½ tasse de pois chiches cuits (80 g) + crudités + 1 c. à soupe d’huile d’olive.',
    ing: ['P:Poulet', 'F:Pois chiches', 'L:Concombre', 'L:Tomates', 'E:Huile d’olive'],
  },
  D4: {
    nom: 'Maquereau ou sardines grillés',
    details: 'Poisson grillé (environ 120 g) + épinards sautés + 1 taro moyen (environ 120 g cuit, taille d’un poing).',
    ing: ['P:Maquereau ou sardines fraîches', 'L:Épinards', 'F:Taro'],
  },
  D5: {
    nom: 'Sauté asiatique poulet-légumes',
    details: 'Poulet et légumes sautés + ¾ de tasse de spaghetti ou de nouilles cuits (105 g).',
    ing: ['P:Poulet', 'L:Poivrons', 'L:Brocoli', 'F:Spaghetti ou nouilles'],
  },
  D6: {
    nom: 'Curry de lentilles',
    details:
      'Curry de lentilles aux légumes : ¾ de tasse de lentilles cuites (150 g) + ½ tasse de riz cuit (80 g).\nAvec des lentilles sèches : ⅓ de tasse (65 g) par portion avant cuisson.',
    ing: ['F:Lentilles', 'F:Riz', 'L:Oignons', 'L:Tomates', 'E:Curry en poudre'],
  },
  D7: {
    nom: 'Okok allégé au bœuf maigre',
    details: 'Okok (moitié moins d’huile et d’arachide) + ½ bâton de manioc (environ 100 g).',
    ing: ['L:Feuilles d’okok', 'P:Bœuf maigre', 'E:Pâte d’arachide', 'F:Bâton de manioc'],
  },
  'S-A': {
    nom: 'Poisson braisé sauce tomate + plantain',
    details:
      'Tilapia ou maquereau (environ 120 g), sauce tomate-oignons-poivrons-épinards, 1 c. à soupe d’huile par personne + ½ plantain bouilli (environ 90 g).\nCuisiné une fois pour lundi et mardi.',
    ing: ['P:Tilapia ou maquereau', 'L:Tomates', 'L:Oignons', 'L:Poivrons', 'L:Épinards', 'F:Plantains'],
  },
  'S-B': {
    nom: 'Poulet aux légumes + riz',
    details:
      'Poulet sans peau (environ 120 g), beaucoup de légumes, 1 c. à soupe d’huile par personne + ¾ de tasse de riz cuit (120 g).\nCuisiné une fois pour mercredi et jeudi.',
    ing: ['P:Poulet', 'L:Carottes', 'L:Poivrons', 'L:Haricots verts', 'F:Riz'],
  },
  'S-C': {
    nom: 'Sauce gombo au bœuf maigre + couscous de maïs',
    details:
      'Gombo et épinards, 1 c. à soupe d’huile de palme par personne, bœuf maigre (environ 100 g) + crevettes séchées + 1 petite boule de couscous (taille d’un poing fermé, environ 150 g).\nCuisiné une fois pour vendredi et samedi.',
    ing: ['L:Gombo', 'L:Épinards', 'P:Bœuf maigre', 'P:Crevettes séchées', 'E:Huile de palme', 'F:Farine de maïs'],
  },
  'S-D': {
    nom: 'Poisson grillé, épinards, taro',
    details:
      'Grillade rapide du dimanche : poisson grillé (environ 120 g) + épinards sautés + 1 taro moyen (environ 120 g cuit).',
    ing: ['P:Poisson', 'L:Épinards', 'F:Taro'],
  },
};
Object.assign(DEFAULT_MEALS, NEW_MEALS);
// calories estimées par portion (semaine 1 ; les semaines suivantes ont leur propre champ kcal)
const KCAL = {
  P1: 570,
  P2: 570,
  P3: 445,
  P4: 450,
  P5: 430,
  P6: 365,
  C1: 170,
  C2: 200,
  C3: 200,
  C4: 230,
  C5: 175,
  DCR: 490,
  D1: 400,
  D2: 270,
  D3: 435,
  D4: 445,
  D5: 430,
  D6: 340,
  D7: 550,
  'S-A': 405,
  'S-B': 520,
  'S-C': 510,
  'S-D': 345,
};
const KCAL_MIN = 1800,
  KCAL_MAX = 2300;
// ajouts rapides sur un repas (calories fixées d'avance)
const ADDS = [
  ['Huile +1 c. à soupe', 120],
  ['Féculent +1 portion', 150],
  ['Viande/poisson +50 g', 100],
  ['Fruit +1', 80],
  ['Sucre/miel +1 c. à thé', 20],
];
// extras courants hors menu
const EXTRAS = [
  ['Beignet (1 moyen)', 200],
  ['Bouillie (1 bol)', 200],
  ['Plantain frit (½)', 220],
  ['Pain blanc (1 tranche)', 80],
  ['Arachides (1 poignée, 30 g)', 170],
  ['Jus de fruits (1 verre)', 115],
  ['Boisson gazeuse (1 canette)', 140],
  ['Biscuits (2)', 140],
  ['Chocolat (2 carrés)', 110],
  ['Yaourt sucré (1 pot)', 140],
  ['Lait (1 verre)', 105],
  ['Fruit (1)', 80],
  ['Riz (½ tasse)', 105],
  ['Fromage (30 g)', 120],
];
// jour 1 = lundi … 7 = dimanche → [petit-déj., collation 11 h, dîner, collation 15 h 30, souper]
const DEFAULT_PLAN = {
  1: ['P1', 'C1', 'D1', 'C2', 'S-A'],
  2: ['P2', 'C1', 'D2', 'C3', 'S-A'],
  3: ['P3', 'C1', 'D3', 'C2', 'S-B'],
  4: ['P1', 'C1', 'D4', 'C3', 'S-B'],
  5: ['P2', 'C1', 'D5', 'C2', 'S-C'],
  6: ['P3', 'C1', 'D6', 'C3', 'S-C'],
  7: ['P2', 'C1', 'D7', 'C2', 'S-D'],
};
