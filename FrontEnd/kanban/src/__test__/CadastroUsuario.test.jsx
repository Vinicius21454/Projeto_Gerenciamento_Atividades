import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CadastroUsuario } from '../pages/CadastroUsuario';
import { describe, it, expect, vi } from "vitest";
import axios from "axios";
import Swal from "sweetalert2";

// Faz o mock das dependências externas axios e sweetalert2 para controle nos testes
vi.mock("axios");
vi.mock("sweetalert2", () => ({
  fire: vi.fn(),
}));

describe("Cadastro de Usuário", () => {

  // Testa se os campos do formulário aparecem na tela corretamente
  it("Renderiza os campos necessários", () => {
    render(<CadastroUsuario />);
    
    // Busca os inputs pelos labels, usando case-insensitive (i)
    const nomeInput = screen.getByLabelText(/nome/i);
    const emailInput = screen.getByLabelText(/email/i);
    
    // Busca o botão pelo texto
    const botao = screen.getByRole("button", { name: /cadastrar/i });

    // Verifica se os elementos existem na renderização
    expect(nomeInput).toBeTruthy();
    expect(emailInput).toBeTruthy();
    expect(botao).toBeTruthy();
  });

  // Testa se erros de validação aparecem quando dados inválidos são enviados
  it("Exibe erros de validação ao tentar enviar dados inválidos", async () => {
    render(<CadastroUsuario />);

    // Clica no botão sem preencher nada para disparar erro de validação
    fireEvent.click(screen.getByRole("button", { name: /cadastrar/i }));

    // Aguarda a mensagem de erro aparecer para o nome com menos de 3 caracteres
    await waitFor(() => {
      expect(screen.getByText(/mínimo de 3 caracteres/i)).toBeInTheDocument();
    });

    // Preenche nome com múltiplos espaços consecutivos (inválido)
    fireEvent.change(screen.getByLabelText(/nome/i), { target: { value: "João  Silva" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "email@valido.com" } });

    fireEvent.click(screen.getByRole("button", { name: /cadastrar/i }));

    // Verifica se a mensagem de múltiplos espaços aparece
    await waitFor(() => {
      expect(screen.getByText(/não pode conter múltiplos espaços consecutivos/i)).toBeInTheDocument();
    });

    // Preenche email inválido para disparar erro na validação do email
    fireEvent.change(screen.getByLabelText(/nome/i), { target: { value: "João Silva" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "email-invalido" } });

    fireEvent.click(screen.getByRole("button", { name: /cadastrar/i }));

    // Verifica se o erro de email inválido aparece
    await waitFor(() => {
      expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
    });
  });

  // Testa o envio com dados válidos e a exibição do popup de sucesso
  it("Envia dados válidos e exibe mensagem de sucesso", async () => {
    // Mock da resposta bem sucedida do axios
    axios.post.mockResolvedValueOnce({ data: {} });

    render(<CadastroUsuario />);

    // Preenche os campos com dados válidos
    fireEvent.change(screen.getByLabelText(/nome/i), { target: { value: "João Silva" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "joao@email.com" } });

    fireEvent.click(screen.getByRole("button", { name: /cadastrar/i }));

    // Aguarda a chamada ao axios.post e ao Swal.fire
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith("http://127.0.0.1:3000/users", {
        nome: "João Silva",
        email: "joao@email.com",
      });
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Cadastro concluído com sucesso!",
          icon: "success",
        })
      );
    });
  });

  // Testa exibição de erro personalizado vindo do backend
  it("Exibe erro retornado pelo backend (mensagem string)", async () => {
    // Mock do axios rejeitando com erro específico do backend
    axios.post.mockRejectedValueOnce({
      response: {
        data: { error: "Email já cadastrado" }
      }
    });

    render(<CadastroUsuario />);

    // Preenche campos
    fireEvent.change(screen.getByLabelText(/nome/i), { target: { value: "Maria Oliveira" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "maria@email.com" } });

    fireEvent.click(screen.getByRole("button", { name: /cadastrar/i }));

    // Espera que o erro do backend seja exibido na tela
    await waitFor(() => {
      expect(screen.getByText("Email já cadastrado")).toBeInTheDocument();
    });
  });

  // Testa erro genérico caso o backend não retorne mensagem clara
  it("Exibe erro genérico quando backend não fornece mensagem clara", async () => {
    axios.post.mockRejectedValueOnce({}); // erro sem dados no response

    render(<CadastroUsuario />);

    fireEvent.change(screen.getByLabelText(/nome/i), { target: { value: "Pedro Lopes" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "pedro@email.com" } });

    fireEvent.click(screen.getByRole("button", { name: /cadastrar/i }));

    // Espera a mensagem genérica de erro
    await waitFor(() => {
      expect(screen.getByText(/ocorreu um erro ao cadastrar o usuário/i)).toBeInTheDocument();
    });
  });

  // Testa que não permite nome com espaço no início ou no fim
  it("Não permite nome começando ou terminando com espaço", async () => {
    render(<CadastroUsuario />);

    // Começando com espaço
    fireEvent.change(screen.getByLabelText(/nome/i), { target: { value: " João Silva" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "joao@email.com" } });

    fireEvent.click(screen.getByRole("button", { name: /cadastrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/não pode começar ou terminar com espaço/i)).toBeInTheDocument();
    });

    // Terminando com espaço
    fireEvent.change(screen.getByLabelText(/nome/i), { target: { value: "João Silva " } });

    fireEvent.click(screen.getByRole("button", { name: /cadastrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/não pode começar ou terminar com espaço/i)).toBeInTheDocument();
    });
  });

  // Testa que o nome não aceita números ou caracteres inválidos
  it("Não permite caracteres inválidos no nome", async () => {
    render(<CadastroUsuario />);

    fireEvent.change(screen.getByLabelText(/nome/i), { target: { value: "João123" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "joao@email.com" } });

    fireEvent.click(screen.getByRole("button", { name: /cadastrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/digite apenas letras e espaços simples entre nomes/i)).toBeInTheDocument();
    });
  });

});
