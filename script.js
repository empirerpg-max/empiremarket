const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwxbkUndhZPtFvtK1uIFTkPNN-m6WeiFVMU3IDzuahsC0oQp8Ba2GLQFOAPkWv8eiA3/exec"; 

// Abertura e Fechamento
function openCinema() { document.getElementById('modal-cinema').classList.add('active'); }
function closeCinema() { document.getElementById('modal-cinema').classList.remove('active'); }
function openTour() { document.getElementById('modal-tour').classList.add('active'); }
function closeTour() { document.getElementById('modal-tour').classList.remove('active'); }

async function loadData() {
    const params = new URLSearchParams(window.location.search);
    const nome = params.get('nome');
    if(!nome) return;

    try {
        const response = await fetch(`${SCRIPT_URL}?nome=${nome}`);
        const user = await response.json();
        
        document.getElementById('artist-name').innerText = user.nome;
        document.getElementById('artist-photo').src = user.foto;
        document.getElementById('artist-saldo').innerText = `$EC ${user.saldo.toLocaleString('pt-BR')}`;
        document.getElementById('artist-fortuna').innerText = `$${user.fortuna.toLocaleString('pt-BR')}`;
        
        const dot = document.getElementById('status-dot');
        dot.style.background = (user.status === "Livre") ? "#00ff88" : "#bc13fe";
        document.getElementById('current-activity').innerText = (user.status === "Livre") ? "Disponível para Projetos" : user.status;

        document.getElementById('bar-prestigio').style.width = (user.prestigio / 10) + "%";
        document.getElementById('txt-prestigio').innerText = `${user.prestigio}/1000`;
        document.getElementById('bar-fadiga').style.width = user.fadiga + "%";
        document.getElementById('txt-fadiga').innerText = user.fadiga + "%";
    } catch (e) { console.log("Erro no fetch:", e); }
}

async function contratarFilme(cat) {
    const nome = new URLSearchParams(window.location.search).get('nome');
    const t = document.getElementById('obra-titulo').value;
    const g = document.getElementById('obra-genero').value;
    const a = document.getElementById('obra-ano').value;
    if(!t || !g || !a) { alert("Preencha todos os campos!"); return; }
    
    await enviarAcao('contratar_filme', { nome, tipo: cat, titulo: t, genero: g, ano: a });
}

async function contratarTour(porte) {
    const nome = new URLSearchParams(window.location.search).get('nome');
    const t = document.getElementById('tour-nome').value;
    if(!t) { alert("Dê um nome à Tour!"); return; }

    await enviarAcao('contratar_tour', { nome, tipo: porte, titulo: t });
}

async function enviarAcao(acao, params) {
    document.body.style.opacity = "0.5";
    let url = `${SCRIPT_URL}?acao=${acao}`;
    for (let k in params) url += `&${k}=${encodeURIComponent(params[k])}`;
    
    try {
        const res = await fetch(url);
        const txt = await res.text();
        alert(txt);
        closeCinema(); closeTour();
        loadData();
    } catch (e) { alert("Erro na conexão."); }
    document.body.style.opacity = "1";
}

window.onload = loadData;
