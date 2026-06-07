import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from './entities/store.entity';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
  ) {}

  async create(createStoreDto: CreateStoreDto): Promise<Store> {
    const existingStore = await this.storeRepository.findOne({
      where: { email: createStoreDto.email },
    });

    if (existingStore) {
      throw new ConflictException('Store with this email already exists');
    }

    const store = this.storeRepository.create(createStoreDto);
    return this.storeRepository.save(store);
  }

  async findAll(): Promise<Store[]> {
    return this.storeRepository.find({
      relations: {
        owner: true,
        ratings: true,
      },
    });
  }

  async findOne(id: number): Promise<Store> {
    const store = await this.storeRepository.findOne({
      where: { id },
      relations: {
        owner: true,
        ratings: true,
      },
    });

    if (!store) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }

    return store;
  }

  async update(id: number, updateStoreDto: UpdateStoreDto): Promise<Store> {
    const store = await this.findOne(id);

    if (updateStoreDto.email && updateStoreDto.email !== store.email) {
      const existingStore = await this.storeRepository.findOne({
        where: { email: updateStoreDto.email },
      });

      if (existingStore) {
        throw new ConflictException('Store with this email already exists');
      }
    }

    Object.assign(store, updateStoreDto);
    return this.storeRepository.save(store);
  }

  async remove(id: number): Promise<void> {
    const store = await this.findOne(id);
    await this.storeRepository.remove(store);
  }

  async searchStores(filters: {
    name?: string;
    address?: string;
  }): Promise<Store[]> {
    const queryBuilder = this.storeRepository.createQueryBuilder('store')
      .leftJoinAndSelect('store.owner', 'owner')
      .leftJoinAndSelect('store.ratings', 'ratings');

    if (filters.name) {
      queryBuilder.andWhere('store.name ILIKE :name', { name: `%${filters.name}%` });
    }

    if (filters.address) {
      queryBuilder.andWhere('store.address ILIKE :address', { address: `%${filters.address}%` });
    }

    return queryBuilder.getMany();
  }

  async getStoreWithAverageRating(id: number): Promise<any> {
    const store = await this.storeRepository.findOne({
      where: { id },
      relations: {
        owner: true,
        ratings: true,
      },
    });

    if (!store) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }

    const averageRating = store.ratings.length > 0
      ? store.ratings.reduce((sum, rating) => sum + rating.rating, 0) / store.ratings.length
      : 0;

    return {
      ...store,
      averageRating: parseFloat(averageRating.toFixed(2)),
    };
  }

  async getStoresWithRatings(): Promise<any[]> {
    const stores = await this.storeRepository.find({
      relations: {
        owner: true,
        ratings: true,
      },
    });

    return stores.map(store => {
      const averageRating = store.ratings.length > 0
        ? store.ratings.reduce((sum, rating) => sum + rating.rating, 0) / store.ratings.length
        : 0;

      return {
        ...store,
        averageRating: parseFloat(averageRating.toFixed(2)),
      };
    });
  }
}
