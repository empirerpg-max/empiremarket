const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwxbkUndhZPtFvtK1uIFTkPNN-m6WeiFVMU3IDzuahsC0oQp8Ba2GLQFOAPkWv8eiA3/exec"; 

let ARTISTA_DATA = {};

function openCinema() { document.getElementById('modal-cinema').classList.add('active'); }
function closeCinema() { document.getElementById('modal-cinema').classList.remove('active'); }
function openTour() { document.getElementById('modal-tour').classList.add('active'); }
function closeTour() { document.getElementById('modal-tour').classList.remove('active'); }
function openPlanejar() { document.getElementById('modal-planejar-tour').classList.add('active'); }
function closePlanejar() { document.getElementById('modal-planejar-tour').classList.remove('active'); }

function checkTourStatus() {
    if (ARTISTA_DATA.status && ARTISTA_DATA.status.includes("Planejamento")) {
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
        
        // 1. Atualiza Perfil
        document.getElementById('artist-name').innerText = ARTISTA_DATA.nome;
        document.getElementById('artist-photo').src = ARTISTA_DATA.foto;
        document.getElementById('artist-saldo').innerText = `$EC ${ARTISTA_DATA.saldo.toLocaleString('pt-BR')}`;
        
        const banner = document.getElementById('current-activity');
        banner.innerText = (ARTISTA_DATA.status === "Livre") ? "Disponível para Projetos" : ARTISTA_DATA.status;

        document.getElementById('bar-prestigio').style.width = (ARTISTA_DATA.prestigio / 10) + "%";
        document.getElementById('bar-fadiga').style.width = ARTISTA_DATA.fadiga + "%";

        // 2. RENDERIZA CENTRAL DE GESTÃO
        renderManagement();

    } catch (e) { console.error(e); }
}

function renderManagement() {
    const container = document.getElementById('management-area');
    container.innerHTML = ""; // Limpa

    let temProjeto = false;

    // Se estiver em Rota (Tour)
    if (ARTISTA_DATA.itinerario) {
        temProjeto = true;
        container.innerHTML += `
            <div class="mgmt-card">
                <h4>🎤 ROTA DA TOUR ATIVA</h4>
                <p class="mgmt-data">${ARTISTA_DATA.itinerario}</p>
                <small style="opacity:0.5; font-size:10px; display:block; margin-top:10px;">Status: Em Rota</small>
            </div>
        `;
    }

    // Se estiver Gravando Filme
    if (ARTISTA_DATA.status && ARTISTA_DATA.status.includes("🎬")) {
        temProjeto = true;
        container.innerHTML += `
            <div class="mgmt-card">
                <h4>🎬 PRODUÇÃO DE CINEMA</h4>
                <p class="mgmt-data">Gravando projeto: ${ARTISTA_DATA.status.replace("🎬 ", "")}</p>
                <small style="opacity:0.5; font-size:10px; display:block; margin-top:10px;">Lançamento estimado: 3 dias</small>
            </div>
        `;
    }

    if (!temProjeto) {
        container.innerHTML = '<p class="empty-msg">Nenhum projeto ativo no momento.</p>';
    }
}

async function contratarFilme(cat) {
    const t = document.getElementById('obra-titulo').value;
    const g = document.getElementById('obra-genero').value;
    const a = document.getElementById('obra-ano').value;
    if(!t) return alert("Dê um título!");
    await enviarAcao('contratar_filme', { nome: ARTISTA_DATA.nome, tipo: cat, titulo: t, genero: g, ano: a });
}

async function contratarTour(porte) {
    const t = document.getElementById('tour-nome').value;
    if(!t) return alert("Dê um nome!");
    await enviarAcao('contratar_tour', { nome: ARTISTA_DATA.nome, tipo: porte, titulo: t });
}

async function gerarItinerario() {
    const q = document.getElementById('tour-qtd-datas').value;
    await enviarAcao('gerar_itinerario', { nome: ARTISTA_DATA.nome, qtd: q });
}

async function enviarAcao(acao, params) {
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
