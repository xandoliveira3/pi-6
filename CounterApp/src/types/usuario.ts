export interface Usuario {
  uid: string;
  nome: string;
  email: string;
  tipo_usuario: 'admin' | 'usuario';
  ativo: boolean;
  criado_em?: any;
  atualizado_em?: any;
}
