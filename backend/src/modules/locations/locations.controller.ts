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
import { IResponse } from '../../interfaces/response.interface';
import { LocationDto } from './dtos/location.dto';
import { Location } from './entities/location.entity';
import { TenantId } from '../../decorators/tenant-id.decorator';
import { EErrorsGlobal } from '../../enum/errors-global.enum';
import { UpdateDescriptionLocationDto } from './dtos/update-description-location.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { EPermission } from '../../enum/permissions.enum';
import { PermissionGuard } from '../../guards/permission.guard';
import { RequiresPermission } from '../../decorators/permission.decorator';

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
    return await this.service.createLocation({ ...locationDto, tenantId });
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
