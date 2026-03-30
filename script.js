const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwxbkUndhZPtFvtK1uIFTkPNN-m6WeiFVMU3IDzuahsC0oQp8Ba2GLQFOAPkWv8eiA3/exec"; 

function openCinema() { document.getElementById('modal-cinema').classList.add('active'); }
function closeCinema() { document.getElementById('modal-cinema').classList.remove('active'); }

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
    } catch (e) { console.error(e); }
}

async function contratarFilme(categoria) {
    const nome = new URLSearchParams(window.location.search).get('nome');
    
    // Captura dos dados
    const titulo = document.getElementById('obra-titulo').value.trim();
    const genero = document.getElementById('obra-genero').value;
    const ano = document.getElementById('obra-ano').value;

    // VALIDAÇÃO OBRIGATÓRIA
    if (!titulo || !genero || !ano) {
        alert("⚠️ Por favor, preencha o Título, Gênero e Ano antes de contratar!");
        return;
    }

    if(!confirm(`Confirmar produção de "${titulo}"?\nInvestimento: ${categoria}`)) return;

    document.body.style.opacity = "0.5";
    try {
        const url = `${SCRIPT_URL}?acao=contratar_filme&nome=${nome}&tipo=${categoria}&titulo=${encodeURIComponent(titulo)}&genero=${genero}&ano=${ano}`;
        const res = await fetch(url);
        const text = await res.text();
        alert(text);
        closeCinema();
        loadData();
    } catch (e) { alert("Erro na conexão."); }
    document.body.style.opacity = "1";
}

window.onload = loadData;
