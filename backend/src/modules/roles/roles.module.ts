import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { User } from '../users/entities/user.entity';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { RolesRepository } from './roles.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Role, User])],
  controllers: [RolesController],
  providers: [
    { provide: 'IRolesService', useClass: RolesService },
    { provide: 'IRolesRepository', useClass: RolesRepository },
  ],
  exports: ['IRolesService', 'IRolesRepository'],
})
export class RolesModule {}
