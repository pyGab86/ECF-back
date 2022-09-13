// Logique du login :
// - Un admin peut se connecter si ses identifiants sont bons.
// - un partenaire/structure peut se connecter si ses ids sont bons et que son statut est actif
// - Si un partenaire/structure se login, on le spécifie au front pour qu'il n'affiche pas les écrans
// et options d'admins. On spécifie aussi si l'utilisateur a besoin de reset son mdp pour que le front affiche
// la modale de changement de mdp

const login = async (req) => {

    const password = req.body.password
    



}

export default login