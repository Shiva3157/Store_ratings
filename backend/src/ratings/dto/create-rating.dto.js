const { IsNumber, IsInt, Min, Max } = require('class-validator');

class CreateRatingDto {
  @IsInt()
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating must be at most 5' })
  rating;

  @IsInt()
  storeId;

  @IsInt()
  userId;
}

module.exports = { CreateRatingDto };
