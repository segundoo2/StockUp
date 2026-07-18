import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'users' })
@Unique('uq_user_tenant_username', ['tenantId', 'username'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  tenantId!: string;

  @Column({ type: 'varchar', length: 50 })
  @Index()
  username!: string;

  @Column({ type: 'boolean' })
  admin!: boolean;

  @Column({ type: 'boolean' })
  mustChangePassword!: boolean;

  @Column({ type: 'varchar', length: 12 })
  password!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
