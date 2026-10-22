export const notations=Object.freeze({
 symbols:{'&':'&','|':'|','!':'!'},
 logic:{'&':'∧','|':'∨','!':'¬'},
 words:{'&':'AND','|':'OR','!':'NOT'},
 code:{'&':'&&','|':'||','!':'!'}
});
export const operatorLabel=(op,mode)=>notations[mode]?.[op]??notations.symbols[op]??op;
export function displayNotation(source,mode){
 let text='';const boundaries=[0];
 for(let i=0;i<source.length;i++){const char=source[i];let token=operatorLabel(char,mode);if(mode==='words'&&'&|!'.includes(char)){const left=i>0&&!/\s/.test(source[i-1])?' ':'',right=i+1<source.length&&/\s/.test(source[i+1])?'':' ';token=char==='!'?'NOT'+right:left+token+right;}text+=token;boundaries.push(text.length);}
 return {text,boundaries};
}
export const canonicalNotation=source=>source.replace(/\bAND\b/gi,'&').replace(/\bOR\b/gi,'|').replace(/\bNOT\b/gi,'!').replace(/&&/g,'&').replace(/\|\|/g,'|').replace(/∧/g,'&').replace(/∨/g,'|').replace(/¬/g,'!').toUpperCase();
// A caret inside a multi-character operator snaps past that whole operator.
export function canonicalCursor(source,mode,position){const b=displayNotation(source,mode).boundaries;const i=b.findIndex(x=>x>=position);return i<0?source.length:i;}
export function operatorDeletion(source,mode,position,direction='backward'){
 const {boundaries}=displayNotation(source,mode);
 for(let i=0;i<source.length;i++)if('&|!'.includes(source[i])&&boundaries[i+1]-boundaries[i]>1){
  const inside=direction==='backward'?position>boundaries[i]&&position<=boundaries[i+1]:position>=boundaries[i]&&position<boundaries[i+1];
  if(inside)return {text:source.slice(0,i)+source.slice(i+1),cursor:i};
 }
 return null;
}
