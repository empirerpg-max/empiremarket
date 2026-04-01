const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwxbkUndhZPtFvtK1uIFTkPNN-m6WeiFVMU3IDzuahsC0oQp8Ba2GLQFOAPkWv8eiA3/exec"; 

let ARTISTA_DATA = {};

// NAVEGAÇÃO SPA (SUBPÁGINAS)
function showScreen(viewId) {
    document.querySelectorAll('.app-screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(viewId);
    if(target) target.classList.add('active');
    window.scrollTo(0, 0);
}

// CARREGAMENTO INICIAL
async function loadData() {
    const params = new URLSearchParams(window.location.search);
    const nome = params.get('nome');
    if(!nome) return;

    try {
        const response = await fetch(`${SCRIPT_URL}?nome=${nome}`);
        ARTISTA_DATA = await response.json();
        
        // Header e Fortuna
        document.getElementById('artist-name').innerText = ARTISTA_DATA.nome;
        document.getElementById('artist-photo').src = ARTISTA_DATA.foto;
        document.getElementById('artist-saldo').innerText = `$EC ${ARTISTA_DATA.saldo.toLocaleString('pt-BR')}`;
        document.getElementById('hub-fortuna').innerText = `$${ARTISTA_DATA.fortuna.toLocaleString('pt-BR')}`;
        
        const banner = document.getElementById('current-activity');
        banner.innerText = (ARTISTA_DATA.status === "Livre") ? "DISPONÍVEL" : ARTISTA_DATA.status.toUpperCase();

        // Barras de Progresso
        document.getElementById('bar-prestigio').style.width = (ARTISTA_DATA.prestigio / 10) + "%";
        document.getElementById('txt-prestigio').innerText = `${ARTISTA_DATA.prestigio}/1000`;
        document.getElementById('bar-fadiga').style.width = ARTISTA_DATA.fadiga + "%";
        document.getElementById('txt-fadiga').innerText = ARTISTA_DATA.fadiga + "%";

    } catch (e) { console.error("Erro na sincronização:", e); }
}

// CENTRAL DE GESTÃO (DASHBOARD DINÂMICO)
function checkManagementView() {
    const container = document.getElementById('mgmt-content');
    container.innerHTML = "";
    let temAlgo = false;

    // Lógica para Turnê
    if (ARTISTA_DATA.tour_info || (ARTISTA_DATA.status && ARTISTA_DATA.status.includes("Preparando"))) {
        temAlgo = true;
        renderTourInMgmt(container);
    }

    // Lógica para Cinema
    if (ARTISTA_DATA.status && ARTISTA_DATA.status.includes("🎬")) {
        temAlgo = true;
        renderCinemaInMgmt(container);
    }

    if (!temAlgo) {
        container.innerHTML = "<p style='text-align:center; opacity:0.3; margin-top:50px;'>Nenhum projeto em andamento.</p>";
    }
    showScreen('view-mgmt');
}

function renderTourInMgmt(container) {
    if (!ARTISTA_DATA.tour_info) {
        // TELA DE SETUP (DATA E QUANTIDADE)
        container.innerHTML += `
            <div class="glass-card">
                <h3 style="margin-bottom:15px; font-size:1.1em;">Finalizar Logística</h3>
                <div class="input-field"><label>DATA DE INÍCIO</label><input type="date" id="t-start"></div>
                <div class="input-field"><label>QUANTIDADE DE SHOWS</label><input type="number" id="t-qtd" value="10"></div>
                <button onclick="gerarItinerario()" class="main-action-btn">GERAR TOUR BOOK</button>
            </div>`;
    } else {
        // DASHBOARD DA TOUR
        const info = ARTISTA_DATA.tour_info;
        const agenda = JSON.parse(info.agenda);
        let agendaHtml = "";
        agenda.forEach(show => {
            agendaHtml += `<div class="agenda-card"><div><small style="color:#bc13fe; font-weight:800; font-size:0.6em;">${show.data}</small><b style="display:block; font-size:0.85em;">${show.local}</b></div><div style="text-align:right;"><b style="color:#ffd700; font-size:0.75em;">EC ${show.arrecadado.toLocaleString()}</b></div></div>`;
        });
        container.innerHTML += `
            <div class="glass-card" style="text-align:left;">
                <h3 style="font-size:1.3em; margin-bottom:5px;">${info.nomeTour}</h3>
                <div class="tour-stats-grid">
                    <div class="t-stat"><b>ARRECADAÇÃO</b><span>$EC ${info.arrecadacao.toLocaleString()}</span></div>
                    <div class="t-stat"><b>PROGRESSO</b><span>Show ${info.showAtual}/${info.totalShows}</span></div>
                </div>
            </div>
            ${agendaHtml}`;
    }
}

function renderCinemaInMgmt(container) {
    const titulo = ARTISTA_DATA.status.replace("🎬 ", "");
    container.innerHTML += `
        <div class="mgmt-project-card" style="border-left-color: #00ff88;">
            <h4>🎬 CINEMA: ${titulo}</h4>
            <p>Status: Gravações no Set (Etapa 1 de 3)</p>
            <div style="margin-top:10px; font-size:0.6em; color:#ffd700;">Lançamento em breve</div>
        </div>`;
}

// AÇÕES DE COMPRA E GERAÇÃO
async function contratarTour(porte) {
    const t = document.getElementById('tour-nome').value;
    if(!t) return alert("Dê um nome à turnê!");
    await enviar('contratar_tour', { nome: ARTISTA_DATA.nome, tipo: porte, titulo: t });
}

async function contratarCinema(porte) {
    const t = document.getElementById('cinema-titulo').value;
    if(!t) return alert("Dê um título à obra!");
    await enviar('contratar_cinema', { nome: ARTISTA_DATA.nome, tipo: porte, titulo: t });
}

async function gerarItinerario() {
    const q = document.getElementById('t-qtd').value;
    const d = document.getElementById('t-start').value;
    if(!d) return alert("Escolha a data de início!");
    await enviar('gerar_itinerario', { nome: ARTISTA_DATA.nome, qtd: q, dataInicio: d });
}

async function enviar(acao, params) {
    document.body.style.opacity = "0.5";
    let url = `${SCRIPT_URL}?acao=${acao}`;
    for (let k in params) url += `&${k}=${encodeURIComponent(params[k])}`;
    try {
        const res = await fetch(url);
        const txt = await res.text();
        alert(txt);
        location.reload();
    } catch(e) { alert("Erro de conexão"); document.body.style.opacity = "1"; }
}

window.onload = loadData;
