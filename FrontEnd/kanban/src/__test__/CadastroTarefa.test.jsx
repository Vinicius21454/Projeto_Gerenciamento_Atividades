import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CadastroTarefas from "../pages/CadastroTarefas";
import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import Swal from "sweetalert2";

// Faz mock do axios para controlar as requisições HTTP nos testes
vi.mock("axios");

// Mock do Swal.fire para não abrir popups reais nos testes
vi.mock("sweetalert2", () => ({
  fire: vi.fn(),
}));

describe("CadastroTarefas", () => {
  // Limpa mocks antes de cada teste
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Testa se os campos e botão são renderizados corretamente
  it("Renderiza todos os campos e botão de envio", async () => {
    // Mocka o GET dos usuários para popular o select
    axios.get.mockResolvedValueOnce({
      data: [
        { id: 1, nome: "Usuário 1" },
        { id: 2, nome: "Usuário 2" },
      ],
    });

    render(<CadastroTarefas />);

    // Espera os usuários serem carregados e exibidos no select
    await waitFor(() => {
      expect(screen.getByText("Usuário 1")).toBeInTheDocument();
      expect(screen.getByText("Usuário 2")).toBeInTheDocument();
    });

    // Checa os inputs e selects
    expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/setor/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/usuário/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/prioridade/i)).toBeInTheDocument();

    // Checa o botão
    const botao = screen.getByRole("button", { name: /cadastrar/i });
    expect(botao).toBeInTheDocument();
    expect(botao).not.toBeDisabled();
  });

  // Testa validação dos campos - campos vazios ou inválidos devem exibir erros
  it("Exibe erros de validação quando dados inválidos são inseridos", async () => {
    axios.get.mockResolvedValueOnce({ data: [] }); // Mock do GET vazio para select

    render(<CadastroTarefas />);

    // Tenta enviar o formulário sem preencher nada
    fireEvent.click(screen.getByRole("button", { name: /cadastrar/i }));

    // Espera aparecer mensagens de erro para todos os campos obrigatórios
    await waitFor(() => {
      expect(screen.getByText(/a descrição deve conter no mínimo 5 caracteres/i)).toBeInTheDocument();
      expect(screen.getByText(/o setor deve conter ao menos 2 caracteres/i)).toBeInTheDocument();
      expect(screen.getByText(/escolha um usuário/i)).toBeInTheDocument();
      expect(screen.getByText(/a prioridade deve ser alta, média ou baixa/i)).toBeInTheDocument();
    });

    // Preenche descrição com espaços apenas para testar refinamento
    fireEvent.change(screen.getByLabelText(/descrição/i), { target: { value: "     " } });
    fireEvent.change(screen.getByLabelText(/setor/i), { target: { value: " " } });
    fireEvent.change(screen.getByLabelText(/usuario/i), { target: { value: "" } });
    fireEvent.change(screen.getByLabelText(/prioridade/i), { target: { value: "" } });

    fireEvent.click(screen.getByRole("button", { name: /cadastrar/i }));

    // Espera erros específicos para espaços em branco e seleção vazia
    await waitFor(() => {
      expect(screen.getByText(/a descrição não pode conter apenas espaços/i)).toBeInTheDocument();
      expect(screen.getByText(/o setor não pode conter apenas espaços/i)).toBeInTheDocument();
      expect(screen.getByText(/escolha um usuário/i)).toBeInTheDocument();
      expect(screen.getByText(/a prioridade deve ser alta, média ou baixa/i)).toBeInTheDocument();
    });
  });

  // Testa que o setor não pode conter espaços (validação específica)
  it("Não permite espaços no campo setor", async () => {
    axios.get.mockResolvedValueOnce({ data: [{ id: 1, nome: "Usuário 1" }] });

    render(<CadastroTarefas />);

    fireEvent.change(screen.getByLabelText(/descricao/i), { target: { value: "Descrição válida" } });
    fireEvent.change(screen.getByLabelText(/setor/i), { target: { value: "Set or" } }); // com espaço
    fireEvent.change(screen.getByLabelText(/usuario/i), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText(/prioridade/i), { target: { value: "Alta" } });

    fireEvent.click(screen.getByRole("button", { name: /cadastrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/o setor não pode conter espaços/i)).toBeInTheDocument();
    });
  });

  // Testa envio de tarefa com sucesso e comportamento do botão (disabled e texto)
  it("Envia tarefa com sucesso e reseta formulário", async () => {
    axios.get.mockResolvedValueOnce({ data: [{ id: 1, nome: "Usuário 1" }] });
    axios.post.mockResolvedValueOnce({}); // mock post sucesso

    render(<CadastroTarefas />);

    // Preenche o formulário com dados válidos
    fireEvent.change(screen.getByLabelText(/descricao/i), { target: { value: "Descrição válida" } });
    fireEvent.change(screen.getByLabelText(/setor/i), { target: { value: "SetorValido" } });
    fireEvent.change(screen.getByLabelText(/usuario/i), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText(/prioridade/i), { target: { value: "Alta" } });

    // Clica no botão
    fireEvent.click(screen.getByRole("button", { name: /cadastrar/i }));

    // O botão deve ficar desabilitado e mostrar "Enviando..."
    expect(screen.getByRole("button")).toHaveAttribute("disabled");
    expect(screen.getByRole("button")).toHaveTextContent(/enviando.../i);

    // Aguarda o envio e a exibição do popup de sucesso
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith("http://127.0.0.1:3000/tasks", {
        descricao: "Descrição válida",
        setor: "SetorValido",
        usuario: "1",
        prioridade: "Alta",
      });
      expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
        title: "Tarefa criada com sucesso!",
        icon: "success",
      }));
    });

    // Depois do envio, o botão volta a ficar habilitado e texto volta a "Cadastrar"
    expect(screen.getByRole("button")).not.toHaveAttribute("disabled");
    expect(screen.getByRole("button")).toHaveTextContent(/cadastrar/i);
  });

  // Testa erro no envio da tarefa e exibição do alerta de erro
  it("Exibe alerta de erro quando falha no envio", async () => {
    axios.get.mockResolvedValueOnce({ data: [{ id: 1, nome: "Usuário 1" }] });
    axios.post.mockRejectedValueOnce(new Error("Erro na requisição"));

    render(<CadastroTarefas />);

    fireEvent.change(screen.getByLabelText(/descricao/i), { target: { value: "Descrição válida" } });
    fireEvent.change(screen.getByLabelText(/setor/i), { target: { value: "SetorValido" } });
    fireEvent.change(screen.getByLabelText(/usuario/i), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText(/prioridade/i), { target: { value: "Alta" } });

    fireEvent.click(screen.getByRole("button", { name: /cadastrar/i }));

    // Espera o Swal.fire com mensagem de erro ser chamado
    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
        title: "Erro ao criar tarefa",
        icon: "error",
      }));
    });

    // O botão deve voltar ao estado habilitado
    expect(screen.getByRole("button")).not.toHaveAttribute("disabled");
  });

  // Testa se a função viewUsers é chamada no useEffect e os usuários aparecem no select
  it("Carrega usuários ao montar o componente", async () => {
    const usuariosMock = [
      { id: 1, nome: "Usuário A" },
      { id: 2, nome: "Usuário B" },
    ];

    axios.get.mockResolvedValueOnce({ data: usuariosMock });

    render(<CadastroTarefas />);

    // Espera que os usuários apareçam no select
    for (const usuario of usuariosMock) {
      await waitFor(() => {
        expect(screen.getByText(usuario.nome)).toBeInTheDocument();
      });
    }
  });
});
