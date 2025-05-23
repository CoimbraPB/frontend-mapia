const baseURL = 'https://backend-mapia.onrender.com'; // Substitua pela URL real do seu backend

// Função para mostrar a notificação com fade-in e fade-out
function mostrarNotificacao(mensagem, tempo = 3000) {
  const notif = document.getElementById('notificacao');
  notif.textContent = mensagem;
  notif.classList.add('show');

  setTimeout(() => {
    notif.classList.remove('show');
  }, tempo);
}

document.getElementById('formulario').addEventListener('submit', async (e) => {
  e.preventDefault();

  const nome = document.getElementById('nome').value.trim();
  const departamento = document.getElementById('departamento').value;
  const pergunta = document.getElementById('pergunta').value.trim();

  if (!nome || !departamento || !pergunta) {
    mostrarNotificacao('Preencha todos os campos.', 3000);
    return;
  }

  try {
    const res = await fetch(`${baseURL}/perguntas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, departamento, pergunta }),
    });

    const data = await res.json();
    mostrarNotificacao(data.msg || data.erro || 'Mensagem enviada com sucesso!', 3000);

    document.getElementById('formulario').reset();
    await carregarPerguntas();
    await carregarFAQ();

  } catch (error) {
    mostrarNotificacao('Erro ao enviar, tente novamente.', 3000);
  }
});

let perguntasCache = [];
let faqsCache = [];

async function carregarPerguntas() {
  const container = document.getElementById('perguntas');
  container.innerHTML = '';
  const res = await fetch(`${baseURL}/perguntas`);
  perguntasCache = await res.json();
  renderizarPerguntasFiltradas('Todos');
}

async function carregarFAQ() {
  const container = document.getElementById('faq');
  container.innerHTML = '';
  const res = await fetch(`${baseURL}/faq`);
  faqsCache = await res.json();
  renderizarFaqsFiltradas('Todos');
}

function criarBotaoPergunta(p) {
  const wrapper = document.createElement('div');
  wrapper.className = 'pergunta-wrapper';

  const botao = document.createElement('button');
  botao.type = 'button';
  botao.className = 'faq-question';
  botao.textContent = `Nome: ${p.nome} — Pergunta: ${p.pergunta || 'Sem pergunta'}`;

  const resposta = document.createElement('div');
  resposta.className = 'faq-answer';
  resposta.innerHTML = `
    <p><strong>Departamento:</strong> ${p.departamento}</p>
    <p><strong>Resposta:</strong> ${p.resposta}</p>
  `;
  resposta.style.display = 'none';

  botao.addEventListener('click', () => {
    const isAtivo = resposta.style.display === 'block';
    resposta.style.display = isAtivo ? 'none' : 'block';
    botao.classList.toggle('active', !isAtivo);
  });

  wrapper.appendChild(botao);
  wrapper.appendChild(resposta);

  return wrapper;
}

function renderizarPerguntasFiltradas(filtro) {
  const container = document.getElementById('perguntas');
  container.innerHTML = '';

  perguntasCache.forEach(p => {
    if (!p.resposta) return;
    if (filtro !== 'Todos' && p.departamento !== filtro) return;

    const perguntaBotao = criarBotaoPergunta(p);
    container.appendChild(perguntaBotao);
  });
}

function renderizarFaqsFiltradas(filtro) {
  const container = document.getElementById('faq');
  container.innerHTML = '';

  faqsCache.forEach(p => {
    if (!p.resposta) return;
    if (filtro !== 'Todos' && p.departamento !== filtro) return;

    const perguntaBotao = criarBotaoPergunta(p);
    container.appendChild(perguntaBotao);
  });
}

function configurarFiltros() {
  const botoes = document.querySelectorAll('#filtros-departamento .btn-filtro');

  botoes.forEach(botao => {
    botao.addEventListener('click', () => {
      botoes.forEach(b => b.classList.remove('ativo'));
      botao.classList.add('ativo');

      const filtro = botao.getAttribute('data-dep');
      renderizarPerguntasFiltradas(filtro);
      renderizarFaqsFiltradas('Todos');
    });
  });
}

window.addEventListener('DOMContentLoaded', () => {
  carregarPerguntas();
  carregarFAQ();
  configurarFiltros();
});
