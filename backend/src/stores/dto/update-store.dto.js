const { PartialType } = require('@nestjs/mapped-types');
const { CreateStoreDto } = require('./create-store.dto');

class UpdateStoreDto extends PartialType(CreateStoreDto) {}

module.exports = { UpdateStoreDto };
