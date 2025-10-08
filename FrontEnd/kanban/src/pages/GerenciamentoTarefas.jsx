import "../styles/GerenciamentoTarefas.scss";
import React, { useState, useEffect } from 'react';
import ModalComponent from "../components/Modal";
import axios from "axios";
import Swal from 'sweetalert2';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export default function GerenciamentoTarefas() {
  const url = "http://127.0.0.1:3000/tasks";
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [usuarios, setUsers] = useState([]);
  const [draggedTask, setDraggedTask] = useState(null);

  // Schema de validação
  const taskSchema = z.object({
    descricao: z.string().min(5, "Mínimo 5 caracteres").max(200, "Máximo 200 caracteres"),
    setor: z.string().min(2, "Mínimo 2 caracteres").max(50, "Máximo 50 caracteres"),
    prioridade: z.enum(["Alta", "Media", "Baixa"], {
      errorMap: () => ({ message: "Selecione uma prioridade" }),
    }),
    usuario: z.preprocess((val) => Number(val), z.number().int().min(1, "Selecione um usuário")),
    status: z.enum(["A Fazer", "Fazendo", "Pronto"], {
      errorMap: () => ({ message: "Selecione um status" }),
    }),
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(taskSchema)
  });

  // Buscar tarefas
  const fetchTasks = async () => {
    try {
      const response = await axios.get(url);
      setTasks(response.data);
    } catch (error) {
      console.error("Erro ao buscar tarefas", error);
      Swal.fire("Erro!", "Não foi possível carregar as tarefas", "error");
    }
  };

  // Buscar usuários
  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:3000/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Erro ao buscar usuários", error);
    }
  };

  // Abrir modal de edição
  const openEditModal = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
    reset({
      descricao: task.descricao,
      setor: task.setor,
      prioridade: task.prioridade,
      usuario: task.usuario || "",
      status: task.status || "A Fazer"
    });
  };

  // Atualizar tarefa
  const updateTask = async (id, updatedData) => {
    try {
      await axios.patch(`${url}/${id}`, updatedData);
      setTasks(prev => prev.map(task =>
        task.id === id ? { ...task, ...updatedData } : task
      ));
    } catch (error) {
      console.error("Erro ao atualizar tarefa", error);
      Swal.fire("Erro!", "Não foi possível atualizar a tarefa", "error");
    }
  };

    // Deletar tarefa
    const deleteTask = async (id) => {
      const result = await Swal.fire({
        title: "Tem certeza?",
        text: "Esta ação não pode ser desfeita!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sim, deletar!",
        cancelButtonText: "Cancelar"
      });

      if (result.isConfirmed) {
        try {
          await axios.delete(`${url}/${id}`);
          setTasks(prev => prev.filter(task => task.id !== id));
          Swal.fire("Deletado!", "Tarefa deletada com sucesso.", "success");
        } catch (error) {
          console.error("Erro ao deletar tarefa", error);
          Swal.fire("Erro!", "Não foi possível deletar a tarefa", "error");
        }
      }
    };

    // Atualizar status direto no card
    const handleStatusChange = async (taskId, newStatus) => {
      updateTask(taskId, { status: newStatus });
    };

    // DRAG AND DROP
    const handleDragStart = (e, task) => {
      setDraggedTask(task);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", task.id.toString());
      e.currentTarget.classList.add("dragging");
    };

    const handleDragOver = (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      e.currentTarget.classList.add("drag-over");
    };

    const handleDragLeave = (e) => {
      e.currentTarget.classList.remove("drag-over");
    };

    const handleDrop = async (e, newStatus) => {
      e.preventDefault();
      e.currentTarget.classList.remove("drag-over");

      if (!draggedTask) return;

      const taskId = parseInt(e.dataTransfer.getData("text/plain"));

      if (draggedTask.status === newStatus) {
        setDraggedTask(null);
        return;
      }

      updateTask(taskId, { status: newStatus });
      setDraggedTask(null);
    };

    const handleDragEnd = (e) => {
      e.currentTarget.classList.remove("dragging");
      setDraggedTask(null);
    };

    // Buscar dados iniciais
    useEffect(() => {
      fetchTasks();
      fetchUsers();
    }, []);

    // Agrupar tarefas por status
    const tasksPorStatus = {
      "A Fazer": tasks.filter(task => task.status === "A Fazer"),
      "Fazendo": tasks.filter(task => task.status === "Fazendo"),
      "Pronto": tasks.filter(task => task.status === "Pronto")
    };

    // Enviar formulário de edição
    const onSubmitEdit = (data) => {
      if (editingTask) {
        updateTask(editingTask.id, data);
        setIsModalOpen(false);
      }
    };

    // Classe da prioridade
    const getPrioridadeClass = (prioridade) => {
      switch (prioridade) {
        case "Alta": return "alta";
        case "Media": return "media";
        case "Baixa": return "baixa";
        default: return "";
      }
    };

    return (
      <section className="tarefas">
        <div className="colunas">
          {["A Fazer", "Fazendo", "Pronto"].map((status) => (
            <div
              className="coluna"
              key={status}
              onDragOver={(e) => handleDragOver(e, status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, status)}
            >
              <h2>{status} ({tasksPorStatus[status].length})</h2>
              <div className="cards-column">
                {tasksPorStatus[status].map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                    onDragEnd={handleDragEnd}
                    className="card-tarefa"
                  >
                    <div className="card-content">
                      <div className="campo">
                        <label>Descrição:</label>
                        <p>{task.descricao}</p>
                      </div>
                      <div className="campo">
                        <label>Setor:</label>
                        <p>{task.setor}</p>
                      </div>
                      <div className="campo">
                        <label>Prioridade:</label>
                        <p>
                          <span className={`prioridade ${getPrioridadeClass(task.prioridade)}`}>
                            {task.prioridade}
                          </span>
                        </p>
                      </div>
                      <div className="campo">
                        <label>Responsável:</label>
                        <p>{usuarios.find(u => u.id === task.usuario)?.nome || "Não atribuído"}</p>
                      </div>

                      {/* Novo select de status direto no card */}
                      <div className="campo">
                        <label>Status:</label>
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        >
                          <option value="A Fazer">A Fazer</option>
                          <option value="Fazendo">Fazendo</option>
                          <option value="Pronto">Pronto</option>
                        </select>
                      </div>

                      <div className="acoes">
                        <button
                          onClick={() => openEditModal(task)}
                          className="btn-editar"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="btn-excluir"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

              {tasksPorStatus[status].length === 0 && (
                <div className="empty-state">
                  <p>Nenhuma tarefa {status.toLowerCase()}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Edição */}
      <ModalComponent
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Editar Tarefa"
      >
        <form onSubmit={handleSubmit(onSubmitEdit)} className="form-edicao">
          <div className="campo-form">
            <label htmlFor="descricao">Descrição *</label>
            <textarea id="descricao" {...register("descricao")} rows="3" />
            {errors.descricao && <span className="erro">{errors.descricao.message}</span>}
          </div>

          <div className="campo-form">
            <label htmlFor="setor">Setor *</label>
            <input id="setor" type="text" {...register("setor")} />
            {errors.setor && <span className="erro">{errors.setor.message}</span>}
          </div>

          <div className="campo-form">
            <label htmlFor="prioridade">Prioridade *</label>
            <select id="prioridade" {...register("prioridade")}>
              <option value="">Selecione...</option>
              <option value="Alta">Alta</option>
              <option value="Media">Média</option>
              <option value="Baixa">Baixa</option>
            </select>
            {errors.prioridade && <span className="erro">{errors.prioridade.message}</span>}
          </div>

          <div className="campo-form">
            <label htmlFor="usuario">Responsável *</label>
            <select id="usuario" {...register("usuario")}>
              <option value="">Selecione um usuário...</option>
              {usuarios.map(usuario => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.nome}
                </option>
              ))}
            </select>
            {errors.usuario && <span className="erro">{errors.usuario.message}</span>}
          </div>

          <div className="campo-form">
            <label htmlFor="status">Status *</label>
            <select id="status" {...register("status")}>
              <option value="">Selecione...</option>
              <option value="A Fazer">A Fazer</option>
              <option value="Fazendo">Fazendo</option>
              <option value="Pronto">Pronto</option>
            </select>
            {errors.status && <span className="erro">{errors.status.message}</span>}
          </div>

          <div className="acoes-form">
            <button type="button" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn-salvar">
              Salvar Alterações
            </button>
          </div>
        </form>
      </ModalComponent>
    </section>
  );
}
