// ATENÇÃO: COLOQUE SUA URL ABAIXO
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwxbkUndhZPtFvtK1uIFTkPNN-m6WeiFVMU3IDzuahsC0oQp8Ba2GLQFOAPkWv8eiA3/exec";

async function loadData() {
    const params = new URLSearchParams(window.location.search);
    const nome = params.get('nome');
    
    if(!nome) {
        document.getElementById('artist-name').innerText = "Escolha um Artista";
        return;
    }

    try {
        const response = await fetch(`${SCRIPT_URL}?nome=${nome}`);
        const user = await response.json();

        // 1. Informações Básicas
        document.getElementById('artist-name').innerText = user.nome;
        document.getElementById('artist-photo').src = user.foto;
        
        // 2. Status e Atividade Dinâmica
        const statusDot = document.getElementById('status-dot');
        const activityText = document.getElementById('current-activity');

        if (user.status === "Livre") {
            statusDot.style.background = "#00ff88"; // Verde Neon
            activityText.innerText = "Disponível para Projetos";
        } else {
            statusDot.style.background = "#bc13fe"; // Roxo (Ocupado)
            activityText.innerText = user.status; // Mostra o que está fazendo (Ex: Gravando Filme)
        }

        // 3. Finanças (Formatando com ponto e vírgula)
        document.getElementById('artist-saldo').innerText = `$EC ${user.saldo.toLocaleString('pt-BR')}`;
        document.getElementById('artist-fortuna').innerText = `$${user.fortuna.toLocaleString('pt-BR')}`;
        
        // 4. Barra de Prestígio (De 0 a 1000)
        const percPrestigio = (user.prestigio / 1000) * 100;
        document.getElementById('bar-prestigio').style.width = percPrestigio + "%";
        document.getElementById('txt-prestigio').innerText = `${user.prestigio}/1000`;
        
        // 5. Barra de Fadiga (De 0 a 100)
        document.getElementById('bar-fadiga').style.width = user.fadiga + "%";
        document.getElementById('txt-fadiga').innerText = user.fadiga + "%";

    } catch (e) {
        console.error("Erro na conexão com a planilha:", e);
        document.getElementById('artist-name').innerText = "Erro ao carregar";
    }
}

// Executa a função assim que a página abre
window.onload = loadData;
