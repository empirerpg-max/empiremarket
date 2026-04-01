const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwxbkUndhZPtFvtK1uIFTkPNN-m6WeiFVMU3IDzuahsC0oQp8Ba2GLQFOAPkWv8eiA3/exec"; // Substitua pelo seu /exec

let ARTISTA_DATA = {};

// NAVEGAÇÃO SPA
function changeView(viewId) {
    document.querySelectorAll('.app-screen').forEach(s => s.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
}

function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

// CARREGAMENTO INICIAL
async function loadData() {
    const params = new URLSearchParams(window.location.search);
    const nome = params.get('nome');
    if(!nome) return;

    try {
        const response = await fetch(`${SCRIPT_URL}?nome=${nome}`);
        ARTISTA_DATA = await response.json();
        
        // UI BÁSICA
        document.getElementById('artist-name').innerText = ARTISTA_DATA.nome;
        document.getElementById('artist-photo').src = ARTISTA_DATA.foto;
        document.getElementById('artist-saldo').innerText = `$EC ${ARTISTA_DATA.saldo.toLocaleString('pt-BR')}`;
        document.getElementById('hub-fortuna').innerText = `$${ARTISTA_DATA.fortuna.toLocaleString('pt-BR')}`;
        
        const banner = document.getElementById('current-activity');
        banner.innerText = (ARTISTA_DATA.status === "Livre") ? "DISPONÍVEL" : ARTISTA_DATA.status.toUpperCase();

        // BARRAS
        document.getElementById('bar-prestigio').style.width = (ARTISTA_DATA.prestigio / 10) + "%";
        document.getElementById('txt-prestigio').innerText = `${ARTISTA_DATA.prestigio}/1000`;
        document.getElementById('bar-fadiga').style.width = ARTISTA_DATA.fadiga + "%";
        document.getElementById('txt-fadiga').innerText = ARTISTA_DATA.fadiga + "%";

    } catch (e) { console.error("Erro ao carregar dados", e); }
}

// CENTRAL DE GESTÃO
function openManagement() {
    const container = document.getElementById('mgmt-container');
    container.innerHTML = "";
    let temProjeto = false;

    if (ARTISTA_DATA.tour_info || (ARTISTA_DATA.status && ARTISTA_DATA.status.includes("Preparando"))) {
        temProjeto = true;
        const card = document.createElement('div');
        card.className = "mgmt-project-card";
        card.innerHTML = `<h4>🎤 PROJETO DE TURNÊ</h4><p>Status: ${ARTISTA_DATA.tour_info ? 'Em Rota Ativa' : 'Aguardando Itinerário'}</p>`;
        card.onclick = () => renderTourDetails();
        container.appendChild(card);
    }

    if (!temProjeto) {
        container.innerHTML = "<p style='text-align:center; opacity:0.3; margin-top:50px;'>Nenhum projeto ativo.</p>";
    }
    changeView('mgmt-view');
}

// DETALHES DA TOUR (INTERNO)
function renderTourDetails() {
    const container = document.getElementById('mgmt-container');
    container.innerHTML = "";

    if (!ARTISTA_DATA.tour_info) {
        container.innerHTML = `
            <div class="glass-card">
                <h3 style="margin-bottom:15px; font-size:1.1em;">Setup do Itinerário</h3>
                <input type="date" id="t-start" style="width:100%; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); padding:15px; border-radius:12px; color:white; margin-bottom:12px;">
                <input type="number" id="t-qtd" value="10" style="width:100%; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); padding:15px; border-radius:12px; color:white; margin-bottom:12px;">
                <button onclick="gerarItinerario()" style="width:100%; background:linear-gradient(45deg, #bc13fe, #ffd700); border:none; padding:18px; border-radius:15px; color:#0b0118; font-weight:800; text-transform:uppercase;">SINCRONIZAR AGENDA</button>
            </div>`;
    } else {
        const info = ARTISTA_DATA.tour_info;
        const agenda = JSON.parse(info.agenda);
        let agendaHtml = "";
        agenda.forEach(show => {
            agendaHtml += `<div class="agenda-card"><div><small style="color:#bc13fe; font-weight:800; font-size:0.6em;">${show.data}</small><b style="display:block; font-size:0.85em;">${show.local}</b></div><div style="text-align:right;"><b style="color:#ffd700; font-size:0.75em;">EC ${show.arrecadado.toLocaleString()}</b></div></div>`;
        });
        container.innerHTML = `
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

// AÇÕES DE COMPRA E GERAÇÃO
async function contratarTour(porte) {
    const t = document.getElementById('tour-nome').value;
    if(!t) return alert("Dê um nome à sua Tour!");
    await enviar('contratar_tour', { nome: ARTISTA_DATA.nome, tipo: porte, titulo: t });
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
    try {
        const res = await fetch(url);
        const txt = await res.text();
        alert(txt);
        location.reload();
    } catch(e) { alert("Erro de conexão"); document.body.style.opacity = "1"; }
}

window.onload = loadData;
