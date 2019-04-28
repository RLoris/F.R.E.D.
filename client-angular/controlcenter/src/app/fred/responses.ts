export const Responses = {
  Welcome: 'Bonjour content de vous revoir',
  Bye: 'Mise en veille imminente, à très bientôt',
  Help: 'Que puis je faire pour vous assister ?',
  ChangeBackground: 'Je change d\'environnement pour vous',
  DoRelaxationExercices: 'Je lance une vidéo de relaxation pour vous',
  HideWidget: 'Je masque ce widget',
  None: 'En quoi puis je vous aider ?',
  PlayMusic: 'Je lance un morceau de musique pour vous',
  ShowWidget: 'J\'affiche ce widget'
} as IDictonary;

interface IDictonary {
  [index: string]: string;
}
