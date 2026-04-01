const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwxbkUndhZPtFvtK1uIFTkPNN-m6WeiFVMU3IDzuahsC0oQp8Ba2GLQFOAPkWv8eiA3/exec"; // COLOQUE SEU /exec AQUI

let ARTISTA_DATA = {};

// TROCA DE TELAS (SPA REAL)
function showScreen(screenId) {
    document.querySelectorAll('.app-screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    window.scrollTo(0,0);
}

// CARREGAMENTO INICIAL
async function loadData() {
    const params = new URLSearchParams(window.location.search);
    const nome = params.get('nome');
    if(!nome) return;

    try {
        const response = await fetch(`${SCRIPT_URL}?nome=${nome}`);
        ARTISTA_DATA = await response.json();
        
        // Atualiza Interface Fixa
        document.getElementById('artist-name').innerText = ARTISTA_DATA.nome;
        document.getElementById('artist-photo').src = ARTISTA_DATA.foto;
        document.getElementById('artist-saldo').innerText = `$EC ${ARTISTA_DATA.saldo.toLocaleString('pt-BR')}`;
        document.getElementById('hub-fortuna').innerText = `$${ARTISTA_DATA.fortuna.toLocaleString('pt-BR')}`;
        
        const banner = document.getElementById('current-activity');
        banner.innerText = (ARTISTA_DATA.status === "Livre") ? "DISPONÍVEL" : ARTISTA_DATA.status.toUpperCase();

        // Barras
        document.getElementById('bar-prestigio').style.width = (ARTISTA_DATA.prestigio / 10) + "%";
        document.getElementById('txt-prestigio').innerText = `${ARTISTA_DATA.prestigio}/1000`;
        document.getElementById('bar-fadiga').style.width = ARTISTA_DATA.fadiga + "%";
        document.getElementById('txt-fadiga').innerText = ARTISTA_DATA.fadiga + "%";

    } catch (e) { console.error("Erro na sincronização", e); }
}

// GESTÃO DE PROJETOS (DASHBOARD)
function checkManagementView() {
    const container = document.getElementById('mgmt-content');
    container.innerHTML = "";

    if (ARTISTA_DATA.tour_info) {
        // TELA COM DASHBOARD DA TOUR ATIVA
        const info = ARTISTA_DATA.tour_info;
        const agenda = JSON.parse(info.agenda);
        let agendaHtml = "";
        agenda.forEach(show => {
            agendaHtml += `
                <div class="agenda-card">
                    <div><small style="color:#bc13fe; font-weight:800; font-size:0.6em;">${show.data}</small><b style="display:block; font-size:0.85em;">${show.local}</b></div>
                    <div style="text-align:right;"><b style="color:#ffd700; font-size:0.75em;">EC ${show.arrecadado.toLocaleString()}</b></div>
                </div>`;
        });

        container.innerHTML = `
            <div class="glass-card" style="text-align:left;">
                <h3 style="font-size:1.3em; margin-bottom:5px;">${info.nomeTour}</h3>
                <div class="tour-stats-grid">
                    <div class="t-stat"><b>ARRECADAÇÃO</b><span>$EC ${info.arrecadacao.toLocaleString()}</span></div>
                    <div class="t-stat"><b>PROGRESSO</b><span>Show ${info.showAtual}/${info.totalShows}</span></div>
                </div>
            </div>
            <h3 style="font-size:0.85em; font-weight:800; color:#bc13fe; margin: 15px 0; text-align:left; text-transform:uppercase;">Itinerário</h3>
            ${agendaHtml}`;
    } else {
        container.innerHTML = "<p style='text-align:center; opacity:0.3; margin-top:50px;'>Nenhum projeto ativo.</p>";
    }
    showScreen('screen-mgmt');
}

// AÇÃO ÚNICA: COMPRAR E GERAR AGENDA (FIM DO ERRO DE CONEXÃO)
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
        alert("Erro de conexão. Verifique o console."); 
        document.body.style.opacity = "1";
    }
}

window.onload = loadData;
