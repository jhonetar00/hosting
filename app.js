// ===== DATOS ORIGINALES =====
let dataStore = JSON.parse(localStorage.getItem("dataStore")) || {
  user: [
    {id:1, nombre:"Jhon Ramirez", rol:"Admin", correo:"admin.jramirez@technologyserver.com", info:"Usuario principal", archivos:{"info.txt":"Información del usuario"}}
  ],
  bitacora: [{id:1,nombre:"Registro 01",info:"Primer registro", archivos:{"registro.txt":"Contenido inicial"}}],
  chip: [{id:1,tipo:"SIM7600",estado:"Activo", archivos:{"info.txt":"Contenido inicial"}}],
  data: [{id:1,tipo:"GPS",estado:"Activo", archivos:{"gps.txt":"Datos GPS"}}],
  "datos-partners": [{id:1,nombre:"Archivo1.txt",info:"Datos reenviados", archivos:{"data1.txt":"Contenido"}}],
  documentos: [{id:1,nombre:"Contrato.docx",info:"Documento legal", archivos:{"contrato.txt":"Texto"}}],
  equipos: [{id:1,nombre:"Laptop",modelo:"Dell XPS",serial:"12345",estado:"Operativo",imagen:"https://via.placeholder.com/100", archivos:{ "readme.txt":"Contenido inicial del laptop" }}],
  mantenimientos: [{id:1,equipo:"Laptop",historial:"Revisión software", archivos:{"historial.txt":"Detalles mantenimiento"}}],
  security: [{id:1,servicio:"Mantenimiento Router",info:"Revisar conectividad", archivos:{"servicio.txt":"Detalles servicio"}}],
  monimar: [],
  registros: []
};

// ===== SESIÓN =====
function loadSession(){
  const sessionUser = localStorage.getItem("username");
  const darkMode = localStorage.getItem("darkMode");
  if(darkMode==="true") document.body.classList.add("dark-mode");
  if(sessionUser){
    document.getElementById("login-container").classList.add("d-none");
    document.getElementById("dashboard-container").classList.remove("d-none");
    document.getElementById("sidebar-username").innerText = sessionUser;
    loadView("dashboard");
  }
}

// ===== LOGIN / LOGOUT =====
document.getElementById("login-btn").addEventListener("click", ()=>{
  const u = document.getElementById("username").value;
  const p = document.getElementById("password").value;
  if(u==="user" && p==="pass"){
    localStorage.setItem("username", u);
    document.getElementById("login-container").classList.add("d-none");
    document.getElementById("dashboard-container").classList.remove("d-none");
    document.getElementById("sidebar-username").innerText = u;
    loadView("dashboard");
    document.getElementById("login-error").classList.add("d-none");
    return;
  }
  document.getElementById("login-error").classList.remove("d-none");
});

document.getElementById("logout-btn").addEventListener("click", ()=>{
  localStorage.removeItem("username");
  document.getElementById("dashboard-container").classList.add("d-none");
  document.getElementById("login-container").classList.remove("d-none");
  document.getElementById("username").value="";
  document.getElementById("password").value="";
  document.getElementById("login-error").classList.add("d-none");
});

// ===== DARK MODE =====
document.getElementById("darkModeSwitch").addEventListener("change",()=>{
  document.body.classList.toggle("dark-mode");
  localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
});

// ===== SIDEBAR =====
document.querySelectorAll("#menu .nav-link").forEach(link=>{
  link.addEventListener("click", e=>{
    e.preventDefault();
    document.querySelectorAll("#menu .nav-link").forEach(l=>l.classList.remove("active"));
    link.classList.add("active");
    document.getElementById("breadcrumb").innerText = link.innerText;
    loadView(link.dataset.target);
  });
});

// ===== VISTA =====
const viewRoot = document.getElementById("view-root");
function loadView(section){
  switch(section){
    case "dashboard":
      viewRoot.innerHTML = "<h3>Panel Principal del Sistema</h3><p>Bienvenido al dashboard.</p>";
      break;
    case "monimar": loadMonimar(); break;
    default: renderSection(section);
  }
}

// ===== RENDER TABLAS CON ACCIONES =====
function renderSection(section){
  const items = dataStore[section];
  let html = `<h3>${section}</h3>`;
  if(!items || items.length===0){ viewRoot.innerHTML = html+"<p>No hay registros</p>"; return; }

  html += `<table class="table table-striped" id="table-${section}"><thead><tr>`;
  Object.keys(items[0]).forEach(k=>{
    if(k!=="archivos" && k!=="imagen") html+=`<th>${k}</th>`;
  });
  html += `<th>Archivos</th><th>Imagen</th><th>Acciones</th></tr></thead><tbody>`;

  items.forEach((item,i)=>{
    html+=`<tr>`;
    Object.keys(item).forEach(k=>{
      if(k==="archivos"||k==="imagen") return;
      html+=`<td>${item[k]}</td>`;
    });

    html+=`<td>${Object.keys(item.archivos||{}).map(f=>`<button class="btn btn-sm btn-primary" onclick="openTxtFile('${section}',${i},'${f}')">${f}</button>`).join(" ")}
      <button class="btn btn-sm btn-success" onclick="uploadTxtFile('${section}',${i})">Subir TXT</button></td>`;

    html+=`<td>${item.imagen?`<img id="img-${section}-${i}" src="${item.imagen}" class="img-fluid d-none" style="max-width:100px"/>`:``}
      ${section==="equipos"?`<br/><button class="btn btn-sm btn-info" onclick="toggleImage('${section}',${i})">Mostrar/Ocultar</button>
      <button class="btn btn-sm btn-success" onclick="uploadImage('${section}',${i})">Subir Imagen</button>`:``}</td>`;

    html+=`<td>
      <button class="btn btn-sm btn-success" onclick="addItem('${section}')">Agregar</button>
      <button class="btn btn-sm btn-danger" onclick="deleteItem('${section}',${i})">Eliminar</button>
      <button class="btn btn-sm btn-warning" onclick="editItem('${section}',${i})">Editar</button>
      <button class="btn btn-sm btn-info" onclick="saveItem('${section}',${i})">Guardar</button>
    </td>`;

    html+=`</tr>`;
  });

  html+=`</tbody></table>`;
  viewRoot.innerHTML = html;
}

// ===== CRUD =====
function addItem(section){
  const newItem = Object.assign({}, dataStore[section][0]);
  Object.keys(newItem).forEach(k=>{
    if(typeof newItem[k]==="string") newItem[k]="";
    if(typeof newItem[k]==="object") newItem[k]={};
  });
  dataStore[section].push(newItem);
  saveDataStore();
  renderSection(section);
}
function deleteItem(section,i){
  if(confirm("¿Eliminar este item?")){
    dataStore[section].splice(i,1);
    saveDataStore();
    renderSection(section);
  }
}
function editItem(section,i){
  const keys = Object.keys(dataStore[section][i]);
  keys.forEach(k=>{
    if(typeof dataStore[section][i][k]==="string"){
      const val = prompt(`Editar ${k}:`, dataStore[section][i][k]);
      if(val!==null) dataStore[section][i][k]=val;
    }
  });
  saveDataStore();
  renderSection(section);
}
function saveItem(section,i){
  saveDataStore();
  alert("Guardado correctamente!");
}

// ===== MONIMAR =====
let monimarCharts = {};
async function loadMonimar(){
  if(document.querySelector("#menu .nav-link.active").dataset.target !== "monimar") return;
  viewRoot.innerHTML = `
    <div id="monimarPanels">
      <div class="monimar-panel"><h5>Nivel [m]</h5><canvas id="nivelChart"></canvas></div>
      <div class="monimar-panel"><h5>Temperatura [°C]</h5><canvas id="tempChart"></canvas></div>
      <div class="monimar-panel"><h5>Humedad [%]</h5><canvas id="humChart"></canvas></div>
      <div class="monimar-panel">
        <h5>Acciones</h5>
        <button class="btn btn-sm btn-success mb-1" onclick="downloadMonimarData()">Descargar datos</button>
      </div>
    </div>
  `;

  async function fetchAndUpdate(){
    try{
      const resp = await fetch("https://api.thingspeak.com/channels/3034575/feeds.json?api_key=MW7EED9XDLDQCQL7&results=100");
      const data = await resp.json();
      const feeds = data.feeds || [];
      const labels = feeds.map(f => new Date(f.created_at).toLocaleString());
      const nivel = feeds.map(f => parseFloat(f.field1)||0);
      const temp = feeds.map(f => parseFloat(f.field3)||0);
      const hum = feeds.map(f => parseFloat(f.field4)||0);

      // Guardar datos para descargar
      dataStore.monimar = feeds.map(f=>({
        hora: new Date(f.created_at).toLocaleString(),
        nivel: parseFloat(f.field1)||0,
        temp: parseFloat(f.field3)||0,
        hum: parseFloat(f.field4)||0
      }));

      function createOrUpdateChart(id, dataArr, label, color){
        if(monimarCharts[id]){
          monimarCharts[id].data.labels = labels;
          monimarCharts[id].data.datasets[0].data = dataArr;
          monimarCharts[id].update();
        }else{
          monimarCharts[id] = new Chart(document.getElementById(id).getContext('2d'),{
            type:'line',
            data:{
              labels:labels,
              datasets:[{
                label:label,
                data:dataArr,
                borderColor: color,
                backgroundColor:'rgba(0,0,0,0)',
                borderWidth:2,
                tension:0.4,
                pointRadius:0
              }]
            },
            options:{
              responsive:true,
              maintainAspectRatio:false,
              scales:{y:{beginAtZero:true}},
              plugins:{legend:{display:true}}
            }
          });
        }
      }

      createOrUpdateChart("nivelChart",nivel,"Nivel [m]","#007bff");
      createOrUpdateChart("tempChart",temp,"Temperatura [°C]","#dc3545");
      createOrUpdateChart("humChart",hum,"Humedad [%]","#28a745");

    }catch(err){
      console.error(err);
    }
  }

  fetchAndUpdate();
  setInterval(fetchAndUpdate,30000); // cada 30s
}

// ===== DESCARGAR DATOS MONIMAR =====
function downloadMonimarData(){
  if(!dataStore.monimar || dataStore.monimar.length===0){ alert("No hay datos para descargar"); return; }
  const txt = dataStore.monimar.map(d=>`Hora: ${d.hora}, Nivel: ${d.nivel}, Temp: ${d.temp}, Hum: ${d.hum}`).join("\n");
  const blob = new Blob([txt], {type:"text/plain"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `Monimar_${new Date().toISOString()}.txt`;
  a.click();
}

// ===== LOCAL STORAGE =====
function saveDataStore(){
  localStorage.setItem("dataStore", JSON.stringify(dataStore));
}

// ===== EFECTO NODO =====
const canvas = document.getElementById("particleCanvas");
const ctx = canvas.getContext("2d");
let particles=[];
function resizeCanvas(){ canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function initParticles(){
  particles=[];
  for(let i=0;i<70;i++){
    particles.push({
      x: Math.random()*canvas.width,
      y: Math.random()*canvas.height,
      vx: (Math.random()-0.5)*0.7,
      vy: (Math.random()-0.5)*0.7,
      r: Math.random()*2+1
    });
  }
}
initParticles();

function drawParticles(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for(let p of particles){
    ctx.beginPath();
    ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fillStyle="rgba(0,123,255,0.7)";
    ctx.fill();
    ctx.closePath();
  }

  // líneas
  for(let i=0;i<particles.length;i++){
    for(let j=i+1;j<particles.length;j++){
      const dx = particles[i].x-particles[j].x;
      const dy = particles[i].y-particles[j].y;
      const dist = Math.sqrt(dx*dx+dy*dy);
      if(dist<120){
        ctx.beginPath();
        ctx.moveTo(particles[i].x,particles[i].y);
        ctx.lineTo(particles[j].x,particles[j].y);
        ctx.strokeStyle="rgba(0,123,255,0.2)";
        ctx.lineWidth=1;
        ctx.stroke();
        ctx.closePath();
      }
    }
  }

  for(let p of particles){
    p.x += p.vx;
    p.y += p.vy;
    if(p.x<0||p.x>canvas.width) p.vx*=-1;
    if(p.y<0||p.y>canvas.height) p.vy*=-1;
  }

  requestAnimationFrame(drawParticles);
}
drawParticles();

// ===== INICIAL =====
loadSession();
