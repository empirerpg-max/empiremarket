const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwxbkUndhZPtFvtK1uIFTkPNN-m6WeiFVMU3IDzuahsC0oQp8Ba2GLQFOAPkWv8eiA3/exec"; 

let ARTISTA_DATA = {};

// Navegação Básica
function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

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
        document.getElementById('current-activity').innerText = (ARTISTA_DATA.status === "Livre") ? "Disponível" : ARTISTA_DATA.status;

        document.getElementById('bar-prestigio').style.width = (ARTISTA_DATA.prestigio / 10) + "%";
        document.getElementById('bar-fadiga').style.width = ARTISTA_DATA.fadiga + "%";
    } catch (e) { console.error(e); }
}

// MENU GESTÃO: LISTA PROJETOS ATIVOS
function openManagement() {
    const list = document.getElementById('project-list');
    list.innerHTML = "";
    let temProjeto = false;

    // Se houver turnê
    if (ARTISTA_DATA.tour_info || ARTISTA_DATA.status.includes("Preparando")) {
        temProjeto = true;
        list.innerHTML += `
            <div class="mgmt-item" onclick="verDetalhesProjeto('tour')">
                <h4>🎤 Projeto de Turnê</h4>
                <p>Status: ${ARTISTA_DATA.tour_info ? 'Em Rota' : 'Aguardando Itinerário'}</p>
            </div>`;
    }

    // Se houver cinema
    if (ARTISTA_DATA.status.includes("🎬")) {
        temProjeto = true;
        list.innerHTML += `
            <div class="mgmt-item" onclick="verDetalhesProjeto('cinema')">
                <h4>🎬 Projeto de Cinema</h4>
                <p>Status: Gravando em Hollywood</p>
            </div>`;
    }

    if (!temProjeto) list.innerHTML = "<p style='text-align:center; opacity:0.5; margin-top:40px;'>Nenhum projeto ativo.</p>";
    openModal('modal-mgmt');
}

// TELINHA DE ACOMPANHAMENTO INDIVIDUAL
function verDetalhesProjeto(tipo) {
    const corpo = document.getElementById('detalhe-corpo');
    corpo.innerHTML = "";

    if (tipo === 'tour') {
        document.getElementById('detalhe-titulo').innerText = "Tour Center";
        if (!ARTISTA_DATA.tour_info) {
            corpo.innerHTML = `
                <div class="input-field"><label>DATA DE INÍCIO</label><input type="date" id="tour-start"></div>
                <div class="input-field"><label>QTD DE SHOWS</label><input type="number" id="tour-count" value="10"></div>
                <button class="main-action-btn" onclick="gerarItinerario()">Gerar Datas Agora</button>
            `;
        } else {
            const agenda = JSON.parse(ARTISTA_DATA.tour_info.agenda);
            agenda.forEach(show => {
                corpo.innerHTML += `
                    <div class="agenda-row">
                        <div><b>${show.local}</b><br><small>${show.data}</small></div>
                        <div style="text-align:right;"><b>EC ${show.arrecadado.toLocaleString()}</b><br><small>${show.vendidos} pax</small></div>
                    </div>`;
            });
        }
    }

    if (tipo === 'cinema') {
        document.getElementById('detalhe-titulo').innerText = "Cinema Center";
        corpo.innerHTML = `
            <div class="mgmt-item"><h4>Etapa 1: Leitura de Roteiro</h4><p>Concluído</p></div>
            <div class="mgmt-item" style="border-color:#ffd700"><h4>Etapa 2: Gravações em Set</h4><p>Em andamento...</p></div>
            <div class="mgmt-item" style="opacity:0.3"><h4>Etapa 3: Pós-Produção</h4><p>Bloqueado</p></div>
        `;
    }

    openModal('modal-detalhes-projeto');
}

async function contratarTour(porte) {
    const t = document.getElementById('tour-nome').value;
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
