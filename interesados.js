/**
 * interesados.js — apartado "Interesados" del dashboard TIMS.
 * Se carga con UNA sola línea en Index.html:
 *   <script src="https://wearetims.github.io/calculadora_we_are_tims/interesados.js"></script>
 * Inyecta su CSS, crea la sección, la registra en el menú lateral, pinta las
 * tarjetas (Por contactar / Contactados) y habla con Interesados.gs.
 */
(function () {
  "use strict";

  // ── 1. CSS ──────────────────────────────────────────────────────────────
  var CSS = ''
    + '#apartado-interesados .iw{padding:18px 24px 44px;}'
    + '#apartado-interesados .itop{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:16px;}'
    + '#apartado-interesados .ititle{font-family:var(--display);font-size:19px;font-weight:700;color:var(--text);}'
    + '#apartado-interesados .isub{font-size:11.5px;color:var(--text3);margin-top:2px;max-width:680px;}'
    + '#apartado-interesados .isearch{font-family:Inter,sans-serif;font-size:12px;padding:8px 13px;border:1.5px solid var(--border);border-radius:9px;background:var(--surface);color:var(--text);min-width:220px;margin-left:auto;}'
    + '#apartado-interesados .isearch:focus{outline:none;border-color:var(--blue);}'
    + '#apartado-interesados .iupd{font-size:11px;color:var(--text3);width:100%;}'
    + '#apartado-interesados .iboard{display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start;}'
    + '@media(max-width:900px){#apartado-interesados .iboard{grid-template-columns:1fr;}}'
    + '#apartado-interesados .icol{background:var(--surface2);border:1px solid var(--border);border-radius:16px;padding:12px 12px 16px;min-height:160px;}'
    + '#apartado-interesados .icol-h{display:flex;align-items:center;gap:9px;padding:6px 6px 12px;}'
    + '#apartado-interesados .icol-dot{width:9px;height:9px;border-radius:50%;}'
    + '#apartado-interesados .icol-t{font-family:var(--display);font-weight:700;font-size:13.5px;color:var(--text);}'
    + '#apartado-interesados .icol-n{font-size:11px;font-weight:700;color:var(--text2);background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:2px 9px;margin-left:auto;}'
    + '#apartado-interesados .icards{display:flex;flex-direction:column;gap:11px;min-height:40px;}'
    + '#apartado-interesados .icard{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:14px 15px;box-shadow:var(--shadow-sm);transition:box-shadow .2s,transform .2s;}'
    + '#apartado-interesados .icard:hover{box-shadow:var(--shadow-md);transform:translateY(-1px);}'
    + '#apartado-interesados .icard.done{background:#fff9e6;border-color:#f0dc9a;}'
    + '#apartado-interesados .ic-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;}'
    + '#apartado-interesados .ic-name{font-family:var(--display);font-weight:700;font-size:14.5px;color:var(--text);}'
    + '#apartado-interesados .ic-emp{font-size:12px;color:var(--text2);margin-top:1px;}'
    + '#apartado-interesados .ic-tipo{flex-shrink:0;font-size:10px;font-weight:700;padding:3px 9px;border-radius:20px;background:var(--blue-lt);color:var(--blue);white-space:nowrap;}'
    + '#apartado-interesados .ic-tipo.r{background:#e0f3f5;color:#0e7490;}'
    + '#apartado-interesados .ic-meta{display:flex;flex-wrap:wrap;gap:5px 8px;margin:10px 0;font-size:11.5px;color:var(--text2);}'
    + '#apartado-interesados .ic-tag{background:var(--surface2);border:1px solid var(--border);border-radius:7px;padding:2px 8px;}'
    + '#apartado-interesados .ic-contact{display:flex;flex-wrap:wrap;gap:6px 14px;font-size:12px;margin-bottom:8px;align-items:center;}'
    + '#apartado-interesados .ic-contact a{color:var(--blue);text-decoration:none;font-weight:500;}'
    + '#apartado-interesados .ic-when{color:var(--text3);font-size:11px;margin-left:auto;}'
    + '#apartado-interesados .ic-when.old{color:#c0392b;font-weight:600;}'
    + '#apartado-interesados .ic-msg{font-size:12px;color:var(--text2);background:var(--surface2);border-radius:9px;padding:8px 11px;margin-bottom:10px;line-height:1.45;border-left:3px solid var(--border);}'
    + '#apartado-interesados .ic-notes-l{font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--text3);margin-bottom:4px;}'
    + '#apartado-interesados .ic-notes-s{font-weight:600;font-size:9px;color:var(--turq);opacity:0;text-transform:none;margin-left:6px;}'
    + '#apartado-interesados .ic-notes-s.show{opacity:1;}'
    + '#apartado-interesados textarea.ic-notes{width:100%;box-sizing:border-box;font-family:Inter,sans-serif;font-size:12px;color:var(--text);border:1.5px solid var(--border);border-radius:9px;padding:8px 10px;resize:vertical;min-height:38px;background:var(--surface);}'
    + '#apartado-interesados textarea.ic-notes:focus{outline:none;border-color:var(--blue);}'
    + '#apartado-interesados .ic-actions{margin-top:11px;}'
    + '#apartado-interesados .ibtn{width:100%;font-family:Inter,sans-serif;font-size:12.5px;font-weight:700;padding:10px;border-radius:10px;cursor:pointer;border:none;}'
    + '#apartado-interesados .ibtn-do{background:var(--turq);color:#fff;}'
    + '#apartado-interesados .ibtn-do:hover{background:#009c9c;}'
    + '#apartado-interesados .ibtn-undo{background:transparent;color:var(--text2);border:1.5px solid var(--border);}'
    + '#apartado-interesados .ibtn-undo:hover{border-color:var(--blue);color:var(--blue);}'
    + '#apartado-interesados .iempty{padding:26px 12px;text-align:center;color:var(--text3);font-size:12px;}'
    + '#apartado-interesados .iloading{display:flex;align-items:center;gap:12px;justify-content:center;padding:50px;color:var(--text2);}'
    + '#apartado-interesados .itoast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(20px);background:var(--text);color:#fff;font-size:13px;font-weight:600;padding:11px 20px;border-radius:12px;box-shadow:var(--shadow-lg);opacity:0;pointer-events:none;transition:all .3s;z-index:900;}'
    + '#apartado-interesados .itoast.show{opacity:1;transform:translateX(-50%) translateY(0);}';

  // ── 2. HTML del apartado ────────────────────────────────────────────────
  var HTML = ''
    + '<div class="iw">'
    +   '<div class="itop">'
    +     '<div>'
    +       '<div class="ititle">Interesados desde la calculadora</div>'
    +       '<div class="isub">Rellenaron el formulario o pidieron reunión. Marca a quién ya has contactado y apunta notas (se guardan solas).</div>'
    +     '</div>'
    +     '<input type="text" id="i-search" class="isearch" placeholder="Buscar nombre, empresa, país...">'
    +     '<button type="button" class="cart-btn" id="i-refresh">Actualizar</button>'
    +     '<span class="iupd" id="i-updated"></span>'
    +   '</div>'
    +   '<div id="i-body"><div class="iloading"><div class="loader-ring"></div><span>Cargando interesados...</span></div></div>'
    + '</div>'
    + '<div class="itoast" id="i-toast"></div>';

  // ── 3. Estado y helpers ─────────────────────────────────────────────────
  var DATA = [], loaded = false;
  function esc(s){ s=String(s==null?"":s); return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
  function haceCuanto(ms){
    if(!ms) return "";
    var d=Math.floor((Date.now()-ms)/86400000);
    if(d<=0){ var h=Math.floor((Date.now()-ms)/3600000); return h<=0?"hace un momento":"hace "+h+" h"; }
    return d===1?"hace 1 día":"hace "+d+" días";
  }
  function diasEspera(ms){ return ms?Math.floor((Date.now()-ms)/86400000):0; }

  // ── 4. Carga de datos ───────────────────────────────────────────────────
  window.ensureInteresados = function(){ if(!loaded) window.loadInteresados(); };
  window.loadInteresados = function(){
    var b=document.getElementById("i-body");
    if(b) b.innerHTML='<div class="iloading"><div class="loader-ring"></div><span>Cargando interesados...</span></div>';
    google.script.run
      .withSuccessHandler(onData)
      .withFailureHandler(function(e){ if(b) b.innerHTML='<div class="iempty">Error: '+(e&&e.message||e)+'</div>'; })
      .getInteresadosData();
  };
  function onData(res){
    loaded=true;
    var b=document.getElementById("i-body");
    if(res && res.error){ if(b) b.innerHTML='<div class="iempty">Error: '+res.error+'</div>'; return; }
    DATA=(res&&res.records)||[];
    var u=document.getElementById("i-updated");
    if(u) u.textContent=res&&res.timestamp?"Actualizado: "+res.timestamp:"";
    render();
  }

  // ── 5. Render ───────────────────────────────────────────────────────────
  function card(r){
    var esR=String(r.tipo).toLowerCase().indexOf("reuni")>=0;
    var tipoTxt=esR?"Reunión":"Formulario", tipoCls=esR?" r":"";
    var meta="", campos=[r.perfil,r.posicion,r.pais,r.seniority];
    for(var k=0;k<campos.length;k++){ if(campos[k]) meta+='<span class="ic-tag">'+esc(campos[k])+'</span>'; }
    var oldCls=(!r.contactado && diasEspera(r.fechaMs)>=5)?" old":"";
    var extraPers=(r.personas && r.personas!=="1")?(" - "+esc(r.personas)+" personas"):"";
    var h="";
    h+='<div class="icard'+(r.contactado?' done':'')+'" data-row="'+r.row+'">';
    h+='<div class="ic-top"><div>';
    h+='<div class="ic-name">'+esc(r.nombre||"-")+'</div>';
    h+='<div class="ic-emp">'+esc(r.empresa||"Sin empresa")+extraPers+'</div>';
    h+='</div><span class="ic-tipo'+tipoCls+'">'+tipoTxt+'</span></div>';
    if(meta) h+='<div class="ic-meta">'+meta+'</div>';
    h+='<div class="ic-contact">';
    if(r.email) h+='<a href="mailto:'+esc(r.email)+'">✉ '+esc(r.email)+'</a>';
    if(r.telefono) h+='<a href="tel:'+esc(r.telefono)+'">☎ '+esc(r.telefono)+'</a>';
    h+='<span class="ic-when'+oldCls+'">'+esc(haceCuanto(r.fechaMs))+'</span></div>';
    if(r.mensaje) h+='<div class="ic-msg">'+esc(r.mensaje)+'</div>';
    h+='<div class="ic-notes-l">Notas internas<span class="ic-notes-s" data-note-status="'+r.row+'">✓ guardado</span></div>';
    h+='<textarea class="ic-notes" data-note="'+r.row+'" rows="1" placeholder="Añade una nota...">'+esc(r.notas)+'</textarea>';
    h+='<div class="ic-actions">';
    h+= r.contactado
      ? '<button type="button" class="ibtn ibtn-undo" data-undo="'+r.row+'">↩ Volver a por contactar</button>'
      : '<button type="button" class="ibtn ibtn-do" data-done="'+r.row+'">✓ Marcar como contactado</button>';
    h+='</div></div>';
    return h;
  }
  function render(){
    var q=(document.getElementById("i-search").value||"").toLowerCase().trim();
    var pend=[], done=[];
    for(var i=0;i<DATA.length;i++){
      var r=DATA[i];
      if(q){ var hay=[r.nombre,r.empresa,r.email,r.pais,r.posicion].join(" ").toLowerCase().indexOf(q)>=0; if(!hay) continue; }
      if(r.contactado) done.push(r); else pend.push(r);
    }
    var pendHtml=pend.length?pend.map(card).join(""):'<div class="iempty">Nada pendiente</div>';
    var doneHtml=done.length?done.map(card).join(""):'<div class="iempty">Aun ninguno</div>';
    var html='<div class="iboard">'
      +'<div class="icol"><div class="icol-h"><span class="icol-dot" style="background:var(--blue)"></span><span class="icol-t">Por contactar</span><span class="icol-n">'+pend.length+'</span></div><div class="icards">'+pendHtml+'</div></div>'
      +'<div class="icol"><div class="icol-h"><span class="icol-dot" style="background:var(--turq)"></span><span class="icol-t">Contactados</span><span class="icol-n">'+done.length+'</span></div><div class="icards">'+doneHtml+'</div></div>'
      +'</div>';
    document.getElementById("i-body").innerHTML=html;
  }
  function toast(msg){
    var t=document.getElementById("i-toast");
    t.textContent=msg; t.classList.add("show");
    clearTimeout(t._t); t._t=setTimeout(function(){ t.classList.remove("show"); },2200);
  }
  function setContactado(row,val){
    var r=null;
    for(var i=0;i<DATA.length;i++){ if(DATA[i].row===row){ r=DATA[i]; break; } }
    if(!r) return;
    r.contactado=val; render();
    toast(val?"Marcado como contactado":"Devuelto a por contactar");
    google.script.run
      .withSuccessHandler(function(res){ if(!res||!res.ok){ r.contactado=!val; render(); toast("No se pudo guardar"); } })
      .withFailureHandler(function(){ r.contactado=!val; render(); toast("Error al guardar"); })
      .setInteresadoContactado(row,val);
  }

  // ── 6. Montaje del apartado + menú + eventos ────────────────────────────
  function montar(){
    if(document.getElementById("apartado-interesados")) return true;
    if(!document.body) return false;

    var style=document.createElement("style"); style.textContent=CSS; document.head.appendChild(style);

    var sec=document.createElement("div");
    sec.className="apartado"; sec.id="apartado-interesados"; sec.innerHTML=HTML;
    document.body.appendChild(sec);

    var body=document.getElementById("i-body");
    body.addEventListener("click",function(e){
      var d=e.target.closest("[data-done]"); if(d){ setContactado(Number(d.dataset.done),true); return; }
      var u=e.target.closest("[data-undo]"); if(u){ setContactado(Number(u.dataset.undo),false); return; }
    });
    body.addEventListener("change",function(e){
      var ta=e.target.closest("textarea[data-note]"); if(!ta) return;
      var row=Number(ta.dataset.note), texto=ta.value;
      for(var i=0;i<DATA.length;i++){ if(DATA[i].row===row){ DATA[i].notas=texto; break; } }
      var st=body.querySelector('[data-note-status="'+row+'"]');
      google.script.run
        .withSuccessHandler(function(res){ if(res&&res.ok&&st){ st.classList.add("show"); setTimeout(function(){ st.classList.remove("show"); },1600); } })
        .withFailureHandler(function(){ toast("No se pudo guardar la nota"); })
        .guardarNotaInteresado(row,texto);
    });
    document.getElementById("i-search").addEventListener("input",render);
    document.getElementById("i-refresh").addEventListener("click",window.loadInteresados);

    // botón en el menú lateral
    var nav=document.querySelector(".drawer-nav");
    if(nav && !nav.querySelector('[data-apartado="interesados"]')){
      var b=document.createElement("button");
      b.type="button"; b.className="drawer-item"; b.dataset.apartado="interesados";
      b.innerHTML='<span class="di-ic"><svg width="17" height="17" viewBox="0 0 16 16" fill="none"><path d="M2 3.5h12v9H2z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M2 4l6 4.5L14 4" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg></span> Interesados';
      b.addEventListener("click",function(){
        if(typeof switchApartado==="function") switchApartado("interesados");
        window.ensureInteresados();
        setTimeout(function(){ var hd=document.querySelector(".header-title"); if(hd) hd.textContent="Interesados"; },0);
      });
      nav.appendChild(b);
    }
    return true;
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",montar);
  } else {
    if(!montar()) document.addEventListener("DOMContentLoaded",montar);
  }
})();
