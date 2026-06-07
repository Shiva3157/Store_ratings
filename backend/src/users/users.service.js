const { Injectable, NotFoundException, ConflictException } = require('@nestjs/common');
const { InjectRepository } = require('@nestjs/typeorm');
const { Repository } = require('typeorm');
const bcrypt = require('bcryptjs');
const { User, UserRole } = require('./entities/user.entity');
const { CreateUserDto } = require('./dto/create-user.dto');
const { UpdateUserDto } = require('./dto/update-user.dto');

// Service for handling user operations
@Injectable()
class UsersService {
  constructor(
    @InjectRepository(User)
    userRepository,
  ) {
    this.userRepository = userRepository;
  }

  // Create a new user
  async create(createUserDto) {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    // Save user to database
    return this.userRepository.save(user);
  }

  async findAll() {
    return this.userRepository.find({
      relations: {
        stores: true,
        ratings: true,
      },
    });
  }

  async findOne(id) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: {
        stores: true,
        ratings: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(id, updateUserDto) {
    const user = await this.findOne(id);

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
    }

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(id) {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  async getDashboardStats() {
    const totalUsers = await this.userRepository.count();
    const totalStores = await this.userRepository.manager.count('stores');
    const totalRatings = await this.userRepository.manager.count('ratings');

    return {
      totalUsers,
      totalStores,
      totalRatings,
    };
  }

  async searchUsers(filters) {
    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.stores', 'stores')
      .leftJoinAndSelect('user.ratings', 'ratings');

    if (filters.name) {
      queryBuilder.andWhere('user.name ILIKE :name', { name: `%${filters.name}%` });
    }

    if (filters.email) {
      queryBuilder.andWhere('user.email ILIKE :email', { email: `%${filters.email}%` });
    }

    if (filters.address) {
      queryBuilder.andWhere('user.address ILIKE :address', { address: `%${filters.address}%` });
    }

    if (filters.role) {
      queryBuilder.andWhere('user.role = :role', { role: filters.role });
    }

    return queryBuilder.getMany();
  }
}

module.exports = { UsersService };
