import {parse,check,evaluate,matchSelection,isResult,resultPrefix} from './engine.mjs?v=result1';
import {getLevel} from './levels.mjs?v=result1';
const atom=key=>({op:'var',key});
const key=n=>n.op==='var'?n.key:n.op==='!'?'!'+key(n.arg):n.op+'('+[key(n.a),key(n.b)].sort().join(',')+')';
const same=(a,b)=>key(a)===key(b);
const opposite=(a,b)=>(a.op==='!'&&same(a.arg,b))||(b.op==='!'&&same(b.arg,a));
function cost(n){if(n.op==='var')return {operators:0,occurrences:1};const a=cost(n.op==='!'?n.arg:n.a),b=n.op==='!'?{operators:0,occurrences:0}:cost(n.b);return {operators:1+a.operators+b.operators,occurrences:a.occurrences+b.occurrences};}
const cheaper=(a,b)=>a.operators<b.operators||(a.operators===b.operators&&a.occurrences<b.occurrences);
function simplify(n){
 if(n.op==='var')return n;
 if(n.op==='!'){const arg=simplify(n.arg);if(arg.op==='!')return simplify(arg.arg);if(arg.op==='var'&&/[01]/.test(arg.key))return atom(String(1-Number(arg.key)));return {op:'!',arg};}
 const a=simplify(n.a),b=simplify(n.b),op=n.op,other=op==='&'?'|':'&',identity=op==='&'?'1':'0',absorber=op==='&'?'0':'1';
 if(same(a,b))return a;
 if(opposite(a,b))return atom(absorber);
 for(const [x,y] of [[a,b],[b,a]]){
  if(x.op==='var'&&x.key===absorber)return x;
  if(x.op==='var'&&x.key===identity)return y;
  if(y.op===other&&(same(x,y.a)||same(x,y.b)))return x;
 }
 if(a.op==='!'&&b.op==='!')return simplify({op:'!',arg:{op:other,a:a.arg,b:b.arg}});
 if(a.op===other&&b.op===other){
  for(const [x,y] of [[a.a,a.b],[a.b,a.a]])for(const [z,w] of [[b.a,b.b],[b.b,b.a]])if(same(x,z))return simplify({op:other,a:x,b:{op,a:y,b:w}});
 }
 return {op,a,b};
}
function format(n,parent=0){
 if(n.op==='var')return n.key;
 const precedence=n.op==='!'?3:n.op==='&'?2:1;
 const text=n.op==='!'?'!'+format(n.arg,precedence):format(n.a,precedence)+' '+n.op+' '+format(n.b,precedence);
 return precedence<parent?'('+text+')':text;
}
function remap(n,groups){
 if(n.op==='var'){
  if(/^[01]$/.test(n.key))return n;
  const g=groups.find(g=>g.mapping?.key===n.key);if(!g)throw Error('Proposizione non selezionata');
  return g.mapping.negative?{op:'!',arg:atom(g.letter)}:atom(g.letter);
 }
 return n.op==='!'?{op:'!',arg:remap(n.arg,groups)}:{op:n.op,a:remap(n.a,groups),b:remap(n.b,groups)};
}
// A verified shorter candidate, never a claim of a globally minimal formula.
export function reviewSolution(level,groups,expression){
 try{
  if(Object.keys(level.props).length>8)throw Error('Troppe proposizioni per questo confronto');
  const result=check(level,groups,expression),studentCost=cost(result.ast);
  const review={status:'analysed',correct:result.wrong.length===0,comparedCases:result.cases.length,studentCost,simplification:null};
  if(!review.correct)return review;
  const candidates=[simplify(result.ast)];
  try{candidates.push(simplify(remap(parse(level.rule),groups)));}catch{/* The student may have eliminated an irrelevant property. */}
  let best=result.ast,bestCost=studentCost;
  for(const candidate of candidates){const candidateCost=cost(candidate);if(cheaper(candidateCost,bestCost)&&result.cases.every(c=>evaluate(candidate,c.values)===c.expected)){best=candidate;bestCost=candidateCost;}}
  if(cheaper(bestCost,studentCost))review.simplification={expression:format(best),candidateCost:bestCost,reason:`Stesso risultato in tutte le ${result.cases.length} combinazioni del livello; operatori da ${studentCost.operators} a ${bestCost.operators}, occorrenze da ${studentCost.occurrences} a ${bestCost.occurrences}.`,note:'Alternativa più compatta trovata, non necessariamente minima o didatticamente preferibile. Nessuna penalità.'};
  return review;
 }catch(e){return {status:'unavailable',reason:e.message,simplification:null};}
}
export function completionEvidence(level,groups){return {levelSnapshot:{title:level.title,text:level.text,rule:level.rule,props:level.props,result:level.result,resultAliases:level.resultAliases},legend:groups.map(g=>({letter:g.letter,text:g.text,mapping:g.mapping}))};}
export function buildReport(state,exportedAt=new Date().toISOString()){
 const starts=new Map(),solutions=[];
 for(const event of state.logs){
  if(event.type==='test-start')starts.set(event.level,event);
  if(event.type!=='level-complete')continue;
  const level=event.levelSnapshot||getLevel(event.level,state.seed),source=event.legend||starts.get(event.level)?.legend;
  const legend=source?.map(g=>({...g,mapping:g.mapping||matchSelection(level,g.text)}));
  const analysis=legend?reviewSolution(level,legend,event.expression):{status:'unavailable',reason:'Legenda non presente nello storico conservato.',simplification:null};
  const output=legend?.find(isResult),prefix=resultPrefix(legend||[]);
  if(analysis.simplification)analysis.simplification.equation=prefix+analysis.simplification.expression;
  solutions.push({level:event.level,title:level.title,at:event.at,expression:event.expression,equation:prefix+event.expression,resultProposition:output?{letter:output.letter,text:output.text}:null,legend:legend||null,analysis});
 }
 const flagged=solutions.filter(s=>s.analysis.simplification);
 return {app:'Logica Mente',version:2,notation:state.settings.notation||'symbols',expressionNotation:'Formule normalizzate con & | ! per il confronto docente.',exportedAt,student:state.name,className:state.className,seed:state.seed,summary:{completedLevels:state.completed,highestUnlocked:state.unlocked,errors:state.errors,restarts:state.restarts,activeSeconds:Math.round(state.activeMs/1000)},teacherReview:{criterion:'Confronto di correttezza e numero di operatori/occorrenze, con le lettere e la legenda dello studente. Non valuta la qualità della lettera scelta. Nessuna penalità e nessuna garanzia di minimo globale.',coverage:'Analizza le soluzioni concluse presenti nello storico locale (massimo 2000 eventi); eventuali attività precedenti potrebbero non essere più disponibili. Le righe sono tentativi conclusi, non voti o conteggi di competenze.',analysedSolutions:solutions.filter(s=>s.analysis.status==='analysed').length,unavailableSolutions:solutions.filter(s=>s.analysis.status==='unavailable').length,simplificationCount:flagged.length,levelsWithSimplifications:[...new Set(flagged.map(s=>s.level))],solutions},note:'Registro locale non autenticato. Tempo stimato con pagina visibile e interazioni negli ultimi 60 secondi; non misura il tempo esatto di studio.',events:state.logs};
}
