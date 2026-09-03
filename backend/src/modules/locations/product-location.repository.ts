import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { EErrorsGlobal } from '../../common/enum/errors-global.enum';
import { ProductLocation } from './entities/product-location.entity';
import { IProductLocationsRepository } from './interfaces/product-locations.repository.interface';

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
    try {
      return await this.getRepo(em).findOne({
        where: { productId, locationId, tenantId },
      });
    } catch {
      throw new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR);
    }
  }

  async sumAllocatedStock(
    productId: string,
    tenantId: string,
    em?: EntityManager,
  ): Promise<number> {
    try {
      const result = await this.getRepo(em)
        .createQueryBuilder('pl')
        .select('SUM(pl.quantity)', 'total')
        .where('pl.product_id = :productId AND pl.tenant_id = :tenantId', {
          productId,
          tenantId,
        })
        .getRawOne<{ total: string | null }>();

      return parseFloat(result?.total ?? '0');
    } catch {
      throw new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR);
    }
  }

  async incrementQuantity(
    productId: string,
    locationId: string,
    tenantId: string,
    quantity: number,
    em?: EntityManager,
  ): Promise<void> {
    try {
      const repo = this.getRepo(em);

      const record = await repo.findOne({
        where: { productId, locationId, tenantId },
      });

      if (!record) {
        const newRecord = repo.create({
          productId,
          locationId,
          tenantId,
          quantity,
        });
        await repo.save(newRecord);
        return;
      }

      await repo.increment(
        { productId, locationId, tenantId },
        'quantity',
        quantity,
      );
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR);
    }
  }

  async decrementQuantity(
    productId: string,
    locationId: string,
    tenantId: string,
    quantity: number,
    em?: EntityManager,
  ): Promise<void> {
    try {
      const repo = this.getRepo(em);

      const record = await repo.findOne({
        where: { productId, locationId, tenantId },
      });

      if (!record || Number(record.quantity) < quantity) {
        throw new BadRequestException(
          'Estoque insuficiente na localização de origem',
        );
      }

      await repo.decrement(
        { productId, locationId, tenantId },
        'quantity',
        quantity,
      );
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR);
    }
  }
}
