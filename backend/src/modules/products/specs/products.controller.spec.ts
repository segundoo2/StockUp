/* eslint-disable @typescript-eslint/unbound-method */
import { ProductDto } from '../dtos/product.dto';
import { EProductsSuccess } from '../enums/products-success.enum';
import { IProductsResponse } from '../interfaces/products-response.interface';
import { IProductsController } from '../interfaces/products.controller.interface';
import { IProductsService } from '../interfaces/products.service.interface';
import { ProductsController } from '../products.controller';

describe('ProductsController', () => {
  let controller: IProductsController;
  let mockService: jest.Mocked<IProductsService>;

  beforeEach(() => {
    mockService = {
      createProduct: jest.fn(),
    };
    controller = new ProductsController(mockService);
  });

  describe('createProduct', () => {
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

    const response: IProductsResponse<ProductDto> = {
      message: EProductsSuccess.CREATE,
      data: mockProductDto,
    };

    it('should return product when it is create', async () => {
      mockService.createProduct.mockResolvedValue(response);
      expect(await controller.createProduct(mockProductDto)).toEqual(response);
      expect(mockService.createProduct).toHaveBeenCalledWith(mockProductDto);
    });
  });
});
