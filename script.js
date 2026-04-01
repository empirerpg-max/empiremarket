const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwxbkUndhZPtFvtK1uIFTkPNN-m6WeiFVMU3IDzuahsC0oQp8Ba2GLQFOAPkWv8eiA3/exec"; 

let ARTISTA_DATA = {};

// TROCA DE TELA (SPA)
function showView(viewId) {
    document.querySelectorAll('.app-screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(viewId);
    if(target) target.classList.add('active');
}

function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

// CARREGAMENTO
async function loadData() {
    const params = new URLSearchParams(window.location.search);
    const nome = params.get('nome');
    if(!nome) return;
    try {
        const response = await fetch(`${SCRIPT_URL}?nome=${nome}`);
        ARTISTA_DATA = await response.json();
        
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

// GESTÃO: LISTA DE PROJETOS
function openManagementScreen() {
    const list = document.getElementById('mgmt-list-content');
    list.innerHTML = "";
    let temAlgo = false;

    if (ARTISTA_DATA.tour_info || (ARTISTA_DATA.status && ARTISTA_DATA.status.includes("Preparando"))) {
        temAlgo = true;
        const card = document.createElement('div');
        card.className = "project-item-card";
        card.innerHTML = `<h4>🎤 PROJETO DE TURNÊ</h4><p>Status: ${ARTISTA_DATA.tour_info ? 'Em Rota' : 'Aguardando Setup'}</p>`;
        card.onclick = () => openTourDetails();
        list.appendChild(card);
    }

    if (ARTISTA_DATA.status && ARTISTA_DATA.status.includes("🎬")) {
        temAlgo = true;
        const card = document.createElement('div');
        card.className = "project-item-card"; card.style.borderLeftColor = "#0096ff";
        card.innerHTML = `<h4>🎬 PRODUÇÃO DE CINEMA</h4><p>Status: Em Gravação</p>`;
        card.onclick = () => openCinemaDetails();
        list.appendChild(card);
    }

    if (!temAlgo) list.innerHTML = "<p style='text-align:center; opacity:0.3; margin-top:40px;'>Nenhum projeto ativo.</p>";
    showView('mgmt-screen');
}

// DETALHES TOUR
function openTourDetails() {
    const container = document.getElementById('tour-details-content');
    container.innerHTML = "";

    if (ARTISTA_DATA.status.includes("Preparando")) {
        container.innerHTML = `
            <div class="glass-card">
                <h3>Configurar Itinerário</h3>
                <div class="input-field"><label>DATA DE INÍCIO</label><input type="date" id="t-start"></div>
                <div class="input-field"><label>QTD SHOWS</label><input type="number" id="t-qtd" value="10"></div>
                <button class="main-action-btn" onclick="gerarItinerario()">Gerar Datas Agora</button>
            </div>`;
    } else {
        const info = ARTISTA_DATA.tour_info;
        const agenda = JSON.parse(info.agenda);
        let agendaHtml = "";
        agenda.forEach(show => {
            agendaHtml += `<div class="agenda-card"><div><small style="color:#bc13fe; font-weight:800;">${show.data}</small><b style="display:block;">${show.local}</b></div><div style="text-align:right;"><b>EC ${show.arrecadado.toLocaleString()}</b></div></div>`;
        });
        container.innerHTML = `
            <div class="glass-card" style="text-align:left;">
                <h3 style="font-size:1.3em; margin-bottom:5px;">${info.nomeTour}</h3>
                <div class="tour-stats-grid"><div class="t-stat"><b>ARRECADAÇÃO</b><span>$EC ${info.arrecadacao.toLocaleString()}</span></div><div class="t-stat"><b>PROGRESSO</b><span>Show ${info.showAtual}/${info.totalShows}</span></div></div>
            </div>${agendaHtml}`;
    }
    showView('tour-details-screen');
}

// DETALHES CINEMA
function openCinemaDetails() {
    const container = document.getElementById('cinema-details-content');
    container.innerHTML = `
        <div class="glass-card" style="text-align:left;"><h3>${ARTISTA_DATA.status.replace("🎬 ", "") || "Filme em Produção"}</h3><p style="font-size:0.7em; opacity:0.5;">PRODUÇÃO HOLLYWOOD</p></div>
        <div class="project-item-card" style="border-left-color:#ffd700;"><h4>Etapa 1: Gravações</h4><p>Em andamento</p></div>`;
    showView('cinema-details-screen');
}

// BACKEND
async function contratarTour(porte) {
    const t = document.getElementById('tour-nome').value;
    if(!t) return alert("Dê um nome!");
    await enviar('contratar_tour', { nome: ARTISTA_DATA.nome, tipo: porte, titulo: t });
}

async function contratarCinema(porte) {
    const t = document.getElementById('cinema-titulo').value;
    if(!t) return alert("Dê um título!");
    await enviar('contratar_cinema', { nome: ARTISTA_DATA.nome, tipo: porte, titulo: t });
}

async function gerarItinerario() {
    const q = document.getElementById('t-qtd').value;
    const d = document.getElementById('t-start').value;
    if(!d) return alert("Escolha a data!");
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
