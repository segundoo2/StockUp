import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';
import { EPermission } from '../../../enum/permissions.enum';
import { ERolesErrors } from '../../../enum/roles-errors.enum';

export class RoleDto {
  tenantId!: string;

  @ApiProperty({
    description: 'Nome da role único por tenant',
    example: 'Operador',
    minLength: 2,
    maxLength: 50,
  })
  @IsString({ message: ERolesErrors.NAME_STRING })
  @IsNotEmpty({ message: ERolesErrors.NAME_REQUIRED })
  @Length(2, 50, { message: ERolesErrors.NAME_REQUIRED })
  name!: string;

  @ApiProperty({
    description: 'Permissões atribuídas à role',
    enum: EPermission,
    isArray: true,
    example: [EPermission.PRODUCTS_READ, EPermission.PRODUCTS_CREATE],
  })
  @IsArray({ message: ERolesErrors.PERMISSIONS_REQUIRED })
  @ArrayNotEmpty({ message: ERolesErrors.PERMISSIONS_REQUIRED })
  @IsEnum(EPermission, { each: true, message: ERolesErrors.PERMISSION_INVALID })
  permissions!: EPermission[];
}
