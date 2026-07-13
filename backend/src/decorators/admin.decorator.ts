import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const RequiresAdmin = (): CustomDecorator<string> =>
  SetMetadata('requiresAdmin', true);
