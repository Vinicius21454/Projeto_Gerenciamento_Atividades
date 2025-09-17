export const taskModel = {
    type:"object",
    required:["descricao","setor","usuario","prioridade","status"],
    properties:{
        id:{type:"number"},
        descricao: {type:"string"},
        setor:{type:"string"},
        usuario:{type:"number"},
        prioridade:{
            type:"string",
            enum:["Alta","Media","Baixa"]
        },
        status:{
            type:"string",
            enum:["A Fazer","Fazendo","Pronto"]
        }
    }
}

export const createTaskSchema = {
  type: "object",
  required: ["descricao", "setor", "usuario", "prioridade"],
  properties: {
    descricao: { type: "string", minLength: 5, errorMessage: "O campo descrição exige no minimo 5 caracteres"} ,
    setor: { type: "string", minLength: 2, errorMessage: "O campo setor exige no minimo 2 caracteres"},
    usuario: { type: "number" , minLength: 3, errorMessage: "O campo usuario exige no minimo 3 caracteres"},
    prioridade: { 
        type: "string", 
        enum: ["Alta", "Media", "Baixa"],
        errorMessage:"Prioridade inválida! Deve ser Alta, Media ou Baixa",
    },
    
  },
  additionalProperties:false,
  errorMessage:{
    descricao:"O campo descrição é Obrigatório",
    setor:"O campo setor é obrigatório",
    usuario:"O campo usuário é obrigatório",
    prioridade:"O campo prioridade é obrigatório",
    additionalProperties:"Não são permitidos campos além de descrição, setor, usuário e prioridade"
  }
}

