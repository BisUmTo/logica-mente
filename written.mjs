// History contains only revealed steps. Ranges always refer to the displayed expression.
export function writtenRows(steps,index){
 const rows=[{expression:steps[0].expression,ranges:[],kind:'source',label:'Regola di partenza'}];
 for(let i=1;i<=Math.min(index,steps.length-1);i++){
  const step=steps[i],previous=rows.at(-1);
  if(step.previous!==undefined)previous.expression=step.previous;
  previous.ranges=step.beforeRanges??(step.beforeRange?[step.beforeRange]:[]);
  previous.kind='operation';previous.label=step.letter?'Sostituisci '+step.letter:step.operator==='!'?'Calcola NOT':step.operator==='&'?'Calcola AND':step.operator==='|'?'Calcola OR':'Sostituisci i valori';
  rows.push({expression:step.expression,ranges:step.afterRanges??(step.afterRange?[step.afterRange]:[]),kind:'result',label:'Ottieni'});
 }
 const next=steps[index+1];
 if(next){const current=rows.at(-1);if(next.previous!==undefined)current.expression=next.previous;current.ranges=next.beforeRanges??(next.beforeRange?[next.beforeRange]:[]);current.kind='pending';current.label=next.letter?'Ora sostituisci '+next.letter:next.operator==='!'?'Ora calcola NOT':next.operator==='&'?'Ora calcola AND':next.operator==='|'?'Ora calcola OR':'Leggi il valore';}
 return rows;
}
