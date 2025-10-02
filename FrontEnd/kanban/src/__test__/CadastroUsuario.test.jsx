import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CadastroUsuario } from '../pages/CadastroUsuario';
import { describe, it, expect } from "vitest";

describe("Cadastro de Usuário", ()=>{
    it("Renderiza os campos necessarios", ()=>{
        render(<CadastroUsuario/>);
        const nomeInput = screen.getByLabelText(/Nome/);
        const emailInput = screen.getByLabelText(/Email/);
        const botao = screen.getByRole("button", {name: /Cadastar/i});

        expect(nomeInput).toBeTruthy();
        expect(emailInput).toBeTruthy();
        expect(botao).toBeTruthy();

    });

    it("Exibe erros de válidação ao colocar dados inválidos", async () =>{
        render (<CadastroUsuario/>);

        fireEvent,click(screen.getByText(/Minimo de 3 caracteres/i)).toBeInTheDocumnet();
    })
})