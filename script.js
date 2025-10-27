// Dados simulados para armazenamento local
let volunteers = JSON.parse(localStorage.getItem('volunteers')) || [];
let projectSignups = JSON.parse(localStorage.getItem('projectSignups')) || [];

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Animação dos números nas estatísticas
    animateStats();
    
    // Configurar formulários
    setupForms();
    
    // Configurar filtros de projetos
    setupProjectFilters();
    
    // Configurar modal de projetos
    setupProjectModal();
    
    // Configurar navegação suave
    setupSmoothScroll();
}

// Animação das estatísticas
function animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const target = parseInt(element.getAttribute('data-target'));
                animateNumber(element, target);
                observer.unobserve(element);
            }
        });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(stat => {
        if (stat.hasAttribute('data-target')) {
            observer.observe(stat);
        }
    });
}

function animateNumber(element, target) {
    let current = 0;
    const increment = target / 100;
    const duration = 2000; // 2 segundos
    const step = duration / 100;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current).toLocaleString('pt-BR');
    }, step);
}

// Configuração dos formulários
function setupForms() {
    // Formulário de cadastro de voluntários
    const volunteerForm = document.getElementById('volunteerForm');
    if (volunteerForm) {
        volunteerForm.addEventListener('submit', handleVolunteerSubmit);
    }
    
    // Formulário de inscrição em projetos
    const projectForm = document.getElementById('projectSignupForm');
    if (projectForm) {
        projectForm.addEventListener('submit', handleProjectSignup);
    }
    
    // Máscaras para telefone
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', formatPhone);
    });
}

function handleVolunteerSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const volunteerData = {
        id: Date.now(),
        nome: formData.get('nome'),
        email: formData.get('email'),
        telefone: formData.get('telefone'),
        idade: formData.get('idade'),
        cidade: formData.get('cidade'),
        disponibilidade: formData.get('disponibilidade'),
        interesses: formData.getAll('interesses'),
        experiencia: formData.get('experiencia'),
        motivacao: formData.get('motivacao'),
        dataCadastro: new Date().toLocaleDateString('pt-BR'),
        status: 'ativo',
        dataUltimaAtualizacao: new Date().toISOString()
    };
    
    // Validar campos obrigatórios
    if (!validateVolunteerData(volunteerData)) {
        return;
    }
    
    // Salvar dados
    volunteers.push(volunteerData);
    localStorage.setItem('volunteers', JSON.stringify(volunteers));
    
    // Log da atividade para sistema administrativo
    logActivity(`Novo voluntário cadastrado: ${volunteerData.nome} (${volunteerData.email})`, 'success');
    
    // Mostrar mensagem de sucesso
    showSuccessMessage('Cadastro realizado com sucesso! Em breve entraremos em contato.');
    
    // Limpar formulário
    event.target.reset();
    
    // Log para desenvolvimento
    console.log('Novo voluntário cadastrado:', volunteerData);
}

function validateVolunteerData(data) {
    if (!data.nome || !data.email || !data.telefone || !data.cidade || !data.disponibilidade || !data.motivacao) {
        showErrorMessage('Por favor, preencha todos os campos obrigatórios.');
        return false;
    }
    
    if (data.interesses.length === 0) {
        showErrorMessage('Selecione pelo menos uma área de interesse.');
        return false;
    }
    
    if (!isValidEmail(data.email)) {
        showErrorMessage('Por favor, insira um e-mail válido.');
        return false;
    }
    
    // Verificar se o e-mail já existe
    if (volunteers.some(v => v.email === data.email)) {
        showErrorMessage('Este e-mail já está cadastrado.');
        return false;
    }
    
    return true;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function formatPhone(event) {
    let value = event.target.value.replace(/\D/g, '');
    
    if (value.length <= 11) {
        if (value.length <= 2) {
            value = value.replace(/(\d{0,2})/, '($1');
        } else if (value.length <= 7) {
            value = value.replace(/(\d{2})(\d{0,5})/, '($1) $2');
        } else {
            value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
        }
    }
    
    event.target.value = value;
}

// Configuração dos filtros de projetos
function setupProjectFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remover classe active de todos os botões
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Adicionar classe active ao botão clicado
            button.classList.add('active');
            
            // Obter categoria do filtro
            const filter = button.getAttribute('data-filter');
            
            // Filtrar projetos
            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                if (filter === 'all' || category === filter) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeInUp 0.5s ease';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// Configuração do modal de projetos
function setupProjectModal() {
    const modal = document.getElementById('projectModal');
    const joinButtons = document.querySelectorAll('.project-join');
    const closeButton = document.querySelector('.close');
    
    if (!modal) return;
    
    joinButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const projectId = button.getAttribute('data-project');
            const projectCard = button.closest('.project-card');
            const projectName = projectCard.querySelector('h3').textContent;
            
            document.getElementById('selectedProject').value = projectId;
            modal.querySelector('h2').textContent = `Inscrever-se em: ${projectName}`;
            modal.style.display = 'block';
        });
    });
    
    closeButton.addEventListener('click', closeModal);
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
}

function closeModal() {
    const modal = document.getElementById('projectModal');
    if (modal) {
        modal.style.display = 'none';
        document.getElementById('projectSignupForm').reset();
    }
}

function handleProjectSignup(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const signupData = {
        id: Date.now(),
        project: formData.get('project'),
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        availability: formData.get('availability'),
        signupDate: new Date().toLocaleDateString('pt-BR'),
        status: 'pendente',
        dataInscricao: new Date().toISOString()
    };
    
    // Validar dados
    if (!signupData.name || !signupData.email || !signupData.phone || !signupData.availability) {
        showErrorMessage('Por favor, preencha todos os campos.');
        return;
    }
    
    if (!isValidEmail(signupData.email)) {
        showErrorMessage('Por favor, insira um e-mail válido.');
        return;
    }
    
    // Salvar inscrição
    projectSignups.push(signupData);
    localStorage.setItem('projectSignups', JSON.stringify(projectSignups));
    
    // Log da atividade para sistema administrativo
    const projectNames = {
        'alimenta': 'Alimenta Solidário',
        'vestir': 'Vestir Esperança',
        'acessivel': 'Caminhos Acessíveis',
        'cesta': 'Cesta Básica Solidária',
        'educacao': 'Saber Compartilhado',
        'saude': 'Saúde Para Todos'
    };
    
    logActivity(`Nova inscrição no projeto "${projectNames[signupData.project] || signupData.project}": ${signupData.name} (${signupData.email})`, 'success');
    
    // Mostrar mensagem de sucesso
    showSuccessMessage('Inscrição realizada com sucesso! Entraremos em contato em breve.');
    
    // Fechar modal
    closeModal();
    
    // Log para desenvolvimento
    console.log('Nova inscrição em projeto:', signupData);
}

// Configuração da navegação suave
function setupSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Função para rolar para os projetos
function scrollToProjects() {
    const projectsSection = document.querySelector('.projects-container');
    if (projectsSection) {
        projectsSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Funções de mensagens
function showSuccessMessage(message) {
    showMessage(message, 'success');
}

function showErrorMessage(message) {
    showMessage(message, 'error');
}

function showMessage(message, type) {
    // Remover mensagem anterior se existir
    const existingMessage = document.querySelector('.message-toast');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Criar elemento da mensagem
    const messageEl = document.createElement('div');
    messageEl.className = `message-toast message-${type}`;
    messageEl.textContent = message;
    
    // Estilos da mensagem
    messageEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 9999;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
        ${type === 'success' ? 'background: #28a745;' : 'background: #dc3545;'}
    `;
    
    // Adicionar ao documento
    document.body.appendChild(messageEl);
    
    // Remover após 5 segundos
    setTimeout(() => {
        messageEl.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.remove();
            }
        }, 300);
    }, 5000);
}

// Funções utilitárias para desenvolvimento/administração
function getVolunteers() {
    return JSON.parse(localStorage.getItem('volunteers')) || [];
}

function getProjectSignups() {
    return JSON.parse(localStorage.getItem('projectSignups')) || [];
}

function clearAllData() {
    localStorage.removeItem('volunteers');
    localStorage.removeItem('projectSignups');
    volunteers = [];
    projectSignups = [];
    console.log('Todos os dados foram limpos.');
}

function exportData() {
    const data = {
        volunteers: getVolunteers(),
        projectSignups: getProjectSignups(),
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `voluntarios-dados-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Adicionar estilos para as animações das mensagens
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Função para log de atividades administrativas
function logActivity(action, type = 'info') {
    const activityLog = JSON.parse(localStorage.getItem('activityLog')) || [];
    const logEntry = {
        id: Date.now(),
        timestamp: new Date().toLocaleString('pt-BR'),
        user: 'Sistema Público',
        action: action,
        type: type,
        source: 'frontend'
    };
    
    activityLog.unshift(logEntry);
    
    // Manter apenas os últimos 100 logs
    if (activityLog.length > 100) {
        activityLog.slice(0, 100);
    }
    
    localStorage.setItem('activityLog', JSON.stringify(activityLog));
}

// Disponibilizar funções globalmente para uso no console (desenvolvimento)
window.volunteerUtils = {
    getVolunteers,
    getProjectSignups,
    clearAllData,
    exportData,
    showSuccessMessage,
    showErrorMessage,
    logActivity,
    // Função especial para acesso ao painel administrativo
    openAdminPanel: function() {
        window.open('admin.html', '_blank', 'width=1200,height=800');
    }
};

// Log inicial para desenvolvimento
console.log('Sistema de Voluntários carregado!');
console.log('Use volunteerUtils no console para acessar funções de desenvolvimento.');
console.log('Use volunteerUtils.openAdminPanel() para abrir o painel administrativo.');
