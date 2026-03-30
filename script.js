const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwxbkUndhZPtFvtK1uIFTkPNN-m6WeiFVMU3IDzuahsC0oQp8Ba2GLQFOAPkWv8eiA3/exec"; // <--- COLOQUE SUA URL AQUI

function openCinema() {
    document.getElementById('modal-cinema').classList.add('active');
}

function closeCinema() {
    document.getElementById('modal-cinema').classList.remove('active');
    document.getElementById('obra-titulo').value = ""; // Limpa ao fechar
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
        if(user.status === "Livre") {
            dot.style.background = "#00ff88";
            banner.innerText = "Disponível para Projetos";
        } else {
            dot.style.background = "#bc13fe";
            banner.innerText = user.status;
        }

        document.getElementById('bar-prestigio').style.width = (user.prestigio / 10) + "%";
        document.getElementById('txt-prestigio').innerText = `${user.prestigio}/1000`;
        document.getElementById('bar-fadiga').style.width = user.fadiga + "%";
        document.getElementById('txt-fadiga').innerText = user.fadiga + "%";

    } catch (e) { console.error(e); }
}

async function contratarFilme(categoria) {
    const nome = new URLSearchParams(window.location.search).get('nome');
    const titulo = document.getElementById('obra-titulo').value.trim();

    // Validação: Não pode deixar o nome vazio
    if (!titulo) {
        alert("Por favor, dê um nome para o seu projeto cinematográfico!");
        return;
    }

    if(!confirm(`Iniciar produção de "${titulo}" como ${categoria}?`)) return;

    document.body.style.opacity = "0.7";
    document.body.style.pointerEvents = "none";

    try {
        // Enviamos o nome (artista), a categoria (tipo) e o título digitado
        const response = await fetch(`${SCRIPT_URL}?acao=contratar_filme&nome=${nome}&tipo=${categoria}&titulo=${encodeURIComponent(titulo)}`);
        const text = await response.text();
        
        alert(text);
        closeCinema();
        await loadData();
    } catch (e) {
        alert("Erro na conexão com Hollywood.");
    } finally {
        document.body.style.opacity = "1";
        document.body.style.pointerEvents = "all";
    }
}

window.onload = loadData;
