import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';

export async function seedSuperAdmin(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);

  const email = 'superadmin@dragclothing.com';

  const existing = await userRepository.findOne({
    where: { email },
  });

  if (existing) {
    existing.password =
      '$2b$10$fuxmWie2nIfaLsw7.aN65eYhJhf3NEwSpP/VMxi.kmlSAjfuCWRvi';

    existing.role = 'super_admin';
    existing.name = 'Super Admin';
    existing.isActive = true;

    await userRepository.save(existing);

    console.log('✅ Super Admin updated successfully');
    return;
  }

  const admin = userRepository.create({
    email,
    password: '$2b$10$fuxmWie2nIfaLsw7.aN65eYhJhf3NEwSpP/VMxi.kmlSAjfuCWRvi',
    name: 'Super Admin',
    role: 'super_admin',
  });

  await userRepository.save(admin);

  console.log('✅ Super Admin created successfully');
}
