import Fastify from "fastify";
import cors from '@fastify/cors';
import path from 'path';
import ajvErrors from "ajv-errors";
import fs from'fs';
import { fileURLToPath } from "url";

import { taskModel,createTaskSchema } from "./models/task.js";
import { userModel,createUserSchema } from "./models/user.js";

const fastify = Fastify({
    logger:true,
    ajv:{
        customOptions:{
            allErrors:true,
            removeAdditional:false
        },
        plugins:[ajvErrors]
    },
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

fastify.register(cors, {
    origin: true,
    methods: ["GET","POST","PATCH","DELETE"],
});

const fakeDatabaseTasks = path.join(__dirname, "tasks.json");
const fakeDatabaseUsers = path.join(__dirname,"user.json");

function readTasks() {
    try{
        const data = fs.readFileSync(fakeDatabaseTasks, 'utf-8');
        return data ? JSON.parse(data):{schema:{response:{message:"Nenhuma tarefa cadastrada"}}};
    }
    catch(err){
        return []
    }
}

function readUser(){
    try{
        const data = fs.readFileSync(fakeDatabaseUsers,'utf-8');
        return data ? JSON.parse(data):{schema:{response:{message:"Nenhum Usuário Cadastrado"}}}
    }
    catch(e){
        return []
    }
}


function writeTasks(task) {
    fs.writeFileSync(fakeDatabaseTasks, JSON.stringify(task, null, 2))
}

function writeUsers(user){
    fs.writeFileSync(fakeDatabaseUsers,JSON.stringify(user,null,2))
}

// TASKS REQUESTS

fastify.get('/tasks', { schema: { 
    response: { 
        200: { 
            type: "array", 
            items: taskModel 
        }}}}, async () => {
    return readTasks()
})

fastify.post('/tasks', {
    schema:{
        body:createTaskSchema,
        response:{
            201: taskModel
        }       
    }
} ,async (req, reply) => {
    const { descricao,setor,usuario,prioridade,status} = req.body;
    
    const users = readUser()
    const userExist = users.some(u => u.id === usuario)
    if(!userExist){
        return reply.status(400).send({error:"Este usuário não existe"})
    }

    const tasks = readTasks()
    const newTask = {
        id:tasks.length ? tasks[tasks.length - 1].id +1:1,
        descricao,setor,usuario,prioridade,status: "A Fazer"
    }
    tasks.push(newTask);
    writeTasks(tasks)
    return reply.status(201).send(newTask)
})

fastify.patch("/tasks/:id",{
    schema:{
        body:{
            type:"object",
            properties:{
                descricao:{type:"string"},
                setor:{type:"string"},
                usuario:{type:"number"},
                prioridade:{type:"string",enum:['Alta','Media','Baixa']},
                status:{type:"string",enum:['A Fazer','Fazendo','Pronto']}
            },
            additionalProperties:false
        },
        response:{200:taskModel}
    }
}, async (request,reply)=>{
    const {id} = request.params
    const updates = request.body
    const tasks = readTasks()
    const task = tasks.find(t => t.id == id)

    if(!task){
        return reply.status(404).send({error:"Tarefa não encontrada"})
    }

    if (updates.usuarioId) {
        const users = readUser();
        const userExist = users.some(u => u.id == updates.usuarioId);
        if (!userExist) {
            return reply.status(400).send({ error:`Usuário com id ${updates.usuarioId} não existe!!` });
        }
    }

    Object.keys(updates).forEach(key =>{
        task[key] = updates[key]
    })

    writeTasks(tasks)
    return task
})

fastify.delete("/tasks/:id",async (request,reply)=>{
    let tasks = readTasks()
    const exist = tasks.some(t => t.id == request.params.id)

    if(!exist){
        return reply.status(404).send({error:"Tarefa não encontrada!"})
    }

    tasks = tasks.filter(t => t.id != request.params.id)
    writeTasks(tasks)
    return {message:"Task Deletada com sucesso"}
})

// USERS REQUESTS

fastify.get('/users', { schema: { 
    response: { 
        200: { 
            type: "array", 
            items: userModel 
        }}}}, async () => {
    return readUser()
})

fastify.post('/users', {
    schema:{
        body:createUserSchema,
        response:{
            201: userModel
        }       
    }
} ,async (req, reply) => {
    const {nome,email} = req.body;
    const users = readUser()

    const emailExist = users.some(u => u.email === email);
    if(emailExist){
        return reply.status(400).send({error:"Email já cadastrado. Por favor use outro email"})
    }
    const newUser = { id:users.length ? users[users.length - 1].id +1:1,nome,email }
    users.push(newUser);
    writeUsers(users)
    return reply.status(201).send(newUser)
})

fastify.patch("/users/:id",{
    schema:{
        body:{
            type:"object",
            properties:{
               nome:{type:"string"},
               email:{type:"string"}
            },
            additionalProperties:false
        },
        response:{200:userModel}
    }
}, async (request,reply)=>{
    const {id} = request.params
    const updates = request.body
    const users = readUser()
    const user = users.find(t => t.id == id)

    if(!user){
        return reply.status(404).send({error:"Usuário não encontrado"})
    }

    Object.keys(updates).forEach(key =>{
        user[key] = updates[key]
    })

    writeUsers(users)
    return user
})

fastify.delete("/users/:id",async (request,reply)=>{
    let users = readUser()
    const exist = users.some(t => t.id == request.params.id)

    if(!exist){
        return reply.status(404).send({error:"Usuário não encontrado!"})
    }

    users = users.filter(t => t.id != request.params.id)
    writeUsers(users)
    return {message:"Usuário Deletado com sucesso"}
})

const start = async () => {
    try{
        await fastify.listen({port:3000})
        console.log("Api rodando");
    }catch(err){
        fastify.log.error(err)
        process.exit(1)
    }
}



start();