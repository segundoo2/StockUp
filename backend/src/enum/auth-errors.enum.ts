export enum EAuthErrors {
  ACCESS_DENIED = 'Acesso negado:',
  SESSION_EXPIRED = `${ACCESS_DENIED} sessão inválida ou expirada.`,
  FAILED_RETRIEVE_SESSION = `${ACCESS_DENIED} ocorreu uma falha ao tentar recuperar a sessão.`,
  USER_NOT_FOUND = 'Usuário não encontrado ou credenciais inválidas.',
}
