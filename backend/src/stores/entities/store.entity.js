const { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } = require('typeorm');
const User = require('../../users/entities/user.entity');
const Rating = require('../../ratings/entities/rating.entity');

@Entity('stores')
class Store {
  @PrimaryGeneratedColumn()
  id;

  @Column({ length: 60 })
  name;

  @Column({ unique: true })
  email;

  @Column({ length: 400 })
  address;

  @ManyToOne(() => User, user => user.stores)
  owner;

  @OneToMany(() => Rating, rating => rating.store)
  ratings;

  @CreateDateColumn()
  createdAt;

  @UpdateDateColumn()
  updatedAt;
}

module.exports = { Store };
