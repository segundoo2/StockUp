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
import { Product } from './product.entity';

@Entity({ name: 'product_locations' })
@Index(['tenantId', 'locationCode'], { unique: true }) // 👈 Unicidade da posição no tenant
export class ProductLocation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ type: 'varchar', name: 'location_code', length: 50 })
  locationCode!: string;

  @Column({ type: 'uuid', name: 'product_id', nullable: true })
  productId?: string | null;

  @ManyToOne(() => Product, (product) => product.locations, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'product_id' })
  product?: Product | null;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 4,
    default: 0.0,
    transformer: {
      to: (value: number): number => value,
      from: (value: string): number => parseFloat(value),
    },
  })
  quantity!: number;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt!: Date;
}
