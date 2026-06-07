import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from './entities/rating.entity';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating)
    private ratingRepository: Repository<Rating>,
  ) {}

  async create(createRatingDto: CreateRatingDto): Promise<Rating> {
    const existingRating = await this.ratingRepository.findOne({
      where: {
        user: { id: createRatingDto.userId },
        store: { id: createRatingDto.storeId },
      },
      relations: {
        user: true,
        store: true,
      },
    });

    if (existingRating) {
      throw new ConflictException('User has already rated this store');
    }

    const rating = this.ratingRepository.create(createRatingDto);
    return this.ratingRepository.save(rating);
  }

  async findAll(): Promise<Rating[]> {
    return this.ratingRepository.find({
      relations: {
        user: true,
        store: true,
      },
    });
  }

  async findOne(id: number): Promise<Rating> {
    const rating = await this.ratingRepository.findOne({
      where: { id },
      relations: {
        user: true,
        store: true,
      },
    });

    if (!rating) {
      throw new NotFoundException(`Rating with ID ${id} not found`);
    }

    return rating;
  }

  async update(id: number, updateRatingDto: UpdateRatingDto): Promise<Rating> {
    const rating = await this.findOne(id);
    Object.assign(rating, updateRatingDto);
    return this.ratingRepository.save(rating);
  }

  async remove(id: number): Promise<void> {
    const rating = await this.findOne(id);
    await this.ratingRepository.remove(rating);
  }

  async getUserRatingForStore(userId: number, storeId: number): Promise<Rating | null> {
    return this.ratingRepository.findOne({
      where: {
        user: { id: userId },
        store: { id: storeId },
      },
      relations: {
        user: true,
        store: true,
      },
    });
  }

  async updateUserRatingForStore(userId: number, storeId: number, rating: number): Promise<Rating> {
    const existingRating = await this.getUserRatingForStore(userId, storeId);

    if (existingRating) {
      existingRating.rating = rating;
      return this.ratingRepository.save(existingRating);
    } else {
      const createRatingDto: CreateRatingDto = {
        rating,
        userId,
        storeId,
      };
      return this.create(createRatingDto);
    }
  }

  async getStoreRatings(storeId: number): Promise<Rating[]> {
    return this.ratingRepository.find({
      where: { store: { id: storeId } },
      relations: {
        user: true,
        store: true,
      },
    });
  }

  async getStoreOwnerDashboard(storeOwnerId: number): Promise<any> {
    const ratings = await this.ratingRepository
      .createQueryBuilder('rating')
      .leftJoinAndSelect('rating.user', 'user')
      .leftJoinAndSelect('rating.store', 'store')
      .where('store.ownerId = :storeOwnerId', { storeOwnerId })
      .getMany();

    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length
      : 0;

    return {
      ratings,
      averageRating: parseFloat(averageRating.toFixed(2)),
      totalRatings: ratings.length,
    };
  }
}
