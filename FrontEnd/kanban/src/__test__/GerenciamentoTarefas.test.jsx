import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import GerenciamentoTarefas from "../pages/GerenciamentoTarefas"; // Ajuste o caminho conforme seu projeto
import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import Swal from "sweetalert2";

// Mockamos axios para controlar as requisições HTTP
vi.mock("axios");

// Mockamos Swal para controlar os pop-ups de alerta/confirmação
vi.mock("sweetalert2", () => ({
  fire: vi.fn(),
}));

describe("GerenciamentoTarefas", () => {
  // Dados mockados para usuários
  const mockUsers = [
    { id: 1, nome: "Usuário A" },
    { id: 2, nome: "Usuário B" },
  ];

  // Dados mockados para tarefas
  const mockTasks = [
    { id: 1, descricao: "Tarefa 1", setor: "Setor1", prioridade: "Alta", usuario: 1, status: "A Fazer" },
    { id: 2, descricao: "Tarefa 2", setor: "Setor2", prioridade: "Media", usuario: 2, status: "Fazendo" },
    { id: 3, descricao: "Tarefa 3", setor: "Setor3", prioridade: "Baixa", usuario: 1, status: "Pronto" },
  ];

  // Antes de cada teste, limpamos mocks e configuramos as respostas padrão do axios.get
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock para axios.get, retornando mockTasks ou mockUsers dependendo da URL
    axios.get.mockImplementation((url) => {
      if (url.endsWith("/tasks")) return Promise.resolve({ data: mockTasks });
      if (url.endsWith("/users")) return Promise.resolve({ data: mockUsers });
      return Promise.reject("URL não mockada");
    });
  });

  // Teste 1: Verifica se as colunas e tarefas são renderizadas corretamente
  it("Renderiza colunas e tarefas corretamente", async () => {
    render(<GerenciamentoTarefas />);

    // Espera até que as tarefas estejam no documento
    for (const task of mockTasks) {
      await waitFor(() => {
        expect(screen.getByText(task.descricao)).toBeInTheDocument();
      });
    }

    // Verifica o título e o número de tarefas em cada coluna
    expect(screen.getByText("A Fazer (1)")).toBeInTheDocument();
    expect(screen.getByText("Fazendo (1)")).toBeInTheDocument();
    expect(screen.getByText("Pronto (1)")).toBeInTheDocument();

    // Verifica se a tarefa com prioridade 'Alta' tem a classe css correta
    const tarefaAlta = screen.getByText("Alta");
    expect(tarefaAlta.classList.contains("alta")).toBe(true);
  });

  // Teste 2: Verifica se o modal abre com os dados da tarefa preenchidos para edição
  it("Abre modal de edição com dados preenchidos", async () => {
    render(<GerenciamentoTarefas />);
    // Aguarda renderização da tarefa
    await waitFor(() => screen.getByText("Tarefa 1"));

    // Clica no botão "Editar" da primeira tarefa
    const botaoEditar = screen.getAllByText("Editar")[0];
    fireEvent.click(botaoEditar);

    // Verifica se os campos do formulário foram preenchidos corretamente
    expect(screen.getByLabelText(/Descrição \*/i).value).toBe("Tarefa 1");
    expect(screen.getByLabelText(/Setor \*/i).value).toBe("Setor1");
    expect(screen.getByLabelText(/Prioridade \*/i).value).toBe("Alta");
    expect(screen.getByLabelText(/Responsável \*/i).value).toBe("1");
    expect(screen.getByLabelText(/Status \*/i).value).toBe("A Fazer");
  });

  // Teste 3: Valida o envio do formulário e a chamada do PATCH para atualizar a tarefa
  it("Valida edição e chama updateTask via axios.patch", async () => {
    // Spy no método patch para verificar se é chamado corretamente
    const patchMock = vi.spyOn(axios, "patch").mockResolvedValue({});

    render(<GerenciamentoTarefas />);
    await waitFor(() => screen.getByText("Tarefa 1"));

    // Abre o modal de edição
    fireEvent.click(screen.getAllByText("Editar")[0]);

    // Altera o campo descrição
    const descricaoInput = screen.getByLabelText(/Descrição \*/i);
    fireEvent.change(descricaoInput, { target: { value: "Tarefa 1 editada" } });

    // Clica no botão para salvar alterações
    fireEvent.click(screen.getByText("Salvar Alterações"));

    // Aguarda e verifica se axios.patch foi chamado com os dados corretos
    await waitFor(() => {
      expect(patchMock).toHaveBeenCalledWith(
        "http://127.0.0.1:3000/tasks/1",
        expect.objectContaining({
          descricao: "Tarefa 1 editada",
        })
      );
    });
  });

  // Teste 4: Testa a exclusão da tarefa após confirmação do usuário
  it("Exclui tarefa após confirmação", async () => {
    // Mock do Swal para simular confirmação do usuário
    Swal.fire.mockResolvedValue({ isConfirmed: true });

    // Spy no método delete para verificar se é chamado corretamente
    const deleteMock = vi.spyOn(axios, "delete").mockResolvedValue({});

    render(<GerenciamentoTarefas />);
    await waitFor(() => screen.getByText("Tarefa 1"));

    // Clica no botão "Excluir" da primeira tarefa
    fireEvent.click(screen.getAllByText("Excluir")[0]);

    // Verifica se o Swal de confirmação foi chamado com as opções corretas
    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Tem certeza?",
        })
      );
    });

    // Verifica se axios.delete foi chamado com a URL correta
    await waitFor(() => {
      expect(deleteMock).toHaveBeenCalledWith("http://127.0.0.1:3000/tasks/1");
    });

    // Verifica se Swal mostrou mensagem de sucesso após exclusão
    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith("Deletado!", "Tarefa deletada com sucesso.", "success");
    });
  });

  // Teste 5: Testa alteração direta do status da tarefa pelo select no card
  it("Altera status da tarefa pelo select no card", async () => {
    const patchMock = vi.spyOn(axios, "patch").mockResolvedValue({});

    render(<GerenciamentoTarefas />);
    await waitFor(() => screen.getByText("Tarefa 1"));

    // Pega todos os selects de status (um por card)
    const selects = screen.getAllByLabelText("Status:");
    const primeiroSelect = selects[0]; // Primeiro card (Tarefa 1)

    // Simula alteração para "Fazendo"
    fireEvent.change(primeiroSelect, { target: { value: "Fazendo" } });

    // Verifica se axios.patch foi chamado com a nova informação de status
    await waitFor(() => {
      expect(patchMock).toHaveBeenCalledWith("http://127.0.0.1:3000/tasks/1", { status: "Fazendo" });
    });
  });

  // Teste 6: Simula drag and drop para mudar o status da tarefa
  it("Drag and Drop - atualiza status ao soltar em coluna diferente", async () => {
    const patchMock = vi.spyOn(axios, "patch").mockResolvedValue({});

    render(<GerenciamentoTarefas />);
    await waitFor(() => screen.getByText("Tarefa 1"));

    // Seleciona o card da tarefa 1 e a coluna "Fazendo"
    const card = screen.getByText("Tarefa 1").closest(".card-tarefa");
    const colunaFazendo = screen.getByText("Fazendo (1)").closest(".coluna");

    // Simula o evento dragStart no card
    fireEvent.dragStart(card, {
      dataTransfer: {
        setData: vi.fn(),
        effectAllowed: "move",
      },
    });

    // Simula dragOver na coluna Fazendo (necessário para permitir drop)
    fireEvent.dragOver(colunaFazendo, {
      preventDefault: vi.fn(),
      dataTransfer: {
        dropEffect: "move",
      },
    });

    // Simula drop na coluna Fazendo, passando o id da tarefa no dataTransfer
    fireEvent.drop(colunaFazendo, {
      dataTransfer: {
        getData: () => "1", // id da tarefa
      },
      preventDefault: vi.fn(),
    });

    // Verifica se a função para atualizar a tarefa foi chamada com o novo status
    await waitFor(() => {
      expect(patchMock).toHaveBeenCalledWith("http://127.0.0.1:3000/tasks/1", { status: "Fazendo" });
    });
  });

  // Teste 7: Testa exibição de mensagem de erro ao falhar a busca das tarefas
  it("Exibe mensagem de erro ao falhar ao buscar tarefas", async () => {
    // Simula falha na requisição das tarefas
    axios.get.mockRejectedValueOnce(new Error("Erro no fetch"));

    // Mock para axios.get dos usuários continuar funcionando
    axios.get.mockImplementationOnce(() => Promise.resolve({ data: mockUsers }));

    render(<GerenciamentoTarefas />);

    // Espera que o alerta de erro seja exibido pelo Swal
    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith("Erro!", "Não foi possível carregar as tarefas", "error");
    });
  });
});
