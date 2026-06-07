const { PartialType } = require('@nestjs/mapped-types');
const { CreateUserDto } = require('./create-user.dto');

class UpdateUserDto extends PartialType(CreateUserDto) {}

module.exports = { UpdateUserDto };
