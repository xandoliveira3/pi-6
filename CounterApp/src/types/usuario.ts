export interface Usuario {
  uid: string;
  nome: string;
  email: string;
  tipo_usuario: 'admin' | 'usuario';
  ativo: boolean;
  criado_em?: any;
  atualizado_em?: any;
  faceEmbedding?: number[]; // Vetor de características faciais (128 dimensões)
  faceEmbeddingVersion?: number; // Versão do embedding para controle de atualização
}
