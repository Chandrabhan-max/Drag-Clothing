import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Req,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtGuard } from '../Auth/guards/jwt.guard';
import { CreateReviewDto } from './dto/reviews.dto';

@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post('products/:productId/reviews')
  @UseGuards(JwtGuard)
  async createReview(
    @Req() req,
    @Param('productId') productId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.createReview(req.user, productId, dto);
  }

  @Get('products/:productId/reviews')
  async getProductReviews(@Param('productId') productId: string) {
    return this.reviewsService.getProductReviews(productId);
  }

  @Delete('reviews/:id')
  @UseGuards(JwtGuard)
  async deleteReview(@Req() req, @Param('id') id: string) {
    return this.reviewsService.deleteReview(req.user, id);
  }
}
