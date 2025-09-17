import "../styles/CadTarefas.scss";
import "../styles/CadUsuario.scss";
import { useState, useEffect } from "react";
import axios from 'axios';
import Swal from 'sweetalert2';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export default function CadastroTarefas() {
  const url = "http://127.0.0.1:3000/tasks";
  const [users, setUsers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const prioridade = ["Alta", "Media", "Baixa"];

  const schema = z.object({
    descricao: z.string()
      .min(5, "A descrição deve conter no mínimo 5 caracteres")
      .max(200, "A descrição deve conter no máximo 200 caracteres")
      .refine(val => val.trim().length > 0, {
        message: "A descrição não pode conter apenas espaços"
      }),

    setor: z.string()
      .min(2, "O setor deve conter ao menos 2 caracteres")
      .max(100, "O setor deve conter no máximo 100 caracteres")
      .refine(val => val.trim().length > 0, {
        message: "O setor não pode conter apenas espaços"
      })
      .refine(val => /^\S+$/.test(val), {
        message: "O setor não pode conter espaços"
      }),

    usuario: z.string()
      .nonempty("Escolha um usuário")
      .refine(val => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Usuário inválido"
      }),

    prioridade: z.enum(["Alta", "Media", "Baixa"], {
      errorMap: () => ({ message: "A prioridade deve ser Alta, Média ou Baixa" })
    })
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(schema),
  });

  async function viewUsers() {
    try {
      const response = await axios.get("http://127.0.0.1:3000/users");
      setUsers(response.data);
    } catch (e) {
      console.log(e);
    }
  }

  const createTask = async (data) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await axios.post(url, data);
      Swal.fire({
        title: "Tarefa criada com sucesso!",
        icon: "success",
        draggable: true
      });
      reset();
    } catch (e) {
      Swal.fire({
        title: "Erro ao criar tarefa",
        icon: "error",
        draggable: true
      });
      console.log(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    viewUsers();
  }, []);

  return (
    <section className="section-form">
      <div className="container-form">
        <h1 className="title-form">Cadastro de Tarefas</h1>

        <form className="form" onSubmit={handleSubmit(createTask)}>
          <div className="input">
            <label>Descrição</label>
            <input
              type="text"
              {...register("descricao")}
              className={errors.descricao ? "error" : ""}
            />
            {errors.descricao && <span className="error">{errors.descricao.message}</span>}
          </div>

          <div className="input">
            <label>Setor</label>
            <input
              type="text"
              {...register("setor")}
              className={errors.setor ? "error" : ""}
            />
            {errors.setor && <span className="error">{errors.setor.message}</span>}
          </div>

          <div className="input">
            <label>Usuário</label>
            <select
              {...register("usuario")}
              className={errors.usuario ? "error" : ""}
            >
              <option value="">Selecione um Usuário</option>
              {users.map((u) => (
                <option value={u.id} key={u.id}>{u.nome}</option>
              ))}
            </select>
            {errors.usuario && <span className="error">{errors.usuario.message}</span>}
          </div>

          <div className="input">
            <label>Prioridade</label>
            <select
              {...register("prioridade")}
              className={errors.prioridade ? "error" : ""}
            >
              <option value="">Selecione uma prioridade</option>
              {prioridade.map(a => (
                <option value={a} key={a}>{a}</option>
              ))}
            </select>
            {errors.prioridade && <span className="error">{errors.prioridade.message}</span>}
          </div>

          <button className="btn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Cadastrar"}
          </button>
        </form>
      </div>
    </section>
  );
}
