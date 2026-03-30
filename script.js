const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwxbkUndhZPtFvtK1uIFTkPNN-m6WeiFVMU3IDzuahsC0oQp8Ba2GLQFOAPkWv8eiA3/exec";

// Abrir/Fechar Modal
function openCinema() { document.getElementById('modal-cinema').classList.add('active'); }
function closeCinema() { document.getElementById('modal-cinema').classList.remove('active'); }

// Carregar Dados da Home
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
        
        // Status Dot e Banner
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
        document.getElementById('txt-prestigio').innerText = user.prestigio + "/1000";
        document.getElementById('bar-fadiga').style.width = user.fadiga + "%";
        document.getElementById('txt-fadiga').innerText = user.fadiga + "%";
    } catch (e) { console.error(e); }
}

// CONTRATAR FILME (Envia para a Planilha)
async function contratarFilme(tipo) {
    const nome = new URLSearchParams(window.location.search).get('nome');
    if(!confirm(`Deseja investir em: ${tipo}?`)) return;

    // Feedback visual de carregamento
    document.body.style.opacity = "0.5";

    try {
        const response = await fetch(`${SCRIPT_URL}?acao=contratar_filme&nome=${nome}&tipo=${tipo}`);
        const result = await response.text();
        
        alert(result); // Mostra "Sucesso!" ou "Saldo Insuficiente"
        closeCinema();
        loadData(); // Atualiza a tela com o novo saldo e status
    } catch (e) {
        alert("Erro ao processar contrato.");
    } finally {
        document.body.style.opacity = "1";
    }
}

window.onload = loadData;
