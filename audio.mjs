// Original synthesized workshop cues. No recordings, downloads or external service.
// hz, delay, duration, gain, wave, endHz: short attacks and soft decays keep speech clear.
export const cues=Object.freeze({
 tap:[[780,0,.025,.018,'triangle',280],[1700,0,.018,.008,'sine',900]],
 assign:[[330,0,.09,.032,'triangle',330],[660,.045,.18,.025,'sine',660],[990,.045,.13,.009,'sine',990]],
 start:[[130,0,.12,.028,'triangle',195],[392,.09,.18,.025,'sine',392]],
 step:[[560,0,.035,.019,'triangle',320],[840,.025,.09,.015,'sine',840]],
 yes:[[523,0,.13,.028,'sine',523],[659,.09,.16,.027,'sine',659],[784,.18,.24,.025,'sine',784]],
 no:[[196,0,.13,.028,'triangle',174],[147,.11,.22,.025,'triangle',131]],
 win:[[392,0,.13,.027,'triangle',392],[523,.1,.16,.028,'sine',523],[659,.2,.19,.027,'sine',659],[784,.3,.36,.025,'sine',784],[1046,.3,.29,.012,'sine',1046]],
 hint:[[660,0,.14,.024,'sine',660],[990,.09,.24,.019,'sine',990]]
});
export function createSoundPlayer(makeContext){
 let context,enabled=true,lastTap=-Infinity;const active=new Set();
 function silence(){for(const node of active){try{node.stop(context.currentTime);}catch{}try{node.disconnect();node.voiceGain?.disconnect();}catch{}}active.clear();lastTap=-Infinity;}
 function configure(value){enabled=!!value;if(!enabled)silence();}
 function unlock(){if(!enabled)return;try{context??=makeContext();if(context.state==='suspended')context.resume().catch(()=>{});}catch{}}
 function sound(name){
  if(!enabled)return;unlock();if(!context||context.state==='closed')return;
  const now=context.currentTime;
  if(name==='tap'){if(now-lastTap<.045)return;lastTap=now;}
  try{for(const [hz,delay,duration,volume,wave,endHz] of cues[name]||cues.tap){
   const osc=context.createOscillator(),gain=context.createGain(),at=now+delay;
   osc.type=wave;osc.frequency.setValueAtTime(hz,at);osc.frequency.exponentialRampToValueAtTime(endHz,at+duration);
   gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(volume,at+.004);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
   osc.connect(gain).connect(context.destination);osc.voiceGain=gain;active.add(osc);
   osc.onended=()=>{active.delete(osc);osc.disconnect();gain.disconnect();};
   osc.start(at);osc.stop(at+duration+.015);
  }}catch{silence();}
 }
 return {configure,unlock,sound,silence};
}
const player=createSoundPlayer(()=>new(window.AudioContext||window.webkitAudioContext)());
export const configureSound=player.configure,unlock=player.unlock,sound=player.sound,silence=player.silence;
