const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwxbkUndhZPtFvtK1uIFTkPNN-m6WeiFVMU3IDzuahsC0oQp8Ba2GLQFOAPkWv8eiA3/exec"; // <--- COLOQUE SUA URL AQUI

// Funções do Cinema
function openCinema() { 
    console.log("Abrindo Cinema...");
    document.getElementById('modal-cinema').classList.add('active'); 
}
function closeCinema() { 
    document.getElementById('modal-cinema').classList.remove('active'); 
}

// Funções da Tour (O QUE NÃO ESTAVA FUNCIONANDO)
function openTour() { 
    console.log("Abrindo Tour...");
    document.getElementById('modal-tour').classList.add('active'); 
}
function closeTour() { 
    document.getElementById('modal-tour').classList.remove('active'); 
}

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
        const banner = document.getElementById('current-activity');
        dot.style.background = (user.status === "Livre") ? "#00ff88" : "#bc13fe";
        banner.innerText = (user.status === "Livre") ? "Disponível para Projetos" : user.status;

        document.getElementById('bar-prestigio').style.width = (user.prestigio / 10) + "%";
        document.getElementById('txt-prestigio').innerText = `${user.prestigio}/1000`;
        document.getElementById('bar-fadiga').style.width = user.fadiga + "%";
        document.getElementById('txt-fadiga').innerText = user.fadiga + "%";
    } catch (e) { console.error(e); }
}

async function contratarFilme(categoria) {
    const nome = new URLSearchParams(window.location.search).get('nome');
    const titulo = document.getElementById('obra-titulo').value.trim();
    const genero = document.getElementById('obra-genero').value;
    const ano = document.getElementById('obra-ano').value;

    if (!titulo || !genero || !ano) { alert("⚠️ Preencha tudo!"); return; }
    if(!confirm(`Iniciar "${titulo}"?`)) return;

    await enviarPedido('contratar_filme', { nome, tipo: categoria, titulo, genero, ano });
}

async function contratarTour(porte) {
    const nome = new URLSearchParams(window.location.search).get('nome');
    const tourNome = document.getElementById('tour-nome').value.trim();
    const conceito = document.getElementById('tour-conceito').value.trim();

    if (!tourNome) { alert("⚠️ Dê um nome à turnê!"); return; }
    if(!confirm(`Iniciar "${tourNome}"?`)) return;

    await enviarPedido('contratar_tour', { nome, tipo: porte, titulo: tourNome, genero: conceito });
}

async function enviarPedido(acao, params) {
    document.body.style.opacity = "0.5";
    try {
        let q = `?acao=${acao}`;
        for (let k in params) q += `&${k}=${encodeURIComponent(params[k])}`;
        const res = await fetch(SCRIPT_URL + q);
        const txt = await res.text();
        alert(txt);
        closeCinema(); closeTour();
        loadData();
    } catch (e) { alert("Erro na conexão."); }
    document.body.style.opacity = "1";
}

window.onload = loadData;
