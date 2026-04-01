const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwxbkUndhZPtFvtK1uIFTkPNN-m6WeiFVMU3IDzuahsC0oQp8Ba2GLQFOAPkWv8eiA3/exec"; 

let ARTISTA_DATA = {};

// NAVEGAÇÃO SPA
function showScreen(id) {
    document.querySelectorAll('.app-view').forEach(v => v.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

async function loadData() {
    const params = new URLSearchParams(window.location.search);
    const nome = params.get('nome');
    if(!nome) return;
    try {
        const res = await fetch(`${SCRIPT_URL}?nome=${nome}`);
        ARTISTA_DATA = await res.json();
        
        document.getElementById('artist-name').innerText = ARTISTA_DATA.nome;
        document.getElementById('artist-photo').src = ARTISTA_DATA.foto;
        document.getElementById('artist-saldo').innerText = `$EC ${ARTISTA_DATA.saldo.toLocaleString('pt-BR')}`;
        document.getElementById('hub-fortuna').innerText = `$${ARTISTA_DATA.fortuna.toLocaleString('pt-BR')}`;
        document.getElementById('current-activity').innerText = (ARTISTA_DATA.status === "Livre") ? "DISPONÍVEL" : ARTISTA_DATA.status.toUpperCase();
        
        document.getElementById('bar-prestigio').style.width = (ARTISTA_DATA.prestigio / 10) + "%";
        document.getElementById('txt-prestigio').innerText = `${ARTISTA_DATA.prestigio}/1000`;
        document.getElementById('bar-fadiga').style.width = ARTISTA_DATA.fadiga + "%";
        document.getElementById('txt-fadiga').innerText = ARTISTA_DATA.fadiga + "%";
    } catch (e) { console.error(e); }
}

// GESTÃO DE PROJETOS (LISTA DE PROJETOS ATIVOS)
function openManagementScreen() {
    const list = document.getElementById('mgmt-list-container');
    list.innerHTML = "";
    let temAlgo = false;

    // Se houver Tour
    if (ARTISTA_DATA.tour_info || (ARTISTA_DATA.status && ARTISTA_DATA.status.includes("Preparando"))) {
        temAlgo = true;
        list.innerHTML += `
            <div class="project-list-card" onclick="goToTourDetails()">
                <h4>🎤 PROJETO DE TURNÊ</h4>
                <p>Status: ${ARTISTA_DATA.tour_info ? 'Em Rota' : 'Pendente de Itinerário'}</p>
            </div>`;
    }

    // Se houver Cinema
    if (ARTISTA_DATA.status && ARTISTA_DATA.status.includes("🎬")) {
        temAlgo = true;
        list.innerHTML += `
            <div class="project-list-card" onclick="goToCinemaDetails()" style="border-left-color: #00ff88;">
                <h4>🎬 PRODUÇÃO DE CINEMA</h4>
                <p>Status: Gravações em Hollywood</p>
            </div>`;
    }

    if (!temAlgo) list.innerHTML = "<p style='text-align:center; opacity:0.3; margin-top:30px;'>Nenhum projeto ativo.</p>";
    showScreen('mgmt-screen');
}

// DETALHES DE TOUR
function goToTourDetails() {
    const content = document.getElementById('tour-details-content');
    content.innerHTML = "";

    if (ARTISTA_DATA.status.includes("Preparando")) {
        content.innerHTML = `
            <div class="glass-card">
                <h3 style="margin-bottom:15px; font-size:1.1em;">Setup do Itinerário</h3>
                <div class="input-field"><label>DATA DE INÍCIO</label><input type="date" id="tour-start"></div>
                <div class="input-field"><label>QTD SHOWS</label><input type="number" id="tour-qtd" value="10"></div>
                <button class="main-action-btn" onclick="gerarItinerario()">Sincronizar Agenda</button>
            </div>`;
    } else {
        const info = ARTISTA_DATA.tour_info;
        const agenda = JSON.parse(info.agenda);
        let agendaHtml = "";
        agenda.forEach(show => {
            agendaHtml += `<div class="agenda-card"><div><small style="color:#bc13fe; font-weight:800;">${show.data}</small><b style="display:block;">${show.local}</b></div><div style="text-align:right;"><b>EC ${show.arrecadado.toLocaleString()}</b></div></div>`;
        });
        content.innerHTML = `
            <div class="glass-card" style="text-align:left;">
                <h3 style="font-size:1.3em; margin-bottom:5px;">${info.nomeTour}</h3>
                <div class="tour-stats-grid">
                    <div class="t-stat"><b>ARRECADAÇÃO</b><span>$EC ${info.arrecadacao.toLocaleString()}</span></div>
                    <div class="t-stat"><b>PROGRESSO</b><span>Show ${info.showAtual}/${info.totalShows}</span></div>
                </div>
            </div>
            ${agendaHtml}`;
    }
    showScreen('tour-details-screen');
}

// DETALHES DE CINEMA
function goToCinemaDetails() {
    const content = document.getElementById('cinema-details-content');
    content.innerHTML = `
        <div class="glass-card" style="text-align:left;">
            <h3 style="font-size:1.3em; margin-bottom:5px;">${ARTISTA_DATA.status.replace("🎬 ", "")}</h3>
            <p style="font-size:0.7em; opacity:0.5;">PRODUÇÃO HOLLYWOOD</p>
        </div>
        <div class="project-list-card" style="border-left-color: #ffd700;"><h4>Etapa 1: Gravações</h4><p>Em andamento (Lançamento em breve)</p></div>
        <div class="project-list-card" style="opacity:0.3; cursor:default;"><h4>Etapa 2: Pós-Produção</h4><p>Bloqueado</p></div>`;
    showScreen('cinema-details-screen');
}

// AÇÕES BACKEND
async function contratarTour(p) {
    const t = document.getElementById('tour-nome').value;
    if(!t) return alert("Dê um nome!");
    await enviar('contratar_tour', { nome: ARTISTA_DATA.nome, tipo: p, titulo: t });
}

async function contratarCinema(p) {
    const t = document.getElementById('cinema-titulo').value;
    if(!t) return alert("Título obrigatório!");
    await enviar('contratar_cinema', { nome: ARTISTA_DATA.nome, tipo: p, titulo: t });
}

async function gerarItinerario() {
    const q = document.getElementById('tour-qtd').value;
    const d = document.getElementById('tour-start').value;
    await enviar('gerar_itinerario', { nome: ARTISTA_DATA.nome, qtd: q, dataInicio: d });
}

async function enviar(acao, params) {
    document.body.style.opacity = "0.5";
    let url = `${SCRIPT_URL}?acao=${acao}`;
    for (let k in params) url += `&${k}=${encodeURIComponent(params[k])}`;
    const res = await fetch(url);
    const txt = await res.text();
    alert(txt);
    location.reload();
}

window.onload = loadData;
