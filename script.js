const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwxbkUndhZPtFvtK1uIFTkPNN-m6WeiFVMU3IDzuahsC0oQp8Ba2GLQFOAPkWv8eiA3/exec"; 

let ARTISTA_DATA = {};

// NAVEGAÇÃO ENTRE TELAS
function showScreen(screenId) {
    document.querySelectorAll('.app-view').forEach(view => view.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

// CARREGAMENTO DE DADOS
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
        
        document.getElementById('current-activity').innerText = (ARTISTA_DATA.status === "Livre") ? "Disponível" : ARTISTA_DATA.status;

        document.getElementById('bar-prestigio').style.width = (ARTISTA_DATA.prestigio / 10) + "%";
        document.getElementById('txt-prestigio').innerText = `${ARTISTA_DATA.prestigio}/1000`;
        document.getElementById('bar-fadiga').style.width = ARTISTA_DATA.fadiga + "%";
        document.getElementById('txt-fadiga').innerText = ARTISTA_DATA.fadiga + "%";

    } catch (e) { console.error("Erro na sincronização", e); }
}

// LOGICA DA TELA DE TOUR
function checkActiveTour() {
    if (ARTISTA_DATA.status && ARTISTA_DATA.status.includes("Preparando")) {
        openModal('modal-planejar-tour'); // Se comprou logística mas não gerou datas
    } else if (ARTISTA_DATA.tour_info) {
        renderTourScreen();
        showScreen('tour-screen'); // Se já tem tour em rota, vai pra tela de Tour
    } else {
        alert("Nenhum projeto ativo. Vá ao Empire Hub para contratar!");
    }
}

function renderTourScreen() {
    const info = ARTISTA_DATA.tour_info;
    document.getElementById('tour-display-name').innerText = info.nomeTour || "World Tour";
    document.getElementById('tour-total-money').innerText = `$EC ${info.arrecadacao.toLocaleString('pt-BR')}`;
    document.getElementById('tour-progress').innerText = `${info.showAtual} / ${info.totalShows}`;

    const agendaList = document.getElementById('tour-agenda-list');
    agendaList.innerHTML = "";

    const agenda = JSON.parse(info.agenda);
    agenda.forEach((show) => {
        agendaList.innerHTML += `
            <div class="agenda-card">
                <div class="info">
                    <small>${show.data}</small>
                    <b>${show.local}</b>
                </div>
                <div class="stats">
                    <b>EC ${show.arrecadado.toLocaleString('pt-BR')}</b>
                    <small>${show.vendidos.toLocaleString('pt-BR')} pax</small>
                </div>
            </div>`;
    });
}

// AÇÕES
async function contratarTour(porte) {
    const t = document.getElementById('tour-nome').value;
    if(!t) return alert("Dê um nome!");
    await enviar('contratar_tour', { nome: ARTISTA_DATA.nome, tipo: porte, titulo: t });
}

async function gerarItinerario() {
    const q = document.getElementById('tour-count-shows').value;
    const d = document.getElementById('tour-date-start').value;
    if(!d) return alert("Escolha o início!");
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
    } catch (e) { alert("Erro de conexão."); }
}

window.onload = loadData;
