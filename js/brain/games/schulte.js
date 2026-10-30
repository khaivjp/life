(() => {
const K=KhaiLife;
K.games.schulte={id:'schulte',name:'Bảng Schulte',category:'Tập trung',icon:'grid',accent:'sage',description:'Tìm số bằng mắt, chỉ bấm bắt đầu và dừng đồng hồ.',rules:'Bấm Bắt đầu để hiện bảng, dùng mắt tìm số từ 1 đến hết rồi bấm Dừng. Không chạm các ô. Kết quả tự xác nhận, không đo độ chính xác.',duration:'1–2 phút',start(s){
const size=[3,4,5][s.level],total=size*size;let start=null,done=false;
s.prompt('Dùng mắt tìm số từ 1 đến '+total+'.');s.progress('Sẵn sàng');
s.stage.innerHTML='<div class="schulte-board" style="--cols:'+size+';visibility:hidden">'+K.shuffle(Array.from({length:total},(_,i)=>i+1)).map(n=>'<div style="aspect-ratio:1;display:grid;place-items:center;border:1px solid var(--line);border-radius:10px;background:var(--surface-2);font-size:28px;font-weight:700">'+n+'</div>').join('')+'</div><button class="btn primary">Bắt đầu</button>';
const b=s.stage.querySelector('button');b.onclick=()=>{if(s.paused||!s.active||done)return;if(start===null){start=s.elapsed;s.stage.querySelector('.schulte-board').style.visibility='visible';b.textContent='Dừng — đã tìm xong';s.progress('Đang tính giờ');}else{done=true;const seconds=(s.elapsed-start)/1000;s.finish({correct:0,total:0,score:0,detail:'Tự xác nhận tìm đủ '+total+' số trong '+seconds.toFixed(1)+' giây. Không chấm điểm / độ chính xác.'});}};
}};})();
