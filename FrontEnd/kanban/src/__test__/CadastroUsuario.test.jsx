import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CadastroUsuario from "../pages/CadastroUsuario";
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

describe("CadastroUsuario", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axios.post.mockResolvedValue({});
    axios.get.mockResolvedValue({ data: [] });
  });

  it("Renderiza campos de nome, email e botão", async () => {
    render(<CadastroUsuario />);
    expect(await screen.findByLabelText(/nome/i)).toBeInTheDocument();
    expect(await screen.findByLabelText(/email/i)).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: /cadastrar/i })).toBeInTheDocument();
  });

  it("Exibe erros de validação com campos vazios", async () => {
    render(<CadastroUsuario />);
    const botao = await screen.findByRole("button", { name: /cadastrar/i });
    await userEvent.click(botao);

    expect(await screen.findByText(/mínimo de 3 caracteres/i)).toBeInTheDocument();
    expect(await screen.findByText(/email muito curto/i)).toBeInTheDocument();
  });

  it("Valida nome com espaços indevidos e múltiplos espaços", async () => {
    render(<CadastroUsuario />);
    await userEvent.type(screen.getByLabelText(/nome/i), " João  da  Silva ");
    await userEvent.type(screen.getByLabelText(/email/i), "joao@email.com");

    const botao = await screen.findByRole("button", { name: /cadastrar/i });
    await userEvent.click(botao);

    expect(await screen.findByText(/não pode começar ou terminar com espaço/i)).toBeInTheDocument();
    expect(await screen.findByText(/não pode conter múltiplos espaços consecutivos/i)).toBeInTheDocument();
  });

  it("Valida email inválido", async () => {
    render(<CadastroUsuario />);
    await userEvent.type(screen.getByLabelText(/nome/i), "João");
    await userEvent.type(screen.getByLabelText(/email/i), "joao@");

    const botao = await screen.findByRole("button", { name: /cadastrar/i });
    await userEvent.click(botao);

    expect(await screen.findByText(/email inválido/i)).toBeInTheDocument();
  });

  it("Envia dados com sucesso e exibe alerta", async () => {
    render(<CadastroUsuario />);
    await userEvent.type(screen.getByLabelText(/nome/i), "João da Silva");
    await userEvent.type(screen.getByLabelText(/email/i), "joao@email.com");

    const botao = await screen.findByRole("button", { name: /cadastrar/i });
    await userEvent.click(botao);

    expect(axios.post).toHaveBeenCalledWith("http://127.0.0.1:3000/users", {
      nome: "João da Silva",
      email: "joao@email.com",
    });
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
      title: "Cadastro concluído com sucesso!",
      icon: "success",
    }));
  });

  it("Exibe erro do backend ao falhar envio", async () => {
    axios.post.mockRejectedValueOnce({
      response: {
        data: { error: "Email já cadastrado" },
      },
    });

    render(<CadastroUsuario />);
    await userEvent.type(screen.getByLabelText(/nome/i), "João da Silva");
    await userEvent.type(screen.getByLabelText(/email/i), "joao@email.com");

    const botao = await screen.findByRole("button", { name: /cadastrar/i });
    await userEvent.click(botao);

    expect(await screen.findByText(/email já cadastrado/i)).toBeInTheDocument();
  });

  it("Exibe erro genérico se backend não retornar mensagem", async () => {
    axios.post.mockRejectedValueOnce({});

    render(<CadastroUsuario />);
    await userEvent.type(screen.getByLabelText(/nome/i), "João da Silva");
    await userEvent.type(screen.getByLabelText(/email/i), "joao@email.com");

    const botao = await screen.findByRole("button", { name: /cadastrar/i });
    await userEvent.click(botao);

    expect(await screen.findByText(/ocorreu um erro ao cadastrar o usuário/i)).toBeInTheDocument();
  });
});
