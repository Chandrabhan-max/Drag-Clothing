export class CreateManagerDiscountDto {
  productId: string;
  percentage: number;
  startDate: string | Date;
  endDate: string | Date;
}
