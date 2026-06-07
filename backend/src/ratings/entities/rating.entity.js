const { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } = require('typeorm');
const User = require('../../users/entities/user.entity');
const Store = require('../../stores/entities/store.entity');

@Entity('ratings')
class Rating {
  @PrimaryGeneratedColumn()
  id;

  @Column()
  rating;

  @ManyToOne(() => User, user => user.ratings)
  user;

  @ManyToOne(() => Store, store => store.ratings)
  store;

  @CreateDateColumn()
  createdAt;

  @UpdateDateColumn()
  updatedAt;
}

module.exports = { Rating };
