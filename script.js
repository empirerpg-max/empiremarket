const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwxbkUndhZPtFvtK1uIFTkPNN-m6WeiFVMU3IDzuahsC0oQp8Ba2GLQFOAPkWv8eiA3/exec"; // <--- COLOQUE SUA URL AQUI

function openCinema() {
    const modal = document.getElementById('modal-cinema');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Impede o fundo de rolar
}

function closeCinema() {
    const modal = document.getElementById('modal-cinema');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

async function loadData() {
    const params = new URLSearchParams(window.location.search);
    const nome = params.get('nome');
    if(!nome) return;

    try {
        const response = await fetch(`${SCRIPT_URL}?nome=${nome}`);
        const user = await response.json();

        // Dados
        document.getElementById('artist-name').innerText = user.nome;
        document.getElementById('artist-photo').src = user.foto;
        document.getElementById('artist-saldo').innerText = `$EC ${user.saldo.toLocaleString('pt-BR')}`;
        document.getElementById('artist-fortuna').innerText = `$${user.fortuna.toLocaleString('pt-BR')}`;
        
        // Status
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
        console.error("Erro ao carregar:", e);
    }
}

async function contratarFilme(tipo) {
    const nome = new URLSearchParams(window.location.search).get('nome');
    if(!confirm(`Deseja assinar contrato para: ${tipo}?`)) return;

    // Loading
    document.body.style.opacity = "0.7";

    try {
        const response = await fetch(`${SCRIPT_URL}?acao=contratar_filme&nome=${nome}&tipo=${tipo}`);
        const text = await response.text();
        
        alert(text);
        closeCinema();
        await loadData();

    } catch (e) {
        alert("Erro na transação.");
    } finally {
        document.body.style.opacity = "1";
    }
}

window.onload = loadData;
