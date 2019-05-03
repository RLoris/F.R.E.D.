export const Responses = {
  Welcome: ['Bonjour content de vous revoir'],
  Bye: ['Mise en veille imminente, à très bientôt'],
  Help: ['Que puis je faire pour vous assister ?'],
  ChangeBackground: ['Je change d\'environnement pour vous'],
  DoRelaxationExercices: ['Je lance une vidéo de relaxation pour vous'],
  HideWidget: ['Je masque ce widget'],
  None: ['En quoi puis je vous aider ?'],
  PlayMusic: ['Je lance un morceau de musique pour vous'],
  ShowWidget: ['J\'affiche ce widget'],
  News: [
    'En l\'an de grâce 23 PEML(Post Elon Musk Landing), nous finîmes par réussir à enfin exterminer les vegane.',
    // tslint:disable-next-line:max-line-length
    'Avis à tous les chimistes (et maîtres artificiers par la même occasion), un nouveau matériau extrêmement explosif vient d\'être découvert. Vous pouvez maintenant sauter dessus sans mauvais jeux de mot',
    // tslint:disable-next-line:max-line-length
    'La 18ème merveille de Mars viens d\'être détruite ! Elon a encore envoyé un éléphant dans l\'espace et celui-ci est retombé sur la grande muraille des turcs.',
    'J\'ai le regret de vous annoncer que Johnny Hallyday est décédé il y a maintenant 30ans, il savait pourtant bien allumer le feu.',
    // tslint:disable-next-line:max-line-length
    'Un nouvel aliment vient d\'être créée en laboratoire, celui-ci est le mélange d\'un portugais et d\'une betonière et se prénome un parpaing.',
    'Regarder dehors ! Une Xavier Vercruysse sauvage en train de cramer un raspberry pie est apparu.',
    'Une nouvelle ère est sur le point de commencer, les gitans arrivent eux aussi pour coloniser Mars avec leurs caravanes rocket heavy.',
    // tslint:disable-next-line:max-line-length
    'C\'est officiel, la TEC va tout mettre en place pour que les contrats qu\'elle a passé sur Terre soit les mêmes que ceux sur Mars, nous sommes de tout coeur avec vous cher passager.',
    'La RaMarsette, un projet très smart selon une certaine personne.',
    'Le rover opportunity n\'a pas pu être très curieux, espérons que curiosity nous dévoile de nouvelles opportunités.'],
  DidYouEverKnow: [
    'Le saviez-vous, sur Terre en l\'an 2019 ap. J-C il existait encore des gens qui pensaient que la Terre était ronde.',
    'Le saviez-vous, les Terriens croyaient encore en 2025 que le niveau de la mer monterait quand les glaciers auraient fondu',
    'Le saviez-vous, contrairement au croyance le fruit le plus riche en vitamine C n\'est pas l\'orange mais le poivron.',
    'Le saviez-vous, sur Terre la 1ère photo d\'un trou noir a été diffusée le 10/04/2019.',
    // tslint:disable-next-line:max-line-length
    'Le saviez-vous, les antivaxs pensaient que les vaccins étaient là pour décimer la population et non pas pour les prévenir de maladie qui ont fait des ravages avant ces dit vaccins.',
    'Le saviez-vous, le nom Mars vient du Dieu guerrier romain Mars.',
    'Le saviez-vous, un magicarpe ne peut pas apprendre d\'autres capacités que Trempette.',
    'Le saviez-vous, il parait que l\'homme descend du singe alors que parfois on se demande réellement si c\'est pas le contraire.',
    // tslint:disable-next-line:max-line-length
    'Le saviez-vous, au Moyen-Âge pour chasser les sorciers ils leurs attachaient un boulet à la cheville et les jettaient dans la mer, si le sorcier remontait c\'est qu\'il était bien un sorcier.',
    'Le saviez-vous, un consultant est un stagiaire éternel, non?'],
  Warning: [
    'Attention, une tempête de sable est prévue sur le Mont Olympe dans 1h30 (Sortez couvert).',
    // tslint:disable-next-line:max-line-length
    'Attention, un dangereux pyromane est désormais en liberté, si vous possédez un raspberry pi ou un rover ne lui confiez surtout pas sauf si votre but est de recevoir de la suie',
    'Attention, fuite de gaz.',
    // tslint:disable-next-line:max-line-length
    'Attention, un SAS de la station a dû se fermer pour des raisons de sécurité, si vous êtes bloqués dedans, la sentence est irrévocable!',
    // tslint:disable-next-line:max-line-length
    'Attention, suite à une fuite de produit radioactif extrêmement dangereux, nous vous prions de changer de planète et bonne chance pour la suivante.',
    // tslint:disable-next-line:max-line-length
    'Attention, suite à l\'arriver des vegane, nous avons dû procéder à un ratissage de la population pour en reprendre uniquement les meilleurs.',
    // tslint:disable-next-line:max-line-length
    'Attention, une souris s\'est infiltrée dans les conduits d\'aération. Merci de dégager la sortie car celle-ci va être expulsée violement.',
    'Attention, niveau d\'oxygène critique. Si vous tenez à la vie il vous est grandement conseillé d\'évacuer la zone.',
    'Attention, un sursaut Gamma est dans votre direction. GAME OVER.',
    'Attention, bolide en approche. Merci de rester calme et de prier que celui-ci ne vous tombe pas dessus.'
  ]
} as IDictonary;

interface IDictonary {
  [index: string]: string[];
}
