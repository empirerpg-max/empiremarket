const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwxbkUndhZPtFvtK1uIFTkPNN-m6WeiFVMU3IDzuahsC0oQp8Ba2GLQFOAPkWv8eiA3/exec"; 

let ARTISTA_DATA = {};

function showScreen(id) {
    document.querySelectorAll('.app-view').forEach(v => v.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

async function loadData() {
    const params = new URLSearchParams(window.location.search);
    const nome = params.get('nome');
    if(!nome) return;
    try {
        const res = await fetch(`${SCRIPT_URL}?nome=${nome}`);
        ARTISTA_DATA = await res.json();
        document.getElementById('artist-name').innerText = ARTISTA_DATA.nome;
        document.getElementById('artist-photo').src = ARTISTA_DATA.foto;
        document.getElementById('artist-saldo').innerText = `$EC ${ARTISTA_DATA.saldo.toLocaleString('pt-BR')}`;
        document.getElementById('hub-fortuna').innerText = `$${ARTISTA_DATA.fortuna.toLocaleString('pt-BR')}`;
        document.getElementById('current-activity').innerText = (ARTISTA_DATA.status === "Livre") ? "DISPONÍVEL" : ARTISTA_DATA.status.toUpperCase();
        document.getElementById('bar-prestigio').style.width = (ARTISTA_DATA.prestigio / 10) + "%";
        document.getElementById('txt-prestigio').innerText = `${ARTISTA_DATA.prestigio}/1000`;
        document.getElementById('bar-fadiga').style.width = ARTISTA_DATA.fadiga + "%";
        document.getElementById('txt-fadiga').innerText = ARTISTA_DATA.fadiga + "%";
    } catch (e) { console.error(e); }
}

function checkActiveTour() {
    if (ARTISTA_DATA.status && ARTISTA_DATA.status.includes("Preparando")) {
        openModal('modal-planejar-tour');
    } else if (ARTISTA_DATA.tour_info) {
        renderTourScreen();
        showScreen('tour-screen');
    } else {
        alert("Nenhum projeto ativo.");
    }
}

function renderTourScreen() {
    const info = ARTISTA_DATA.tour_info;
    document.getElementById('tour-display-name').innerText = info.nomeTour;
    document.getElementById('tour-total-money').innerText = `$EC ${info.arrecadacao.toLocaleString('pt-BR')}`;
    document.getElementById('tour-progress').innerText = `${info.showAtual} / ${info.totalShows}`;
    const list = document.getElementById('tour-agenda-list');
    list.innerHTML = "";
    JSON.parse(info.agenda).forEach(show => {
        list.innerHTML += `<div class="agenda-card"><div><small>${show.data}</small><b>${show.local}</b></div><div style="text-align:right;"><b>EC ${show.arrecadado.toLocaleString()}</b><small style="display:block;opacity:0.5;">${show.vendidos} pax</small></div></div>`;
    });
}

async function contratarTour(p) {
    const t = document.getElementById('tour-nome').value;
    if(!t) return alert("Dê um nome!");
    await enviar('contratar_tour', { nome: ARTISTA_DATA.nome, tipo: p, titulo: t });
}

async function gerarItinerario() {
    const q = document.getElementById('tour-count-shows').value;
    const d = document.getElementById('tour-date-start').value;
    if(!d) return alert("Defina o início!");
    await enviar('gerar_itinerario', { nome: ARTISTA_DATA.nome, qtd: q, dataInicio: d });
}

async function enviar(acao, params) {
    document.body.style.opacity = "0.5";
    let url = `${SCRIPT_URL}?acao=${acao}`;
    for (let k in params) url += `&${k}=${encodeURIComponent(params[k])}`;
    const res = await fetch(url);
    const txt = await res.text();
    alert(txt);
    location.reload();
}

window.onload = loadData;
