import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ILocationsController } from './interfaces/locations.controller.interface';
import type {
  ILocationsService,
  IPaginatedResponse,
} from './interfaces/locations.service.interface';
import { IResponse } from '../../interfaces/response.interface';
import { LocationDto } from './dtos/location.dto';
import { Location } from './entities/location.entity';
import { TenantId } from '../../decorators/tenant-id.decorator';
import { EErrorsGlobal } from '../../enum/errors-global.enum';
import { UpdateDescriptionLocationDto } from './dtos/update-description-location.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { PermissionGuard } from '../../guards/permission.guard';
import { RequiresPermission } from '../../decorators/permission.decorator';
import { EPermission } from '../../enum/permissions.enum';
import { ELocationSuccessMessage } from '../../enum/location-success.enum';
import { PaginationQueryDto } from './dtos/pagination-query.dto';

@ApiTags('Locations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('locations')
export class LocationsController implements ILocationsController {
  private readonly logger = new Logger(LocationsController.name);

  constructor(
    @Inject('ILocationsService')
    private readonly service: ILocationsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequiresPermission(EPermission.LOCATION_CREATE)
  @ApiOperation({
    summary: 'Criar nova localização',
    description:
      'Cadastra uma nova localização associada ao tenant autenticado.',
  })
  @ApiCreatedResponse({ description: 'Localização criada com sucesso.' })
  @ApiBadRequestResponse({ description: 'Dados de entrada inválidos.' })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou expirado.',
  })
  @ApiForbiddenResponse({
    description: 'Acesso negado: permissão insuficiente.',
  })
  async createLocation(
    @TenantId() tenantId: string,
    @Body() locationDto: LocationDto,
  ): Promise<IResponse<null>> {
    try {
      this.logger.log(
        `Tentativa de criação de localização "${locationDto.code}" no tenant "${tenantId}".`,
      );

      const result = await this.service.createLocation({
        ...locationDto,
        tenantId,
      });

      this.logger.log(
        `Localização "${locationDto.code}" criada com sucesso para o tenant "${tenantId}".`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Erro ao criar localização "${locationDto.code}" no tenant "${tenantId}": ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  @Get(':code')
  @HttpCode(HttpStatus.OK)
  @RequiresPermission(EPermission.LOCATION_FIND)
  @ApiOperation({
    summary: 'Buscar localização por código',
    description:
      'Retorna os detalhes de uma localização pelo seu código único.',
  })
  @ApiParam({
    name: 'code',
    description: 'Código identificador da localização',
  })
  @ApiOkResponse({
    description: 'Localização encontrada com sucesso.',
    type: Location,
  })
  @ApiBadRequestResponse({ description: 'Código ou TenantId inválidos.' })
  @ApiNotFoundResponse({ description: 'Localização não encontrada.' })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou expirado.',
  })
  @ApiForbiddenResponse({
    description: 'Acesso negado: permissão insuficiente.',
  })
  async findByCode(
    @Param('code') code: string,
    @TenantId() tenantId: string,
  ): Promise<IResponse<Location>> {
    try {
      if (!code || !tenantId) {
        this.logger.warn(
          `Tentativa de busca com dados inválidos. Code: "${code}", TenantId: "${tenantId}".`,
        );
        throw new BadRequestException(EErrorsGlobal.INVALID_DATA);
      }

      this.logger.log(
        `Buscando localização pelo código "${code}" no tenant "${tenantId}".`,
      );
      return await this.service.findByCode(code, tenantId);
    } catch (error) {
      this.logger.error(
        `Erro ao buscar localização "${code}" no tenant "${tenantId}": ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @RequiresPermission(EPermission.LOCATION_FIND)
  @ApiOperation({
    summary: 'Listar localizações paginadas',
    description:
      'Retorna a lista paginada de localizações pertencentes ao tenant do usuário autenticado.',
  })
  @ApiOkResponse({
    description: 'Lista paginada de localizações retornada com sucesso.',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: ELocationSuccessMessage.FIND_ALL },
        data: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/Location' },
            },
            meta: {
              type: 'object',
              properties: {
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 10 },
                total: { type: 'number', example: 42 },
                totalPages: { type: 'number', example: 5 },
              },
            },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Parâmetros de paginação inválidos.' })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou expirado.',
  })
  @ApiForbiddenResponse({
    description: 'Acesso negado: permissão insuficiente.',
  })
  async findAllLocations(
    @TenantId() tenantId: string,
    @Query() query: PaginationQueryDto,
  ): Promise<IResponse<IPaginatedResponse<Location>>> {
    try {
      this.logger.log(
        `Listando localizações paginadas para o tenant "${tenantId}". Página: ${query.page}, Limite: ${query.limit}.`,
      );

      const result = await this.service.findAllLocations(tenantId, query);

      return result;
    } catch (error) {
      this.logger.error(
        `Erro ao buscar localizações paginadas no tenant "${tenantId}": ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  @Patch(':code/code')
  @HttpCode(HttpStatus.OK)
  @RequiresPermission(EPermission.LOCATION_UPDATE)
  @ApiOperation({
    summary: 'Atualizar código da localização',
    description:
      'Atualiza a chave/código de identificação de uma localização existente.',
  })
  @ApiParam({ name: 'code', description: 'Código atual da localização' })
  @ApiOkResponse({
    description: 'Código da localização atualizado com sucesso.',
  })
  @ApiBadRequestResponse({ description: 'Dados informados inválidos.' })
  @ApiNotFoundResponse({ description: 'Localização não encontrada.' })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou expirado.',
  })
  @ApiForbiddenResponse({
    description: 'Acesso negado: permissão insuficiente.',
  })
  async updateCodeLocation(
    @Param('code') code: string,
    @TenantId() tenantId: string,
  ): Promise<IResponse<null>> {
    try {
      if (!code || !tenantId) {
        this.logger.warn(
          `Tentativa de atualização de código com dados inválidos. Code: "${code}", TenantId: "${tenantId}".`,
        );
        throw new BadRequestException(EErrorsGlobal.INVALID_DATA);
      }

      this.logger.log(
        `Atualizando código da localização "${code}" no tenant "${tenantId}".`,
      );

      const result = await this.service.updateCodeLocation(code, tenantId);

      this.logger.log(
        `Código da localização "${code}" atualizado com sucesso.`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Erro ao atualizar código da localização "${code}" no tenant "${tenantId}": ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  @Patch('description')
  @HttpCode(HttpStatus.OK)
  @RequiresPermission(EPermission.LOCATION_UPDATE)
  @ApiOperation({
    summary: 'Atualizar descrição da localização',
    description: 'Atualiza o texto descritivo de uma localização.',
  })
  @ApiOkResponse({ description: 'Descrição atualizada com sucesso.' })
  @ApiBadRequestResponse({ description: 'Dados de entrada inválidos.' })
  @ApiNotFoundResponse({ description: 'Localização não encontrada.' })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou expirado.',
  })
  @ApiForbiddenResponse({
    description: 'Acesso negado: permissão insuficiente.',
  })
  async updateDescriptionLocation(
    @Body() updateDescriptionLocation: UpdateDescriptionLocationDto,
    @TenantId() tenantId: string,
  ): Promise<IResponse<null>> {
    try {
      this.logger.log(
        `Atualizando descrição da localização "${updateDescriptionLocation.code}" no tenant "${tenantId}".`,
      );

      const result = await this.service.updateDescriptionLocation(
        updateDescriptionLocation,
        tenantId,
      );

      this.logger.log(
        `Descrição da localização "${updateDescriptionLocation.code}" atualizada com sucesso.`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Erro ao atualizar descrição da localização "${updateDescriptionLocation.code}" no tenant "${tenantId}": ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  @Delete(':code')
  @HttpCode(HttpStatus.OK)
  @RequiresPermission(EPermission.LOCATION_DELETE)
  @ApiOperation({
    summary: 'Deletar localização',
    description: 'Remove um registro de localização pelo código.',
  })
  @ApiParam({
    name: 'code',
    description: 'Código da localização a ser removida',
  })
  @ApiOkResponse({ description: 'Localização removida com sucesso.' })
  @ApiNotFoundResponse({ description: 'Localização não encontrada.' })
  @ApiUnauthorizedResponse({
    description: 'Token de acesso inválido ou expirado.',
  })
  @ApiForbiddenResponse({
    description: 'Acesso negado: permissão insuficiente.',
  })
  async deleteLocation(
    @Param('code') code: string,
    @TenantId() tenantId: string,
  ): Promise<IResponse<null>> {
    try {
      this.logger.warn(
        `Solicitação de remoção da localização "${code}" no tenant "${tenantId}".`,
      );

      const result = await this.service.deleteLocation(code, tenantId);

      this.logger.log(
        `Localização "${code}" removida com sucesso do tenant "${tenantId}".`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Erro ao remover localização "${code}" no tenant "${tenantId}": ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }
}
