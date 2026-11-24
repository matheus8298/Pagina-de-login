// Pega o token salvo no login
const token = localStorage.getItem('token');

// Se não tiver token, o usuário nem deveria estar aqui. Manda de volta pro login.
if (!token) {
    alert('Você precisa fazer login para acessar esta página.');
    window.location.href = 'login.html';
}

const tabelaUsuarios = document.getElementById('tabela-usuarios');
const btnSair = document.getElementById('btn-sair');

// Função para buscar os usuários na API
async function carregarUsuarios() {
    try {
        const response = await fetch('http://localhost:3000/api/users', {
            method: 'GET',
            headers: {
                // Envia o token no cabeçalho de autorização
                'Authorization': `Bearer ${token}` 
            }
        });

        // Se o token expirou ou é inválido, a API retorna 401
        if (response.status === 401) {
            localStorage.removeItem('token');
            alert('Sessão expirada. Faça login novamente.');
            window.location.href = 'login.html';
            return;
        }

        const usuarios = await response.json();
        
        // Limpa a tabela antes de preencher
        tabelaUsuarios.innerHTML = '';
        
        // Para cada usuário, cria uma linha na tabela
        usuarios.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.id}</td>
                <td>${user.nome}</td>
                <td>${user.email}</td>
                <td>${user.cpf}</td>
                <td>
                    <button class="btn-deletar" onclick="deletarUsuario(${user.id}, '${user.nome}')">
                        <i class='bx bx-trash'></i> Remover
                    </button>
                </td>
            `;
            tabelaUsuarios.appendChild(tr);
        });

    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        alert('Erro ao conectar com o servidor.');
    }
}

// Função para deletar o usuário
async function deletarUsuario(id, nome) {
    // Confirmação para não deletar por acidente
    const confirmacao = confirm(`Tem certeza que deseja remover o usuário ${nome}?`);
    
    if (!confirmacao) return; // Se cancelar, para por aqui

    try {
        const response = await fetch(`http://localhost:3000/api/users/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            alert('Usuário removido com sucesso!');
            carregarUsuarios(); // Recarrega a tabela para atualizar a lista
        } else {
            const data = await response.json();
            alert(data.message || 'Erro ao remover usuário.');
        }
    } catch (error) {
        console.error('Erro ao deletar:', error);
        alert('Erro ao conectar com o servidor.');
    }
}

// Lógica do botão Sair
btnSair.addEventListener('click', () => {
    localStorage.removeItem('token'); // Apaga o crachá
    localStorage.removeItem('emailLogado');
    window.location.href = 'login.html'; // Volta pro login
});

// Quando a página carregar, chama a função para buscar os dados
carregarUsuarios();