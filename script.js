const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwxbkUndhZPtFvtK1uIFTkPNN-m6WeiFVMU3IDzuahsC0oQp8Ba2GLQFOAPkWv8eiA3/exec"; // Substituir pelo seu link /exec

let ARTISTA_DATA = {};

// NAVEGAÇÃO ENTRE TELAS
function showScreen(id) {
    document.querySelectorAll('.app-view').forEach(v => v.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

// CARREGAMENTO DE DADOS
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
    } catch (e) { console.error("Erro ao carregar dados", e); }
}

// GESTÃO DE PROJETOS: DECIDE O QUE MOSTRAR NA TELA DE TOUR
function checkManagement() {
    const content = document.getElementById('tour-content');
    content.innerHTML = "";

    if (ARTISTA_DATA.status && ARTISTA_DATA.status.includes("Preparando")) {
        // TELA PARA GERAR ITINERÁRIO
        content.innerHTML = `
            <div class="glass-card">
                <h3 style="margin-bottom:15px; font-size:1.1em;">Configurar Itinerário</h3>
                <div class="input-field"><label>DATA DE INÍCIO</label><input type="date" id="tour-start-date"></div>
                <div class="input-field"><label>QUANTIDADE DE SHOWS</label><input type="number" id="tour-qtd" value="10"></div>
                <button class="main-action-btn" onclick="gerarItinerario()">Sincronizar Agenda</button>
            </div>`;
        showScreen('tour-screen');
    } else if (ARTISTA_DATA.tour_info) {
        // TELA COM O DASHBOARD DA TOUR ATIVA
        renderTourDashboard(content);
        showScreen('tour-screen');
    } else {
        alert("Nenhum projeto ativo. Visite o Empire Hub para começar!");
    }
}

function renderTourDashboard(container) {
    const info = ARTISTA_DATA.tour_info;
    const agenda = JSON.parse(info.agenda);
    
    let agendaHtml = "";
    agenda.forEach(show => {
        agendaHtml += `
            <div class="agenda-card">
                <div><small style="font-size:0.6em; color:#bc13fe; font-weight:800;">${show.data}</small><b style="display:block; font-size:0.85em;">${show.local}</b></div>
                <div style="text-align:right;">
                    <b style="color:#ffd700; font-size:0.75em;">EC ${show.arrecadado.toLocaleString()}</b>
                    <small style="display:block; opacity:0.5; font-size:0.6em;">${show.vendidos} pax</small>
                </div>
            </div>`;
    });

    container.innerHTML = `
        <div class="glass-card" style="text-align:left;">
            <h3 style="font-size:1.3em; margin-bottom:5px;">${info.nomeTour}</h3>
            <div class="tour-stats-grid">
                <div class="t-stat"><b>ARRECADAÇÃO TOTAL</b><span>$EC ${info.arrecadacao.toLocaleString()}</span></div>
                <div class="t-stat"><b>PROGRESSO</b><span>Show ${info.showAtual} de ${info.totalShows}</span></div>
            </div>
        </div>
        <h3 style="font-size:0.85em; font-weight:800; text-transform:uppercase; color:#bc13fe; margin-bottom:15px; text-align:left;">Itinerário de Shows</h3>
        <div class="agenda-container">${agendaHtml}</div>`;
}

// AÇÕES BACKEND
async function contratarTour(porte) {
    const t = document.getElementById('tour-nome').value;
    if(!t) return alert("Dê um nome à turnê!");
    await enviar('contratar_tour', { nome: ARTISTA_DATA.nome, tipo: porte, titulo: t });
}

async function gerarItinerario() {
    const q = document.getElementById('tour-qtd').value;
    const d = document.getElementById('tour-start-date').value;
    if(!d) return alert("Escolha a data de início!");
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
