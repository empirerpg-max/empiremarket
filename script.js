const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwxbkUndhZPtFvtK1uIFTkPNN-m6WeiFVMU3IDzuahsC0oQp8Ba2GLQFOAPkWv8eiA3/exec"; 

let ARTISTA_DATA = {};

function openCinema() { document.getElementById('modal-cinema').classList.add('active'); }
function closeCinema() { document.getElementById('modal-cinema').classList.remove('active'); }
function openTour() { document.getElementById('modal-tour').classList.add('active'); }
function closeTour() { document.getElementById('modal-tour').classList.remove('active'); }
function openPlanejar() { document.getElementById('modal-planejar-tour').classList.add('active'); }
function closePlanejar() { document.getElementById('modal-planejar-tour').classList.remove('active'); }
function openAgenda() { document.getElementById('modal-agenda').classList.add('active'); renderAgendaFull(); }
function closeAgenda() { document.getElementById('modal-agenda').classList.remove('active'); }

function checkTourStatus() {
    if (ARTISTA_DATA.status && (ARTISTA_DATA.status.includes("Preparando") || ARTISTA_DATA.status.includes("Planejamento"))) {
        openPlanejar();
    } else if (ARTISTA_DATA.status && ARTISTA_DATA.status !== "Livre") {
        alert("Já tens um projeto ativo!");
    } else {
        openTour();
    }
}

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
        document.getElementById('artist-fortuna').innerText = `$${ARTISTA_DATA.fortuna.toLocaleString('pt-BR')}`;
        
        document.getElementById('current-activity').innerText = (ARTISTA_DATA.status === "Livre") ? "Disponível para Projetos" : ARTISTA_DATA.status;

        document.getElementById('bar-prestigio').style.width = (ARTISTA_DATA.prestigio / 10) + "%";
        document.getElementById('txt-prestigio').innerText = `${ARTISTA_DATA.prestigio}/1000`;
        document.getElementById('bar-fadiga').style.width = ARTISTA_DATA.fadiga + "%";
        document.getElementById('txt-fadiga').innerText = ARTISTA_DATA.fadiga + "%";

        renderDashboard();
    } catch (e) { console.error(e); }
}

function renderDashboard() {
    const container = document.getElementById('management-area');
    container.innerHTML = "";
    let temAlgo = false;

    if (ARTISTA_DATA.tour) {
        temAlgo = true;
        container.innerHTML += `
            <div class="mgmt-card">
                <h4>🎤 CENTRAL DA TURNÊ</h4>
                <div class="mgmt-data">
                    <p><b>Próximo Show:</b> ${ARTISTA_DATA.tour.proximo}</p>
                    <p><b>Progresso:</b> Show ${ARTISTA_DATA.tour.showAtual} de ${ARTISTA_DATA.tour.totalShows}</p>
                    <p><b>Arrecadação:</b> $EC ${ARTISTA_DATA.tour.arrecadacao.toLocaleString('pt-BR')}</p>
                </div>
                <button class="btn-book" onclick="openAgenda()">Abrir Tour Book</button>
            </div>`;
    } else if (ARTISTA_DATA.status && (ARTISTA_DATA.status.includes("Preparando") || ARTISTA_DATA.status.includes("Planejamento"))) {
        temAlgo = true;
        container.innerHTML += `
            <div class="mgmt-card">
                <h4>🎤 TURNÊ COMPRADA</h4>
                <p style="font-size:0.75em; opacity:0.7;">Logística contratada! Clique no botão <b>Tour</b> no Hub para definir datas e início.</p>
            </div>`;
    }

    if (ARTISTA_DATA.status && ARTISTA_DATA.status.includes("🎬")) {
        temAlgo = true;
        container.innerHTML += `
            <div class="mgmt-card">
                <h4>🎬 CENTRAL DE CINEMA</h4>
                <div class="mgmt-data"><p><b>Projeto:</b> ${ARTISTA_DATA.status.replace("🎬 ", "")}</p><p>Status: Em Gravação</p></div>
            </div>`;
    }

    if (!temAlgo) container.innerHTML = '<p class="empty-msg">Nenhum projeto ativo.</p>';
}

function renderAgendaFull() {
    const list = document.getElementById('agenda-lista');
    list.innerHTML = "";
    if(!ARTISTA_DATA.tour || !ARTISTA_DATA.tour.agenda) return;

    const agenda = JSON.parse(ARTISTA_DATA.tour.agenda);
    agenda.forEach((item) => {
        list.innerHTML += `
            <div class="agenda-row">
                <div class="agenda-info">
                    <span>${item.data}</span>
                    <span>${item.local}</span>
                </div>
                <div class="agenda-stats">
                    <b>EC ${item.arrecadado.toLocaleString('pt-BR')}</b>
                    <small>${item.vendidos.toLocaleString('pt-BR')} / ${item.capacidade.toLocaleString('pt-BR')}</small>
                </div>
            </div>`;
    });
}

async function contratarFilme(cat) {
    const t = document.getElementById('obra-titulo').value;
    const g = document.getElementById('obra-genero').value;
    const a = document.getElementById('obra-ano').value;
    await enviar('contratar_filme', { nome: ARTISTA_DATA.nome, tipo: cat, titulo: t, genero: g, ano: a });
}

async function contratarTour(porte) {
    const t = document.getElementById('tour-nome').value;
    await enviar('contratar_tour', { nome: ARTISTA_DATA.nome, tipo: porte, titulo: t });
}

async function gerarItinerario() {
    const q = document.getElementById('tour-qtd-datas').value;
    const d = document.getElementById('tour-data-inicio').value;
    if(!d) return alert("Define a data de início!");
    await enviar('gerar_itinerario', { nome: ARTISTA_DATA.nome, qtd: q, dataInicio: d });
}

async function enviar(acao, params) {
    document.body.style.opacity = "0.5";
    let url = `${SCRIPT_URL}?acao=${acao}`;
    for (let k in params) url += `&${k}=${encodeURIComponent(params[k])}`;
    try {
        const res = await fetch(url);
        const txt = await res.text();
        if (!txt.includes('{"nome":')) alert(txt);
        location.reload(); 
    } catch (e) { alert("Erro de conexão."); }
}

window.onload = loadData;
