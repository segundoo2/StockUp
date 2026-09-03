import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductLocation } from './entities/product-location.entity';
import { IProductLocationsRepository } from './interfaces/product-location.repository.interface';

@Injectable()
export class ProductLocationsRepository implements IProductLocationsRepository {
  constructor(
    @InjectRepository(ProductLocation)
    private readonly repository: Repository<ProductLocation>,
  ) {}

  private getRepo(em?: EntityManager): Repository<ProductLocation> {
    return em ? em.getRepository(ProductLocation) : this.repository;
  }

  async findByProductAndLocation(
    productId: string,
    locationId: string,
    tenantId: string,
    em?: EntityManager,
  ): Promise<ProductLocation | null> {
    return this.getRepo(em).findOne({
      where: { productId, locationId, tenantId },
    });
  }

  async sumAllocatedStock(
    productId: string,
    tenantId: string,
    em?: EntityManager,
  ): Promise<number> {
    const result = await this.getRepo(em)
      .createQueryBuilder('pl')
      .select('SUM(pl.quantity)', 'total')
      .where('pl.product_id = :productId AND pl.tenant_id = :tenantId', {
        productId,
        tenantId,
      })
      .getRawOne<{ total: string | null }>();

    return parseFloat(result?.total ?? '0');
  }

  async incrementQuantity(
    productId: string,
    locationId: string,
    tenantId: string,
    quantity: number,
    em?: EntityManager,
  ): Promise<void> {
    const repo = this.getRepo(em);

    let record = await repo.findOne({
      where: { productId, locationId, tenantId },
    });

    if (!record) {
      record = repo.create({
        productId,
        locationId,
        tenantId,
        quantity,
      });
    } else {
      record.quantity = Number(record.quantity) + quantity;
    }

    await repo.save(record);
  }

  async decrementQuantity(
    productId: string,
    locationId: string,
    tenantId: string,
    quantity: number,
    em?: EntityManager,
  ): Promise<void> {
    const repo = this.getRepo(em);
    const record = await repo.findOne({
      where: { productId, locationId, tenantId },
    });

    if (!record || Number(record.quantity) < quantity) {
      throw new Error('Estoque insuficiente na localização de origem');
    }

    record.quantity = Number(record.quantity) - quantity;
    await repo.save(record);
  }
}
