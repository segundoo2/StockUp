export enum ERolesErrors {
  NAME_REQUIRED = 'O nome da role é obrigatório.',
  NAME_STRING = 'O nome da role deve ser um texto.',
  PERMISSIONS_REQUIRED = 'Informe ao menos uma permissão.',
  PERMISSION_INVALID = 'Uma ou mais permissões são inválidas.',
  ROLE_NOT_FOUND = 'Role não encontrada.',
  ROLE_NAME_EXISTS = 'Já existe uma role com este nome neste tenant.',
  SYSTEM_ROLE_IMMUTABLE = 'A role de sistema não pode ser alterada ou removida.',
  ROLE_IN_USE = 'Não é possível remover a role enquanto houver usuários vinculados.',
}
