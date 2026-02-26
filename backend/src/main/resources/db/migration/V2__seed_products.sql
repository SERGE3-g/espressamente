-- ============================================
-- Espressamente - Seed Prodotti
-- 20 prodotti realistici distribuiti su
-- tutte le categorie e brand
-- ============================================

-- ── 1. Vergnano Espresso Classico 1kg ──
INSERT INTO products (name, slug, short_description, description, product_type, price, category_id, brand_id, images, features, is_featured, is_active, sort_order, meta_title, meta_description)
VALUES (
    'Vergnano Espresso Classico 1kg',
    'vergnano-espresso-classico-1kg',
    'Miscela classica di caffè in grani, equilibrata e corposa. Ideale per macchine espresso.',
    '<p>Il <strong>Caffè Vergnano Espresso Classico</strong> è una miscela raffinata di chicchi Arabica e Robusta, tostati lentamente secondo la tradizione piemontese dal 1882.</p><p>Note di cioccolato fondente e nocciola tostata, con un corpo pieno e una crema densa color nocciola. Perfetto per chi cerca l''espresso italiano autentico.</p><ul><li>Tostatura media-scura</li><li>Intensità 7/10</li><li>Confezione salvaroma da 1kg</li></ul>',
    'CAFFE',
    18.90,
    (SELECT id FROM categories WHERE slug = 'caffe-in-grani'),
    (SELECT id FROM brands WHERE slug = 'caffe-vergnano'),
    '["https://placehold.co/800x800/F5F0EB/6B5B4E?text=Vergnano+Classico"]'::jsonb,
    '[{"label":"Peso","value":"1 kg"},{"label":"Tostatura","value":"Media-scura"},{"label":"Miscela","value":"Arabica/Robusta"},{"label":"Intensità","value":"7/10"},{"label":"Origine","value":"Blend Sud America / Asia"}]'::jsonb,
    TRUE, TRUE, 1,
    'Caffè Vergnano Espresso Classico 1kg | Espressamente',
    'Miscela classica Vergnano in grani da 1kg. Tostatura media-scura, note di cioccolato e nocciola. Acquista online su Espressamente.'
);

-- ── 2. Vergnano Gran Aroma 1kg ──
INSERT INTO products (name, slug, short_description, description, product_type, price, category_id, brand_id, images, features, is_featured, is_active, sort_order, meta_title, meta_description)
VALUES (
    'Vergnano Gran Aroma 1kg',
    'vergnano-gran-aroma-1kg',
    'Caffè in grani 100% Arabica con note floreali e fruttate. Elegante e profumato.',
    '<p>Il <strong>Gran Aroma</strong> di Caffè Vergnano è una selezione pregiata di <em>100% Arabica</em> provenienti dalle migliori piantagioni di Centro e Sud America.</p><p>Profilo aromatico complesso con note di fiori bianchi, frutti rossi e un finale di miele. Acidità vivace e corpo medio, ideale per chi apprezza un espresso delicato ma caratteristico.</p>',
    'CAFFE',
    24.50,
    (SELECT id FROM categories WHERE slug = 'caffe-in-grani'),
    (SELECT id FROM brands WHERE slug = 'caffe-vergnano'),
    '["https://placehold.co/800x800/F5F0EB/6B5B4E?text=Vergnano+Gran+Aroma"]'::jsonb,
    '[{"label":"Peso","value":"1 kg"},{"label":"Tostatura","value":"Media"},{"label":"Miscela","value":"100% Arabica"},{"label":"Intensità","value":"6/10"},{"label":"Origine","value":"Centro e Sud America"}]'::jsonb,
    TRUE, TRUE, 2,
    'Caffè Vergnano Gran Aroma 1kg 100% Arabica | Espressamente',
    'Caffè Vergnano Gran Aroma 100% Arabica in grani. Note floreali e fruttate per un espresso elegante.'
);

-- ── 3. Lavazza Qualità Oro 1kg ──
INSERT INTO products (name, slug, short_description, description, product_type, price, category_id, brand_id, images, features, is_featured, is_active, sort_order, meta_title, meta_description)
VALUES (
    'Lavazza Qualità Oro 1kg',
    'lavazza-qualita-oro-1kg',
    'La miscela storica Lavazza, 100% Arabica dal gusto ricco e aromatico.',
    '<p><strong>Lavazza Qualità Oro</strong> è la miscela iconica nata nel 1956, una selezione di pregiate Arabica brasiliane e centroamericane.</p><p>Gusto pieno e avvolgente con note di malto, miele e un leggero sentore di frutta secca. La crema è compatta e persistente. Da oltre 60 anni, il punto di riferimento per l''espresso italiano a casa.</p>',
    'CAFFE',
    22.90,
    (SELECT id FROM categories WHERE slug = 'caffe-in-grani'),
    (SELECT id FROM brands WHERE slug = 'lavazza'),
    '["https://placehold.co/800x800/F5F0EB/6B5B4E?text=Lavazza+Qualita+Oro"]'::jsonb,
    '[{"label":"Peso","value":"1 kg"},{"label":"Tostatura","value":"Media"},{"label":"Miscela","value":"100% Arabica"},{"label":"Intensità","value":"5/10"},{"label":"Origine","value":"Brasile / Centro America"}]'::jsonb,
    TRUE, TRUE, 3,
    'Lavazza Qualità Oro 1kg | Espressamente',
    'Lavazza Qualità Oro in grani 100% Arabica. La miscela storica dal gusto ricco e aromatico. Acquista online.'
);

-- ── 4. Lavazza Crema e Gusto 1kg ──
INSERT INTO products (name, slug, short_description, description, product_type, price, category_id, brand_id, images, features, is_featured, is_active, sort_order, meta_title, meta_description)
VALUES (
    'Lavazza Crema e Gusto 1kg',
    'lavazza-crema-e-gusto-1kg',
    'Miscela forte e decisa, blend di Arabica e Robusta. Crema ricca e gusto intenso.',
    '<p><strong>Lavazza Crema e Gusto</strong> è la miscela pensata per chi ama il caffè dal carattere forte e deciso. Un blend sapientemente bilanciato di Arabica e Robusta selezionate.</p><p>Corpo pieno con note di cacao amaro e spezie. La Robusta conferisce una crema densa e persistente, mentre l''Arabica apporta complessità aromatica. Ottimo rapporto qualità-prezzo.</p>',
    'CAFFE',
    16.50,
    (SELECT id FROM categories WHERE slug = 'caffe-in-grani'),
    (SELECT id FROM brands WHERE slug = 'lavazza'),
    '["https://placehold.co/800x800/F5F0EB/6B5B4E?text=Lavazza+Crema+e+Gusto"]'::jsonb,
    '[{"label":"Peso","value":"1 kg"},{"label":"Tostatura","value":"Scura"},{"label":"Miscela","value":"Arabica/Robusta"},{"label":"Intensità","value":"8/10"},{"label":"Origine","value":"Brasile / Vietnam / India"}]'::jsonb,
    FALSE, TRUE, 4,
    'Lavazza Crema e Gusto 1kg | Espressamente',
    'Lavazza Crema e Gusto in grani. Miscela forte e corposa, ideale per espresso intenso con crema ricca.'
);

-- ── 5. Vergnano Moka Antica Bottega 250g ──
INSERT INTO products (name, slug, short_description, description, product_type, price, category_id, brand_id, images, features, is_featured, is_active, sort_order, meta_title, meta_description)
VALUES (
    'Vergnano Moka Antica Bottega 250g',
    'vergnano-moka-antica-bottega-250g',
    'Caffè macinato per moka, macinatura perfetta per la caffettiera tradizionale italiana.',
    '<p>Il <strong>Moka Antica Bottega</strong> di Caffè Vergnano è macinato con granulometria studiata appositamente per la moka tradizionale italiana.</p><p>Miscela armoniosa con note di caramello e pane tostato. Il risultato in tazza è un caffè corposo ma mai amaro, con un retrogusto dolce e persistente. Confezionato sotto vuoto per preservare la freschezza.</p>',
    'CAFFE',
    5.90,
    (SELECT id FROM categories WHERE slug = 'caffe-macinato'),
    (SELECT id FROM brands WHERE slug = 'caffe-vergnano'),
    '["https://placehold.co/800x800/F5F0EB/6B5B4E?text=Vergnano+Moka"]'::jsonb,
    '[{"label":"Peso","value":"250 g"},{"label":"Macinatura","value":"Per moka"},{"label":"Miscela","value":"Arabica/Robusta"},{"label":"Intensità","value":"6/10"},{"label":"Confezionamento","value":"Sottovuoto"}]'::jsonb,
    FALSE, TRUE, 5,
    'Vergnano Moka Antica Bottega 250g | Espressamente',
    'Caffè Vergnano macinato per moka da 250g. Macinatura perfetta per la caffettiera tradizionale.'
);

-- ── 6. Lavazza Qualità Rossa 250g ──
INSERT INTO products (name, slug, short_description, description, product_type, price, category_id, brand_id, images, features, is_featured, is_active, sort_order, meta_title, meta_description)
VALUES (
    'Lavazza Qualità Rossa 250g',
    'lavazza-qualita-rossa-250g',
    'Caffè macinato versatile, ideale per moka ed espresso. Gusto bilanciato e corposo.',
    '<p><strong>Lavazza Qualità Rossa</strong> è la miscela versatile per eccellenza, adatta sia alla moka che alle macchine espresso con macinatura universale.</p><p>Blend di Arabica brasiliane e Robusta africane per un gusto rotondo, mai aggressivo. Note di cioccolato al latte e cereali. Il caffè di tutti i giorni che non delude mai.</p>',
    'CAFFE',
    4.50,
    (SELECT id FROM categories WHERE slug = 'caffe-macinato'),
    (SELECT id FROM brands WHERE slug = 'lavazza'),
    '["https://placehold.co/800x800/F5F0EB/6B5B4E?text=Lavazza+Qualita+Rossa"]'::jsonb,
    '[{"label":"Peso","value":"250 g"},{"label":"Macinatura","value":"Universale moka/espresso"},{"label":"Miscela","value":"Arabica/Robusta"},{"label":"Intensità","value":"5/10"},{"label":"Confezionamento","value":"Sottovuoto"}]'::jsonb,
    FALSE, TRUE, 6,
    'Lavazza Qualità Rossa 250g | Espressamente',
    'Lavazza Qualità Rossa macinato 250g. Miscela bilanciata per moka e espresso, gusto corposo.'
);

-- ── 7. Vergnano Cialde ESE 18pz ──
INSERT INTO products (name, slug, short_description, description, product_type, price, category_id, brand_id, images, features, is_featured, is_active, sort_order, meta_title, meta_description)
VALUES (
    'Vergnano Cialde ESE 18pz',
    'vergnano-cialde-ese-18pz',
    'Cialde ESE 44mm in carta filtro compostabile. Espresso pratico e sostenibile.',
    '<p>Le <strong>Cialde ESE Vergnano</strong> racchiudono 7g di miscela pre-dosata in carta filtro naturale compostabile, per un espresso perfetto con zero sprechi.</p><p>Compatibili con tutte le macchine a cialde ESE 44mm. Ogni cialda è confezionata singolarmente in atmosfera protettiva per garantire massima freschezza. Miscela bilanciata con crema vellutata.</p>',
    'CAFFE',
    6.90,
    (SELECT id FROM categories WHERE slug = 'cialde-e-capsule'),
    (SELECT id FROM brands WHERE slug = 'caffe-vergnano'),
    '["https://placehold.co/800x800/F5F0EB/6B5B4E?text=Vergnano+Cialde+ESE"]'::jsonb,
    '[{"label":"Quantità","value":"18 cialde"},{"label":"Formato","value":"ESE 44mm"},{"label":"Dose","value":"7g per cialda"},{"label":"Compatibilità","value":"Tutte le macchine ESE"},{"label":"Materiale","value":"Carta filtro compostabile"}]'::jsonb,
    FALSE, TRUE, 7,
    'Vergnano Cialde ESE 18 pezzi | Espressamente',
    'Cialde ESE 44mm Caffè Vergnano, 18 pezzi. Carta filtro compostabile, espresso pratico e sostenibile.'
);

-- ── 8. Lavazza A Modo Mio 36 caps ──
INSERT INTO products (name, slug, short_description, description, product_type, price, category_id, brand_id, images, features, is_featured, is_active, sort_order, meta_title, meta_description)
VALUES (
    'Lavazza A Modo Mio 36 capsule',
    'lavazza-a-modo-mio-36-capsule',
    'Capsule Lavazza A Modo Mio, espresso cremoso in un gesto. Confezione da 36.',
    '<p>Le <strong>capsule Lavazza A Modo Mio</strong> sono progettate per il sistema proprietario Lavazza, garantendo estrazione ottimale e crema impeccabile ad ogni erogazione.</p><p>Miscela Crema e Gusto in formato capsula: corpo robusto, aroma intenso e una crema color nocciola che persiste in tazza. Maxi formato da 36 capsule per un consumo quotidiano conveniente.</p>',
    'CAFFE',
    12.90,
    (SELECT id FROM categories WHERE slug = 'cialde-e-capsule'),
    (SELECT id FROM brands WHERE slug = 'lavazza'),
    '["https://placehold.co/800x800/F5F0EB/6B5B4E?text=Lavazza+A+Modo+Mio"]'::jsonb,
    '[{"label":"Quantità","value":"36 capsule"},{"label":"Sistema","value":"A Modo Mio"},{"label":"Intensità","value":"8/10"},{"label":"Dose","value":"7.5g per capsula"},{"label":"Compatibilità","value":"Macchine Lavazza A Modo Mio"}]'::jsonb,
    FALSE, TRUE, 8,
    'Lavazza A Modo Mio 36 capsule | Espressamente',
    'Capsule Lavazza A Modo Mio confezione da 36. Espresso cremoso e intenso, sistema proprietario Lavazza.'
);

-- ── 9. La Marzocco Linea Mini ──
INSERT INTO products (name, slug, short_description, description, product_type, price, category_id, brand_id, images, features, is_featured, is_active, sort_order, meta_title, meta_description)
VALUES (
    'La Marzocco Linea Mini',
    'la-marzocco-linea-mini',
    'La leggendaria Linea in formato compatto per casa. Doppia caldaia, gruppo saturato.',
    '<p>La <strong>Linea Mini</strong> porta la tecnologia professionale La Marzocco direttamente a casa tua. Un capolavoro di ingegneria fiorentina in dimensioni compatte.</p><p>Dotata di <strong>doppia caldaia</strong> in acciaio inox e <strong>gruppo saturato</strong> per una stabilità termica senza paragoni. Display integrato, PID di serie e possibilità di collegamento via app per personalizzare ogni parametro di estrazione.</p><p>Disponibile nelle finiture classiche e in edizioni speciali.</p>',
    'MACCHINA',
    4490.00,
    (SELECT id FROM categories WHERE slug = 'macchine-espresso'),
    (SELECT id FROM brands WHERE slug = 'la-marzocco'),
    '["https://placehold.co/800x800/F5F0EB/6B5B4E?text=Linea+Mini"]'::jsonb,
    '[{"label":"Caldaie","value":"Doppia caldaia"},{"label":"Gruppo","value":"Saturato"},{"label":"Pompa","value":"Rotativa"},{"label":"Serbatoio","value":"2.5 litri"},{"label":"Potenza","value":"1600W"},{"label":"Dimensioni","value":"35.5 x 45.4 x 38.1 cm"},{"label":"Peso","value":"24.5 kg"},{"label":"Connettività","value":"App La Marzocco"}]'::jsonb,
    TRUE, TRUE, 9,
    'La Marzocco Linea Mini | Espressamente',
    'La Marzocco Linea Mini: doppia caldaia, gruppo saturato, tecnologia professionale per casa. Acquista online.'
);

-- ── 10. La Marzocco Linea Micra ──
INSERT INTO products (name, slug, short_description, description, product_type, price, category_id, brand_id, images, features, is_featured, is_active, sort_order, meta_title, meta_description)
VALUES (
    'La Marzocco Linea Micra',
    'la-marzocco-linea-micra',
    'L''espresso professionale nel formato più compatto di sempre. Design iconico, tecnologia completa.',
    '<p>La <strong>Linea Micra</strong> è la macchina più compatta mai creata da La Marzocco, pensata per spazi ridotti senza rinunciare alla qualità professionale.</p><p>Sistema termico a <strong>doppia caldaia</strong> con gruppo in acciaio inox, sistema di vapore autosteam integrato per una montatura del latte semplice e perfetta. Connessione Wi-Fi e controllo completo da app.</p><p>Disponibile in 6 colori esclusivi.</p>',
    'MACCHINA',
    3190.00,
    (SELECT id FROM categories WHERE slug = 'macchine-espresso'),
    (SELECT id FROM brands WHERE slug = 'la-marzocco'),
    '["https://placehold.co/800x800/F5F0EB/6B5B4E?text=Linea+Micra"]'::jsonb,
    '[{"label":"Caldaie","value":"Doppia caldaia"},{"label":"Gruppo","value":"Acciaio inox"},{"label":"Pompa","value":"Vibrante"},{"label":"Serbatoio","value":"1.5 litri"},{"label":"Potenza","value":"1450W"},{"label":"Dimensioni","value":"22.9 x 40.6 x 36.2 cm"},{"label":"Peso","value":"18 kg"},{"label":"Connettività","value":"Wi-Fi + App"}]'::jsonb,
    TRUE, TRUE, 10,
    'La Marzocco Linea Micra | Espressamente',
    'La Marzocco Linea Micra: la più compatta della famiglia. Doppia caldaia, Wi-Fi, 6 colori disponibili.'
);

-- ── 11. Rocket Appartamento ──
INSERT INTO products (name, slug, short_description, description, product_type, price, category_id, brand_id, images, features, is_featured, is_active, sort_order, meta_title, meta_description)
VALUES (
    'Rocket Appartamento',
    'rocket-appartamento',
    'Macchina espresso HX con scambiatore di calore, design compatto per la cucina moderna.',
    '<p>La <strong>Rocket Appartamento</strong> è pensata per chi vive in spazi compatti ma non vuole compromessi sulla qualità dell''espresso.</p><p>Scambiatore di calore in rame, caldaia da 1.8L in ottone cromato, carrozzeria in acciaio inox con pannelli laterali colorati intercambiabili. Il gruppo E61 garantisce stabilità termica e pre-infusione naturale.</p><p>Design vincitore del premio Red Dot Award.</p>',
    'MACCHINA',
    1690.00,
    (SELECT id FROM categories WHERE slug = 'macchine-espresso'),
    (SELECT id FROM brands WHERE slug = 'rocket-espresso'),
    '["https://placehold.co/800x800/F5F0EB/6B5B4E?text=Rocket+Appartamento"]'::jsonb,
    '[{"label":"Sistema","value":"Scambiatore di calore (HX)"},{"label":"Gruppo","value":"E61"},{"label":"Caldaia","value":"1.8L ottone cromato"},{"label":"Pompa","value":"Vibrante 15 bar"},{"label":"Serbatoio","value":"2.25 litri"},{"label":"Potenza","value":"1200W"},{"label":"Dimensioni","value":"27.4 x 42.5 x 36 cm"},{"label":"Peso","value":"20 kg"}]'::jsonb,
    TRUE, TRUE, 11,
    'Rocket Appartamento | Espressamente',
    'Rocket Appartamento: macchina espresso compatta con scambiatore di calore e gruppo E61. Design italiano premiato.'
);

-- ── 12. Rocket Mozzafiato Cronometro V ──
INSERT INTO products (name, slug, short_description, description, product_type, price, category_id, brand_id, images, features, is_featured, is_active, sort_order, meta_title, meta_description)
VALUES (
    'Rocket Mozzafiato Cronometro V',
    'rocket-mozzafiato-cronometro-v',
    'HX con timer shot integrato e PID. Per l''appassionato che vuole controllo totale.',
    '<p>La <strong>Mozzafiato Cronometro V</strong> rappresenta il top di gamma domestico Rocket Espresso. Scambiatore di calore evoluto con PID e timer shot integrati nel gruppo E61.</p><p>Caldaia in rame da 1.8L, pompa vibrante regolabile, manometro doppio per pressione caldaia e pompa. Carrozzeria in acciaio inox lucidato a specchio con pannelli laterali in legno di noce.</p>',
    'MACCHINA',
    2490.00,
    (SELECT id FROM categories WHERE slug = 'macchine-espresso'),
    (SELECT id FROM brands WHERE slug = 'rocket-espresso'),
    '["https://placehold.co/800x800/F5F0EB/6B5B4E?text=Rocket+Mozzafiato"]'::jsonb,
    '[{"label":"Sistema","value":"Scambiatore di calore (HX) + PID"},{"label":"Gruppo","value":"E61 con timer"},{"label":"Caldaia","value":"1.8L rame"},{"label":"Pompa","value":"Vibrante regolabile"},{"label":"Serbatoio","value":"2.5 litri"},{"label":"Potenza","value":"1350W"},{"label":"Dimensioni","value":"29 x 43 x 40 cm"},{"label":"Peso","value":"25 kg"}]'::jsonb,
    FALSE, TRUE, 12,
    'Rocket Mozzafiato Cronometro V | Espressamente',
    'Rocket Mozzafiato Cronometro V: HX con PID e timer shot. Il massimo per l''espresso domestico.'
);

-- ── 13. La Marzocco Linea Classic S 2GR ──
INSERT INTO products (name, slug, short_description, description, product_type, price, price_label, category_id, brand_id, images, features, is_featured, is_active, sort_order, meta_title, meta_description)
VALUES (
    'La Marzocco Linea Classic S 2GR',
    'la-marzocco-linea-classic-s-2gr',
    'La macchina professionale per eccellenza. Due gruppi, caldaia da 7 litri. Su richiesta.',
    '<p>La <strong>Linea Classic S</strong> è la macchina che ha definito lo standard dell''espresso professionale nel mondo. Due gruppi saturati, caldaia vapore da 7 litri e caldaia caffè dedicata per ogni gruppo.</p><p>Costruzione interamente in acciaio inox, sistema idraulico pre-infusione, display touchscreen per controllo parametri. La scelta di migliaia di bar specialty nel mondo.</p><p><em>Prezzo su richiesta — contattaci per un preventivo personalizzato.</em></p>',
    'MACCHINA',
    NULL,
    'Su richiesta',
    (SELECT id FROM categories WHERE slug = 'macchine-professionali'),
    (SELECT id FROM brands WHERE slug = 'la-marzocco'),
    '["https://placehold.co/800x800/F5F0EB/6B5B4E?text=Linea+Classic+S"]'::jsonb,
    '[{"label":"Gruppi","value":"2"},{"label":"Caldaia vapore","value":"7 litri"},{"label":"Sistema","value":"Doppia caldaia + gruppi saturati"},{"label":"Pre-infusione","value":"Idraulica"},{"label":"Display","value":"Touchscreen"},{"label":"Potenza","value":"3700W"},{"label":"Dimensioni","value":"71 x 56 x 43 cm"},{"label":"Peso","value":"62 kg"}]'::jsonb,
    FALSE, TRUE, 13,
    'La Marzocco Linea Classic S 2 Gruppi | Espressamente',
    'La Marzocco Linea Classic S a 2 gruppi. La macchina professionale di riferimento. Prezzo su richiesta.'
);

-- ── 14. Eureka Mignon Specialita ──
INSERT INTO products (name, slug, short_description, description, product_type, price, category_id, brand_id, images, features, is_featured, is_active, sort_order, meta_title, meta_description)
VALUES (
    'Eureka Mignon Specialita',
    'eureka-mignon-specialita',
    'Macinacaffè on-demand silenzioso con macine piatte 55mm. Il best-seller per home barista.',
    '<p>L''<strong>Eureka Mignon Specialita</strong> è il macinacaffè più amato dagli home barista di tutto il mondo. Macine piatte in acciaio temprato da 55mm con tecnologia ACE (Anti-Clump & Electrostaticity).</p><p>Motore DC a bassa velocità per preservare gli aromi, touch screen con timer programmabile e funzionamento on-demand. Livello di rumore tra i più bassi della categoria grazie alla tecnologia di insonorizzazione Eureka.</p>',
    'ACCESSORIO',
    399.00,
    (SELECT id FROM categories WHERE slug = 'macinacaffe'),
    (SELECT id FROM brands WHERE slug = 'eureka'),
    '["https://placehold.co/800x800/F5F0EB/6B5B4E?text=Eureka+Specialita"]'::jsonb,
    '[{"label":"Macine","value":"Piatte 55mm acciaio"},{"label":"Motore","value":"DC bassa velocità"},{"label":"Tramoggia","value":"300g"},{"label":"Regolazione","value":"Stepless micrometrica"},{"label":"Display","value":"Touch screen"},{"label":"Rumorosità","value":"<55 dB"},{"label":"Dimensioni","value":"12 x 18 x 35 cm"},{"label":"Peso","value":"5.5 kg"}]'::jsonb,
    TRUE, TRUE, 14,
    'Eureka Mignon Specialita | Espressamente',
    'Eureka Mignon Specialita: macinacaffè on-demand con macine 55mm, touch screen, tecnologia anti-clump.'
);

-- ── 15. Eureka Mignon Crono ──
INSERT INTO products (name, slug, short_description, description, product_type, price, category_id, brand_id, images, features, is_featured, is_active, sort_order, meta_title, meta_description)
VALUES (
    'Eureka Mignon Crono',
    'eureka-mignon-crono',
    'Entry-level della famiglia Mignon, macine 50mm. Ideale per iniziare con la macinatura fresca.',
    '<p>L''<strong>Eureka Mignon Crono</strong> è il punto di ingresso ideale nella famiglia Mignon, offrendo le stesse qualità costruttive in un formato ancora più accessibile.</p><p>Macine piatte da 50mm in acciaio, regolazione stepless e timer analogico per dose singola e doppia. Corpo in lega di alluminio pressofuso, disponibile in molteplici colorazioni.</p>',
    'ACCESSORIO',
    269.00,
    (SELECT id FROM categories WHERE slug = 'macinacaffe'),
    (SELECT id FROM brands WHERE slug = 'eureka'),
    '["https://placehold.co/800x800/F5F0EB/6B5B4E?text=Eureka+Crono"]'::jsonb,
    '[{"label":"Macine","value":"Piatte 50mm acciaio"},{"label":"Motore","value":"DC"},{"label":"Tramoggia","value":"300g"},{"label":"Regolazione","value":"Stepless"},{"label":"Timer","value":"Analogico singola/doppia"},{"label":"Dimensioni","value":"12 x 18 x 32 cm"},{"label":"Peso","value":"4.8 kg"}]'::jsonb,
    FALSE, TRUE, 15,
    'Eureka Mignon Crono | Espressamente',
    'Eureka Mignon Crono: macinacaffè entry-level con macine piatte 50mm. Qualità Eureka a prezzo accessibile.'
);

-- ── 16. Eureka Mignon Turbo 65mm ──
INSERT INTO products (name, slug, short_description, description, product_type, price, category_id, brand_id, images, features, is_featured, is_active, sort_order, meta_title, meta_description)
VALUES (
    'Eureka Mignon Turbo 65mm',
    'eureka-mignon-turbo-65mm',
    'Macinacaffè ad alte prestazioni con macine 65mm. Velocità professionale in formato compatto.',
    '<p>L''<strong>Eureka Mignon Turbo</strong> porta prestazioni professionali nel formato Mignon grazie alle macine piatte da 65mm, le più grandi della serie.</p><p>Macinatura ultra-rapida: meno di 8 secondi per una dose singola. Motore brushless ad alte prestazioni con regolazione elettronica della velocità. Ideale per chi cerca la velocità di un macinacaffè da bar in dimensioni domestiche.</p>',
    'ACCESSORIO',
    549.00,
    (SELECT id FROM categories WHERE slug = 'macinacaffe'),
    (SELECT id FROM brands WHERE slug = 'eureka'),
    '["https://placehold.co/800x800/F5F0EB/6B5B4E?text=Eureka+Turbo"]'::jsonb,
    '[{"label":"Macine","value":"Piatte 65mm acciaio"},{"label":"Motore","value":"Brushless ad alta velocità"},{"label":"Velocità","value":"<8 sec/dose"},{"label":"Tramoggia","value":"300g"},{"label":"Regolazione","value":"Stepless micrometrica"},{"label":"Display","value":"Touch screen"},{"label":"Dimensioni","value":"12.5 x 18 x 36 cm"},{"label":"Peso","value":"6.2 kg"}]'::jsonb,
    FALSE, TRUE, 16,
    'Eureka Mignon Turbo 65mm | Espressamente',
    'Eureka Mignon Turbo con macine 65mm: prestazioni professionali in formato compatto. Meno di 8 sec/dose.'
);

-- ── 17. Tamper La Marzocco 58.4mm ──
INSERT INTO products (name, slug, short_description, description, product_type, price, category_id, brand_id, images, features, is_featured, is_active, sort_order, meta_title, meta_description)
VALUES (
    'Tamper La Marzocco 58.4mm',
    'tamper-la-marzocco-58-4mm',
    'Tamper ufficiale La Marzocco in acciaio inox con impugnatura in legno di noce.',
    '<p>Il <strong>Tamper La Marzocco 58.4mm</strong> è l''accessorio ufficiale per i gruppi La Marzocco. Base piatta in acciaio inossidabile calibrata a 58.4mm per un fit perfetto nel portafiltro.</p><p>Impugnatura ergonomica in legno di noce naturale, peso bilanciato per una pressatura uniforme senza sforzo. Un oggetto bello da usare e da esporre.</p>',
    'ACCESSORIO',
    89.00,
    (SELECT id FROM categories WHERE slug = 'accessori'),
    (SELECT id FROM brands WHERE slug = 'la-marzocco'),
    '["https://placehold.co/800x800/F5F0EB/6B5B4E?text=Tamper+LM"]'::jsonb,
    '[{"label":"Diametro","value":"58.4 mm"},{"label":"Base","value":"Piatta, acciaio inox"},{"label":"Impugnatura","value":"Legno di noce"},{"label":"Peso","value":"350g"},{"label":"Compatibilità","value":"Portafiltri 58mm"}]'::jsonb,
    FALSE, TRUE, 17,
    'Tamper La Marzocco 58.4mm | Espressamente',
    'Tamper ufficiale La Marzocco 58.4mm. Acciaio inox e legno di noce per una pressatura perfetta.'
);

-- ── 18. Bricco Latte Rocket 350ml ──
INSERT INTO products (name, slug, short_description, description, product_type, price, category_id, brand_id, images, features, is_featured, is_active, sort_order, meta_title, meta_description)
VALUES (
    'Bricco Latte Rocket 350ml',
    'bricco-latte-rocket-350ml',
    'Bricco per latte art in acciaio inox 18/10, beccuccio di precisione. Ideale per cappuccino.',
    '<p>Il <strong>Bricco Rocket Espresso</strong> da 350ml è realizzato in acciaio inossidabile 18/10 con finitura satinata. Beccuccio affilato per latte art di precisione.</p><p>Formato da 350ml ideale per cappuccino singolo, interno calibrato con segni di livello. Manico ergonomico saldato con finitura liscia. Utilizzato dai baristi professionisti nei campionati di latte art.</p>',
    'ACCESSORIO',
    39.00,
    (SELECT id FROM categories WHERE slug = 'accessori'),
    (SELECT id FROM brands WHERE slug = 'rocket-espresso'),
    '["https://placehold.co/800x800/F5F0EB/6B5B4E?text=Bricco+Rocket"]'::jsonb,
    '[{"label":"Capacità","value":"350 ml"},{"label":"Materiale","value":"Acciaio inox 18/10"},{"label":"Finitura","value":"Satinata"},{"label":"Beccuccio","value":"Precisione latte art"},{"label":"Lavaggio","value":"Lavastoviglie"}]'::jsonb,
    FALSE, TRUE, 18,
    'Bricco Latte Rocket 350ml | Espressamente',
    'Bricco Rocket Espresso 350ml in acciaio inox per latte art. Beccuccio di precisione per cappuccino perfetto.'
);

-- ── 19. Set Tazzine Espressamente 6pz ──
INSERT INTO products (name, slug, short_description, description, product_type, price, category_id, brand_id, images, features, is_featured, is_active, sort_order, meta_title, meta_description)
VALUES (
    'Set Tazzine Espressamente 6pz',
    'set-tazzine-espressamente-6pz',
    'Set di 6 tazzine da espresso in porcellana con piattini. Design esclusivo Espressamente.',
    '<p>Il <strong>Set Tazzine Espressamente</strong> comprende 6 tazzine da espresso con piattini coordinati in porcellana bianca di alta qualità.</p><p>Forma classica a tulipano da 70ml, parete spessa per mantenere la temperatura. Logo Espressamente inciso in tono su tono. Confezionate in elegante scatola regalo, ideali come dono per gli amanti del caffè.</p>',
    'ACCESSORIO',
    45.00,
    (SELECT id FROM categories WHERE slug = 'accessori'),
    NULL,
    '["https://placehold.co/800x800/F5F0EB/6B5B4E?text=Tazzine+Espressamente"]'::jsonb,
    '[{"label":"Pezzi","value":"6 tazzine + 6 piattini"},{"label":"Materiale","value":"Porcellana"},{"label":"Capacità","value":"70 ml"},{"label":"Colore","value":"Bianco"},{"label":"Lavaggio","value":"Lavastoviglie e microonde"}]'::jsonb,
    FALSE, TRUE, 19,
    'Set Tazzine Espressamente 6 pezzi | Espressamente',
    'Set di 6 tazzine espresso in porcellana con piattini. Design esclusivo Espressamente, ideale come regalo.'
);

-- ── 20. Kit Pulizia Macchina Espresso ──
INSERT INTO products (name, slug, short_description, description, product_type, price, category_id, brand_id, images, features, is_featured, is_active, sort_order, meta_title, meta_description)
VALUES (
    'Kit Pulizia Macchina Espresso',
    'kit-pulizia-macchina-espresso',
    'Kit completo per la pulizia e manutenzione della macchina espresso. Tutto il necessario.',
    '<p>Il <strong>Kit Pulizia Espresso</strong> contiene tutto il necessario per mantenere la tua macchina in condizioni ottimali e garantire sempre il miglior espresso.</p><p>Include: detergente per gruppo in polvere (200g), decalcificante liquido (250ml), spazzolino per gruppo, panno in microfibra e filtro cieco per backflush. Compatibile con tutte le macchine espresso con gruppo E61 e similari.</p>',
    'ACCESSORIO',
    29.90,
    (SELECT id FROM categories WHERE slug = 'accessori'),
    NULL,
    '["https://placehold.co/800x800/F5F0EB/6B5B4E?text=Kit+Pulizia"]'::jsonb,
    '[{"label":"Contenuto","value":"5 pezzi"},{"label":"Detergente","value":"200g polvere"},{"label":"Decalcificante","value":"250ml liquido"},{"label":"Accessori","value":"Spazzolino + panno + filtro cieco"},{"label":"Compatibilità","value":"Macchine con gruppo E61 e similari"}]'::jsonb,
    FALSE, TRUE, 20,
    'Kit Pulizia Macchina Espresso | Espressamente',
    'Kit completo pulizia macchina espresso: detergente, decalcificante, spazzolino, filtro cieco. Per tutte le macchine E61.'
);
