import { BrowserRouter , Route, Routes} from "react-router-dom";
import CadastroUsuario from './pages/cadastroUsuario';
import CadastroTarefas from "./pages/CadastroTarefas";
import GerenciamentoTarefas from "./pages/GerenciamentoTarefas";
import Header from "./components/Header";
import Layout from './components/Layout';
import './App.css';

function App() {


  return (
      <BrowserRouter>
        <Routes>
              <Route path='/' element={<Layout/>}>
                <Route path="cadusuario" index element={<CadastroUsuario/>}/>
                <Route path="cadtarefas" element={<CadastroTarefas/>}/>
                <Route path="gerenciamento_tarefas" element={<GerenciamentoTarefas/>}/>
              </Route>
        </Routes>
      </BrowserRouter>    
  )
}

export default App
