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
                                            <label className="label-campo">Descrição</label>
                                            <span>{task.descricao}</span>
                                        </div>
                                        <div className="separador-campo">
                                            <label className="label-campo">Setor</label>
                                            <span>{task.setor}</span>
                                        </div>
                                        <div className="separador-campo">
                                            <label className="label-campo">Prioridade</label>
                                            <span>{task.prioridade}</span>
                                        </div>
                                        <div className="separador-campo">
                                            <label className="label-campo">Vinculada A</label>
                                            <span>{usuarios.find(u => u.id == task.usuario)?.nome || "Usuário não encontrado"}</span>
                                        </div>
                                        <div className="opt-actions">
                                            <button onClick={() => openEditModal(task)}>Editar</button>
                                            <button onClick={() => deleteTask(task.id)}>Excluir</button>
                                        </div>
                                        <div className="separador-campo">
                                            <select value={task.status} onChange={(e) => setStatusChanges({...statusChanges, [task.id]: e.target.value})}>
                                                <option value="A Fazer">A fazer</option>
                                                <option value="Fazendo">Fazendo</option>
                                                <option value="Pronto">Pronto</option>
                                            </select>
                                            <button onClick={() => updateTask(task.id, { status: statusChanges[task.id] || task.status })}>Alterar Status</button>
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
                    <ModalComponent onClose={() => setIsModalOpen(false)} isOpen={isModalOpen}>
                        <h2>Editar Tarefa</h2>
                        <form onSubmit={handleEditSubmit(handleUpdateTask)}>
                            <label>Descrição</label>
                            <input type="text" {...editRegister("descricao")} />
                            {editErrors.descricao && <span className="error">{editErrors.descricao.message}</span>}

                            <label>Setor</label>
                            <input type="text" {...editRegister("setor")} />
                            {editErrors.setor && <span className="error">{editErrors.setor.message}</span>}

                            <label>Prioridade</label>
                            <select {...editRegister("prioridade")}>
                                <option value="Alta">Alta</option>
                                <option value="Media">Média</option>
                                <option value="Baixa">Baixa</option>
                            </select>
                            {editErrors.prioridade && <span className="error">{editErrors.prioridade.message}</span>}

                            <label>Usuário</label>
                            <select {...editRegister("usuario")}>
                                <option value="">Escolha um usuário</option>
                                {usuarios.map(user => (
                                    <option key={user.id} value={user.id}>{user.nome}</option>
                                ))}
                            </select>
                            {editErrors.usuario && <span className="error">{editErrors.usuario.message}</span>}

                            <label>Status</label>
                            <select {...editRegister("status")}>
                                <option value="A Fazer">A Fazer</option>
                                <option value="Fazendo">Fazendo</option>
                                <option value="Pronto">Pronto</option>
                            </select>
                            {editErrors.status && <span className="error">{editErrors.status.message}</span>}

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
