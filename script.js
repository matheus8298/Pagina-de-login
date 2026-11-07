const inputCpf = document.getElementById('cpf');
const cpfError = document.getElementById('cpf-error');

inputCpf.addEventListener('input', function(e) {
    let valor = e.target.value.replace(/\D/g, "");
    
    if (valor.length > 3) valor = valor.replace(/^(\d{3})(\d)/, "$1.$2");
    if (valor.length > 6) valor = valor.replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3");
    if (valor.length > 9) valor = valor.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
    
    e.target.value = valor;
});

function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    
    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
    let resto = 11 - (soma % 11);
    let digito1 = (resto === 10 || resto === 11) ? 0 : resto;
    if (digito1 !== parseInt(cpf.charAt(9))) return false;
    
    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
    resto = 11 - (soma % 11);
    let digito2 = (resto === 10 || resto === 11) ? 0 : resto;
    if (digito2 !== parseInt(cpf.charAt(10))) return false;
    
    return true;
}

inputCpf.addEventListener('blur', function() {
    const valor = inputCpf.value;
    
    if (valor.length === 14) {
        if (validarCPF(valor)) {
            cpfError.style.display = 'none';
            inputCpf.setCustomValidity("");
        } else {
            cpfError.style.display = 'block';
            inputCpf.setCustomValidity("CPF Inválido");
        }
    } else if (valor.length > 0) {
        cpfError.style.display = 'block';
        inputCpf.setCustomValidity("CPF incompleto");
    } else {
        cpfError.style.display = 'none';
        inputCpf.setCustomValidity("");
    }
});

const inputSenha = document.getElementById('senha');
const inputConfirmarSenha = document.getElementById('confirmarSenha');
const senhaError = document.getElementById('senha-error');

function validarSenhas() {
    if (inputSenha.value && inputConfirmarSenha.value) {
        if (inputSenha.value === inputConfirmarSenha.value) {
            senhaError.style.display = 'none';
            inputConfirmarSenha.setCustomValidity(""); 
        } else {
            senhaError.style.display = 'block';
            inputConfirmarSenha.setCustomValidity("As senhas não coincidem"); 
        }
    } else {
        senhaError.style.display = 'none';
        inputConfirmarSenha.setCustomValidity("");
    }
}


inputConfirmarSenha.addEventListener('input', validarSenhas);


inputSenha.addEventListener('input', validarSenhas);