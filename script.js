const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwxbkUndhZPtFvtK1uIFTkPNN-m6WeiFVMU3IDzuahsC0oQp8Ba2GLQFOAPkWv8eiA3/exec"; 

let TG_USER_ID = "000000"; 
let ARTISTAS_USUARIO = []; 
let ARTISTA_ATUAL = null;  

// INICIALIZAÇÃO
window.onload = () => {
    const params = new URLSearchParams(window.location.search);
    const testeId = params.get('tg_id');

    if (testeId) {
        TG_USER_ID = testeId;
        console.log("Modo de Teste. TG_ID:", TG_USER_ID);
    } else if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
        if(window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user) {
            TG_USER_ID = window.Telegram.WebApp.initDataUnsafe.user.id;
        }
    }
};

// NAVEGAÇÃO SPA
function showScreen(viewId) {
    document.querySelectorAll('.app-screen').forEach(s => s.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    window.scrollTo(0,0);
}
function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

// BUSCAR ARTISTAS DO BD
async function loadMyArtists() {
    showScreen('view-artist-list');
    const container = document.getElementById('my-artists-container');
    container.innerHTML = "<p style='text-align:center; opacity:0.5;'>Buscando portfólio...</p>";

    try {
        const response = await fetch(`${SCRIPT_URL}?acao=get_artistas_by_tg&tg_id=${TG_USER_ID}`);
        ARTISTAS_USUARIO = await response.json();
        
        if(ARTISTAS_USUARIO.length === 0) {
            container.innerHTML = "<p style='text-align:center; opacity:0.5;'>Você não gerencia nenhum artista ainda.</p>";
            return;
        }

        container.innerHTML = "";
        ARTISTAS_USUARIO.forEach((artista, index) => {
            container.innerHTML += `
                <div class="artist-list-item" onclick="openArtistDashboard(${index})">
                    <img src="${artista.foto}" alt="${artista.nome}">
                    <div class="info">
                        <b>${artista.nome}</b>
                        <span>$EC ${artista.saldo.toLocaleString('pt-BR')}</span>
                    </div>
                </div>`;
        });
    } catch(e) {
        container.innerHTML = "<p style='text-align:center; color:red;'>Erro de conexão.</p>";
    }
}

// DASHBOARD DO ARTISTA
function openArtistDashboard(index) {
    ARTISTA_ATUAL = ARTISTAS_USUARIO[index];
    
    document.getElementById('artist-name').innerText = ARTISTA_ATUAL.nome;
    document.getElementById('artist-photo').src = ARTISTA_ATUAL.foto;
    document.getElementById('artist-saldo').innerText = `$EC ${ARTISTA_ATUAL.saldo.toLocaleString('pt-BR')}`;
    document.getElementById('hub-fortuna').innerText = `$${ARTISTA_ATUAL.fortunaTotal.toLocaleString('pt-BR')}`;
    document.getElementById('current-activity').innerText = (ARTISTA_ATUAL.status === "Livre") ? "DISPONÍVEL" : ARTISTA_ATUAL.status.toUpperCase();

    document.getElementById('bar-prestigio').style.width = (ARTISTA_ATUAL.prestigio / 10) + "%";
    document.getElementById('txt-prestigio').innerText = `${ARTISTA_ATUAL.prestigio}/1000`;
    document.getElementById('bar-fadiga').style.width = ARTISTA_ATUAL.fadiga + "%";
    document.getElementById('txt-fadiga').innerText = ARTISTA_ATUAL.fadiga + "%";

    showScreen('view-artist-dashboard');
}

// GESTÃO
function checkManagementView() {
    if(!ARTISTA_ATUAL) return;
    const container = document.getElementById('mgmt-content');
    container.innerHTML = "";
    let temProjeto = false;

    if (ARTISTA_ATUAL.tour_info) {
        temProjeto = true;
        const info = ARTISTA_ATUAL.tour_info;
        container.innerHTML += `
            <div class="glass-card" style="text-align:left;">
                <div class="project-tag">🎤 Tour Ativa</div>
                <h3 style="font-size:1.3em; margin-bottom:5px;">${info.nomeTour}</h3>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:15px; border-top:1px solid rgba(255,255,255,0.1); padding-top:15px;">
                    <div><b style="display:block; font-size:0.55em; opacity:0.5;">ARRECADAÇÃO</b><span style="font-size:0.9em; font-weight:700; color:#ffd700;">$EC ${info.arrecadacao.toLocaleString()}</span></div>
                    <div><b style="display:block; font-size:0.55em; opacity:0.5;">PROGRESSO</b><span style="font-size:0.9em; font-weight:700; color:#ffd700;">Show ${info.showAtual}/${info.totalShows}</span></div>
                </div>
                <button class="btn-detalhes" onclick="abrirItinerario()">Ver datas e locais</button>
            </div>`;
    } 
    
    if (ARTISTA_ATUAL.status && ARTISTA_ATUAL.status.includes("🎬")) {
        temProjeto = true;
        container.innerHTML += `
            <div class="glass-card" style="text-align:left; border-color:#00ff88;">
                <div class="project-tag" style="color:#00ff88; border-color:#00ff88; background:rgba(0,255,136,0.1);">🎬 Audiovisual</div>
                <h3 style="font-size:1.1em; margin-bottom:5px;">${ARTISTA_ATUAL.status.replace("🎬 ", "")}</h3>
                <p style="font-size:0.8em; opacity:0.7;">Status: Em fase de produção / Gravações.</p>
            </div>`;
    }

    if(!temProjeto) {
        container.innerHTML = "<p style='text-align:center; opacity:0.3; margin-top:50px;'>Nenhum projeto ativo.</p>";
    }
    showScreen('view-mgmt');
}

function abrirItinerario() {
    const lista = document.getElementById('itinerario-lista');
    lista.innerHTML = "";
    if (ARTISTA_ATUAL.tour_info && ARTISTA_ATUAL.tour_info.agenda) {
        const agenda = JSON.parse(ARTISTA_ATUAL.tour_info.agenda);
        agenda.forEach(show => {
            const pct = Math.round((show.vendidos / show.capacidade) * 100);
            lista.innerHTML += `
                <div class="agenda-card">
                    <div class="info"><small>${show.data}</small><b>${show.local}</b></div>
                    <div class="agenda-stats">
                        <b style="color:#ffd700;">EC ${show.arrecadado.toLocaleString()}</b>
                        <span class="cap-box">${show.vendidos.toLocaleString()} / ${show.capacidade.toLocaleString()}</span>
                        <span class="pct-tag">${pct}% OCUPADO</span>
                    </div>
                </div>`;
        });
        openModal('modal-itinerario');
    }
}

// COMPRA DE TOUR
async function processarCompraUnificada(porte) {
    if(!ARTISTA_ATUAL) return;
    const nomeT = document.getElementById('t-nome').value;
    const dataT = document.getElementById('t-data').value;
    const qtdT = document.getElementById('t-qtd').value;
    const contT = document.getElementById('t-continente').value;

    if(!nomeT || !dataT) return alert("Preencha nome e data!");

    document.body.style.opacity = "0.5";
    const url = `${SCRIPT_URL}?acao=compra_unificada_tour&nome=${encodeURIComponent(ARTISTA_ATUAL.nome)}&tipo=${encodeURIComponent(porte)}&titulo=${encodeURIComponent(nomeT)}&dataInicio=${dataT}&qtd=${qtdT}&continente=${contT}`;

    try {
        const res = await fetch(url);
        const txt = await res.text();
        alert(txt);
        loadMyArtists(); 
        document.body.style.opacity = "1";
    } catch(e) { alert("Erro de conexão."); document.body.style.opacity = "1"; }
}

// COMPRA DE CINEMA
async function processarCompraCinema() {
    if(!ARTISTA_ATUAL) return;
    const nomeC = document.getElementById('c-nome').value;
    const tipoC = document.getElementById('c-tipo').value;
    const dataC = document.getElementById('c-data').value;
    const genC = document.getElementById('c-genero').value;

    if(!nomeC || !dataC) return alert("Preencha título e data!");

    document.body.style.opacity = "0.5";
    const url = `${SCRIPT_URL}?acao=compra_cinema&nome=${encodeURIComponent(ARTISTA_ATUAL.nome)}&titulo=${encodeURIComponent(nomeC)}&tipo=${encodeURIComponent(tipoC)}&genero=${encodeURIComponent(genC)}&dataInicio=${dataC}`;

    try {
        const res = await fetch(url);
        const txt = await res.text();
        alert(txt);
        loadMyArtists(); 
        document.body.style.opacity = "1";
    } catch(e) { alert("Erro de conexão."); document.body.style.opacity = "1"; }
}
