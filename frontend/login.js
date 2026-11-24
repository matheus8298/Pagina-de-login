const formLogin = document.getElementById('formLogin');

formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-senha').value;

    try {
        // Bate na rota de login do back-end
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const data = await response.json();

        if (response.ok) {
            // SALVA O TOKEN NO NAVEGADOR (localStorage)
            localStorage.setItem('token', data.token);
            localStorage.setItem('emailLogado', email);
            
            alert('Login realizado com sucesso!');
            
            // Redireciona para a página do sistema
            window.location.href = 'dashboard.html';
            
        } else {
            // Senha errada ou usuário não existe
            alert(data.message || 'Credenciais inválidas.');
        }

    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao conectar com o servidor.');
    }
});