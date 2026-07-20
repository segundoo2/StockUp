import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { ProductLocation } from './product-location.entity';

@Entity({ name: 'products' })
@Index(['tenantId', 'sku'], { unique: true })
@Index(['tenantId', 'ean'], { unique: true })
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
    scale: 4,
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

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0.0,
    transformer: {
      to: (value: number): number => value,
      from: (value: string): number => parseFloat(value),
    },
  })
  price!: number;

  @Column({
    type: 'decimal',
    name: 'cost_price',
    precision: 12,
    scale: 2,
    default: 0.0,
    transformer: {
      to: (value: number): number => value,
      from: (value: string): number => parseFloat(value),
    },
  })
  costPrice!: number;

  // --- RELACIONAMENTOS ---
  @Column({ type: 'uuid', name: 'category_id' })
  categoryId?: string;

  @ManyToOne(() => Category, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id' })
  category?: Category;

  @OneToMany(
    () => ProductLocation,
    (productLocation) => productLocation.product,
    {
      cascade: true,
    },
  )
  locations!: ProductLocation[];

  // --- DADOS FISCAIS ---
  @Column({ type: 'varchar', length: 14, nullable: true })
  ean?: string | null;

  @Column({ type: 'varchar', length: 8, nullable: true })
  ncm?: string | null;

  @Column({ type: 'varchar', length: 7, nullable: true })
  cest?: string | null;

  @Column({ type: 'varchar', length: 1, default: '0' })
  origin!: string; // Origem da mercadoria (ex: '0' para Nacional)

  @Column({ type: 'varchar', length: 3, nullable: true })
  csosn?: string | null; // Usado se o tenant for do Simples Nacional

  @Column({ type: 'varchar', length: 2, nullable: true })
  cst?: string | null; // Usado se o tenant for Regime Normal (Lucro Presumido/Real)

  // ---------------------
  @Column({ type: 'varchar', name: 'created_by', length: 100, nullable: true })
  createdBy?: string;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt!: Date;

  @Column({ type: 'varchar', name: 'updated_by', length: 100, nullable: true })
  updatedBy?: string;
}
