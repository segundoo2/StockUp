import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'products' })
@Index(['tenantId', 'sku'], { unique: true })
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ type: 'varchar', length: 50 })
  sku!: string;

  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Column({ type: 'varchar', length: 10, default: 'UN' })
  uom!: string;

  @Column({
    type: 'decimal',
    name: 'current_stock',
    precision: 12,
    scale: 12,
    default: 0.0,
    transformer: {
      to: (value: number): number => value,
      from: (value: string): number => parseFloat(value),
    },
  })
  currentStock!: number;

  @Column({
    type: 'decimal',
    name: 'minimum_stock',
    precision: 12,
    scale: 4,
    default: 0.0,
    transformer: {
      to: (value: number): number => value,
      from: (value: string): number => parseFloat(value),
    },
  })
  minimumStock!: number;

  @Column({ type: 'uuid', name: 'category_id' })
  categoryId!: string;

  @ManyToOne(() => Category, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id' })
  category!: AudioContextLatencyCategory;

  @Column({ type: 'varchar', length: 14, unique: true, nullable: true })
  ean?: string | null;

  @Column({ type: 'varchar', length: 8, nullable: true })
  ncm?: string | null;

  @Column({ type: 'varchar', length: 7, nullable: true })
  cest?: string | null;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt!: Date;
}
