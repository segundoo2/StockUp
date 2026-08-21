import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { EPermission } from '../enum/permissions.enum';

export const PERMISSIONS_KEY = 'permissions';

export const RequiresPermission = (
  ...permissions: EPermission[]
): CustomDecorator<string> => SetMetadata(PERMISSIONS_KEY, permissions);
