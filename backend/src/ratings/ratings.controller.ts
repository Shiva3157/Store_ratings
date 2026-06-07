import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Ratings')
@Controller('ratings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  @Roles(UserRole.USER)
  @ApiOperation({ summary: 'Create a new rating (User only)' })
  @ApiResponse({ status: 201, description: 'Rating created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - User access required' })
  async create(@Body() createRatingDto: CreateRatingDto, @Request() req) {
    createRatingDto.userId = req.user.userId;
    return this.ratingsService.create(createRatingDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all ratings (Admin only)' })
  @ApiResponse({ status: 200, description: 'Ratings retrieved successfully' })
  findAll() {
    return this.ratingsService.findAll();
  }

  @Get('store/:storeId')
  @ApiOperation({ summary: 'Get ratings for a specific store' })
  @ApiResponse({ status: 200, description: 'Store ratings retrieved successfully' })
  getStoreRatings(@Param('storeId') storeId: string) {
    return this.ratingsService.getStoreRatings(+storeId);
  }

  @Get('user/:userId/store/:storeId')
  @ApiOperation({ summary: 'Get user rating for a specific store' })
  @ApiResponse({ status: 200, description: 'User rating retrieved successfully' })
  getUserRatingForStore(@Param('userId') userId: string, @Param('storeId') storeId: string) {
    return this.ratingsService.getUserRatingForStore(+userId, +storeId);
  }

  @Patch('store/:storeId')
  @Roles(UserRole.USER)
  @ApiOperation({ summary: 'Update user rating for a store (User only)' })
  @ApiResponse({ status: 200, description: 'Rating updated successfully' })
  async updateRating(
    @Param('storeId') storeId: string,
    @Body() updateRatingDto: UpdateRatingDto,
    @Request() req,
  ) {
    return this.ratingsService.updateUserRatingForStore(
      req.user.userId,
      +storeId,
      updateRatingDto.rating,
    );
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get rating by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Rating retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Rating not found' })
  findOne(@Param('id') id: string) {
    return this.ratingsService.findOne(+id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update rating (Admin only)' })
  @ApiResponse({ status: 200, description: 'Rating updated successfully' })
  @ApiResponse({ status: 404, description: 'Rating not found' })
  update(@Param('id') id: string, @Body() updateRatingDto: UpdateRatingDto) {
    return this.ratingsService.update(+id, updateRatingDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete rating (Admin only)' })
  @ApiResponse({ status: 200, description: 'Rating deleted successfully' })
  @ApiResponse({ status: 404, description: 'Rating not found' })
  remove(@Param('id') id: string) {
    return this.ratingsService.remove(+id);
  }

  @Get('dashboard/store-owner')
  @Roles(UserRole.STORE_OWNER)
  @ApiOperation({ summary: 'Get store owner dashboard (Store Owner only)' })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved successfully' })
  getStoreOwnerDashboard(@Request() req) {
    return this.ratingsService.getStoreOwnerDashboard(req.user.userId);
  }
}
