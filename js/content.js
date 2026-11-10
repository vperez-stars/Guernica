/*
 * Guernica puzzle — bilingual content (ES / EN).
 *
 * CARDS: one "chapter" is revealed each time a piece is placed correctly,
 * in the order listed here (chronological). With the default 6×3 grid there
 * are 18 pieces and 18 cards. If you change the grid, chapters are spread
 * proportionally over the pieces (see revealedFor() in puzzle.js).
 *
 * Card shape:
 *   {
 *     kind: 'history' | 'poetry',
 *     date:  { es, en },
 *     title: { es, en },
 *     body:  { es, en },
 *     poem?: { author, work, year, es: [lines], en: [lines] }   // en = translation
 *   }
 *
 * In title and body, wrap titles of works in underscores (_Cántico_) to render
 * them in italics, as RAE prescribes.
 *
 * Spanish text follows RAE norms for Spain (verified 2026-11-10): no point as
 * thousands separator (35 000, 1654), hyphen for numeric ranges (1936-1939),
 * lowercase titles/positions (generalísimo, jefe del Estado), "Gobierno" with
 * capital for the institution, lowercase article in nicknames (la Pasionaria).
 * Poem excerpts were checked against Spanish sources; see CLAUDE.md.
 *
 * Copyright note: García Lorca (d. 1936) is in the public domain. Alberti,
 * Cernuda, Guillén and Aleixandre are still under copyright, so only short,
 * attributed excerpts are quoted. English versions are literal translations
 * written for this exhibit.
 */
window.GUERNICA_CONTENT = {
  UI: {
    es: {
      title: 'Guernica',
      subtitle: 'Puzle de la memoria',
      tagline: 'Cada pieza que colocas desvela un capítulo de la Guerra Civil española (1936-1939) y de sus poetas.',
      start: 'Empezar',
      howTo: 'Arrastra las piezas hasta su lugar en el cuadro. Funciona con ratón y con pantalla táctil, y varias personas pueden jugar a la vez.',
      chooseLang: 'Idioma',
      pieces: 'Piezas',
      time: 'Tiempo',
      moves: 'Movimientos',
      hint: 'Pista',
      shuffle: 'Reiniciar',
      fullscreen: 'Pantalla completa',
      settings: 'Ajustes',
      story: 'La historia',
      chapter: 'Capítulo',
      of: 'de',
      locked: 'Por desvelar',
      emptyTitle: 'La memoria está en las piezas',
      emptyBody: 'Coloca tu primera pieza en el lugar correcto para desvelar el primer capítulo.',
      kind_history: 'Historia',
      kind_poetry: 'Poesía',
      newChapter: 'Nuevo capítulo',
      translation: 'Traducción',
      completeTitle: '¡Guernica reconstruido!',
      completeBody: 'Has desvelado los {n} capítulos de esta historia.',
      playAgain: 'Escucha otra vez',
      readStory: 'Leer la historia',
      soundTitle: 'Sonido final',
      soundHelp: 'Suena al completar el puzle. Elige un archivo de audio de este ordenador o deja el archivo por defecto en assets/audio/.',
      soundCustom: 'Archivo elegido',
      soundDefault: 'Archivo por defecto',
      soundChime: 'Melodía integrada (no se encontró el archivo por defecto)',
      chooseSound: 'Elegir archivo…',
      testSound: 'Probar',
      resetSound: 'Quitar archivo elegido',
      volume: 'Volumen',
      enableSound: 'Sonido activado',
      shortcuts: 'Atajos de teclado',
      sc_hint: 'Mostrar/ocultar pista',
      sc_lang: 'Cambiar idioma',
      sc_full: 'Pantalla completa',
      sc_restart: 'Reiniciar partida',
      sc_demo: 'Modo demo: coloca una pieza',
      close: 'Cerrar',
      idleNote: 'Vuelve a la pantalla de inicio tras {s} s sin actividad.',
      whoMade: '¿Quién ha hecho este puzle?',
      credits: 'Pablo Picasso, Guernica (1937). Museo Nacional Centro de Arte Reina Sofía, Madrid.'
    },
    en: {
      title: 'Guernica',
      subtitle: 'A puzzle of memory',
      tagline: 'Every piece you place reveals a chapter of the Spanish Civil War (1936–1939) and its poets.',
      start: 'Start',
      howTo: 'Drag the pieces into place on the painting. Works with mouse and touch, and several people can play at once.',
      chooseLang: 'Language',
      pieces: 'Pieces',
      time: 'Time',
      moves: 'Moves',
      hint: 'Hint',
      shuffle: 'Restart',
      fullscreen: 'Fullscreen',
      settings: 'Settings',
      story: 'The story',
      chapter: 'Chapter',
      of: 'of',
      locked: 'Still hidden',
      emptyTitle: 'Memory lives in the pieces',
      emptyBody: 'Place your first piece in the right spot to reveal the first chapter.',
      kind_history: 'History',
      kind_poetry: 'Poetry',
      newChapter: 'New chapter',
      translation: 'Translation',
      completeTitle: 'Guernica restored!',
      completeBody: 'You have revealed all {n} chapters of this story.',
      playAgain: 'Play again',
      readStory: 'Read the story',
      soundTitle: 'Completion sound',
      soundHelp: 'Plays when the puzzle is finished. Pick an audio file from this computer, or leave the default file in assets/audio/.',
      soundCustom: 'Chosen file',
      soundDefault: 'Default file',
      soundChime: 'Built-in chime (default file not found)',
      chooseSound: 'Choose file…',
      testSound: 'Test',
      resetSound: 'Remove chosen file',
      volume: 'Volume',
      enableSound: 'Sound on',
      shortcuts: 'Keyboard shortcuts',
      sc_hint: 'Show/hide hint',
      sc_lang: 'Switch language',
      sc_full: 'Fullscreen',
      sc_restart: 'Restart game',
      sc_demo: 'Demo mode: place one piece',
      close: 'Close',
      idleNote: 'Returns to the start screen after {s} s of inactivity.',
      whoMade: 'Who made this puzzle?',
      credits: 'Pablo Picasso, Guernica (1937). Museo Nacional Centro de Arte Reina Sofía, Madrid.'
    }
  },

  CARDS: [
    {
      kind: 'poetry',
      date: { es: '1927', en: '1927' },
      title: { es: 'La Generación del 27', en: 'The Generation of ’27' },
      body: {
        es: 'El grupo toma su nombre del homenaje a Luis de Góngora en el tercer centenario de su muerte, celebrado en 1927. A esta generación pertenecen Federico García Lorca, Rafael Alberti, Luis Cernuda, Jorge Guillén y Vicente Aleixandre, que unieron la vanguardia europea con la tradición popular española. Diez años después, la guerra los dispersó: uno fue asesinado, varios marcharon al exilio y otro se quedó en un silencio vigilado.',
        en: 'The group takes its name from the 1927 tribute to Luis de Góngora on the 300th anniversary of his death. Its members included Federico García Lorca, Rafael Alberti, Luis Cernuda, Jorge Guillén and Vicente Aleixandre, who fused the European avant-garde with Spanish folk tradition. Ten years later the war scattered them: one was murdered, several went into exile, and another stayed behind in a watched silence.'
      }
    },
    {
      kind: 'history',
      date: { es: '14 de abril de 1931', en: '14 April 1931' },
      title: { es: 'Nace la Segunda República', en: 'The Second Republic is born' },
      body: {
        es: 'Se proclama la Segunda República y el rey Alfonso XIII parte al exilio. La nueva Constitución reconoce el voto de las mujeres, separa la Iglesia del Estado e impulsa la reforma agraria y la construcción de miles de escuelas. Lorca recorre los pueblos con su teatro universitario, La Barraca. Son años de enorme ilusión y también de fuertes tensiones sociales y políticas.',
        en: 'The Second Republic is proclaimed and King Alfonso XIII leaves for exile. The new Constitution gives women the vote, separates Church and State, and drives land reform and the building of thousands of schools. Lorca tours the villages with his university theatre company, La Barraca. These are years of great hope, and of deep social and political tension.'
      }
    },
    {
      kind: 'history',
      date: { es: 'Febrero de 1936', en: 'February 1936' },
      title: { es: 'Un país polarizado', en: 'A divided country' },
      body: {
        es: 'El 16 de febrero de 1936, el Frente Popular, una coalición de partidos de izquierda, gana las elecciones generales. La polarización crece en las calles: huelgas, ocupaciones de tierras y atentados de uno y otro signo. Mientras tanto, un grupo de militares prepara en secreto un golpe de Estado contra el Gobierno de la República.',
        en: 'On 16 February 1936 the Popular Front, a coalition of left-wing parties, wins the general election. Polarisation spills into the streets: strikes, land occupations and political killings on both sides. Meanwhile, a group of army officers secretly plans a coup against the Republican government.'
      }
    },
    {
      kind: 'history',
      date: { es: '17 y 18 de julio de 1936', en: '17–18 July 1936' },
      title: { es: 'El golpe y la guerra', en: 'The coup becomes a war' },
      body: {
        es: 'El ejército se subleva en el Protectorado de Marruecos y, al día siguiente, el levantamiento se extiende a la península. El golpe fracasa en Madrid, Barcelona, Valencia y Bilbao, y España queda partida en dos: los republicanos, leales al Gobierno, frente a los sublevados, que en octubre nombran al general Francisco Franco jefe del Estado y generalísimo.',
        en: 'The army rises up in Spanish Morocco and, the next day, the revolt spreads to the mainland. The coup fails in Madrid, Barcelona, Valencia and Bilbao, and Spain is split in two: Republicans loyal to the government against the rebels, who in October name General Francisco Franco head of state and Generalísimo.'
      }
    },
    {
      kind: 'poetry',
      date: { es: 'Agosto de 1936', en: 'August 1936' },
      title: { es: 'Federico García Lorca', en: 'Federico García Lorca' },
      body: {
        es: 'El poeta y dramaturgo español más universal es detenido en Granada y asesinado por fuerzas sublevadas en el camino entre Víznar y Alfacar. Tenía 38 años. Sus restos nunca han sido encontrados. Su muerte se convirtió en símbolo de la violencia contra la cultura y su obra, en una de las más traducidas de la lengua española.',
        en: 'Spain’s most celebrated poet and playwright is arrested in Granada and murdered by rebel forces on the road between Víznar and Alfacar. He was 38. His remains have never been found. His death became a symbol of violence against culture, and his work one of the most translated in the Spanish language.'
      },
      poem: {
        author: 'Federico García Lorca',
        work: 'Romance sonámbulo',
        year: 'Romancero gitano, 1928',
        es: ['Verde que te quiero verde.', 'Verde viento. Verdes ramas.', 'El barco sobre la mar', 'y el caballo en la montaña.'],
        en: ['Green, how I want you green.', 'Green wind. Green branches.', 'The ship upon the sea', 'and the horse on the mountain.']
      }
    },
    {
      kind: 'history',
      date: { es: '1936', en: '1936' },
      title: { es: 'Una guerra internacional', en: 'An international war' },
      body: {
        es: 'La guerra se internacionaliza desde el principio. La Alemania de Hitler y la Italia de Mussolini envían aviones, tanques y tropas a los sublevados, entre ellos la Legión Cóndor. La Unión Soviética vende armas a la República y México la apoya abiertamente. El Reino Unido y Francia impulsan un Acuerdo de No Intervención que las potencias fascistas incumplen sistemáticamente.',
        en: 'The war is international from the start. Hitler’s Germany and Mussolini’s Italy send aircraft, tanks and troops to the rebels, including the Condor Legion. The Soviet Union sells arms to the Republic, and Mexico openly supports it. Britain and France promote a Non-Intervention Agreement that the fascist powers systematically ignore.'
      }
    },
    {
      kind: 'history',
      date: { es: 'Octubre de 1936', en: 'October 1936' },
      title: { es: 'Las Brigadas Internacionales', en: 'The International Brigades' },
      body: {
        es: 'Unos 35 000 voluntarios de más de 50 países llegan a España para defender la República. Obreros, estudiantes, escritores y artistas combaten desde la defensa de Madrid hasta la batalla del Ebro. Se despiden en un desfile multitudinario por las calles de Barcelona el 28 de octubre de 1938.',
        en: 'Some 35,000 volunteers from more than 50 countries come to Spain to defend the Republic. Workers, students, writers and artists fight from the defence of Madrid to the Battle of the Ebro. They say farewell in a huge parade through the streets of Barcelona on 28 October 1938.'
      }
    },
    {
      kind: 'history',
      date: { es: 'Noviembre de 1936', en: 'November 1936' },
      title: { es: '«¡No pasarán!»', en: '“They shall not pass!”' },
      body: {
        es: 'Las tropas sublevadas llegan a las puertas de Madrid. El Gobierno se traslada a Valencia, pero la ciudad resiste bajo los bombardeos con un lema que da la vuelta al mundo, popularizado por Dolores Ibárruri, la Pasionaria: «¡No pasarán!». Madrid aguanta más de dos años de asedio, hasta marzo de 1939.',
        en: 'Rebel troops reach the gates of Madrid. The government moves to Valencia, but the city holds out under the bombs with a slogan that travels the world, made famous by Dolores Ibárruri, “La Pasionaria”: “¡No pasarán!” — “They shall not pass!” Madrid endures more than two years of siege, until March 1939.'
      }
    },
    {
      kind: 'poetry',
      date: { es: '1936-1939', en: '1936–1939' },
      title: { es: 'Rafael Alberti', en: 'Rafael Alberti' },
      body: {
        es: 'El poeta gaditano se vuelca en la defensa de la República: recita en el frente, impulsa la revista _El Mono Azul_ y, junto a su mujer, la escritora María Teresa León, trabaja para proteger los tesoros del Museo del Prado. En 1939 parte al exilio —Francia, Argentina, Italia— y no regresa a España hasta 1977, casi cuarenta años después.',
        en: 'The poet from Cádiz throws himself into defending the Republic: he reads poems at the front, drives the magazine El Mono Azul and, with his wife, the writer María Teresa León, works to protect the treasures of the Prado Museum. In 1939 he goes into exile — France, Argentina, Italy — and does not return to Spain until 1977, almost forty years later.'
      },
      poem: {
        author: 'Rafael Alberti',
        work: 'Galope',
        year: 'Capital de la gloria, 1937',
        es: ['Las tierras, las tierras, las tierras de España,', 'las grandes, las solas, desiertas llanuras.', 'Galopa, caballo cuatralbo,', 'jinete del pueblo,', 'al sol y a la luna.'],
        en: ['The lands, the lands, the lands of Spain,', 'the great, the lonely, deserted plains.', 'Gallop, white-footed horse,', 'rider of the people,', 'by sun and by moon.']
      }
    },
    {
      kind: 'history',
      date: { es: '26 de abril de 1937', en: '26 April 1937' },
      title: { es: 'El bombardeo de Guernica', en: 'The bombing of Guernica' },
      body: {
        es: 'Un lunes, día de mercado, la aviación alemana de la Legión Cóndor, con apoyo de la aviación italiana, bombardea Guernica durante unas tres horas. La villa, símbolo de las libertades vascas, queda arrasada por el fuego. El número de víctimas sigue debatiéndose: el Gobierno vasco habló entonces de 1654 muertos; las investigaciones recientes hablan de entre 150 y 300. La crónica del periodista George Steer lleva la tragedia a todo el mundo.',
        en: 'On a Monday, market day, German aircraft of the Condor Legion, supported by Italian planes, bomb Guernica for about three hours. The town, a symbol of Basque liberties, is consumed by fire. The death toll is still debated: the Basque Government reported 1,654 dead at the time; recent research suggests between 150 and 300. Journalist George Steer’s report carries the tragedy around the world.'
      }
    },
    {
      kind: 'history',
      date: { es: 'Mayo y junio de 1937', en: 'May–June 1937' },
      title: { es: 'Picasso pinta _Guernica_', en: 'Picasso paints Guernica' },
      body: {
        es: 'La República había encargado a Pablo Picasso un mural para su pabellón en la Exposición Internacional de París de 1937, dedicada a «las artes y las técnicas en la vida moderna». Tras conocer el bombardeo, Picasso pinta _Guernica_ en unas cinco semanas: 3,49 × 7,77 metros, solo en negros, blancos y grises. Dora Maar fotografía cada etapa. Nació para una exposición de tecnología, como la que hoy te lo ha traído.',
        en: 'The Republic had commissioned Pablo Picasso to paint a mural for its pavilion at the 1937 Paris International Exposition, devoted to “arts and technology in modern life”. After learning of the bombing, Picasso paints Guernica in about five weeks: 3.49 × 7.77 metres, in nothing but black, white and grey. Dora Maar photographs every stage. It was made for a technology exposition — just like the one that brought it to you today.'
      }
    },
    {
      kind: 'poetry',
      date: { es: '1936-1938', en: '1936–1938' },
      title: { es: 'Jorge Guillén', en: 'Jorge Guillén' },
      body: {
        es: 'El poeta de _Cántico_ celebraba la plenitud del mundo. Al estallar la guerra es detenido brevemente en Pamplona, y en 1938 se exilia en Estados Unidos, donde enseña durante años en Wellesley College. Su obra posterior, _Clamor_, se enfrenta al dolor de la historia de su tiempo. En 1976 recibe el primer Premio Cervantes.',
        en: 'The poet of Cántico celebrated the fullness of the world. When the war breaks out he is briefly detained in Pamplona, and in 1938 he goes into exile in the United States, where he teaches for years at Wellesley College. His later work, Clamor, confronts the pain of the history he lived through. In 1976 he receives the first Cervantes Prize.'
      },
      poem: {
        author: 'Jorge Guillén',
        work: 'Beato sillón',
        year: 'Cántico',
        es: ['El mundo está bien hecho.'],
        en: ['The world is well made.']
      }
    },
    {
      kind: 'poetry',
      date: { es: '1938', en: '1938' },
      title: { es: 'Luis Cernuda', en: 'Luis Cernuda' },
      body: {
        es: 'El poeta sevillano apoya a la República. En 1938 viaja a Inglaterra para dar unas conferencias y ya nunca vuelve a España. Vive en Glasgow, Cambridge, Londres, Estados Unidos y México, donde muere en 1963. En _Las nubes_ da voz al dolor del exilio y a una España perdida.',
        en: 'The poet from Seville supports the Republic. In 1938 he travels to England to give some lectures and never returns to Spain. He lives in Glasgow, Cambridge, London, the United States and Mexico, where he dies in 1963. In Las nubes (The Clouds) he gives voice to the pain of exile and a lost Spain.'
      },
      poem: {
        author: 'Luis Cernuda',
        work: 'Un español habla de su tierra',
        year: 'Las nubes, 1940',
        es: ['Ellos, los vencedores', 'Caínes sempiternos,', 'De todo me arrancaron,', 'Me dejan el destierro.'],
        en: ['They, the victors,', 'everlasting Cains,', 'tore me from everything.', 'They leave me exile.']
      }
    },
    {
      kind: 'history',
      date: { es: 'De julio a noviembre de 1938', en: 'July–November 1938' },
      title: { es: 'La batalla del Ebro', en: 'The Battle of the Ebro' },
      body: {
        es: 'Del 25 de julio al 16 de noviembre se libra la batalla más larga y sangrienta de la guerra. El ejército republicano cruza el río por sorpresa en un último intento de cambiar el curso del conflicto, pero tras casi cuatro meses de combates debe retirarse. Muchos de sus soldados eran la llamada «quinta del biberón», chicos de apenas 17 o 18 años.',
        en: 'From 25 July to 16 November the longest and bloodiest battle of the war is fought. The Republican army crosses the river by surprise in a last attempt to turn the tide, but after almost four months of fighting it has to withdraw. Many of its soldiers belonged to the so-called “baby-bottle draft”: boys of just 17 or 18.'
      }
    },
    {
      kind: 'history',
      date: { es: 'Enero y febrero de 1939', en: 'January–February 1939' },
      title: { es: 'La Retirada', en: 'La Retirada: the exodus' },
      body: {
        es: 'Barcelona cae el 26 de enero de 1939. En pocas semanas, cerca de medio millón de personas cruzan a pie los Pirineos hacia Francia en pleno invierno. Muchas acaban en campos improvisados en las playas, como Argelès-sur-Mer. El poeta Antonio Machado muere en Collioure el 22 de febrero, días después de cruzar la frontera. México, entre otros países, acoge a miles de exiliados.',
        en: 'Barcelona falls on 26 January 1939. Within weeks, nearly half a million people cross the Pyrenees into France on foot in the depths of winter. Many end up in makeshift camps on the beaches, such as Argelès-sur-Mer. The poet Antonio Machado dies in Collioure on 22 February, days after crossing the border. Mexico, among other countries, takes in thousands of exiles.'
      }
    },
    {
      kind: 'history',
      date: { es: '1 de abril de 1939', en: '1 April 1939' },
      title: { es: '«La guerra ha terminado»', en: '“The war is over”' },
      body: {
        es: 'Franco firma el último parte de guerra: «En el día de hoy, cautivo y desarmado el Ejército Rojo, han alcanzado las tropas nacionales sus últimos objetivos militares. La guerra ha terminado». Pero no llega la paz: siguen las cárceles, los fusilamientos y el exilio. La guerra deja en torno a medio millón de muertos y la dictadura se prolonga hasta la muerte de Franco, en 1975.',
        en: 'Franco signs the last war bulletin: “Today, with the Red Army captive and disarmed, the Nationalist troops have reached their final military objectives. The war is over.” But peace does not follow: prisons, executions and exile continue. The war leaves around half a million dead, and the dictatorship lasts until Franco’s death in 1975.'
      }
    },
    {
      kind: 'poetry',
      date: { es: '1939-1977', en: '1939–1977' },
      title: { es: 'Vicente Aleixandre', en: 'Vicente Aleixandre' },
      body: {
        es: 'Su frágil salud lo mantiene en España, donde vive un «exilio interior». Su casa de la calle Velintonia, en Madrid, se convierte en refugio y punto de encuentro de los jóvenes poetas de la posguerra. En 1944 publica _Sombra del paraíso_, un canto a un mundo luminoso y perdido. En 1977 recibe el Premio Nobel de Literatura.',
        en: 'His fragile health keeps him in Spain, where he lives an “inner exile”. His house on Velintonia Street in Madrid becomes a refuge and meeting place for the young poets of the post-war years. In 1944 he publishes Sombra del paraíso (Shadow of Paradise), a song to a bright, lost world. In 1977 he receives the Nobel Prize in Literature.'
      },
      poem: {
        author: 'Vicente Aleixandre',
        work: 'Ciudad del paraíso',
        year: 'Sombra del paraíso, 1944',
        es: ['Siempre te ven mis ojos, ciudad de mis días marinos.'],
        en: ['My eyes always see you, city of my seaside days.']
      }
    },
    {
      kind: 'history',
      date: { es: '10 de septiembre de 1981', en: '10 September 1981' },
      title: { es: '_Guernica_ vuelve a casa', en: 'Guernica comes home' },
      body: {
        es: 'Picasso dejó dicho que _Guernica_ no debía entrar en España hasta que se restablecieran las libertades públicas. Durante décadas el cuadro viajó por el mundo y se custodió en el Museo de Arte Moderno de Nueva York. Llega a Madrid en 1981, ya en democracia. Desde 1992 se expone en el Museo Nacional Centro de Arte Reina Sofía, donde lo contemplan millones de personas.',
        en: 'Picasso left instructions that Guernica should not enter Spain until public liberties were restored. For decades the painting toured the world and was kept at the Museum of Modern Art in New York. It arrives in Madrid in 1981, once Spain is a democracy. Since 1992 it has hung in the Museo Nacional Centro de Arte Reina Sofía, where millions of people come to see it.'
      }
    }
  ],

  // Creator profile page (profile.html). EDIT ME: "about" and "why" are drafts;
  // rewrite them in your own words. Each paragraph is one string in the array.
  PROFILE: {
    name: 'Ventura Perez Del Castillo',
    links: {
      portfolio: 'https://vperez-stars.github.io/Portfolio-Site/',
      linkedin: 'https://www.linkedin.com/in/ventura-perez/',
      github: 'https://github.com/vperez-stars',
      email: 'vperez@icstars.org'
    },
    es: {
      pageTitle: 'Quién ha hecho este puzle',
      role: 'Desarrollo de software',
      back: 'Volver al puzle',
      aboutTitle: 'Sobre mí',
      about: [
        'Soy Ventura. Me dedico al desarrollo de software y quiero contribuir a mejorar el mundo a través de la tecnología. Ahora mismo estoy aprendiendo desarrollo web y me interesa crear aplicaciones que solucionan problemas reales.'
      ],
      whyTitle: 'Por qué he hecho este proyecto',
      why: [
        'He creado este puzle para una feria de tecnología. Quería demostrar que una aplicación web sencilla también puede servir para contar la historia: cada pieza que colocas abre un capítulo de la Guerra Civil española y de sus poetas, en español y en inglés.',
        'Funciona en cualquier navegador, con ratón o pantalla táctil, sin conexión y sin instalar nada.'
      ],
      linksTitle: 'Contacto',
      portfolio: 'Web personal',
      linkedin: 'LinkedIn',
      github: 'GitHub',
      email: 'Correo electrónico'
    },
    en: {
      pageTitle: 'Who made this puzzle',
      role: 'Software developer',
      back: 'Back to the puzzle',
      aboutTitle: 'About me',
      about: [
        'I’m Ventura, a software developer who wants to make a difference in the world through technology. I’m currently learning web development, and I’m interested in building applications that solve real-world problems.'
      ],
      whyTitle: 'Why I made this project',
      why: [
        'I built this puzzle for a tech expo. I wanted to show that a simple web app can also tell history: every piece you place opens a chapter of the Spanish Civil War and its poets, in Spanish and English.',
        'It runs in any browser, with a mouse or a touch screen, offline and with nothing to install.'
      ],
      linksTitle: 'Get in touch',
      portfolio: 'Portfolio',
      linkedin: 'LinkedIn',
      github: 'GitHub',
      email: 'Email'
    }
  },

  // Shown on the completion screen.
  FINALE: {
    author: 'Federico García Lorca',
    work: 'Despedida',
    year: 'Canciones, 1927',
    es: ['Si muero,', 'dejad el balcón abierto.', '', 'El niño come naranjas.', '(Desde mi balcón lo veo.)', '', 'El segador siega el trigo.', '(Desde mi balcón lo siento.)', '', '¡Si muero,', 'dejad el balcón abierto!'],
    en: ['If I die,', 'leave the balcony open.', '', 'The boy is eating oranges.', '(From my balcony I see him.)', '', 'The reaper is reaping the wheat.', '(From my balcony I hear him.)', '', 'If I die,', 'leave the balcony open!']
  }
};
