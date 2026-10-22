// Stable path IDs preserve the identity of repeated letters and identical subtrees.
export function treeLayout(ast, bindings={}, solved={}, activeNode=null, activeLetter=null) {
 const nodes=[],edges=[];let leaf=0,maxDepth=0;
 function walk(n,id,depth){
  const item={id,op:n.op,key:n.key,depth};nodes.push(item);maxDepth=Math.max(maxDepth,depth);
  const children=n.op==='var'?[]:n.op==='!'?[[n.arg,id+'.arg']]:[[n.a,id+'.a'],[n.b,id+'.b']];
  const xs=children.map(([child,childId])=>{edges.push({from:id,to:childId});return walk(child,childId,depth+1);});
  item.x=xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:leaf++*76;
  item.y=depth*74+34;
  item.value=n.op==='var'?(/[01]/.test(n.key)?+n.key:bindings[n.key]):solved[id];
  item.active=id===activeNode||(n.op==='var'&&n.key===activeLetter);
  item.resolved=item.value!==undefined;
  return item.x;
 }
 walk(ast,'r',0);
 const width=Math.max(280,leaf*76+4),shift=(width-(leaf-1)*76)/2;
 nodes.forEach(n=>n.x+=shift);
 return {nodes,edges,width,height:maxDepth*74+70};
}

// Fit can go below the manual zoom minimum for unusually large valid expressions.
export function fitTreeScale(graph,width,height){return Math.max(.01,Math.min(1,width/graph.width,height/graph.height));}
