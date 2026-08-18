import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/entities';
import { DataSource, Repository } from 'typeorm';
import * as Entity from '../../entities';
import { Gender } from 'src/common/enums/gender.enum';
@Injectable()
export class practice {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    private readonly dataSource: DataSource,
  ) {}

  async practiceone(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const kuchbhi = await queryRunner.manager
        .createQueryBuilder(Entity.Product, 'product')
        .where('Product.gender = :gender', { gender: Gender.MEN })
        .andWhere('Product.is_active =: is_active', { is_active: true });

      const Salary = await queryRunner.manager
        .createQueryBuilder(Entity.User, 'user')
        .orderBy('user.salary', 'DESC')
        .getOne();

      const groupby = await queryRunner.manager
        .createQueryBuilder(Entity.Order, 'order')
        .select('Order.user_id', 'user_id')
        .addSelect('count(order_id)', 'totalorder')
        .groupBy('Order.user_id')
        .getMany();

      const morethanthree = await queryRunner.manager
        .createQueryBuilder(Entity.Order, 'order')
        .select('order.user_id', 'user_id')
        .addSelect('COUNT(order.id)', 'totalorder')
        .groupBy('Order.user_id')
        .having('COUNT(order_id) > :count', { count: 3 })
        .getRawMany();

      const amountsum = await queryRunner.manager
        .createQueryBuilder(Entity.Order, 'order')
        .select('order.user_id', 'user_id')
        .addSelect('SUM(order.amount)', 'totalspent')
        .where('order.status = :status', { status: 'completed' })
        .groupBy('order.userid')
        .orderBy('totalspent', 'DESC')
        .limit(1);

      const avgsum = await queryRunner.manager
        .createQueryBuilder(Entity.Order, 'order')
        .select('AVG(order.amount)', 'AvgAmount')
        .where('order.status= :status', { status: 'completed' })
        .getRawOne();

      const total = await queryRunner.manager
        .createQueryBuilder(Entity.User, 'user')
        .select()
        .where('user.age >:age', { age: 18 })
        .andWhere('user.country =:country', { country: 'India' })
        .getMany();

      const secondtotal = await queryRunner.manager
        .createQueryBuilder(Entity.User, 'user')
        .select()
        .where('user.age >:age', { age: 18 })
        .andWhere('user.country =:country', { country: 'India' })
        .orderBy('user.age', 'DESC')
        .getMany();

      const limitme = await queryRunner.manager
        .createQueryBuilder(Entity.User, 'user')
        .select()
        .where('user.age >:age', { age: 18 })
        .andWhere('user.country =:country', { country: 'India' })
        .orderBy('user.createdAt', 'DESC')
        .limit(5)
        .getMany();

      const totalthree = await queryRunner.manager
        .createQueryBuilder(Entity.User, 'user')
        .where('user.country =:country', { country: 'India' })
        .getCount();

      const totalfour = await queryRunner.manager
        .createQueryBuilder(Entity.User, 'user')
        .where('user.age>:age', { age: 18 })
        .andWhere('user.country =:country', { country: 'India' })
        .getCount();

      const totafive = await queryRunner.manager
        .createQueryBuilder(Entity.User, 'user')
        .select('AVG(user.age)', 'avgAge')
        .where('user.country=:country', { country: 'India' })
        .getRawOne();

      const totalsix = await queryRunner.manager
        .createQueryBuilder(Entity.Order, 'order')
        .select('order.user_id', 'userid')
        .addSelect('SUM(order.amount)', 'totalspent')
        .groupBy('order.user_id')
        .having(' totalspent >:Avgamount')
        .getMany();

      const totalseven = await queryRunner.manager
        .createQueryBuilder(Entity.User, 'user')
        .innerJoin(Entity.Order, 'order', 'user.id = order.user_id')
        .select('user.name', 'order.amount')
        .where('order.amount > :amount', { amount: 500 })
        .getRawMany();

      const totaleight = await queryRunner.manager
        .createQueryBuilder(Entity.User, 'user')
        .innerJoin(Entity.Order, 'order', 'user.id = order.user_id')
        .select(['user.name'])
        .addSelect('COUNT(order.user_id)', 'totalorder')
        .groupBy('order.user_id')
        .getRawMany();

      const totalnine = await queryRunner.manager
        .createQueryBuilder(Entity.User, 'user')
        .innerJoin(Entity.Order, 'order', 'user.id = order.user_id')
        .select(['user.name'])
        .addSelect('SUM(order.amount)', 'totalamount')
        .where('order.status =:status', { status: 'Complete' })
        .groupBy('user.id')
        .getRawMany();

      const totalten = await queryRunner.manager
        .createQueryBuilder(Entity.User, 'u')
        .innerJoin(Entity.Order, 'o', 'u.id = o.user_id ')
        .select(['u.name', 'o.id', 'o.amount', 'o.status'])
        .where('o.user_id =:userId', { userId: id })
        .getRawMany();


     const totalproduct =  await queryRunner.manager
        .createQueryBuilder(Entity.User,"u")
        .leftJoin(Entity.Order,"o", "u.id = o.user_id")
        .select(["u.name"])
        .addSelect("COUNT(o.id)","totalorder")
        .groupBy("u.id")
        .getRawMany()



     const eleven = await queryRunner.manager
       .createQueryBuilder(Entity.User,"u")
       .innerJoin(Entity.Order,"o","u.id = o.user_id")
       .select(["u.id","u.name", "u.country"])
       .where("o.status =:status",{status :"completed"})
       .groupBy("u.id")
       .getRawMany()   


     const twelve = await queryRunner.manager
      .createQueryBuilder(Entity.User,"u")
      .innerJoin(Entity.Order,"o", "u.id = o.user_id")
      .select(["u.id","u.name", "u.country"])
      .addSelect("COUNT(o.id)","totalorder")
      .where("o.status = :status", {status: "completed" })
      .having("totalorder >: mini",{ mini :3})
      .groupBy("u.id")
      .getRawMany()
     
     const thirteen = await queryRunner.manager
      .createQueryBuilder(Entity.User,"u")
      .innerJoin(Entity.Order,"o","u.id=o.user_id")
      .select(["u.id","u.name","u.country"])

     const fourteen = await queryRunner.manager
      .createQueryBuilder(Entity.User,"u")
      .innerJoin(Entity.Order,"o","u.id = o.user_id")
      .select (["u.id", "u.name"])
      .addSelect("SUM(o.amount)","totalAmount")
      .where("o.status = :status",{status :"Completed"})
      .having("totalAmount >: amt",{amt :600})
      .groupBy("u.id")
      .addGroupBy("u.name")
      .getRawMany()
      
    } catch {
    } finally {
      queryRunner.release();
    }
  }
}
