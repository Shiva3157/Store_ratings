const { IsEmail, IsString, IsNumber } = require('class-validator');

class CreateStoreDto {
  @IsString()
  name;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  email;

  @IsString()
  address;

  @IsNumber()
  ownerId;
}

module.exports = { CreateStoreDto };
