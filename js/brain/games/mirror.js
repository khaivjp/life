(() => {
const K=KhaiLife;
K.games.mirror={id:'mirror',name:'Lật thẻ ghép cặp',category:'Trí nhớ',icon:'grid',accent:'rose',description:'Ghi nhớ vị trí và ghép các cặp biểu tượng giống nhau.',rules:'Lật hai thẻ mỗi lượt. Thẻ giống nhau được giữ mở; khác nhau sẽ úp lại. Tìm hết các cặp. Dùng chuột, bàn phím hoặc chạm.',duration:'1–3 phút',start(s){
const pairs=[4,6,8][s.level],icons=['☀','★','♥','◆','♣','☾','✿','⚑'].slice(0,pairs),cards=K.shuffle([...icons,...icons]);let open=[],busy=false,matched=0,moves=0;
s.prompt('Lật hai thẻ để tìm cặp giống nhau.');
s.stage.innerHTML='<div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;width:min(100%,420px)">'+cards.map((_,i)=>'<button class="answer-button" style="aspect-ratio:1;padding:8px;font-size:30px;min-width:0" aria-label="Thẻ '+(i+1)+'">?</button>').join('')+'</div>';
const bs=[...s.stage.querySelectorAll('button')],progress=()=>s.progress(matched+'/'+pairs+' cặp · '+moves+' lượt');progress();
bs.forEach((b,i)=>b.onclick=()=>{if(s.paused||!s.active||busy||b.disabled||open.includes(i))return;b.textContent=cards[i];open.push(i);if(open.length<2)return;busy=true;moves++;const[a,c]=open;if(cards[a]===cards[c]){bs[a].disabled=bs[c].disabled=true;bs[a].style.background=bs[c].style.background='var(--mint)';matched++;open=[];busy=false;progress();if(matched===pairs)s.finish({correct:pairs,total:moves,score:Math.round(pairs/moves*1000),detail:'Ghép đủ '+pairs+' cặp sau '+moves+' lượt.'});}else{progress();s.later(()=>{open.forEach(j=>bs[j].textContent='?');open=[];busy=false;},900);}});
}};})();
