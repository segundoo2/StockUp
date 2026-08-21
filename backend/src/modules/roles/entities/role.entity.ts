import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { EPermission } from '../../../enum/permissions.enum';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'roles' })
@Index('uq_role_tenant_name', ['tenantId', 'name'], { unique: true })
export class Role {
  @ApiProperty({
    description: 'Identificador único da role (UUID v4)',
    example: 'c22e5a7d-b2b2-4d76-8809-51a81231f24d',
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    description: 'Identificador do tenant ao qual a role pertence',
    example: 'tenant-12345',
  })
  @Column({ type: 'uuid' })
  tenantId!: string;

  @ApiProperty({
    description: 'Nome da role único por tenant',
    example: 'Admin',
  })
  @Column({ type: 'varchar', length: 50 })
  name!: string;

  @ApiProperty({
    description: 'Permissões atribuídas à role',
    enum: EPermission,
    isArray: true,
    example: [EPermission.USERS_READ, EPermission.PRODUCTS_READ],
  })
  @Column({ type: 'simple-array' })
  permissions!: EPermission[];

  @ApiProperty({
    description: 'Indica se a role é padrão do sistema e não pode ser removida',
    example: true,
  })
  @Column({ type: 'boolean', default: false })
  isSystem!: boolean;

  @OneToMany(() => User, (user) => user.role)
  users!: User[];

  @ApiProperty({
    description: 'Data de criação da role',
    example: '2026-07-27T20:00:00.000Z',
  })
  @CreateDateColumn()
  createdAt!: Date;

  @ApiProperty({
    description: 'Data da última atualização da role',
    example: '2026-07-27T20:00:00.000Z',
  })
  @UpdateDateColumn()
  updatedAt!: Date;
}
