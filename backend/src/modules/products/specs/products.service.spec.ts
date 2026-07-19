/* eslint-disable @typescript-eslint/unbound-method */
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ProductDto } from '../dtos/product.dto';
import { Product } from '../entities/product.entity';
import { EProductsSuccess } from '../../../enum/products-success.enum';
import { EProductsErrors } from '../../../enum/products-errors.enum'; // Ajustado conforme nomenclatura padrão de erros
import { IProductsRepository } from '../interfaces/products.repository.interface';
import { IProductsService } from '../interfaces/products.service.interface';
import { IResponse } from '../../../interfaces/response.interface';
import { ProductsService } from '../products.service';
import { DeleteResult } from 'typeorm';

describe('ProductsService', () => {
  let service: IProductsService;
  let mockRepository: jest.Mocked<IProductsRepository>;

  const mockProductDto: ProductDto = {
    tenantId: '1',
    sku: 'PROD-ALFA-001',
    name: 'Refrigerante Cola 350ml',
    uom: 'UN',
    minimumStock: 10.0,
    price: 5.5,
    costPrice: 2.8,
    categoryId: 'd3b07384-d113-4ec6-a5d6-c1c234567890',
    ean: '7891234567890',
    ncm: '22021000',
    cest: '0300700',
    origin: '0',
    csosn: '102',
    cst: null,
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

  beforeEach(() => {
    mockRepository = {
      createProduct: jest.fn(),
      findOneBySku: jest.fn(),
      findAllProducts: jest.fn(),
      deleteProduct: jest.fn(),
    };

    service = new ProductsService(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createProduct', () => {
    const response: IResponse<null> = {
      message: EProductsSuccess.CREATE,
      data: null,
    };

    it('should return product when it is create', async () => {
      mockRepository.findOneBySku.mockResolvedValue(null);
      mockRepository.createProduct.mockResolvedValue(mockProduct);

      expect(await service.createProduct(mockProductDto)).toEqual(response);
      expect(mockRepository.findOneBySku).toHaveBeenCalledWith(
        mockProductDto.sku,
        mockProductDto.tenantId,
      );
      expect(mockRepository.createProduct).toHaveBeenCalledWith(mockProductDto);
    });

    it('should throw ConflictException when the product SKU already exists', async () => {
      mockRepository.createProduct.mockRejectedValue(
        new ConflictException(EProductsErrors.PRODUCT_EXIST),
      );
      await expect(service.createProduct(mockProductDto)).rejects.toThrow(
        new ConflictException(EProductsErrors.PRODUCT_EXIST),
      );
      expect(mockRepository.createProduct).toHaveBeenCalledWith(mockProductDto);
    });
  });

  describe('findOneBySku', () => {
    it('should return product entity when it exists', async () => {
      mockRepository.findOneBySku.mockResolvedValue(mockProduct);

      expect(
        await service.findOneBySku(mockProduct.sku, mockProduct.tenantId),
      ).toEqual({
        message: EProductsSuccess.FIND_ONE,
        data: mockProduct,
      });
      expect(mockRepository.findOneBySku).toHaveBeenCalledWith(
        mockProduct.sku,
        mockProduct.tenantId,
      );
    });

    it('should throw NotFoundException when product not found', async () => {
      mockRepository.findOneBySku.mockResolvedValue(null);

      await expect(
        service.findOneBySku(mockProductDto.sku, mockProductDto.tenantId),
      ).rejects.toThrow(
        new NotFoundException(EProductsErrors.PRODUCT_NOT_FOUND),
      );
      expect(mockRepository.findOneBySku).toHaveBeenCalledWith(
        mockProductDto.sku,
        mockProductDto.tenantId,
      );
    });
  });

  describe('findAllProduct', () => {
    it("should return list product when it's is found", async () => {
      const response: IResponse<Product[]> = {
        message: EProductsSuccess.FIND_ALL,
        data: [mockProduct, mockProduct, mockProduct],
      };
      mockRepository.findAllProducts.mockResolvedValue(response.data);
      expect(await service.findAllProducts(mockProductDto.tenantId)).toEqual(
        response,
      );
      expect(mockRepository.findAllProducts).toHaveBeenCalledWith(
        mockProductDto.tenantId,
      );
    });

    it('should return NotFoundException when the products not found', async () => {
      mockRepository.findAllProducts.mockResolvedValue([]);
      await expect(
        service.findAllProducts(mockProductDto.tenantId),
      ).rejects.toThrow(
        new NotFoundException(EProductsErrors.PRODUCT_NOT_FOUND),
      );
    });
  });

  describe('deleteProduct', () => {
    const response: IResponse<null> = {
      message: EProductsSuccess.DELETE,
      data: null,
    };
    const responseRepository: DeleteResult = {
      raw: [],
      affected: 1,
    };

    it('should return a success message when the product is delete success', async () => {
      mockRepository.deleteProduct.mockResolvedValue(responseRepository);
      expect(
        await service.deleteProduct(mockProduct.sku, mockProduct.tenantId),
      ).toEqual(response);
      expect(mockRepository.deleteProduct).toHaveBeenCalledWith(
        mockProduct.sku,
        mockProduct.tenantId,
      );
    });

    it('should return NotFoundException when the product not found', async () => {
      responseRepository.affected = 0;
      mockRepository.deleteProduct.mockResolvedValue(responseRepository);
      await expect(
        service.deleteProduct(mockProduct.sku, mockProduct.tenantId),
      ).rejects.toThrow(
        new NotFoundException(EProductsErrors.PRODUCT_NOT_FOUND),
      );
    });
  });
});
