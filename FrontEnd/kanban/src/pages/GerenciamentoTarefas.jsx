import "../styles/GerenciamentoTarefas.scss"
import React, { useState, useEffect } from 'react';
import ModalComponent from "../components/Modal";
import axios from "axios";
import Swal from 'sweetalert2'
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";


export default function GerenciamentoTarefas() {
    const url = "http://127.0.0.1:3000/tasks";
    const [tasks, setTasks] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [usuarios, setUsers] = useState([]);
    const [statusChanges, setStatusChanges] = useState({});

    // Esquema de validação completo com todas as regras possíveis
    const editSchema  = z.object({
        descricao: z.string()
            .min(5, "A descrição deve conter no mínimo 5 caracteres")
            .max(200, "A descrição deve conter no máximo 200 caracteres")
            .nonempty("A descrição não pode ser vazia"),
        setor: z.string()
            .min(2, "O setor deve conter ao menos 2 caracteres")
            .max(50, "O setor deve conter no máximo 50 caracteres")
            .nonempty("O setor não pode ser vazio"),
        prioridade: z.enum(["Alta", "Media", "Baixa"], { 
            errorMap: () => ({ message: "A prioridade deve ser Alta, Media ou Baixa" }) 
        }),
        usuario: z.preprocess(
            (val) => Number(val),
            z.number().int().min(1, "Escolha um usuário válido")
        ),
        status: z.enum(["A Fazer", "Fazendo", "Pronto"], {
            errorMap: () => ({ message: "Status inválido" })
        }).optional()
    });

    const {
        register: editRegister,
        handleSubmit: handleEditSubmit,
        formState: { errors: editErrors },
        reset: resetEditForm
    } = useForm({
        resolver: zodResolver(editSchema),
        defaultValues: editingTask || {}
    });


    

    // Funções de API
    async function viewUsers() {
        try {
            const response = await axios.get("http://127.0.0.1:3000/users");
            setUsers(response.data)
        } catch (e) {
            console.log(e);
        }
    }

    async function viewTasks() {
        try {
            const response = await axios.get(url);
            setTasks(response.data)
        } catch (error) {
            console.log("Erro ao buscar tarefas", error);
        }
    }

    const openEditModal = (task) => {
        setEditingTask(task);
        setIsModalOpen(true);
        resetEditForm(task);
    };

    const handleUpdateTask = (data) => {
        const payload = {
            descricao: data.descricao,
            setor: data.setor,
            prioridade: data.prioridade,
            usuario: Number(data.usuario),
            status: data.status || editingTask.status
        };
        updateTask(editingTask.id, payload);
    };

    const updateTask = async (id, updatedData) => {
        try {
            await axios.patch(`http://127.0.0.1:3000/tasks/${id}`, updatedData);
            viewTasks();
            setIsModalOpen(false);
            Swal.fire({
                title: "Tarefa atualizada com sucesso!",
                icon: "success",
                draggable: true
            });
        } catch (e) {
            console.error("Erro ao atualizar tarefa", e);
            Swal.fire({
                title: "Erro ao atualizar tarefa",
                icon: "error",
                draggable: true
            });
        }
    };

    const deleteTask = async (id) => {
        try {
            await axios.delete(`http://127.0.0.1:3000/tasks/${id}`);
            viewTasks();
            Swal.fire({
                title: "Tarefa deletada com sucesso!",
                icon: "success",
                draggable: true
            });
        } catch (e) {
            console.log(e);
        }
    }

    useEffect(() => {
        viewTasks();
        viewUsers();
    }, [])

    return (
        <section className="tarefas">
            <h1>Tarefas</h1>
            <div className="colunas">
                {["A Fazer", "Fazendo", "Pronto"].map((statusColumn) => (
                    <div className="coluna" key={statusColumn}>
                        <h2>{statusColumn}</h2>
                        <div className="cards-column">
                            {tasks.filter(task => task.status === statusColumn).length > 0 ? (
                                tasks.filter(task => task.status === statusColumn).map(task => (
                                    <div className="card-tarefa" key={task.id}>
                                        <div className="separador-campo">
                                            <label className="label-campo" id={`desc-label-${task.id}`}>Descrição</label>
                                            <span aria-labelledby={`desc-label-${task.id}`}>{task.descricao}</span>
                                        </div>
                                        <div className="separador-campo">
                                            <label className="label-campo" id={`setor-label-${task.id}`}>Setor</label>
                                            <span aria-labelledby={`setor-label-${task.id}`}>{task.setor}</span>
                                        </div>
                                        <div className="separador-campo">
                                            <label className="label-campo" id={`prio-label-${task.id}`}>Prioridade</label>
                                            <span aria-labelledby={`prio-label-${task.id}`}>{task.prioridade}</span>
                                        </div>
                                        <div className="separador-campo">
                                            <label className="label-campo" id={`user-label-${task.id}`}>Vinculada A</label>
                                            <span aria-labelledby={`user-label-${task.id}`}>
                                                {usuarios.find(u => u.id == task.usuario)?.nome || "Usuário não encontrado"}
                                            </span>
                                        </div>
                                        <div className="opt-actions">
                                            <button aria-label={`Editar tarefa: ${task.descricao}`} onClick={() => openEditModal(task)}>Editar</button>
                                            <button aria-label={`Excluir tarefa: ${task.descricao}`} onClick={() => deleteTask(task.id)}>Excluir</button>
                                        </div>
                                        <div className="separador-campo">
                                            <label htmlFor={`status-select-${task.id}`}>Status</label>
                                            <select
                                                id={`status-select-${task.id}`}
                                                aria-label={`Alterar status da tarefa: ${task.descricao}`}
                                                value={statusChanges[task.id] || task.status}
                                                onChange={(e) => setStatusChanges({...statusChanges, [task.id]: e.target.value})}
                                            >
                                                <option value="A Fazer">A fazer</option>
                                                <option value="Fazendo">Fazendo</option>
                                                <option value="Pronto">Pronto</option>
                                            </select>
                                            <button
                                                onClick={() => updateTask(task.id, { status: statusChanges[task.id] || task.status })}
                                                aria-label={`Confirmar alteração de status para a tarefa: ${task.descricao}`}
                                            >
                                                Alterar Status
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p>Nenhuma tarefa {statusColumn.toLowerCase()}</p>
                            )}
                        </div>
                    </div>
                ))}

                {isModalOpen && (
                    <ModalComponent
                      onClose={() => setIsModalOpen(false)}
                      isOpen={isModalOpen}
                      aria-modal="true"
                      aria-labelledby="modal-title"
                    >
                        <h2 id="modal-title">Editar Tarefa</h2>
                        <form onSubmit={handleEditSubmit(handleUpdateTask)} noValidate>
                            <label htmlFor="descricao-input">Descrição</label>
                            <input
                                id="descricao-input"
                                type="text"
                                {...editRegister("descricao")}
                                aria-invalid={editErrors.descricao ? "true" : "false"}
                                aria-describedby={editErrors.descricao ? "descricao-error" : undefined}
                            />
                            {editErrors.descricao && (
                                <span className="error" role="alert" id="descricao-error">
                                    {editErrors.descricao.message}
                                </span>
                            )}

                            <label htmlFor="setor-input">Setor</label>
                            <input
                                id="setor-input"
                                type="text"
                                {...editRegister("setor")}
                                aria-invalid={editErrors.setor ? "true" : "false"}
                                aria-describedby={editErrors.setor ? "setor-error" : undefined}
                            />
                            {editErrors.setor && (
                                <span className="error" role="alert" id="setor-error">
                                    {editErrors.setor.message}
                                </span>
                            )}

                            <label htmlFor="prioridade-select">Prioridade</label>
                            <select
                                id="prioridade-select"
                                {...editRegister("prioridade")}
                                aria-invalid={editErrors.prioridade ? "true" : "false"}
                                aria-describedby={editErrors.prioridade ? "prioridade-error" : undefined}
                            >
                                <option value="Alta">Alta</option>
                                <option value="Media">Média</option>
                                <option value="Baixa">Baixa</option>
                            </select>
                            {editErrors.prioridade && (
                                <span className="error" role="alert" id="prioridade-error">
                                    {editErrors.prioridade.message}
                                </span>
                            )}

                            <label htmlFor="usuario-select">Usuário</label>
                            <select
                                id="usuario-select"
                                {...editRegister("usuario")}
                                aria-invalid={editErrors.usuario ? "true" : "false"}
                                aria-describedby={editErrors.usuario ? "usuario-error" : undefined}
                            >
                                <option value="">Escolha um usuário</option>
                                {usuarios.map(user => (
                                    <option key={user.id} value={user.id}>{user.nome}</option>
                                ))}
                            </select>
                            {editErrors.usuario && (
                                <span className="error" role="alert" id="usuario-error">
                                    {editErrors.usuario.message}
                                </span>
                            )}

                            <label htmlFor="status-select-modal">Status</label>
                            <select
                                id="status-select-modal"
                                {...editRegister("status")}
                                aria-invalid={editErrors.status ? "true" : "false"}
                                aria-describedby={editErrors.status ? "status-error" : undefined}
                            >
                                <option value="A Fazer">A Fazer</option>
                                <option value="Fazendo">Fazendo</option>
                                <option value="Pronto">Pronto</option>
                            </select>
                            {editErrors.status && (
                                <span className="error" role="alert" id="status-error">
                                    {editErrors.status.message}
                                </span>
                            )}

                            <div className="btns">
                                <button type="submit" className="saveButton">Salvar</button>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-bottom exitBottom">Fechar</button>
                            </div>
                        </form>
                    </ModalComponent>
                )}
            </div>
        </section>
    )
}
