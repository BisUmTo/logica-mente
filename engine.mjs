export function parse(source){const tokens=source.toUpperCase().match(/[A-Z01&|!()]|\S/g)||[];let i=0;const peek=()=>tokens[i],take=()=>tokens[i++];function atom(){const t=take();if(t==='!')return{op:'!',arg:atom()};if(t==='('){const a=or();if(take()!==')')throw Error('Manca una parentesi chiusa.');return a;}if(t&&/^[A-Z01]$/.test(t))return{op:'var',key:t};throw Error(t?'Simbolo inatteso: '+t:'La regola è incompleta.');}function and(){let a=atom();while(peek()==='&'){take();a={op:'&',a,b:atom()};}return a;}function or(){let a=and();while(peek()==='|'){take();a={op:'|',a,b:and()};}return a;}if(!tokens.length)throw Error('Scrivi una regola prima del collaudo.');if(tokens.length>120)throw Error('La regola è troppo lunga.');const tree=or();if(i<tokens.length)throw Error('Serve un operatore tra le parti della regola.');return tree;}
export function evaluate(node,values){if(node.op==='var'){if(node.key==='0'||node.key==='1')return +node.key;if(!(node.key in values))throw Error('La lettera '+node.key+' non ha una proposizione.');return +values[node.key];}if(node.op==='!')return 1-evaluate(node.arg,values);const a=evaluate(node.a,values),b=evaluate(node.b,values);return node.op==='&'?a&b:a|b;}
export function steps(node,values){const out=[];function walk(n){if(n.op==='var'){const v=evaluate(n,values);return String(v);}if(n.op==='!'){const a=walk(n.arg),v=1-Number(a);out.push('!'+a+' = '+v);return String(v);}const a=walk(n.a),b=walk(n.b),v=n.op==='&'?Number(a)&Number(b):Number(a)|Number(b);out.push(a+' '+n.op+' '+b+' = '+v);return String(v);}walk(node);return out;}
export function assignments(keys,valid=()=>true){return Array.from({length:2**keys.length},(_,mask)=>Object.fromEntries(keys.map((k,i)=>[k,(mask>>i)&1]))).filter(valid);}
export const normalize=s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
export function matchSelection(level,phrase){const n=normalize(phrase);for(const [key,options]of Object.entries(level.props))for(const entry of options){const [txt,negative]=Array.isArray(entry)?entry:[entry,false];if(normalize(txt)===n)return{key,negative:!!negative};}return null;}
export function check(level,groups,expression){const ast=parse(expression);for(const g of groups)if(!g.mapping)throw Error('Non posso assegnare vero o falso a «'+g.text+'». Seleziona una proposizione completa.');const expected=parse(level.rule),keys=Object.keys(level.props);const cases=assignments(keys,level.valid).map(input=>{const values=Object.fromEntries(groups.map(g=>[g.letter,g.mapping.negative?1-input[g.mapping.key]:input[g.mapping.key]]));const actual=evaluate(ast,values);return{input,values,actual,expected:evaluate(expected,input)};});return{ast,cases,wrong:cases.filter(c=>c.actual!==c.expected)};}
export const rename=(expression,from,to)=>expression.replace(/[A-Z]/g,c=>c===from?to:c);
// Return exact source/result ranges, so identical subexpressions remain distinguishable.
export function trace(ast, values) {
 const substitute = (n,id='r') => n.op === 'var' ? {op:'num',id,value:evaluate(n,values)}
  : n.op === '!' ? {op:'!',id,arg:substitute(n.arg,id+'.arg')}
  : {op:n.op,id,a:substitute(n.a,id+'.a'),b:substitute(n.b,id+'.b')};
 function format(node, focus) {
  let text='', range=null;
  function visit(n) {
   const start=text.length;
   if(n.op==='num') text+=n.value;
   else if(n.op==='!'){text+='!';visit(n.arg);}
   else {text+='(';visit(n.a);text+=' '+n.op+' ';visit(n.b);text+=')';}
   if(n===focus)range=[start,text.length];
  }
  visit(node);return {text,range};
 }
 let tree=substitute(ast);const solved={};
 const out=[{expression:format(tree).text,explanation:'Sostituiamo ogni lettera con il suo valore in questo caso.'}];
 while(tree.op!=='num') {
  const ready=[];
  function collect(n,depth=0){
   if(n.op==='num')return;
   if(n.op==='!'){if(n.arg.op==='num')ready.push({node:n,depth});else collect(n.arg,depth+1);}
   else {if(n.a.op==='num'&&n.b.op==='num')ready.push({node:n,depth});else {collect(n.a,depth+1);collect(n.b,depth+1);}}
  }
  collect(tree);const priority={'!':0,'&':1,'|':2};
  ready.sort((a,b)=>b.depth-a.depth||priority[a.node.op]-priority[b.node.op]);
  const target=ready[0].node;
  const value=target.op==='!'?1-target.arg.value:target.op==='&'?target.a.value&target.b.value:target.a.value|target.b.value;
  const replacement={op:'num',id:target.id,value};
  const explanation=target.op==='!'?`NOT cambia ${target.arg.value} in ${value}.`:target.op==='&'?`AND: ${target.a.value} & ${target.b.value} = ${value}. Servono entrambi veri.`:`OR: ${target.a.value} | ${target.b.value} = ${value}. Basta almeno un vero.`;
  function reduce(n){
   if(n===target)return replacement;
   if(n.op==='num')return n;
   return n.op==='!'?{...n,arg:reduce(n.arg)}:{...n,a:reduce(n.a),b:reduce(n.b)};
  }
  const next=reduce(tree),before=format(tree,target),after=format(next,replacement);
  solved[target.id]=replacement.value;
  out.push({solved:{...solved},activeNode:target.id,expression:after.text,previous:before.text,beforeRange:before.range,afterRange:after.range,operator:target.op,explanation});
  tree=next;
 }
 return out;
}
