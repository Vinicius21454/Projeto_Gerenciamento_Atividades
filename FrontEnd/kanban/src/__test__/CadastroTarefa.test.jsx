import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CadastroTarefas from "../pages/CadastroTarefas";
import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import Swal from "sweetalert2";

// Mocks
vi.mock("axios");
vi.mock("sweetalert2", () => ({
  __esModule: true,
  default: {
    fire: vi.fn(),
  },
}));

describe("CadastroTarefas", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockResolvedValue({ data: [{ id: 1, nome: "Usuário 1" }] });
    axios.post.mockResolvedValue({});
  });

  it("Renderiza todos os campos e botão de envio", async () => {
    render(<CadastroTarefas />);

    await waitFor(() => {
      expect(screen.getByText("Usuário 1")).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/setor/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/usuário/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/prioridade/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cadastrar/i })).toBeInTheDocument();
  });

  // it("Exibe erros de validação com campos vazios ou inválidos", async () => {
  //   render(<CadastroTarefas />);
  //   await userEvent.click(screen.getByRole("button", { name: /cadastrar/i }));

  //   await waitFor(() => {
  //     expect(screen.getByText(/mínimo 5 caracteres/i)).toBeInTheDocument();
  //     expect(screen.getByText(/ao menos 2 caracteres/i)).toBeInTheDocument();
  //     expect(screen.getByText(/escolha um usuário/i)).toBeInTheDocument();
  //     expect(screen.getByText(/alta, média ou baixa/i)).toBeInTheDocument();
  //   });
  // });

  // it("Valida campos com apenas espaços", async () => {
  //   render(<CadastroTarefas />);
  //   await userEvent.type(screen.getByLabelText(/descrição/i), "     ");
  //   await userEvent.type(screen.getByLabelText(/setor/i), " ");
  //   await userEvent.selectOptions(screen.getByLabelText(/usuário/i), "");
  //   await userEvent.selectOptions(screen.getByLabelText(/prioridade/i), "");

  //   await userEvent.click(screen.getByRole("button", { name: /cadastrar/i }));

  //   await waitFor(() => {
  //     expect(screen.getByText(/não pode conter apenas espaços/i)).toBeInTheDocument();
  //   });
  // });

  // it("Valida campo setor com espaços no meio", async () => {
  //   render(<CadastroTarefas />);
  //   await userEvent.type(screen.getByLabelText(/descrição/i), "Descrição válida");
  //   await userEvent.type(screen.getByLabelText(/setor/i), "Set or");
  //   await userEvent.selectOptions(screen.getByLabelText(/usuário/i), "1");
  //   await userEvent.selectOptions(screen.getByLabelText(/prioridade/i), "Alta");

  //   await userEvent.click(screen.getByRole("button", { name: /cadastrar/i }));

  //   await waitFor(() => {
  //     expect(screen.getByText(/setor não pode conter espaços/i)).toBeInTheDocument();
  //   });
  // });

  // it("Envia tarefa com sucesso e reseta formulário", async () => {
  //   render(<CadastroTarefas />);
  //   await userEvent.type(screen.getByLabelText(/descrição/i), "Descrição válida");
  //   await userEvent.type(screen.getByLabelText(/setor/i), "SetorValido");
  //   await userEvent.selectOptions(screen.getByLabelText(/usuário/i), "1");
  //   await userEvent.selectOptions(screen.getByLabelText(/prioridade/i), "Alta");

  //   await userEvent.click(screen.getByRole("button", { name: /cadastrar/i }));

  //   await waitFor(() => {
  //     expect(axios.post).toHaveBeenCalledWith("http://127.0.0.1:3000/tasks", {
  //       descricao: "Descrição válida",
  //       setor: "SetorValido",
  //       usuario: "1",
  //       prioridade: "Alta",
  //     });
  //     expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
  //       title: "Tarefa criada com sucesso!",
  //       icon: "success",
  //     }));
  //   });

  //   expect(screen.getByRole("button", { name: /cadastrar/i })).not.toBeDisabled();
  // });

  // it("Exibe alerta de erro ao falhar envio", async () => {
  //   axios.post.mockRejectedValueOnce(new Error("Erro"));

  //   render(<CadastroTarefas />);
  //   await userEvent.type(screen.getByLabelText(/descrição/i), "Descrição válida");
  //   await userEvent.type(screen.getByLabelText(/setor/i), "SetorValido");
  //   await userEvent.selectOptions(screen.getByLabelText(/usuário/i), "1");
  //   await userEvent.selectOptions(screen.getByLabelText(/prioridade/i), "Alta");

  //   await userEvent.click(screen.getByRole("button", { name: /cadastrar/i }));

  //   await waitFor(() => {
  //     expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
  //       title: "Erro ao criar tarefa",
  //       icon: "error",
  //     }));
  //   });
  // });

  // it("Carrega usuários ao montar o componente", async () => {
  //   const usuariosMock = [
  //     { id: 1, nome: "Usuário A" },
  //     { id: 2, nome: "Usuário B" },
  //   ];
  //   axios.get.mockResolvedValueOnce({ data: usuariosMock });

  //   render(<CadastroTarefas />);

  //   await Promise.all(
  //     usuariosMock.map(async (usuario) => {
  //       expect(await screen.findByText(usuario.nome)).toBeInTheDocument();
  //     })
  //   );
  // });
});
