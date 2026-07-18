/* eslint-disable @typescript-eslint/unbound-method */
import { IResponse } from '../../../interfaces/response.interface';
import { ProductDto } from '../dtos/product.dto';
import { Product } from '../entities/product.entity';
import { EProductsSuccess } from '../../../enum/products-success.enum';
import { IProductsController } from '../interfaces/products.controller.interface';
import { IProductsService } from '../interfaces/products.service.interface';
import { ProductsController } from '../products.controller';

describe('ProductsController', () => {
  let controller: IProductsController;
  let mockService: jest.Mocked<IProductsService>;

  beforeEach(() => {
    mockService = {
      createProduct: jest.fn(),
      findOneBySku: jest.fn(),
      findAllProducts: jest.fn(),
    };
    controller = new ProductsController(mockService);
  });

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

  describe('createProduct', () => {
    const response: IResponse<null> = {
      message: EProductsSuccess.CREATE,
      data: null,
    };
    it('should return product when it is create', async () => {
      mockService.createProduct.mockResolvedValue(response);
      expect(
        await controller.createProduct(mockProductDto, mockProductDto.tenantId),
      ).toEqual(response);
      expect(mockService.createProduct).toHaveBeenCalledWith(mockProductDto);
    });
  });

  describe('findOneBySku', () => {
    const response: IResponse<Product> = {
      message: EProductsSuccess.CREATE,
      data: mockProduct,
    };
    it('should return a product when it is found', async () => {
      mockService.findOneBySku.mockResolvedValue(response);
      expect(
        await controller.findOneBySku(
          mockProductDto.sku,
          mockProductDto.tenantId,
        ),
      ).toEqual(response);
      expect(mockService.findOneBySku).toHaveBeenCalledWith(
        mockProductDto.sku,
        mockProductDto.tenantId,
      );
    });
  });

  describe('findAllProducts', () => {
    it("should return all products when it's is found", async () => {
      const response: IResponse<Product[]> = {
        message: EProductsSuccess.FIND_ALL,
        data: [mockProduct, mockProduct, mockProduct],
      };
      mockService.findAllProducts.mockResolvedValue(response);
      expect(await controller.findAllProducts(mockProductDto.tenantId)).toEqual(
        response,
      );
      expect(mockService.findAllProducts).toHaveBeenCalledWith(
        mockProductDto.tenantId,
      );
    });
  });
});
