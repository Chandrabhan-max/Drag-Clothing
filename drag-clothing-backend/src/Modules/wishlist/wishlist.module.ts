import { Module } from '@nestjs/common';
import { WishlistController } from './wishlist.controller';
import { WishlistService } from './wishlist.service';
import { CommonModule } from 'src/common/common.module';
@Module({
  imports: [CommonModule],
  controllers: [WishlistController],
  providers: [WishlistService],
})
export class WishlistModule {}
