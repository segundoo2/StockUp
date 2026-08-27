import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { Role } from '../../roles/entities/role.entity';

@Entity({ name: 'users' })
@Unique('uq_user_tenant_username', ['tenantId', 'username'])
export class User {
  @ApiProperty({ description: 'Identificador único do usuário (UUID v4)' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ description: 'Identificador do tenant' })
  @Column('uuid')
  tenantId!: string;

  @ApiProperty({ description: 'Nome de usuário único por tenant' })
  @Column({ type: 'varchar', length: 50 })
  @Index()
  username!: string;

  // 🔄 RELACIONAMENTO N:M COM ROLES
  @ManyToMany(() => Role, (role) => role.users, { eager: true })
  @JoinTable({
    name: 'users_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles!: Role[];

  @ApiProperty({ description: 'Flag para forçar troca de senha' })
  @Column({ type: 'boolean' })
  mustChangePassword!: boolean;

  @ApiHideProperty()
  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
