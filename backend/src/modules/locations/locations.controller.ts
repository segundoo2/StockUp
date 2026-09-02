import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
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
import type { ILocationsService } from './interfaces/locations.service.interface';
import { IResponse } from '../../common/interfaces/response.interface';
import { LocationDto } from './dtos/location.dto';
import { Location } from './entities/location.entity';
import { EErrorsGlobal } from '../../common/enum/errors-global.enum';
import { UpdateDescriptionLocationDto } from './dtos/update-description-location.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { EPermission } from '../../common/enum/permissions.enum';
import { ELocationSuccessMessage } from '../../common/enum/location-success.enum';
import { RequiresPermission } from '../../common/decorators/permission.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { PaginationQueryDto } from '../../common/dtos/pagination-query.dto';
import { IPaginatedResponse } from '../../common/interfaces/paginated-response.interface';

@ApiTags('Locations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('locations')
export class LocationsController implements ILocationsController {
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
    return await this.service.createLocation({
      ...locationDto,
      tenantId,
    });
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
    if (!code || !tenantId) {
      throw new BadRequestException(EErrorsGlobal.INVALID_DATA);
    }

    return await this.service.findByCode(code, tenantId);
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
  ): Promise<IPaginatedResponse<Location>> {
    return await this.service.findAllLocations(tenantId, query);
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
    if (!code || !tenantId) {
      throw new BadRequestException(EErrorsGlobal.INVALID_DATA);
    }

    return await this.service.updateCodeLocation(code, tenantId);
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
    return await this.service.updateDescriptionLocation(
      updateDescriptionLocation,
      tenantId,
    );
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
    return await this.service.deleteLocation(code, tenantId);
  }
}
