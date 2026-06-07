const { PartialType } = require('@nestjs/mapped-types');
const { CreateRatingDto } = require('./create-rating.dto');

class UpdateRatingDto extends PartialType(CreateRatingDto) {}

module.exports = { UpdateRatingDto };
