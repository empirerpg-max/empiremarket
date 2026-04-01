const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwxbkUndhZPtFvtK1uIFTkPNN-m6WeiFVMU3IDzuahsC0oQp8Ba2GLQFOAPkWv8eiA3/exec"; 

let ARTISTA_DATA = {}; // Guarda dados carregados

function openCinema() { document.getElementById('modal-cinema').classList.add('active'); }
function closeCinema() { document.getElementById('modal-cinema').classList.remove('active'); }
function openTour() { document.getElementById('modal-tour').classList.add('active'); }
function closeTour() { document.getElementById('modal-tour').classList.remove('active'); }
function openPlanejar() { document.getElementById('modal-planejar-tour').classList.add('active'); }
function closePlanejar() { document.getElementById('modal-planejar-tour').classList.remove('active'); }

function checkTourStatus() {
    console.log("Status Atual:", ARTISTA_DATA.status);
    if (ARTISTA_DATA.status && ARTISTA_DATA.status.includes("Planejamento")) {
        openPlanejar(); // Abre modal de Gerar Datas
    } else if (ARTISTA_DATA.status && ARTISTA_DATA.status !== "Livre") {
        alert("Já estás ocupado com outro projeto!");
    } else {
        openTour(); // Abre modal de Comprar
    }
}

async function loadData() {
    const params = new URLSearchParams(window.location.search);
    const nome = params.get('nome');
    if(!nome) return;

    try {
        const response = await fetch(`${SCRIPT_URL}?nome=${nome}`);
        ARTISTA_DATA = await response.json();
        
        // 1. Preencher Perfil e Status
        document.getElementById('artist-name').innerText = ARTISTA_DATA.nome;
        document.getElementById('artist-photo').src = ARTISTA_DATA.foto;
        document.getElementById('artist-saldo').innerText = `$EC ${ARTISTA_DATA.saldo.toLocaleString('pt-BR')}`;
        document.getElementById('artist-fortuna').innerText = `$${ARTISTA_DATA.fortuna.toLocaleString('pt-BR')}`;
        
        const dot = document.getElementById('status-dot');
        const banner = document.getElementById('current-activity');
        const tourLabel = document.getElementById('btn-tour').lastChild; // Pega o span do texto

        if(ARTISTA_DATA.status === "Livre") {
            dot.style.background = "#00ff88"; // Verde Neon
            banner.innerText = "Disponível para Projetos";
            tourLabel.innerText = "Tour";
        } else if (ARTISTA_DATA.status.includes("Planejamento")) {
            dot.style.background = "#ffd700"; // Amarelo
            banner.innerText = "Aguardando Itinerário";
            tourLabel.innerText = "Planejar Tour";
        } else {
            dot.style.background = "#bc13fe"; // Roxo Empire
            banner.innerText = ARTISTA_DATA.status;
            tourLabel.innerText = "Tour Ativa";
        }

        document.getElementById('bar-prestigio').style.width = (ARTISTA_DATA.prestigio / 10) + "%";
        document.getElementById('txt-prestigio').innerText = `${ARTISTA_DATA.prestigio}/1000`;
        document.getElementById('bar-fadiga').style.width = ARTISTA_DATA.fadiga + "%";
        document.getElementById('txt-fadiga').innerText = ARTISTA_DATA.fadiga + "%";

        // 2. Renderizar a Gestão Ativa
        renderActiveManagement();

    } catch (e) { console.error(e); }
}

function renderActiveManagement() {
    const container = document.getElementById('management-area');
    container.innerHTML = ""; // Limpa
    
    let temProjeto = false;

    // Se estiver em Rota (Tour)
    if (ARTISTA_DATA.itinerario) {
        temProjeto = true;
        container.innerHTML += `
            <div class="mgmt-card glass-card">
                <h4>🎤 ROTA DA TURNÊ ATIVA</h4>
                <p class="mgmt-data">${ARTISTA_DATA.itinerario}</p>
                <small style="opacity:0.5; font-size:10px; display:block; margin-top:10px;">Status: Em Rota</small>
            </div>
        `;
    }

    // Se estiver Gravando Filme
    if (ARTISTA_DATA.status && ARTISTA_DATA.status.includes("🎬")) {
        temProjeto = true;
        container.innerHTML += `
            <div class="mgmt-card glass-card">
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
    const nome = ARTISTA_DATA.nome;
    const t = document.getElementById('obra-titulo').value.trim();
    const g = document.getElementById('obra-genero').value;
    const a = document.getElementById('obra-ano').value;
    if(!t || !g || !a) { alert("Preencha todos os campos!"); return; }
    await enviarAcao('contratar_filme', { nome, tipo: cat, titulo: t, genero: g, ano: a });
}

async function contratarTour(porte) {
    const nome = ARTISTA_DATA.nome;
    const t = document.getElementById('tour-nome').value.trim();
    if(!t) { alert("Dê um nome à Tour!"); return; }
    await enviarAcao('contratar_tour', { nome, tipo: porte, titulo: t });
}

async function gerarItinerario() {
    const nome = ARTISTA_DATA.nome;
    const qtd = document.getElementById('tour-qtd-datas').value;
    await enviarAcao('gerar_itinerario', { nome, qtd: qtd });
}

async function enviarAcao(acao, params) {
    document.body.style.opacity = "0.5";
    document.body.style.pointerEvents = "none";
    let url = `${SCRIPT_URL}?acao=${acao}`;
    for (let k in params) url += `&${k}=${encodeURIComponent(params[k])}`;
    try {
        const res = await fetch(url);
        const txt = await res.text();
        if (!txt.includes('{"nome":')) alert(txt);
        location.reload(); 
    } catch (e) { alert("Erro de conexão."); }
    document.body.style.opacity = "1";
    document.body.style.pointerEvents = "all";
}

window.onload = loadData;
