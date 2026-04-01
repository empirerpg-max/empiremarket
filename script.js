const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwxbkUndhZPtFvtK1uIFTkPNN-m6WeiFVMU3IDzuahsC0oQp8Ba2GLQFOAPkWv8eiA3/exec"; // Substitui pelo teu link /exec

let ARTISTA_DATA = {};

// CONTROLE DE MODAIS
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
        
        document.getElementById('artist-name').innerText = ARTISTA_DATA.nome;
        document.getElementById('artist-photo').src = ARTISTA_DATA.foto;
        document.getElementById('artist-saldo').innerText = `$EC ${ARTISTA_DATA.saldo.toLocaleString('pt-BR')}`;
        document.getElementById('hub-fortuna').innerText = `$${ARTISTA_DATA.fortuna.toLocaleString('pt-BR')}`;
        
        document.getElementById('current-activity').innerText = (ARTISTA_DATA.status === "Livre") ? "Disponível" : ARTISTA_DATA.status;

        document.getElementById('bar-prestigio').style.width = (ARTISTA_DATA.prestigio / 10) + "%";
        document.getElementById('txt-prestigio').innerText = `${ARTISTA_DATA.prestigio}/1000`;
        document.getElementById('bar-fadiga').style.width = ARTISTA_DATA.fadiga + "%";
        document.getElementById('txt-fadiga').innerText = ARTISTA_DATA.fadiga + "%";

    } catch (e) { console.error("Erro ao sincronizar Império", e); }
}

// GESTÃO DE PROJETOS ATIVOS
function openManagement() {
    const list = document.getElementById('active-projects-list');
    list.innerHTML = "";
    let temProjeto = false;

    // Tour
    if (ARTISTA_DATA.tour_info || (ARTISTA_DATA.status && ARTISTA_DATA.status.includes("Preparando"))) {
        temProjeto = true;
        const card = document.createElement('div');
        card.className = "project-card";
        card.innerHTML = `<h4>🎤 Projeto de Turnê</h4><p>Status: ${ARTISTA_DATA.tour_info ? 'Em Rota Ativa' : 'Aguardando Itinerário'}</p>`;
        card.onclick = () => verDetalhes('tour');
        list.appendChild(card);
    }

    // Cinema
    if (ARTISTA_DATA.status && ARTISTA_DATA.status.includes("🎬")) {
        temProjeto = true;
        const card = document.createElement('div');
        card.className = "project-card"; card.style.borderLeftColor = "#0096ff";
        card.innerHTML = `<h4>🎬 Produção de Cinema</h4><p>Status: Gravações em Hollywood</p>`;
        card.onclick = () => verDetalhes('cinema');
        list.appendChild(card);
    }

    if (!temProjeto) list.innerHTML = "<p style='text-align:center; opacity:0.3; margin-top:30px;'>Nenhum projeto ativo.</p>";
    openModal('modal-mgmt');
}

// TELA DE DETALHES INDIVIDUAL
function verDetalhes(tipo) {
    const corpo = document.getElementById('detalhe-conteudo');
    const titulo = document.getElementById('detalhe-titulo');
    corpo.innerHTML = "";

    if (tipo === 'tour') {
        titulo.innerText = "Tour Book";
        if (!ARTISTA_DATA.tour_info) {
            corpo.innerHTML = `
                <div class="input-field"><label>DATA DE INÍCIO</label><input type="date" id="tour-start"></div>
                <div class="input-field"><label>Nº DE SHOWS</label><input type="number" id="tour-count" value="10"></div>
                <button class="main-action-btn" onclick="gerarItinerario()">Gerar Datas Agora</button>`;
        } else {
            const agenda = JSON.parse(ARTISTA_DATA.tour_info.agenda);
            agenda.forEach(show => {
                corpo.innerHTML += `<div class="agenda-row"><div><small>${show.data}</small><b>${show.local}</b></div><div class="agenda-stats"><b>EC ${show.arrecadado.toLocaleString()}</b><small>${show.vendidos} pax</small></div></div>`;
            });
        }
    }

    if (tipo === 'cinema') {
        titulo.innerText = "Produção Cinema";
        corpo.innerHTML = `<div class="project-card"><h4>Status Atual</h4><p>Filmagens em andamento no set de Los Angeles.</p></div>`;
    }

    openModal('modal-detalhes');
}

// AÇÕES DE COMPRA E GERAÇÃO
async function contratarTour(porte) {
    const t = document.getElementById('tour-nome').value;
    if(!t) return alert("Dê um nome!");
    await enviarAcao('contratar_tour', { nome: ARTISTA_DATA.nome, tipo: porte, titulo: t });
}

async function contratarFilme(cat) {
    const t = document.getElementById('obra-titulo').value;
    const g = document.getElementById('obra-genero').value;
    const a = document.getElementById('obra-ano').value;
    await enviarAcao('contratar_filme', { nome: ARTISTA_DATA.nome, tipo: cat, titulo: t, genero: g, ano: a });
}

async function gerarItinerario() {
    const q = document.getElementById('tour-count').value;
    const d = document.getElementById('tour-start').value;
    if(!d) return alert("Defina o início!");
    await enviarAcao('gerar_itinerario', { nome: ARTISTA_DATA.nome, qtd: q, dataInicio: d });
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
