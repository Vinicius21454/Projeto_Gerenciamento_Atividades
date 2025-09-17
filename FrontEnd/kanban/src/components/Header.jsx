import "../styles/Header.scss"

export default function header(){
    return(
        <header>
            <div className="titlle">
                <h1 className="tittle-h1">Gerenciamento de Tarefas</h1>
            </div>
            <nav>
                <ul className="ul-list">
                    <li><a href="cadusuario" className="link-header" >Cadastro de Usuário</a> </li>
                    <li><a href="cadtarefas" className="link-header" >Cadastro de Tarefas</a> </li>
                    <li><a href="gerenciamento_tarefas" className="link-header" >Gerenciamento de Tarefas</a> </li>
                </ul>
            </nav>
        </header>
    )

}