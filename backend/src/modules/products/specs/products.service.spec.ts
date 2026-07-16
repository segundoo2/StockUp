/* eslint-disable @typescript-eslint/unbound-method */
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ProductDto } from '../dtos/product.dto';
import { Product } from '../entities/product.entity';
import { EProductsSuccess } from '../enums/products-success.enum';
import { IProductsResponse } from '../interfaces/products-response.interface';
import { IProductsRepository } from '../interfaces/products.repository.interface';
import { IProductsService } from '../interfaces/products.service.interface';
import { ProductsService } from '../products.service';
import { EProductsError } from '../enums/products-error.enum';

describe('ProductsService', () => {
  let service: IProductsService;
  let mockRepository: jest.Mocked<IProductsRepository>;

  beforeEach(() => {
    mockRepository = {
      createProduct: jest.fn(),
      findOneBySku: jest.fn(),
    };
    service = new ProductsService(mockRepository);
  });
  afterEach(() => jest.clearAllMocks());

  const mockProductDto: ProductDto = {
    sku: 'PROD-ALFA-001',
    name: 'Refrigerante Cola 350ml',
    uom: 'UN',
    minimumStock: 10.0,
    price: 5.5,
    costPrice: 2.8,
    categoryId: 'd3b07384-d113-4ec6-a5d6-c1c234567890',
    ean: '7891234567890',
    ncm: '22021000', // NCM correto para águas gaseificadas/refrigerantes
    cest: '0300700', // CEST correspondente
    origin: '0', // 0 - Nacional
    csosn: '102', // Tributação imune/isenta dentro do Simples Nacional
    cst: null, // Fica nulo se o tenant utilizar o CSOSN (Simples Nacional)
  };
  const mockProduct: Product = {
    ...mockProductDto,
    id: 'a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890',
    tenantId: 'tenant-123-xyz',
    currentStock: 0.0,
    category: {
      id: mockProductDto.categoryId,
      tenantId: 'tenant-123-xyz',
      name: 'Bebidas',
      isActive: true,
      createdAt: new Date('2026-07-01T10:00:00Z'),
      updatedAt: new Date('2026-07-01T10:00:00Z'),
      products: [],
    },

    createdAt: new Date('2026-07-15T19:00:00Z'),
    updatedAt: new Date('2026-07-15T19:00:00Z'),
  };

  describe('createProduct', () => {
    const response: IProductsResponse<ProductDto> = {
      message: EProductsSuccess.CREATE,
      data: mockProduct,
    };

    it('should return product when it is create', async () => {
      mockRepository.createProduct.mockResolvedValue(mockProduct);
      mockRepository.findOneBySku.mockResolvedValue(null);
      expect(await service.createProduct(mockProductDto)).toEqual(response);
      expect(mockRepository.createProduct).toHaveBeenCalledWith(mockProductDto);
    });

    it('should return ConflictException when the product is found in find', async () => {
      mockRepository.findOneBySku.mockResolvedValue(mockProduct);
      await expect(service.createProduct(mockProductDto)).rejects.toThrow(
        new ConflictException(EProductsError.CONFLICT_PRODUCT),
      );
      expect(mockRepository.findOneBySku).toHaveBeenCalledWith(
        mockProductDto.sku,
      );
    });
  });

  describe('findOneBySku', () => {
    it('Should return product entity when it is exists', async () => {
      mockRepository.findOneBySku.mockResolvedValue(mockProduct);
      expect(await service.findOneBySku(mockProduct.sku)).toEqual({
        message: EProductsSuccess.FIND_ONE,
        data: mockProduct,
      });
      expect(mockRepository.findOneBySku).toHaveBeenCalledWith(mockProduct.sku);
    });

    it('should return NotFoundException when product not found', async () => {
      mockRepository.findOneBySku.mockResolvedValue(null);
      await expect(service.findOneBySku(mockProductDto.sku)).rejects.toThrow(
        new NotFoundException(EProductsError.PRODUCT_NOT_FOUND),
      );
    });
  });
});
