import { format } from "path"

export const userModel = {
  type:"object",
  required:["nome","email"],
  properties:{
    id:{type:"number"},
    nome:{type:"string"},
    email:{type:"string",format:"email"}
  }
}

export const createUserSchema = {
  type:"object",
  required:["nome","email"],
  properties:{
    nome:{type:"string", minLength: 5, errorMessage: "O campo nome exige no minimo 5 caracteres."},
    email:{type:"string",format:"email", errorMessage: "O campo email precisa estar no formato de email."}
  },
  additionalProperties:false,
  errorMessage:{
    required:{
        nome:"O campo Nome é Obriogatório",
        email:"O campo Email é Obrigatório",
    },
    additionalProperties:"Não são permitidos campos a mais. Digite apenas o nome e o email."
  }
}