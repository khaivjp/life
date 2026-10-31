/* GPA học kỳ HVU: thang điểm chữ, trọng số và tích lũy tín chỉ. */
(() => {
  "use strict";
  const K = KhaiLife, E = K.esc;
  let root, chosen = 0;
  const parse = x => {
    const s = String(x ?? "").trim().replace(",", ".");
    if (!/^\d+(?:\.\d{1,3})?$/.test(s)) return null;
    const v = Number(s);
    return Number.isFinite(v) ? v : null;
  };
  const numeric = (x, min, max) => {
    const n = parse(x);
    return n !== null && n >= min && n <= max ? n : null;
  };
  const round1 = n => Math.round((n + Number.EPSILON) * 10) / 10;
  const classify = n => n === null ? null :
    n >= 8.5 ? ["A",4,"Giỏi"] :
    n >= 7 ? ["B",3,"Khá"] :
    n >= 5.5 ? ["C",2,"Trung bình"] :
    n >= 4 ? ["D",1,"Trung bình yếu"] : ["F",0,"Kém"];
  const f = (v,d=1) => v === null ? "—" : v.toLocaleString("vi-VN",{minimumFractionDigits:d,maximumFractionDigits:d});
  function calc(c) {
    const a=numeric(c.process,0,10), b=numeric(c.exam,0,10);
    const w=numeric(c.weightProcess,0,100), x=numeric(c.weightExam,0,100);
    if (a===null || b===null || w===null || x===null || Math.abs(w+x-100)>.0001) return null;
    return round1(a*w/100+b*x/100);
  }
  function summary(courses) {
    let n=0, four=0, ten=0, passed=0;
    courses.forEach(c=>{
      const v=calc(c), cr=numeric(c.credits,1,60);
      if (cr===null || !Number.isInteger(cr) || v===null) return;
      const kind=classify(v);
      n+=cr; four+=kind[1]*cr; ten+=v*cr;
      if(kind[1]>0) passed+=cr;
    });
    return {n,passed,four:n?four/n:null,ten:n?ten/n:null};
  }
  const all=()=>K.store.get().gpa.semesters;
  const makeCourse=()=>({id:K.uid(),code:"",group:"",name:"",credits:3,process:"",exam:"",weightProcess:50,weightExam:50});
  function persist() {
    try {K.store.persist(false); return true;} catch {K.toast("Không lưu được điểm.");return false;}
  }
  function csv() {
    const rows=[["Học kỳ","Năm học","Mã môn","Nhóm","Tên môn","Tín chỉ","Đánh giá bộ phận","Điểm thi","Trọng số bộ phận %","Trọng số thi %","Điểm TK (10)","Điểm TK (4)","Điểm chữ"]];
    all().forEach(s=>s.courses.forEach(c=>{
      const v=calc(c),k=classify(v);
      rows.push([s.term,s.year,c.code,c.group,c.name,c.credits,c.process,c.exam,c.weightProcess,c.weightExam,v??"",k?.[1]??"",k?.[0]??""]);
    }));
    const quote = v => {
      let s=String(v??"");
      if (/^[=+\-@\t\r]/.test(s)) s="'"+s;
      return '"'+s.replace(/"/g,'""')+'"';
    };
    K.download("KhaiLife-GPA.csv","\uFEFF"+rows.map(r=>r.map(quote).join(";")).join("\r\n"),"text/csv;charset=utf-8");
  }
  function cell(c,field,label,placeholder="",type="text") {
    return '<input data-id="'+E(c.id)+'" data-field="'+field+'" aria-label="'+E(label)+'" type="'+type+'" inputmode="'+(type==="number"?"decimal":"text")+'" value="'+E(c[field]??"")+'" placeholder="'+E(placeholder)+'">';
  }
  function render(container) {
    root=container;
    const ss=all(); chosen=Math.max(0,Math.min(chosen,ss.length-1));
    const s=ss[chosen], total=summary(ss.flatMap(x=>x.courses));
    root.innerHTML='<div class="page-heading"><div><span class="eyebrow">KẾT QUẢ HỌC TẬP</span><h1>Bảng điểm & GPA</h1><p>Theo học kỳ, hệ 10, điểm chữ và hệ 4 theo bảng quy đổi đã cung cấp.</p></div><button class="btn" id="gpa-export">'+K.icon("download")+' Xuất CSV</button></div>'+
      '<div class="gpa-stats"><div class="card"><small>GPA tích lũy hệ 4</small><strong>'+f(total.four,2)+'</strong></div><div class="card"><small>Điểm tích lũy hệ 10</small><strong>'+f(total.ten,2)+'</strong></div><div class="card"><small>Tín chỉ đạt / đã tính</small><strong>'+total.passed+' / '+total.n+'</strong></div></div>'+
      '<section class="card gpa-panel"><div class="gpa-heading"><label>Học kỳ<select id="gpa-semester">'+ss.map((v,i)=>'<option value="'+i+'" '+(i===chosen?"selected":"")+'>Học kỳ '+E(v.term)+' · '+E(v.year)+'</option>').join("")+'</select></label><button class="btn small" id="gpa-add-term">+ Học kỳ</button><button class="btn small danger" id="gpa-remove-term">Xóa học kỳ</button></div>'+
      '<div class="gpa-term-meta"><label>Năm học<input id="gpa-year" value="'+E(s.year)+'" placeholder="2026-2027"></label><label>Học kỳ<input id="gpa-term" type="number" min="1" max="3" value="'+E(s.term)+'"></label></div>'+
      '<div class="gpa-table-wrap"><table class="gpa-table"><thead><tr><th>STT</th><th>Mã MH</th><th>Nhóm</th><th>Tên môn học</th><th>Số tín chỉ</th><th>Đánh giá bộ phận</th><th>Điểm thi</th><th>Điểm TK (10)</th><th>Điểm TK (4)</th><th>Điểm TK (C)</th><th></th></tr></thead><tbody>'+s.courses.map((c,i)=>{
        const v=calc(c),k=classify(v);
        return '<tr><td>'+(i+1)+'</td><td>'+cell(c,"code","Mã môn")+'</td><td>'+cell(c,"group","Nhóm")+'</td><td class="gpa-name">'+cell(c,"name","Tên môn")+'</td><td>'+cell(c,"credits","Tín chỉ","","number")+'</td><td>'+cell(c,"process","Điểm bộ phận","","number")+'</td><td>'+cell(c,"exam","Điểm thi","","number")+'</td><td data-result="'+E(c.id)+'" data-kind="ten">'+f(v)+'</td><td data-result="'+E(c.id)+'" data-kind="four">'+(k?k[1]:"—")+'</td><td data-result="'+E(c.id)+'" data-kind="letter">'+(k?k[0]:"—")+'</td><td><button class="btn small danger" data-delete="'+E(c.id)+'" title="Xóa môn" aria-label="Xóa môn '+(i+1)+'">×</button></td></tr>';
      }).join("")+'</tbody></table></div>'+
      '<div class="gpa-mobile">'+s.courses.map((c,i)=>{
        const v=calc(c),k=classify(v);
        return '<article class="gpa-course"><div class="gpa-course-top"><strong>Môn '+(i+1)+'</strong><button class="btn small danger" data-delete="'+E(c.id)+'">Xóa</button></div><div class="gpa-fields"><label>Mã môn'+cell(c,"code","Mã môn")+'</label><label>Nhóm'+cell(c,"group","Nhóm")+'</label><label class="wide">Tên môn'+cell(c,"name","Tên môn")+'</label><label>Tín chỉ'+cell(c,"credits","Tín chỉ","","number")+'</label><label>Điểm bộ phận'+cell(c,"process","Điểm bộ phận","","number")+'</label><label>Điểm thi'+cell(c,"exam","Điểm thi","","number")+'</label></div><div class="gpa-course-result">Hệ 10: <b data-result="'+E(c.id)+'" data-kind="ten">'+f(v)+'</b> · Hệ 4: <b data-result="'+E(c.id)+'" data-kind="four">'+(k?k[1]:"—")+'</b> · Chữ: <b data-result="'+E(c.id)+'" data-kind="letter">'+(k?k[0]:"—")+'</b></div></article>';
      }).join("")+'</div><button class="btn primary" id="gpa-add-course">+ Thêm môn học</button>'+
      '<div class="gpa-term-summary" id="gpa-term-summary"></div></section>'+
      '<section class="card gpa-help"><h2>Trọng số tính điểm</h2><p>Mặc định 50% đánh giá bộ phận và 50% điểm thi. Bạn có thể thay đổi riêng cho từng môn.</p><div class="gpa-weights">'+s.courses.map(c=>'<div class="gpa-weight-row"><strong>'+E(c.code||c.name||"Môn chưa đặt tên")+'</strong><label>Bộ phận (%)'+cell(c,"weightProcess","Trọng số bộ phận","","number")+'</label><label>Thi (%)'+cell(c,"weightExam","Trọng số thi","","number")+'</label></div>').join("")+'</div><p>Điểm tổng kết hệ 10 làm tròn một chữ số thập phân trước khi quy đổi: A ≥ 8,5 (4); B ≥ 7,0 (3); C ≥ 5,5 (2); D ≥ 4,0 (1); F dưới 4,0 (0). Chỉ tính GPA cho môn đủ điểm và số tín chỉ hợp lệ. Đây là công cụ theo dõi, không thay thế điểm chính thức của trường.</p></section>';
    const one=summary(s.courses);
    K.$("#gpa-term-summary").textContent='Học kỳ '+s.term+' · '+s.year+' — GPA hệ 4: '+f(one.four,2)+' · hệ 10: '+f(one.ten,2)+' · Tín chỉ đạt: '+one.passed+'/'+one.n;
    K.$("#gpa-export").onclick=csv;
    K.$("#gpa-semester").onchange=e=>{chosen=Number(e.target.value);render(root)};
    K.$("#gpa-year").onchange=e=>{s.year=e.target.value.slice(0,30);persist();render(root)};
    K.$("#gpa-term").onchange=e=>{const n=numeric(e.target.value,1,3);if(n!==null){s.term=n;persist()}render(root)};
    K.$("#gpa-add-term").onclick=()=>{ss.unshift({id:K.uid(),term:1,year:"2027-2028",courses:[makeCourse()]});chosen=0;persist();render(root)};
    K.$("#gpa-remove-term").onclick=()=>{if(ss.length===1){K.toast("Cần giữ ít nhất một học kỳ.");return}if(!confirm("Xóa học kỳ và toàn bộ điểm trong học kỳ này?"))return;ss.splice(chosen,1);chosen=0;persist();render(root)};
    K.$("#gpa-add-course").onclick=()=>{s.courses.push(makeCourse());persist();render(root)};
    root.onclick=e=>{
      const b=e.target.closest("[data-delete]");
      if(!b)return;
      s.courses=s.courses.filter(c=>c.id!==b.dataset.delete);
      persist();render(root);
    };
    root.onchange=e=>{
      const input=e.target.closest("input[data-id][data-field]");
      if(!input)return;
      const c=s.courses.find(c=>c.id===input.dataset.id);
      if(!c)return;
      const field=input.dataset.field;
      if(["credits","process","exam","weightProcess","weightExam"].includes(field)&&input.value.trim()!==""){
        const n=numeric(input.value,0,field==="credits"?60:field.startsWith("weight")?100:10);
        if(n===null||(field==="credits"&&!Number.isInteger(n))){K.toast("Điểm, tín chỉ hoặc trọng số không hợp lệ.");render(root);return}
      }
      c[field]=input.value;
      persist();render(root);
    };
  }
  K.gpa={render,calc,classify,summary};
})();
