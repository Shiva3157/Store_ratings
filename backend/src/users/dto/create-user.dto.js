const { IsEmail, IsString, IsEnum, MinLength, MaxLength, Matches } = require('class-validator');
const { UserRole } = require('../entities/user.entity');

class CreateUserDto {
  @IsString()
  @MinLength(20, { message: 'Name must be at least 20 characters long' })
  @MaxLength(60, { message: 'Name must not exceed 60 characters' })
  name;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  email;

  @IsString()
  @MaxLength(400, { message: 'Address must not exceed 400 characters' })
  address;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(16, { message: 'Password must not exceed 16 characters' })
  @Matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/, {
    message: 'Password must contain at least one uppercase letter and one special character',
  })
  password;

  @IsEnum(UserRole)
  role;
}

module.exports = { CreateUserDto };
