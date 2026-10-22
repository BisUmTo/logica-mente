// Context keys belong to level semantics; scenes may be shared by related situations.
const scene=(name,image,surface,accent)=>Object.freeze({name,image,surface,accent});
export const scenes=Object.freeze({
 workshop:scene('Officina','assets/workshop.webp','#192d33','#e8b76c'),
 theatre:scene('Teatro','assets/scenes/theatre.webp','#382635','#edc392'),
 mechanic:scene('Meccanico','assets/scenes/mechanic.webp','#20343c','#e8b76c'),
 greenhouse:scene('Serra','assets/scenes/greenhouse.webp','#193b32','#c3ddb0'),
 studio:scene('Studio fotografico','assets/scenes/studio.webp','#36303c','#edc7a0'),
 library:scene('Biblioteca','assets/scenes/library.webp','#283342','#e6c893'),
 city:scene('In città','assets/scenes/city.webp','#253b40','#edd39e'),
 arcade:scene('Sala giochi','assets/scenes/arcade.webp','#292b49','#b8dce3'),
 cinema:scene('Cinema','assets/scenes/cinema.webp','#352735','#edc29a')
});
export const contextScenes=Object.freeze({officina:'workshop',motore:'mechanic',furgone:'mechanic',serra:'greenhouse',locale:'theatre',foto:'studio',documento:'library',scuola:'library',negozio:'city',pacco:'city',gita:'city',festa:'theatre',videogioco:'arcade',cinema:'cinema',allarme:'workshop',telefono:'studio'});
export function sceneFor(context){const id=contextScenes[context]||'workshop';return {id,...scenes[id]};}
