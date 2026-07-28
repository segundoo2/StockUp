import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';

@Entity({ name: 'users' })
@Unique('uq_user_tenant_username', ['tenantId', 'username'])
export class User {
  @ApiProperty({
    description: 'Identificador único do usuário (UUID v4)',
    example: 'c22e5a7d-b2b2-4d76-8809-51a81231f24d',
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    description: 'Identificador do tenant ao qual o usuário pertence',
    example: 'tenant-12345',
  })
  @Column('uuid')
  tenantId!: string;

  @ApiProperty({
    description: 'Nome de usuário único por tenant',
    example: 'usuario_admin',
  })
  @Column({ type: 'varchar', length: 50 })
  @Index()
  username!: string;

  @ApiProperty({
    description: 'Indica se o usuário é um administrador',
    example: true,
  })
  @Column({ type: 'boolean' })
  admin!: boolean;

  @ApiProperty({
    description: 'Flag para forçar a troca de senha no próximo login',
    example: false,
  })
  @Column({ type: 'boolean' })
  mustChangePassword!: boolean;

  // Oculta a senha nos Schemas gerados pelo Swagger
  @ApiHideProperty()
  @Column({ type: 'varchar', length: 12 })
  password!: string;

  @ApiProperty({
    description: 'Data de criação do usuário',
    example: '2026-07-27T20:00:00.000Z',
  })
  @CreateDateColumn()
  createdAt!: Date;

  @ApiProperty({
    description: 'Data da última atualização do usuário',
    example: '2026-07-27T20:00:00.000Z',
  })
  @UpdateDateColumn()
  updatedAt!: Date;
}
