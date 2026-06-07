const { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } = require('typeorm');
const Rating = require('../../ratings/entities/rating.entity');
const Store = require('../../stores/entities/store.entity');

const UserRole = {
  ADMIN: 'admin',
  USER: 'user',
  STORE_OWNER: 'store_owner',
};

@Entity('users')
class User {
  @PrimaryGeneratedColumn()
  id;

  @Column({ length: 60 })
  name;

  @Column({ unique: true })
  email;

  @Column({ length: 400 })
  address;

  @Column()
  password;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role;

  @OneToMany(() => Store, store => store.owner)
  stores;

  @OneToMany(() => Rating, rating => rating.user)
  ratings;

  @CreateDateColumn()
  createdAt;

  @UpdateDateColumn()
  updatedAt;
}

module.exports = { User, UserRole };
