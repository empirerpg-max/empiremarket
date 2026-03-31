const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwxbkUndhZPtFvtK1uIFTkPNN-m6WeiFVMU3IDzuahsC0oQp8Ba2GLQFOAPkWv8eiA3/exec"; 

let ARTISTA_DATA = {};

// Controles dos Modais
function openCinema() { document.getElementById('modal-cinema').classList.add('active'); }
function closeCinema() { document.getElementById('modal-cinema').classList.remove('active'); }
function openTour() { document.getElementById('modal-tour').classList.add('active'); }
function closeTour() { document.getElementById('modal-tour').classList.remove('active'); }
function openPlanejar() { document.getElementById('modal-planejar-tour').classList.add('active'); }
function closePlanejar() { document.getElementById('modal-planejar-tour').classList.remove('active'); }

// Verifica se o Artista vai comprar ou planejar a Tour
function checkTourStatus() {
    if (ARTISTA_DATA.status && ARTISTA_DATA.status.includes("Planejamento")) {
        openPlanejar();
    } else if (ARTISTA_DATA.status !== "Livre") {
        alert("Você já está em um projeto!");
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
        
        const dot = document.getElementById('status-dot');
        const banner = document.getElementById('current-activity');
        const tourLabel = document.getElementById('label-tour');

        if(ARTISTA_DATA.status === "Livre") {
            dot.style.background = "#00ff88";
            banner.innerText = "Disponível para Projetos";
            tourLabel.innerText = "Tour";
        } else if (ARTISTA_DATA.status.includes("Planejamento")) {
            dot.style.background = "#ffd700";
            banner.innerText = "Aguardando Itinerário";
            tourLabel.innerText = "Planejar Tour";
        } else {
            dot.style.background = "#bc13fe";
            banner.innerText = ARTISTA_DATA.status;
            tourLabel.innerText = "Ver Tour";
        }

        document.getElementById('bar-prestigio').style.width = (ARTISTA_DATA.prestigio / 10) + "%";
        document.getElementById('txt-prestigio').innerText = `${ARTISTA_DATA.prestigio}/1000`;
        document.getElementById('bar-fadiga').style.width = ARTISTA_DATA.fadiga + "%";
        document.getElementById('txt-fadiga').innerText = ARTISTA_DATA.fadiga + "%";
    } catch (e) { console.error(e); }
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
    if(!confirm(`Gerar ${qtd} datas? Isso definirá sua rota final.`)) return;
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
        alert(txt);
        location.reload(); 
    } catch (e) { alert("Erro de conexão."); }
    document.body.style.opacity = "1";
    document.body.style.pointerEvents = "all";
}

window.onload = loadData;
