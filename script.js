const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwxbkUndhZPtFvtK1uIFTkPNN-m6WeiFVMU3IDzuahsC0oQp8Ba2GLQFOAPkWv8eiA3/exec"; // <--- COLOQUE SUA URL AQUI

// Funções do Modal
function openCinema() { 
    document.getElementById('modal-cinema').classList.add('active'); 
}
function closeCinema() { 
    document.getElementById('modal-cinema').classList.remove('active'); 
}

// Carregar Dados Iniciais
async function loadData() {
    const params = new URLSearchParams(window.location.search);
    const nome = params.get('nome');
    if(!nome) return;

    try {
        const response = await fetch(`${SCRIPT_URL}?nome=${nome}`);
        const user = await response.json();

        // Dados Básicos
        document.getElementById('artist-name').innerText = user.nome;
        document.getElementById('artist-photo').src = user.foto;
        document.getElementById('artist-saldo').innerText = `$EC ${user.saldo.toLocaleString('pt-BR')}`;
        document.getElementById('artist-fortuna').innerText = `$${user.fortuna.toLocaleString('pt-BR')}`;
        
        // Status e Banner
        const dot = document.getElementById('status-dot');
        const banner = document.getElementById('current-activity');
        if(user.status === "Livre") {
            dot.style.background = "#00ff88";
            banner.innerText = "Disponível para Projetos";
        } else {
            dot.style.background = "#bc13fe";
            banner.innerText = user.status;
        }

        // Barras
        document.getElementById('bar-prestigio').style.width = (user.prestigio / 10) + "%";
        document.getElementById('txt-prestigio').innerText = `${user.prestigio}/1000`;
        document.getElementById('bar-fadiga').style.width = user.fadiga + "%";
        document.getElementById('txt-fadiga').innerText = user.fadiga + "%";

    } catch (e) {
        console.error("Erro ao carregar dados:", e);
    }
}

// Contratar Filme
async function contratarFilme(tipo) {
    const nome = new URLSearchParams(window.location.search).get('nome');
    if(!confirm(`Deseja assinar contrato para: ${tipo}?`)) return;

    // Feedback visual
    document.body.style.pointerEvents = "none";
    document.body.style.opacity = "0.7";

    try {
        const response = await fetch(`${SCRIPT_URL}?acao=contratar_filme&nome=${nome}&tipo=${tipo}`);
        const text = await response.text();
        
        alert(text);
        closeCinema();
        await loadData(); // Recarrega os dados para mostrar o novo saldo/status

    } catch (e) {
        alert("Erro ao processar transação.");
    } finally {
        document.body.style.pointerEvents = "all";
        document.body.style.opacity = "1";
    }
}

// Iniciar
window.onload = loadData;
