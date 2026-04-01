const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwxbkUndhZPtFvtK1uIFTkPNN-m6WeiFVMU3IDzuahsC0oQp8Ba2GLQFOAPkWv8eiA3/exec"; 

let ARTISTA_DATA = {};

function showScreen(viewId) {
    document.querySelectorAll('.app-screen').forEach(s => s.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    window.scrollTo(0,0);
}

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
        document.getElementById('hub-fortuna').innerText = `$${ARTISTA_DATA.fortuna.toLocaleString('pt-BR')}`;
        document.getElementById('current-activity').innerText = (ARTISTA_DATA.status === "Livre") ? "DISPONÍVEL" : ARTISTA_DATA.status.toUpperCase();

        document.getElementById('bar-prestigio').style.width = (ARTISTA_DATA.prestigio / 10) + "%";
        document.getElementById('txt-prestigio').innerText = `${ARTISTA_DATA.prestigio}/1000`;
        document.getElementById('bar-fadiga').style.width = ARTISTA_DATA.fadiga + "%";
        document.getElementById('txt-fadiga').innerText = ARTISTA_DATA.fadiga + "%";

    } catch (e) { console.error("Falha no carregamento", e); }
}

// GESTÃO COM TAG DE PROJETO
function checkManagementView() {
    const container = document.getElementById('mgmt-content');
    container.innerHTML = "";

    if (ARTISTA_DATA.tour_info) {
        const info = ARTISTA_DATA.tour_info;
        
        container.innerHTML = `
            <div class="glass-card" style="text-align:left;">
                <div class="project-tag">Tour</div>
                <h3 style="font-size:1.3em; margin-bottom:5px;">${info.nomeTour}</h3>
                <div class="tour-stats-grid">
                    <div class="t-stat"><b>ARRECADAÇÃO</b><span>$EC ${info.arrecadacao.toLocaleString()}</span></div>
                    <div class="t-stat"><b>PROGRESSO</b><span>Show ${info.showAtual}/${info.totalShows}</span></div>
                </div>
                <button class="btn-detalhes" onclick="abrirItinerario()">Ver datas, vendas e locais aqui</button>
            </div>`;
    } else {
        container.innerHTML = "<p style='text-align:center; opacity:0.3; margin-top:50px;'>Nenhum projeto ativo no momento.</p>";
    }
    showScreen('screen-mgmt');
}

// MODAL COM MÉTRICAS E TAG
function abrirItinerario() {
    const lista = document.getElementById('itinerario-lista');
    lista.innerHTML = "";
    
    if (ARTISTA_DATA.tour_info && ARTISTA_DATA.tour_info.agenda) {
        const agenda = JSON.parse(ARTISTA_DATA.tour_info.agenda);
        agenda.forEach(show => {
            const pct = Math.round((show.vendidos / show.capacidade) * 100);
            lista.innerHTML += `
                <div class="agenda-card">
                    <div class="info">
                        <small>Data do Show</small>
                        <b>${show.data}</b>
                        <small style="margin-top:5px; display:block;">Local</small>
                        <b style="font-size:0.75em; opacity:0.7;">${show.local}</b>
                    </div>
                    <div class="agenda-stats">
                        <b>EC ${show.arrecadado.toLocaleString()}</b>
                        <span class="cap-box">${show.vendidos.toLocaleString()} / ${show.capacidade.toLocaleString()}</span>
                        <span class="pct-tag">${pct}% OCUPADO</span>
                    </div>
                </div>`;
        });
        openModal('modal-itinerario');
    }
}

// COMPRA UNIFICADA
async function processarCompraUnificada(porte) {
    const nomeT = document.getElementById('t-nome').value;
    const dataT = document.getElementById('t-data').value;
    const qtdT = document.getElementById('t-qtd').value;

    if(!nomeT || !dataT) return alert("Preencha o nome e a data da tour!");

    document.body.style.opacity = "0.5";
    const url = `${SCRIPT_URL}?acao=compra_unificada_tour&nome=${encodeURIComponent(ARTISTA_DATA.nome)}&tipo=${encodeURIComponent(porte)}&titulo=${encodeURIComponent(nomeT)}&dataInicio=${dataT}&qtd=${qtdT}`;

    try {
        const res = await fetch(url);
        const txt = await res.text();
        alert(txt);
        location.reload();
    } catch(e) { 
        alert("Erro de conexão."); 
        document.body.style.opacity = "1";
    }
}

window.onload = loadData;
