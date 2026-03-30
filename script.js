// ATENÇÃO: COLOQUE SUA URL DO GOOGLE ABAIXO
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwxbkUndhZPtFvtK1uIFTkPNN-m6WeiFVMU3IDzuahsC0oQp8Ba2GLQFOAPkWv8eiA3/exec"; 

function openCinema() { 
    document.getElementById('modal-cinema').classList.add('active'); 
}

function closeCinema() { 
    document.getElementById('modal-cinema').classList.remove('active'); 
}

async function loadData() {
    const params = new URLSearchParams(window.location.search);
    const nome = params.get('nome');
    if(!nome) return;

    try {
        const response = await fetch(`${SCRIPT_URL}?nome=${nome}`);
        const user = await response.json();

        // Preenche os dados
        document.getElementById('artist-name').innerText = user.nome;
        document.getElementById('artist-photo').src = user.foto;
        document.getElementById('artist-saldo').innerText = `$EC ${user.saldo.toLocaleString('pt-BR')}`;
        document.getElementById('artist-fortuna').innerText = `$${user.fortuna.toLocaleString('pt-BR')}`;
        
        // Status e Banner
        const dot = document.getElementById('status-dot');
        const banner = document.getElementById('current-activity');
        if(user.status === "Livre") {
            dot.style.background = "#00ff88"; // Verde Neon
            banner.innerText = "Disponível para Projetos";
        } else {
            dot.style.background = "#bc13fe"; // Roxo Empire
            banner.innerText = user.status;
        }

        // Atualiza as Barras
        document.getElementById('bar-prestigio').style.width = (user.prestigio / 10) + "%";
        document.getElementById('txt-prestigio').innerText = `${user.prestigio}/1000`;
        
        document.getElementById('bar-fadiga').style.width = user.fadiga + "%";
        document.getElementById('txt-fadiga').innerText = user.fadiga + "%";

    } catch (e) {
        console.error("Erro ao carregar dados:", e);
    }
}

async function contratarFilme(categoria) {
    const nome = new URLSearchParams(window.location.search).get('nome');
    
    // Captura valores do formulário
    const titulo = document.getElementById('obra-titulo').value.trim();
    const genero = document.getElementById('obra-genero').value;
    const ano = document.getElementById('obra-ano').value;

    // VALIDAÇÃO OBRIGATÓRIA
    if (!titulo || !genero || !ano) {
        alert("⚠️ ATENÇÃO: Preencha o Título, Gênero e Ano antes de assinar o contrato!");
        return;
    }

    if(!confirm(`Confirmar produção de "${titulo}"?\nInvestimento: ${categoria}`)) return;

    // Feedback visual de carregamento
    document.body.style.opacity = "0.5";
    document.body.style.pointerEvents = "none";

    try {
        const url = `${SCRIPT_URL}?acao=contratar_filme&nome=${nome}&tipo=${categoria}&titulo=${encodeURIComponent(titulo)}&genero=${genero}&ano=${ano}`;
        const response = await fetch(url);
        const text = await response.text();
        
        alert(text);
        closeCinema();
        await loadData(); // Recarrega os dados

    } catch (e) {
        alert("Erro na conexão com a planilha.");
    } finally {
        document.body.style.opacity = "1";
        document.body.style.pointerEvents = "all";
    }
}

// Inicia o carregamento
window.onload = loadData;
