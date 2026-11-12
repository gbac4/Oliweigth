'use strict';
/* OliWeight — cycle de menus intégré (semaines 2 à 5). Le repo privé peut le remplacer (menus/cycle.json). */
const DEFAULT_CYCLE = {
  version: 1,
  updated: '2026-11-11',
  weeks: [
    {
      startDate: '2026-11-16',
      label: 'Menus semaine 2',
      rev: 2,
      meals: {
        P1: {
          nom: 'Salade + sardines + œuf',
          details:
            'Salade composée (laitue, chou rouge, tomate, concombre, carotte, oignon, ail, épices), environ 2 tasses + vinaigrette 1 c. à soupe d’huile + vinaigre.\n1 boîte de sardines égouttées + 1 œuf + 1 tranche de pain complet.\nMayo : 1 c. à thé maximum.',
          ing: [
            'L:Laitue',
            'L:Chou rouge',
            'L:Tomates',
            'L:Concombre',
            'L:Carottes',
            'L:Oignons',
            'L:Ail',
            'E:Vinaigre',
            'E:Huile végétale',
            'P:Sardines en boîte',
            'O:Œufs',
            'F:Pain complet',
          ],
          kcal: 570,
        },
        P2: {
          nom: 'Salade + œufs, avocat, fromage',
          details:
            'Salade composée, environ 2 tasses + vinaigrette 1 c. à soupe d’huile + vinaigre.\n2 œufs + ¼ d’avocat + 30 g de fromage + 1 tranche de pain complet.',
          ing: [
            'L:Laitue',
            'L:Chou rouge',
            'L:Tomates',
            'L:Concombre',
            'L:Carottes',
            'L:Oignons',
            'L:Ail',
            'E:Vinaigre',
            'E:Huile végétale',
            'O:Œufs',
            'L:Avocats',
            'O:Fromage',
            'F:Pain complet',
          ],
          kcal: 570,
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
          ing: [
            'F:Flocons d’avoine',
            'O:Lait 1 %',
            'L:Petits fruits surgelés',
            'E:Graines de chia',
            'O:Œufs',
            'E:Cannelle',
          ],
          kcal: 450,
        },
        P5: {
          nom: 'Omelette aux légumes',
          details:
            'Omelette de 2 œufs avec épinards, poivron, oignon et tomate (1 c. à thé d’huile) + ¼ d’avocat + 1 tranche de pain complet + 1 fruit.',
          ing: ['O:Œufs', 'L:Épinards', 'L:Poivrons', 'L:Oignons', 'L:Tomates', 'F:Pain complet', 'L:Fruits'],
          kcal: 430,
        },
        C1: {
          nom: 'Fruit + amandes',
          details: '1 fruit entier (pas de jus) + 15 g d’amandes nature (environ 12).',
          ing: ['L:Fruits', 'E:Amandes nature'],
          kcal: 170,
        },
        C5: {
          nom: 'Mini-crêpes protéinées Flourish',
          details:
            '⅓ de tasse de mélange Flourish chocolat (38 g, une demi-portion) + eau selon l’emballage → 2 petites crêpes, poêle antiadhésive sans beurre.\nAvec ½ tasse de petits fruits. Pas de sirop.',
          ing: ['E:Mélange à crêpes protéiné Flourish', 'L:Petits fruits surgelés'],
          kcal: 175,
        },
        P6: {
          nom: 'Crêpes protéinées Flourish',
          details:
            '⅔ de tasse de mélange Flourish chocolat (75 g, 1 portion) + eau selon l’emballage → 3 ou 4 crêpes, poêle antiadhésive sans beurre (ou 1 c. à thé d’huile).\nGarniture : ½ banane en rondelles + ½ tasse de petits fruits. Pas de sirop ; 1 c. à thé de sirop d’érable au maximum si elle en veut.\nVérifier les calories sur le sac : la recette a changé selon les lots.',
          ing: ['E:Mélange à crêpes protéiné Flourish', 'L:Bananes', 'L:Petits fruits surgelés'],
          kcal: 365,
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
        C2: {
          nom: 'Whey + fruit',
          details:
            '1 dose de whey dans de l’eau ou du lait 1 % + 1 fruit.\nLe soir, seulement si faim et avant 21 h : un verre de lait ou un yaourt nature.',
          ing: ['E:Whey (sans caféine)', 'O:Lait 1 %', 'L:Fruits'],
          kcal: 200,
        },
        C3: {
          nom: 'Pouding de chia au yaourt',
          details:
            '1 c. à soupe rase de graines de chia (12 g) + ½ tasse de lait 1 % (125 ml) + ⅓ de tasse de yaourt grec nature 0 % ou 2 % (80 g) + 1 c. à thé de miel (7 g).\nMélanger le chia et le lait, laisser gonfler au frigo au moins 2 h (idéalement la veille), puis ajouter le yaourt et le miel.\nEnviron 200 kcal, 14 g de protéines et 5 g de fibres. Boire un verre d’eau avec.',
          ing: ['E:Graines de chia', 'O:Yaourt grec nature', 'O:Lait 1 %', 'E:Miel'],
          kcal: 200,
        },
        C4: {
          nom: 'Crudités, houmous et fromage',
          details:
            '1 tasse de crudités (carotte, concombre, poivron) + ¼ de tasse de houmous (60 g) + 1 bâtonnet de fromage (21 g).\nEnviron 230 kcal : une collation qui tient jusqu’au souper, contre la fringale de 17 h.',
          ing: ['L:Carottes', 'L:Concombre', 'L:Poivrons', 'E:Houmous', 'O:Bâtonnets de fromage'],
          kcal: 230,
        },
        S2A: {
          nom: 'Poulet au four citron-ail, patate douce',
          details:
            'Cuisiné une fois pour lundi et mardi.\nPar portion : poulet sans peau (150 g, taille de la main) mariné citron, ail, paprika + 1 patate douce moyenne rôtie (200 g) + 1 tasse de haricots verts. 1 c. à thé d’huile par portion.\nFour à 200 °C, environ 35 min.',
          ing: ['P:Poulet', 'L:Citrons', 'L:Ail', 'F:Patates douces', 'L:Haricots verts', 'E:Paprika'],
          kcal: 500,
        },
        S2B: {
          nom: 'Chili au dindon et haricots rouges',
          details:
            'Cuisiné une fois pour mercredi et jeudi.\nPar portion : 2 tasses de chili = dindon haché maigre (130 g) + ¾ de tasse de haricots rouges (135 g) + tomates en dés, poivrons, oignon, ¼ de tasse de maïs, cumin et chili en poudre.\nAvec une salade verte. Les haricots et le maïs font office de féculent : pas de riz en plus.',
          ing: [
            'P:Dindon haché maigre',
            'F:Haricots rouges en conserve',
            'L:Tomates en dés (conserve)',
            'L:Poivrons',
            'L:Oignons',
            'F:Maïs surgelé',
            'E:Cumin',
            'E:Chili en poudre',
            'L:Laitue',
          ],
          kcal: 555,
        },
        S2C: {
          nom: 'Sauce gombo au poisson + plantain',
          details:
            'Cuisiné une fois pour vendredi et samedi.\nPar portion : gombo, épinards et tomate + poisson (150 g, tilapia ou maquereau) + 1 c. à soupe d’huile de palme par personne + ¾ de plantain bouilli (135 g).',
          ing: ['L:Gombo', 'L:Épinards', 'L:Tomates', 'P:Tilapia ou maquereau', 'E:Huile de palme', 'F:Plantains'],
          kcal: 535,
        },
        S2D: {
          nom: 'Saumon érable-moutarde au four',
          details:
            'Saumon (150 g) badigeonné de 1 c. à thé de sirop d’érable + 1 c. à thé de moutarde de Dijon, 15 min au four à 200 °C + pommes de terre grelots (200 g) + brocoli vapeur.\nUn classique canadien, riche en oméga-3 : excellent pendant l’allaitement.',
          ing: ['P:Saumon', 'E:Sirop d’érable', 'E:Moutarde de Dijon', 'F:Pommes de terre grelots', 'L:Brocoli'],
          kcal: 520,
        },
        D2A: {
          nom: 'Haricots aux légumes + pain',
          details:
            'Préparé une fois pour lundi et mardi.\n1 tasse de haricots cuits (175 g) avec tomate, oignon et carotte + crudités + 2 tranches de pain complet.',
          ing: ['F:Haricots', 'L:Tomates', 'L:Oignons', 'L:Carottes', 'F:Pain complet'],
          kcal: 480,
        },
        D2B: {
          nom: 'Soupe-repas poulet et orge',
          details:
            'Préparée une fois pour mercredi et jeudi.\n2 tasses par portion : poulet (120 g) + ¾ de tasse d’orge cuite (120 g) + carottes, céleri, oignon, bouillon réduit en sel + 1 tranche de pain complet.\nUn classique canadien qui tient longtemps au corps.',
          ing: [
            'P:Poulet',
            'F:Orge perlé',
            'L:Carottes',
            'L:Céleri',
            'L:Oignons',
            'E:Bouillon de poulet réduit en sel',
          ],
          kcal: 480,
        },
        D2C: {
          nom: 'Bol de riz au thon et légumes',
          details:
            'Préparé une fois pour vendredi et samedi.\n1 boîte de thon pâle égoutté (120 g) + 1 tasse de riz cuit (160 g) + concombre, carotte râpée, chou rouge + ¼ d’avocat + 1 c. à thé d’huile de sésame et jus de citron.\nThon pâle plutôt que blanc (germon) : moins de mercure.',
          ing: [
            'P:Thon pâle en conserve',
            'F:Riz',
            'L:Concombre',
            'L:Carottes',
            'L:Chou rouge',
            'E:Huile de sésame',
            'L:Citrons',
          ],
          kcal: 470,
        },
        D2D: {
          nom: 'Poulet grillé, épinards, taro',
          details: 'Poulet grillé (150 g) + épinards sautés + 1 gros taro (environ 180 g cuit).',
          ing: ['P:Poulet', 'L:Épinards', 'F:Taro'],
          kcal: 510,
        },
      },
      plan: {
        1: ['P1', 'C1', 'D2A', 'C2', 'S2A'],
        2: ['P4', 'C1', 'D2A', 'C3', 'S2A'],
        3: ['P2', 'C1', 'D2B', 'C4', 'S2B'],
        4: ['P5', 'C1', 'D2B', 'C3', 'S2B'],
        5: ['P3', 'C1', 'D2C', 'C2', 'S2C'],
        6: ['P1', 'C1', 'D2C', 'C3', 'S2C'],
        7: ['P4', 'C1', 'D2D', 'C4', 'S2D'],
      },
    },
    {
      startDate: '2026-11-23',
      label: 'Menus semaine 3',
      rev: 2,
      meals: {
        P1: {
          nom: 'Salade + sardines + œuf',
          details:
            'Salade composée (laitue, chou rouge, tomate, concombre, carotte, oignon, ail, épices), environ 2 tasses + vinaigrette 1 c. à soupe d’huile + vinaigre.\n1 boîte de sardines égouttées + 1 œuf + 1 tranche de pain complet.\nMayo : 1 c. à thé maximum.',
          ing: [
            'L:Laitue',
            'L:Chou rouge',
            'L:Tomates',
            'L:Concombre',
            'L:Carottes',
            'L:Oignons',
            'L:Ail',
            'E:Vinaigre',
            'E:Huile végétale',
            'P:Sardines en boîte',
            'O:Œufs',
            'F:Pain complet',
          ],
          kcal: 570,
        },
        P2: {
          nom: 'Salade + œufs, avocat, fromage',
          details:
            'Salade composée, environ 2 tasses + vinaigrette 1 c. à soupe d’huile + vinaigre.\n2 œufs + ¼ d’avocat + 30 g de fromage + 1 tranche de pain complet.',
          ing: [
            'L:Laitue',
            'L:Chou rouge',
            'L:Tomates',
            'L:Concombre',
            'L:Carottes',
            'L:Oignons',
            'L:Ail',
            'E:Vinaigre',
            'E:Huile végétale',
            'O:Œufs',
            'L:Avocats',
            'O:Fromage',
            'F:Pain complet',
          ],
          kcal: 570,
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
          ing: [
            'F:Flocons d’avoine',
            'O:Lait 1 %',
            'L:Petits fruits surgelés',
            'E:Graines de chia',
            'O:Œufs',
            'E:Cannelle',
          ],
          kcal: 450,
        },
        P5: {
          nom: 'Omelette aux légumes',
          details:
            'Omelette de 2 œufs avec épinards, poivron, oignon et tomate (1 c. à thé d’huile) + ¼ d’avocat + 1 tranche de pain complet + 1 fruit.',
          ing: ['O:Œufs', 'L:Épinards', 'L:Poivrons', 'L:Oignons', 'L:Tomates', 'F:Pain complet', 'L:Fruits'],
          kcal: 430,
        },
        C1: {
          nom: 'Fruit + amandes',
          details: '1 fruit entier (pas de jus) + 15 g d’amandes nature (environ 12).',
          ing: ['L:Fruits', 'E:Amandes nature'],
          kcal: 170,
        },
        C5: {
          nom: 'Mini-crêpes protéinées Flourish',
          details:
            '⅓ de tasse de mélange Flourish chocolat (38 g, une demi-portion) + eau selon l’emballage → 2 petites crêpes, poêle antiadhésive sans beurre.\nAvec ½ tasse de petits fruits. Pas de sirop.',
          ing: ['E:Mélange à crêpes protéiné Flourish', 'L:Petits fruits surgelés'],
          kcal: 175,
        },
        P6: {
          nom: 'Crêpes protéinées Flourish',
          details:
            '⅔ de tasse de mélange Flourish chocolat (75 g, 1 portion) + eau selon l’emballage → 3 ou 4 crêpes, poêle antiadhésive sans beurre (ou 1 c. à thé d’huile).\nGarniture : ½ banane en rondelles + ½ tasse de petits fruits. Pas de sirop ; 1 c. à thé de sirop d’érable au maximum si elle en veut.\nVérifier les calories sur le sac : la recette a changé selon les lots.',
          ing: ['E:Mélange à crêpes protéiné Flourish', 'L:Bananes', 'L:Petits fruits surgelés'],
          kcal: 365,
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
        C2: {
          nom: 'Whey + fruit',
          details:
            '1 dose de whey dans de l’eau ou du lait 1 % + 1 fruit.\nLe soir, seulement si faim et avant 21 h : un verre de lait ou un yaourt nature.',
          ing: ['E:Whey (sans caféine)', 'O:Lait 1 %', 'L:Fruits'],
          kcal: 200,
        },
        C3: {
          nom: 'Pouding de chia au yaourt',
          details:
            '1 c. à soupe rase de graines de chia (12 g) + ½ tasse de lait 1 % (125 ml) + ⅓ de tasse de yaourt grec nature 0 % ou 2 % (80 g) + 1 c. à thé de miel (7 g).\nMélanger le chia et le lait, laisser gonfler au frigo au moins 2 h (idéalement la veille), puis ajouter le yaourt et le miel.\nEnviron 200 kcal, 14 g de protéines et 5 g de fibres. Boire un verre d’eau avec.',
          ing: ['E:Graines de chia', 'O:Yaourt grec nature', 'O:Lait 1 %', 'E:Miel'],
          kcal: 200,
        },
        C4: {
          nom: 'Crudités, houmous et fromage',
          details:
            '1 tasse de crudités (carotte, concombre, poivron) + ¼ de tasse de houmous (60 g) + 1 bâtonnet de fromage (21 g).\nEnviron 230 kcal : une collation qui tient jusqu’au souper, contre la fringale de 17 h.',
          ing: ['L:Carottes', 'L:Concombre', 'L:Poivrons', 'E:Houmous', 'O:Bâtonnets de fromage'],
          kcal: 230,
        },
        S3A: {
          nom: 'Pâté chinois allégé',
          details:
            'Cuisiné une fois pour lundi et mardi.\nPar portion : dindon ou bœuf haché maigre (130 g) revenu avec oignon + ½ tasse de maïs en grains + purée moitié patate douce, moitié chou-fleur (1½ tasse), avec un peu de lait 1 % au lieu du beurre.\nAvec une salade verte. Le classique québécois, version légère.',
          ing: [
            'P:Dindon haché maigre',
            'L:Oignons',
            'F:Maïs surgelé',
            'F:Patates douces',
            'L:Chou-fleur',
            'O:Lait 1 %',
            'L:Laitue',
          ],
          kcal: 505,
        },
        S3B: {
          nom: 'Poisson braisé sauce tomate + plantain',
          details:
            'Cuisiné une fois pour mercredi et jeudi.\nTilapia ou maquereau (150 g), sauce tomate-oignons-poivrons-épinards, 1 c. à soupe d’huile par personne + ¾ de plantain bouilli (135 g).',
          ing: ['P:Tilapia ou maquereau', 'L:Tomates', 'L:Oignons', 'L:Poivrons', 'L:Épinards', 'F:Plantains'],
          kcal: 495,
        },
        S3C: {
          nom: 'Ragoût de bœuf aux légumes racines',
          details:
            'Cuisiné une fois pour vendredi et samedi.\nPar portion : bœuf maigre en cubes (130 g) mijoté avec carottes, navet, oignon, céleri + 1 pomme de terre moyenne (150 g), dans un bouillon réduit en sel avec thym et laurier + 1 tranche de pain complet.\nMijoté 1 h 30 : idéal pour cuisiner à l’avance.',
          ing: [
            'P:Bœuf maigre à ragoût',
            'L:Carottes',
            'L:Navet',
            'L:Oignons',
            'L:Céleri',
            'F:Pommes de terre',
            'E:Bouillon de bœuf réduit en sel',
            'E:Thym et laurier',
          ],
          kcal: 535,
        },
        S3D: {
          nom: 'Truite au four, riz et légumes',
          details:
            'Truite (150 g) au four avec citron et aneth + 1 tasse de riz cuit (160 g) + légumes rôtis (courgette, poivron).',
          ing: ['P:Truite', 'L:Citrons', 'E:Aneth', 'F:Riz', 'L:Courgettes', 'L:Poivrons'],
          kcal: 525,
        },
        D3A: {
          nom: 'Salade de lentilles et féta',
          details:
            'Préparée une fois pour lundi et mardi.\n1 tasse de lentilles cuites (200 g) + concombre, tomate, poivron, oignon rouge + 30 g de féta pasteurisée + vinaigrette 1 c. à soupe d’huile d’olive + citron + 1 tranche de pain complet.',
          ing: [
            'F:Lentilles',
            'L:Concombre',
            'L:Tomates',
            'L:Poivrons',
            'L:Oignons rouges',
            'O:Féta',
            'E:Huile d’olive',
            'L:Citrons',
          ],
          kcal: 550,
        },
        D3B: {
          nom: 'Wrap au poulet et crudités',
          details:
            'Préparé une fois pour mercredi et jeudi (garniture au frigo, wrap roulé le jour même).\n1 tortilla de blé entier (25 cm) + poulet (120 g) + laitue, tomate, carotte râpée + 1 c. à soupe de houmous.\nAvec 1 fruit.',
          ing: ['F:Tortillas de blé entier', 'P:Poulet', 'L:Laitue', 'L:Tomates', 'L:Carottes', 'E:Houmous'],
          kcal: 535,
        },
        D3C: {
          nom: 'Sardines, épinards sautés, taro',
          details:
            'Sardines grillées ou en boîte égouttées (130 g) + épinards sautés à l’ail + 1 gros taro (180 g cuit).',
          ing: ['P:Sardines', 'L:Épinards', 'L:Ail', 'F:Taro'],
          kcal: 520,
        },
        D3D: {
          nom: 'Soupe aux pois maison allégée',
          details:
            '1½ tasse de soupe aux pois cassés jaunes (sans lard ; 30 g de jambon maigre facultatif) avec carottes, oignon, céleri + 2 tranches de pain complet.\nLa recette traditionnelle québécoise, riche en fibres et en protéines.',
          ing: ['F:Pois cassés jaunes', 'L:Carottes', 'L:Oignons', 'L:Céleri', 'P:Jambon maigre', 'F:Pain complet'],
          kcal: 470,
        },
      },
      plan: {
        1: ['P2', 'C1', 'D3A', 'C2', 'S3A'],
        2: ['P4', 'C1', 'D3A', 'C3', 'S3A'],
        3: ['P1', 'C1', 'D3B', 'C4', 'S3B'],
        4: ['P5', 'C1', 'D3B', 'C3', 'S3B'],
        5: ['P3', 'C1', 'D3C', 'C2', 'S3C'],
        6: ['P2', 'C1', 'D3C', 'C3', 'S3C'],
        7: ['P4', 'C1', 'D3D', 'C4', 'S3D'],
      },
    },
    {
      startDate: '2026-11-30',
      label: 'Menus semaine 4',
      rev: 2,
      meals: {
        P1: {
          nom: 'Salade + sardines + œuf',
          details:
            'Salade composée (laitue, chou rouge, tomate, concombre, carotte, oignon, ail, épices), environ 2 tasses + vinaigrette 1 c. à soupe d’huile + vinaigre.\n1 boîte de sardines égouttées + 1 œuf + 1 tranche de pain complet.\nMayo : 1 c. à thé maximum.',
          ing: [
            'L:Laitue',
            'L:Chou rouge',
            'L:Tomates',
            'L:Concombre',
            'L:Carottes',
            'L:Oignons',
            'L:Ail',
            'E:Vinaigre',
            'E:Huile végétale',
            'P:Sardines en boîte',
            'O:Œufs',
            'F:Pain complet',
          ],
          kcal: 570,
        },
        P2: {
          nom: 'Salade + œufs, avocat, fromage',
          details:
            'Salade composée, environ 2 tasses + vinaigrette 1 c. à soupe d’huile + vinaigre.\n2 œufs + ¼ d’avocat + 30 g de fromage + 1 tranche de pain complet.',
          ing: [
            'L:Laitue',
            'L:Chou rouge',
            'L:Tomates',
            'L:Concombre',
            'L:Carottes',
            'L:Oignons',
            'L:Ail',
            'E:Vinaigre',
            'E:Huile végétale',
            'O:Œufs',
            'L:Avocats',
            'O:Fromage',
            'F:Pain complet',
          ],
          kcal: 570,
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
          ing: [
            'F:Flocons d’avoine',
            'O:Lait 1 %',
            'L:Petits fruits surgelés',
            'E:Graines de chia',
            'O:Œufs',
            'E:Cannelle',
          ],
          kcal: 450,
        },
        P5: {
          nom: 'Omelette aux légumes',
          details:
            'Omelette de 2 œufs avec épinards, poivron, oignon et tomate (1 c. à thé d’huile) + ¼ d’avocat + 1 tranche de pain complet + 1 fruit.',
          ing: ['O:Œufs', 'L:Épinards', 'L:Poivrons', 'L:Oignons', 'L:Tomates', 'F:Pain complet', 'L:Fruits'],
          kcal: 430,
        },
        C1: {
          nom: 'Fruit + amandes',
          details: '1 fruit entier (pas de jus) + 15 g d’amandes nature (environ 12).',
          ing: ['L:Fruits', 'E:Amandes nature'],
          kcal: 170,
        },
        C5: {
          nom: 'Mini-crêpes protéinées Flourish',
          details:
            '⅓ de tasse de mélange Flourish chocolat (38 g, une demi-portion) + eau selon l’emballage → 2 petites crêpes, poêle antiadhésive sans beurre.\nAvec ½ tasse de petits fruits. Pas de sirop.',
          ing: ['E:Mélange à crêpes protéiné Flourish', 'L:Petits fruits surgelés'],
          kcal: 175,
        },
        P6: {
          nom: 'Crêpes protéinées Flourish',
          details:
            '⅔ de tasse de mélange Flourish chocolat (75 g, 1 portion) + eau selon l’emballage → 3 ou 4 crêpes, poêle antiadhésive sans beurre (ou 1 c. à thé d’huile).\nGarniture : ½ banane en rondelles + ½ tasse de petits fruits. Pas de sirop ; 1 c. à thé de sirop d’érable au maximum si elle en veut.\nVérifier les calories sur le sac : la recette a changé selon les lots.',
          ing: ['E:Mélange à crêpes protéiné Flourish', 'L:Bananes', 'L:Petits fruits surgelés'],
          kcal: 365,
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
        C2: {
          nom: 'Whey + fruit',
          details:
            '1 dose de whey dans de l’eau ou du lait 1 % + 1 fruit.\nLe soir, seulement si faim et avant 21 h : un verre de lait ou un yaourt nature.',
          ing: ['E:Whey (sans caféine)', 'O:Lait 1 %', 'L:Fruits'],
          kcal: 200,
        },
        C3: {
          nom: 'Pouding de chia au yaourt',
          details:
            '1 c. à soupe rase de graines de chia (12 g) + ½ tasse de lait 1 % (125 ml) + ⅓ de tasse de yaourt grec nature 0 % ou 2 % (80 g) + 1 c. à thé de miel (7 g).\nMélanger le chia et le lait, laisser gonfler au frigo au moins 2 h (idéalement la veille), puis ajouter le yaourt et le miel.\nEnviron 200 kcal, 14 g de protéines et 5 g de fibres. Boire un verre d’eau avec.',
          ing: ['E:Graines de chia', 'O:Yaourt grec nature', 'O:Lait 1 %', 'E:Miel'],
          kcal: 200,
        },
        C4: {
          nom: 'Crudités, houmous et fromage',
          details:
            '1 tasse de crudités (carotte, concombre, poivron) + ¼ de tasse de houmous (60 g) + 1 bâtonnet de fromage (21 g).\nEnviron 230 kcal : une collation qui tient jusqu’au souper, contre la fringale de 17 h.',
          ing: ['L:Carottes', 'L:Concombre', 'L:Poivrons', 'E:Houmous', 'O:Bâtonnets de fromage'],
          kcal: 230,
        },
        S4A: {
          nom: 'Poulet DG allégé',
          details:
            'Cuisiné une fois pour lundi et mardi.\nPar portion : poulet sans peau (150 g) + carottes, haricots verts, poivrons, oignon + ¾ de plantain mûr cuit au four (135 g) au lieu de frit. 1 c. à soupe d’huile par personne pour toute la sauce.',
          ing: ['P:Poulet', 'L:Carottes', 'L:Haricots verts', 'L:Poivrons', 'L:Oignons', 'F:Plantains'],
          kcal: 595,
        },
        S4B: {
          nom: 'Mijoté de pois chiches et épinards au cari',
          details:
            'Cuisiné une fois pour mercredi et jeudi.\nPar portion : ¾ de tasse de pois chiches (125 g) + épinards, tomates, oignon, cari et lait de coco léger (¼ de tasse) + ¾ de tasse de riz cuit (120 g).',
          ing: [
            'F:Pois chiches en conserve',
            'L:Épinards',
            'L:Tomates en dés (conserve)',
            'L:Oignons',
            'E:Cari en poudre',
            'E:Lait de coco léger',
            'F:Riz',
          ],
          kcal: 490,
        },
        S4C: {
          nom: 'Saumon au four, quinoa et légumes',
          details:
            'Cuisiné une fois pour vendredi et samedi (saumon cuit la veille, réchauffé doucement ou servi froid).\nSaumon (150 g) + ¾ de tasse de quinoa cuit (135 g) + légumes rôtis (brocoli, carotte, oignon rouge).',
          ing: ['P:Saumon', 'F:Quinoa', 'L:Brocoli', 'L:Carottes', 'L:Oignons rouges'],
          kcal: 545,
        },
        S4D: {
          nom: 'Soupe-repas bœuf et légumes',
          details:
            '2 tasses : bœuf haché maigre (120 g) + chou, carottes, céleri, tomates en dés + 1 tasse de pâtes courtes cuites (140 g).',
          ing: [
            'P:Bœuf haché maigre',
            'L:Chou vert',
            'L:Carottes',
            'L:Céleri',
            'L:Tomates en dés (conserve)',
            'F:Pâtes courtes',
          ],
          kcal: 530,
        },
        D4A: {
          nom: 'Bol méditerranéen',
          details:
            'Préparé une fois pour lundi et mardi.\nPoulet (130 g) + ½ tasse de pois chiches cuits (80 g) + ¾ de tasse de couscous de blé entier cuit (135 g) + crudités + 1 c. à thé d’huile d’olive.',
          ing: [
            'P:Poulet',
            'F:Pois chiches en conserve',
            'F:Couscous de blé entier',
            'L:Concombre',
            'L:Tomates',
            'E:Huile d’olive',
          ],
          kcal: 555,
        },
        D4B: {
          nom: 'Pâtes complètes thon-tomate',
          details:
            'Préparées une fois pour mercredi et jeudi.\n1 tasse de pâtes de blé entier cuites (140 g) + 1 boîte de thon pâle (120 g) + sauce tomate maison (tomates, ail, oignon) + légumes (courgette, poivron).\nAvec 1 fruit.',
          ing: [
            'F:Pâtes de blé entier',
            'P:Thon pâle en conserve',
            'L:Tomates en dés (conserve)',
            'L:Ail',
            'L:Oignons',
            'L:Courgettes',
            'L:Poivrons',
          ],
          kcal: 520,
        },
        D4C: {
          nom: 'Poulet grillé, gombo sauté',
          details:
            'Préparé une fois pour vendredi et samedi.\nPoulet grillé (150 g) + gombo sauté + 3 petites pommes de terre bouillies (225 g en tout).',
          ing: ['P:Poulet', 'L:Gombo', 'F:Pommes de terre'],
          kcal: 500,
        },
        D4D: {
          nom: 'Œufs brouillés aux légumes',
          details: '3 œufs brouillés avec épinards, champignons et tomate + 2 tranches de pain complet + crudités.',
          ing: ['O:Œufs', 'L:Épinards', 'L:Champignons', 'L:Tomates', 'F:Pain complet'],
          kcal: 440,
        },
      },
      plan: {
        1: ['P1', 'C1', 'D4A', 'C2', 'S4A'],
        2: ['P5', 'C1', 'D4A', 'C3', 'S4A'],
        3: ['P2', 'C1', 'D4B', 'C4', 'S4B'],
        4: ['P4', 'C1', 'D4B', 'C3', 'S4B'],
        5: ['P3', 'C1', 'D4C', 'C2', 'S4C'],
        6: ['P5', 'C1', 'D4C', 'C3', 'S4C'],
        7: ['P4', 'C1', 'D4D', 'C4', 'S4D'],
      },
    },
    {
      startDate: '2026-12-07',
      label: 'Menus semaine 5',
      rev: 2,
      meals: {
        P1: {
          nom: 'Salade + sardines + œuf',
          details:
            'Salade composée (laitue, chou rouge, tomate, concombre, carotte, oignon, ail, épices), environ 2 tasses + vinaigrette 1 c. à soupe d’huile + vinaigre.\n1 boîte de sardines égouttées + 1 œuf + 1 tranche de pain complet.\nMayo : 1 c. à thé maximum.',
          ing: [
            'L:Laitue',
            'L:Chou rouge',
            'L:Tomates',
            'L:Concombre',
            'L:Carottes',
            'L:Oignons',
            'L:Ail',
            'E:Vinaigre',
            'E:Huile végétale',
            'P:Sardines en boîte',
            'O:Œufs',
            'F:Pain complet',
          ],
          kcal: 570,
        },
        P2: {
          nom: 'Salade + œufs, avocat, fromage',
          details:
            'Salade composée, environ 2 tasses + vinaigrette 1 c. à soupe d’huile + vinaigre.\n2 œufs + ¼ d’avocat + 30 g de fromage + 1 tranche de pain complet.',
          ing: [
            'L:Laitue',
            'L:Chou rouge',
            'L:Tomates',
            'L:Concombre',
            'L:Carottes',
            'L:Oignons',
            'L:Ail',
            'E:Vinaigre',
            'E:Huile végétale',
            'O:Œufs',
            'L:Avocats',
            'O:Fromage',
            'F:Pain complet',
          ],
          kcal: 570,
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
          ing: [
            'F:Flocons d’avoine',
            'O:Lait 1 %',
            'L:Petits fruits surgelés',
            'E:Graines de chia',
            'O:Œufs',
            'E:Cannelle',
          ],
          kcal: 450,
        },
        P5: {
          nom: 'Omelette aux légumes',
          details:
            'Omelette de 2 œufs avec épinards, poivron, oignon et tomate (1 c. à thé d’huile) + ¼ d’avocat + 1 tranche de pain complet + 1 fruit.',
          ing: ['O:Œufs', 'L:Épinards', 'L:Poivrons', 'L:Oignons', 'L:Tomates', 'F:Pain complet', 'L:Fruits'],
          kcal: 430,
        },
        C1: {
          nom: 'Fruit + amandes',
          details: '1 fruit entier (pas de jus) + 15 g d’amandes nature (environ 12).',
          ing: ['L:Fruits', 'E:Amandes nature'],
          kcal: 170,
        },
        C5: {
          nom: 'Mini-crêpes protéinées Flourish',
          details:
            '⅓ de tasse de mélange Flourish chocolat (38 g, une demi-portion) + eau selon l’emballage → 2 petites crêpes, poêle antiadhésive sans beurre.\nAvec ½ tasse de petits fruits. Pas de sirop.',
          ing: ['E:Mélange à crêpes protéiné Flourish', 'L:Petits fruits surgelés'],
          kcal: 175,
        },
        P6: {
          nom: 'Crêpes protéinées Flourish',
          details:
            '⅔ de tasse de mélange Flourish chocolat (75 g, 1 portion) + eau selon l’emballage → 3 ou 4 crêpes, poêle antiadhésive sans beurre (ou 1 c. à thé d’huile).\nGarniture : ½ banane en rondelles + ½ tasse de petits fruits. Pas de sirop ; 1 c. à thé de sirop d’érable au maximum si elle en veut.\nVérifier les calories sur le sac : la recette a changé selon les lots.',
          ing: ['E:Mélange à crêpes protéiné Flourish', 'L:Bananes', 'L:Petits fruits surgelés'],
          kcal: 365,
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
        C2: {
          nom: 'Whey + fruit',
          details:
            '1 dose de whey dans de l’eau ou du lait 1 % + 1 fruit.\nLe soir, seulement si faim et avant 21 h : un verre de lait ou un yaourt nature.',
          ing: ['E:Whey (sans caféine)', 'O:Lait 1 %', 'L:Fruits'],
          kcal: 200,
        },
        C3: {
          nom: 'Pouding de chia au yaourt',
          details:
            '1 c. à soupe rase de graines de chia (12 g) + ½ tasse de lait 1 % (125 ml) + ⅓ de tasse de yaourt grec nature 0 % ou 2 % (80 g) + 1 c. à thé de miel (7 g).\nMélanger le chia et le lait, laisser gonfler au frigo au moins 2 h (idéalement la veille), puis ajouter le yaourt et le miel.\nEnviron 200 kcal, 14 g de protéines et 5 g de fibres. Boire un verre d’eau avec.',
          ing: ['E:Graines de chia', 'O:Yaourt grec nature', 'O:Lait 1 %', 'E:Miel'],
          kcal: 200,
        },
        C4: {
          nom: 'Crudités, houmous et fromage',
          details:
            '1 tasse de crudités (carotte, concombre, poivron) + ¼ de tasse de houmous (60 g) + 1 bâtonnet de fromage (21 g).\nEnviron 230 kcal : une collation qui tient jusqu’au souper, contre la fringale de 17 h.',
          ing: ['L:Carottes', 'L:Concombre', 'L:Poivrons', 'E:Houmous', 'O:Bâtonnets de fromage'],
          kcal: 230,
        },
        S5A: {
          nom: 'Ragoût de poulet et légumes',
          details:
            'Cuisiné une fois pour lundi et mardi.\nPar portion : poulet sans peau (150 g) mijoté avec carottes, céleri, oignon, petits pois + 1 pomme de terre moyenne (150 g), bouillon réduit en sel et thym.\nInspiré du fricot acadien.',
          ing: [
            'P:Poulet',
            'L:Carottes',
            'L:Céleri',
            'L:Oignons',
            'F:Petits pois surgelés',
            'F:Pommes de terre',
            'E:Bouillon de poulet réduit en sel',
            'E:Thym et laurier',
          ],
          kcal: 495,
        },
        S5B: {
          nom: 'Sauce arachide allégée au poulet',
          details:
            'Cuisiné une fois pour mercredi et jeudi.\nPar portion : poulet (130 g) + sauce tomate-oignon avec 1 c. à soupe de pâte d’arachide naturelle par personne (au lieu de la sauce épaisse habituelle) + épinards + ¾ de plantain bouilli (135 g).',
          ing: ['P:Poulet', 'E:Pâte d’arachide naturelle', 'L:Tomates', 'L:Oignons', 'L:Épinards', 'F:Plantains'],
          kcal: 535,
        },
        S5C: {
          nom: 'Chili au dindon et haricots rouges',
          details:
            'Cuisiné une fois pour vendredi et samedi.\n2 tasses : dindon haché maigre (130 g) + ¾ de tasse de haricots rouges (135 g) + tomates, poivrons, oignon, ¼ de tasse de maïs. Avec une salade verte, sans riz.',
          ing: [
            'P:Dindon haché maigre',
            'F:Haricots rouges en conserve',
            'L:Tomates en dés (conserve)',
            'L:Poivrons',
            'L:Oignons',
            'F:Maïs surgelé',
            'E:Cumin',
            'E:Chili en poudre',
            'L:Laitue',
          ],
          kcal: 555,
        },
        S5D: {
          nom: 'Saumon érable-moutarde au four',
          details:
            'Saumon (150 g) + 1 c. à thé de sirop d’érable + 1 c. à thé de moutarde de Dijon + pommes de terre grelots (200 g) + haricots verts.',
          ing: ['P:Saumon', 'E:Sirop d’érable', 'E:Moutarde de Dijon', 'F:Pommes de terre grelots', 'L:Haricots verts'],
          kcal: 520,
        },
        D5A: {
          nom: 'Curry de lentilles + riz',
          details:
            'Préparé une fois pour lundi et mardi.\n1 tasse de lentilles cuites (200 g) en curry de légumes + ¾ de tasse de riz cuit (120 g) + ½ tasse de yaourt nature à côté.',
          ing: ['F:Lentilles', 'F:Riz', 'L:Oignons', 'L:Tomates', 'E:Cari en poudre'],
          kcal: 515,
        },
        D5B: {
          nom: 'Soupe-repas poulet et orge',
          details:
            'Préparée une fois pour mercredi et jeudi.\n2 tasses : poulet (120 g) + ¾ de tasse d’orge cuite (120 g) + carottes, céleri, oignon + 1 tranche de pain complet.',
          ing: [
            'P:Poulet',
            'F:Orge perlé',
            'L:Carottes',
            'L:Céleri',
            'L:Oignons',
            'E:Bouillon de poulet réduit en sel',
          ],
          kcal: 480,
        },
        D5C: {
          nom: 'Maquereau grillé, épinards, taro',
          details:
            'Préparé une fois pour vendredi et samedi.\nMaquereau grillé (150 g) + épinards sautés + 1 gros taro (180 g cuit).',
          ing: ['P:Maquereau', 'L:Épinards', 'F:Taro'],
          kcal: 570,
        },
        D5D: {
          nom: 'Haricots aux légumes + pain',
          details:
            '1 tasse de haricots cuits (175 g) avec tomate, oignon, carotte + crudités + 2 tranches de pain complet.',
          ing: ['F:Haricots', 'L:Tomates', 'L:Oignons', 'L:Carottes', 'F:Pain complet'],
          kcal: 480,
        },
      },
      plan: {
        1: ['P4', 'C1', 'D5A', 'C2', 'S5A'],
        2: ['P1', 'C1', 'D5A', 'C3', 'S5A'],
        3: ['P5', 'C1', 'D5B', 'C4', 'S5B'],
        4: ['P2', 'C1', 'D5B', 'C3', 'S5B'],
        5: ['P3', 'C1', 'D5C', 'C2', 'S5C'],
        6: ['P4', 'C1', 'D5C', 'C3', 'S5C'],
        7: ['P1', 'C1', 'D5D', 'C4', 'S5D'],
      },
    },
  ],
};
