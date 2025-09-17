import "../styles/CadUsuario.scss"
import axios from "axios"
import Swal from 'sweetalert2'
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";

export default function CadastroUsuario() {
  const [error, setError] = useState(false);

  const schema = z.object({
    nome: z.string()
      .min(3, { message: "Mínimo de 3 caracteres" })
      .max(50, { message: "Máximo de 50 caracteres" })
      .regex(/^[A-Za-zÀ-ÿ]+(?: [A-Za-zÀ-ÿ]+)*$/, {
        message: "Digite apenas letras e espaços simples entre nomes"
      })
      .refine(val => val.trim() === val, {
        message: "Não pode começar ou terminar com espaço"
      })
      .refine(val => !/\s{2,}/.test(val), {
        message: "Não pode conter múltiplos espaços consecutivos"
      }),

    email: z.string()
      .min(5, { message: "Email muito curto" })
      .max(100, { message: "Email muito longo" })
      .email({ message: "Email inválido" }),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const createUsers = async (data) => {
    try {
      const response = await axios.post("http://127.0.0.1:3000/users", data);
      console.log("Usuário criado com sucesso!!");
      Swal.fire({
        title: "Cadastro concluído com sucesso!",
        icon: "success",
        draggable: true,
        customClass: {
          popup: "meu-popup",
          title: "meu-titulo",
          content: "meu-conteudo",
          confirmButton: "meu-botao"
        }
      });
      setError(false);
    } catch (e) {
      if (e.response && e.response.data) {
        let backendError = e.response.data;

        if (typeof backendError === "string") {
          try {
            backendError = JSON.parse(backendError);
          } catch {
            // mantém string
          }
        }

        if (backendError.error) {
          setError(backendError.error);
        } else {
          setError("Ocorreu um erro ao cadastrar o usuário.");
        }
      } else {
        setError("Ocorreu um erro ao cadastrar o usuário.");
      }
    }
  }

  return (
    <section className="section-form">
      <div className="container-form">
        <h1 className="title-form">Cadastro de Usuário</h1>
        <form className="form" onSubmit={handleSubmit(createUsers)}>

          <div className="input">
            <label>Nome:</label>
            <input type="text" {...register("nome")} />
            {errors.nome && <span className="error">{errors.nome.message}</span>}
          </div>

          <div className="input">
            <label>Email:</label>
            <input type="text" {...register("email")} />
            {errors.email && <span className="error">{errors.email.message}</span>}
            {error && <span className="error">{error}</span>}
          </div>
          <button className="btn" type="submit">Cadastrar</button>
        </form>
      </div>
    </section>
  )
}
