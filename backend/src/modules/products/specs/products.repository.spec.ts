import { ObjectLiteral, Repository } from 'typeorm';
import { UsersRepository } from '../../users/users.repository';
import { Product } from '../entities/product.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductsRepository } from '../products.repository';
import { Category } from '../entities/category.entity';
import { ProductDto } from '../dtos/product.dto';
import { InternalServerErrorException } from '@nestjs/common';
import { EErrorsGlobal } from '../../../enum/errors-global.enum';

type MockRepository<T extends ObjectLiteral> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

describe('ProductsRepository', () => {
  let productsRepository: ProductsRepository;
  let ormRepositoryMock: MockRepository<Product>;

  const categoryMock: Category = {
    id: 'b3b3b3b3-b3b3-4b3b-b3b3-b3b3b3b3b3b3',
    tenantId: 'tenant-123',
    name: 'Eletrônicos',
    description: 'Dispositivos eletrônicos e acessórios',
    isActive: true,
    products: [],
    createdAt: new Date('2026-01-01T12:00:00Z'),
    updatedAt: new Date('2026-01-01T12:00:00Z'),
  };

  const productMock: Product = {
    id: 'a1a1a1a1-a1a1-4a1a-a1a1-a1a1a1a1a1a1',
    tenantId: 'tenant-123',
    sku: 'PROD-CEL-001',
    name: 'Smartphone X Pro',
    uom: 'UN',
    currentStock: 15.0,
    minimumStock: 5.0,
    price: 2499.9,
    costPrice: 1800.0,
    categoryId: categoryMock.id,
    category: categoryMock,
    ean: '7891234567890',
    ncm: '85171300',
    cest: '2105300',
    origin: '0',
    csosn: '102',
    cst: null,
    createdBy: 'admin-user',
    createdAt: new Date('2026-07-18T12:00:00Z'),
    updatedAt: new Date('2026-07-18T12:00:00Z'),
    updatedBy: 'admin-user',
  };

  const productDtoMock: ProductDto = {
    tenantId: '1',
    sku: 'PROD-CEL-001',
    name: 'Smartphone X Pro',
    uom: 'UN',
    minimumStock: 5.0,
    price: 2499.9,
    costPrice: 1800.0,
    categoryId: 'b3b3b3b3-b3b3-4b3b-b3b3-b3b3b3b3b3b3',
    ean: '78912345678901',
    ncm: '85171300',
    cest: '2105300',
    origin: '0',
    csosn: '102',
    cst: '00',
  };

  beforeEach(async () => {
    const mockFactory = (): MockRepository<Product> => ({
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsRepository, // Adicionado aqui para o NestJS poder instanciá-lo
        {
          // Fornece um mock isolado para o UsersRepository evitando quebra de dependências
          provide: UsersRepository,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Product),
          useFactory: mockFactory,
        },
      ],
    }).compile();

    productsRepository = module.get<ProductsRepository>(ProductsRepository);
    ormRepositoryMock = module.get<MockRepository<Product>>(
      getRepositoryToken(Product),
    );
  });

  afterEach(() => jest.restoreAllMocks());

  const shouldHandleDatabaseErrors = (
    operation: () => Promise<unknown>,
    mockMethod: () => jest.Mock | undefined,
  ) => {
    it('should return InternalServerException when TypeORM throws an error', async () => {
      mockMethod()?.mockRejectedValue(
        new Error('[TypeOrmModule] Unable to connect to the database'),
      );

      await expect(operation()).rejects.toThrow(
        new InternalServerErrorException(EErrorsGlobal.SERVER_ERROR),
      );
    });
  };

  describe('create', () => {
    it('should return the created product when it is persist success', async () => {
      ormRepositoryMock.create?.mockReturnValue(productMock);
      ormRepositoryMock.save?.mockResolvedValue(productMock);

      const result = await productsRepository.createProduct(productDtoMock);

      expect(result).toEqual(productMock);
      expect(ormRepositoryMock.create).toHaveBeenCalledWith(productDtoMock);
      expect(ormRepositoryMock.save).toHaveBeenCalledWith(productMock);
    });

    shouldHandleDatabaseErrors(
      () => productsRepository.createProduct(productDtoMock),
      () => ormRepositoryMock.save,
    );
  });

  describe('findOneBySku', () => {
    it('should return product when it is found', async () => {
      ormRepositoryMock.findOne?.mockResolvedValue(productMock);
      expect(
        await productsRepository.findOneBySku(
          productMock.sku,
          productMock.tenantId,
        ),
      );
      expect(ormRepositoryMock.findOne).toHaveBeenCalledWith({
        where: {
          sku: productMock.sku,
          tenantId: productMock.tenantId,
        },
      });
    });

    shouldHandleDatabaseErrors(
      () => productsRepository.createProduct(productDtoMock),
      () => ormRepositoryMock.save,
    );
  });
});
