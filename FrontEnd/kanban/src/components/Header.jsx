import "../styles/Header.scss"

export default function Header() {
    return (
        <header role="banner" aria-label="Cabeçalho principal">
            <div className="title">
                <h1 className="title-h1">Gerenciamento de Tarefas</h1>
            </div>
            <nav role="navigation" aria-label="Menu de navegação principal">
                <ul className="ul-list">
                    <li>
                        <a href="cadusuario" className="link-header">
                            Cadastro de Usuário
                        </a>
                    </li>
                    <li>
                        <a href="cadtarefas" className="link-header">
                            Cadastro de Tarefas
                        </a>
                    </li>
                    <li>
                        <a href="gerenciamento_tarefas" className="link-header">
                            Gerenciamento de Tarefas
                        </a>
                    </li>
                </ul>
            </nav>
        </header>
    );
}
