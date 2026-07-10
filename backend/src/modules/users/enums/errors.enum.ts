export enum EErrors {
  USERNAME = 'Nome de usuário',
  USERNAME_LENGTH = 'O username deve ter entre 3 e 50 caracteres.',
  USERNAME_CHARACTERS = 'O username deve conter apenas letras minúsculas, números e ponto final.',
  USERNAME_EXIST = 'O usuário informado já está cadastrado. Solicite um reset de senha a um administrador, se precisar.',
  USERNAME_INVALID = 'Nome de usuário inválido.',

  CARACTERS_INVALID = 'contém caracteres inválidos',

  ADMIN_INVALID = 'Nível de acesso invalido.',

  USERNAME_PASSWORD_INCORRECT = 'Nome de usuário ou senha inválido.',
  MUST_CHANGE_PASSWORD_INVALID = 'Must change password inválido.',

  USER_NOT_FOUND = 'Usuário não encontrado.',
  USERS_NOT_FOUND = 'Lista de usuários não encontrada.',
}
