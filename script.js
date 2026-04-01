const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwxbkUndhZPtFvtK1uIFTkPNN-m6WeiFVMU3IDzuahsC0oQp8Ba2GLQFOAPkWv8eiA3/exec"; // COLOQUE SEU /exec AQUI

let ARTISTA_DATA = {};

// CONTROLE DE MODAIS
function openModal(id) { 
    document.getElementById(id).classList.add('active'); 
}

function closeModal(id) { 
    document.getElementById(id).classList.remove('active'); 
}

// CARREGAMENTO DE DADOS
async function loadData() {
    const params = new URLSearchParams(window.location.search);
    const nome = params.get('nome');
    if(!nome) return;

    try {
        const response = await fetch(`${SCRIPT_URL}?nome=${nome}`);
        ARTISTA_DATA = await response.json();
        
        // Atualização da Interface Principal
        document.getElementById('artist-name').innerText = ARTISTA_DATA.nome;
        document.getElementById('artist-photo').src = ARTISTA_DATA.foto;
        document.getElementById('artist-saldo').innerText = `$EC ${ARTISTA_DATA.saldo.toLocaleString('pt-BR')}`;
        
        // Fortuna no Hub
        document.getElementById('hub-fortuna').innerText = `$${ARTISTA_DATA.fortuna.toLocaleString('pt-BR')}`;
        
        // Status Banner
        const banner = document.getElementById('current-activity');
        banner.innerText = (ARTISTA_DATA.status === "Livre") ? "Disponível" : ARTISTA_DATA.status;

        // Barras Neon
        document.getElementById('bar-prestigio').style.width = (ARTISTA_DATA.prestigio / 10) + "%";
        document.getElementById('txt-prestigio').innerText = `${ARTISTA_DATA.prestigio}/1000`;
        document.getElementById('bar-fadiga').style.width = ARTISTA_DATA.fadiga + "%";
        document.getElementById('txt-fadiga').innerText = ARTISTA_DATA.fadiga + "%";

    } catch (e) { 
        console.error("Erro ao sincronizar com o Império:", e); 
    }
}

// GESTÃO DE PROJETOS (POPULAÇÃO DINÂMICA)
function openManagement() {
    const list = document.getElementById('active-projects-list');
    list.innerHTML = "";
    let temProjeto = false;

    // Lógica para Turnê
    if (ARTISTA_DATA.tour_info || (ARTISTA_DATA.status && ARTISTA_DATA.status.includes("Preparando"))) {
        temProjeto = true;
        const card = document.createElement('div');
        card.className = "project-card";
        card.innerHTML = `
            <h4>🎤 Projeto de Turnê</h4>
            <p>Status: ${ARTISTA_DATA.tour_info ? 'Em Rota Ativa' : 'Aguardando Itinerário'}</p>
        `;
        card.onclick = () => alert("Detalhes da Turnê em breve...");
        list.appendChild(card);
    }

    // Lógica para Cinema
    if (ARTISTA_DATA.status && ARTISTA_DATA.status.includes("🎬")) {
        temProjeto = true;
        const card = document.createElement('div');
        card.className = "project-card";
        card.style.borderLeftColor = "#0096ff";
        card.innerHTML = `
            <h4>🎬 Produção de Cinema</h4>
            <p>Status: Gravações em Hollywood</p>
        `;
        card.onclick = () => alert("Detalhes do Cinema em breve...");
        list.appendChild(card);
    }

    if (!temProjeto) {
        list.innerHTML = "<p style='text-align:center; opacity:0.3; margin-top:30px; font-size:0.8em;'>Nenhum projeto ativo.</p>";
    }

    openModal('modal-mgmt');
}

window.onload = loadData;
