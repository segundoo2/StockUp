import { Module } from '@nestjs/common';
import { MovementsService } from './movements.service';
import { MovementsController } from './movements.controller';
import { MovementsRepository } from './movements.repository';

@Module({
  controllers: [MovementsController],
  providers: [
    { provide: 'IMovementsService', useClass: MovementsService },
    { provide: 'IMovementsRepository', useClass: MovementsRepository },
  ],
})
export class MovementsModule {}
