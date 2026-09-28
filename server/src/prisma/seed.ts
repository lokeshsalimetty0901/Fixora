import { PrismaClient, Role, VerificationStatus, BookingStatus, PaymentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Fixora Database Seed...');

  // Clean existing data
  await prisma.payment.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.service.deleteMany();
  await prisma.serviceCategory.deleteMany();
  await prisma.professionalProfile.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.user.deleteMany();

  const defaultPassword = await bcrypt.hash('Password123!', 10);
  const adminPassword = await bcrypt.hash('AdminPass123!', 10);

  // 1. Create Admin User
  const admin = await prisma.user.create({
    data: {
      email: 'admin@fixora.com',
      passwordHash: adminPassword,
      fullName: 'Fixora Platform Admin',
      phone: '+1 (800) 555-0199',
      role: Role.ADMIN,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  // 2. Create Demo Customer User
  const customer = await prisma.user.create({
    data: {
      email: 'customer@fixora.com',
      passwordHash: defaultPassword,
      fullName: 'Sarah Jenkins',
      phone: '+1 (555) 234-5678',
      role: Role.CUSTOMER,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
  });

  // 3. Create Service Categories
  const categories = [
    {
      name: 'Emergency Auto Mechanic',
      slug: 'auto-mechanic',
      description: '24/7 roadside assistance, battery jumpstarts, tire changes & engine repairs.',
      icon: 'Wrench',
      imageUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=600',
      isEmergencySupported: true,
    },
    {
      name: 'Master Electrician',
      slug: 'electrician',
      description: 'Short-circuit fixes, wiring, breaker box updates & light installations.',
      icon: 'Zap',
      imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600',
      isEmergencySupported: true,
    },
    {
      name: 'Plumbing & Water Leak',
      slug: 'plumbing',
      description: 'Pipe bursts, drain unblocking, faucet repairs & water heater servicing.',
      icon: 'Droplets',
      imageUrl: 'https://images.unsplash.com/photo-1505798577917-a65157d3320a?w=600',
      isEmergencySupported: true,
    },
    {
      name: 'HVAC & AC Service',
      slug: 'ac-repair',
      description: 'Air conditioning gas refill, duct cleaning, cooling repair & thermostat setup.',
      icon: 'Wind',
      imageUrl: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600',
      isEmergencySupported: true,
    },
    {
      name: 'Carpenter & Furniture Fix',
      slug: 'carpentry',
      description: 'Door lock fixes, custom shelving, cabinet repair & structural woodwork.',
      icon: 'Hammer',
      imageUrl: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=600',
      isEmergencySupported: false,
    },
    {
      name: 'Appliance Maintenance',
      slug: 'appliances',
      description: 'Washing machine, refrigerator, microwave & dishwasher diagnostic & repair.',
      icon: 'Tv',
      imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600',
      isEmergencySupported: false,
    },
  ];

  const createdCategories = await Promise.all(
    categories.map((cat) => prisma.serviceCategory.create({ data: cat }))
  );

  const mechanicCat = createdCategories.find((c) => c.slug === 'auto-mechanic')!;
  const electricianCat = createdCategories.find((c) => c.slug === 'electrician')!;
  const plumbingCat = createdCategories.find((c) => c.slug === 'plumbing')!;
  const hvacCat = createdCategories.find((c) => c.slug === 'ac-repair')!;
  const carpenterCat = createdCategories.find((c) => c.slug === 'carpentry')!;

  // 4. Create Services
  const servicesData = [
    { categoryId: mechanicCat.id, name: 'Roadside Battery Jumpstart', description: 'Fast arrival with jump cables & battery testing', price: 65.0, estimatedDurationMinutes: 30 },
    { categoryId: mechanicCat.id, name: 'Flat Tire Change & Inflation', description: 'On-site spare tire change & pressure check', price: 75.0, estimatedDurationMinutes: 45 },
    { categoryId: electricianCat.id, name: 'Short Circuit Emergency Fix', description: 'Immediate diagnosis & breaker replacement', price: 90.0, estimatedDurationMinutes: 60 },
    { categoryId: electricianCat.id, name: 'Ceiling Fan & Light Installation', description: 'Standard light fixture mounting & wiring check', price: 80.0, estimatedDurationMinutes: 60 },
    { categoryId: plumbingCat.id, name: 'Burst Pipe Emergency Leak Repair', description: 'Water main isolation & copper/PVC pipe sealing', price: 120.0, estimatedDurationMinutes: 90 },
    { categoryId: plumbingCat.id, name: 'Clogged Drain & Sink Clearing', description: 'High-pressure auger drain unclogging', price: 85.0, estimatedDurationMinutes: 60 },
    { categoryId: hvacCat.id, name: 'AC Gas Top-Up & Cleaning', description: 'Refrigerant refill & filter chemical wash', price: 110.0, estimatedDurationMinutes: 75 },
    { categoryId: carpenterCat.id, name: 'Door & Lock Replacement', description: 'Smart lock installation & deadbolt alignment', price: 95.0, estimatedDurationMinutes: 90 },
  ];

  const createdServices = await Promise.all(
    servicesData.map((s) => prisma.service.create({ data: s }))
  );

  // 5. Create Demo Professional 1 (Verified Mechanic/Electrician)
  const pro1User = await prisma.user.create({
    data: {
      email: 'pro@fixora.com',
      passwordHash: defaultPassword,
      fullName: 'Marcus Sterling',
      phone: '+1 (555) 890-1234',
      role: Role.PROFESSIONAL,
      avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
    },
  });

  const pro1Profile = await prisma.professionalProfile.create({
    data: {
      userId: pro1User.id,
      bio: 'Licensed master electrician and emergency auto technician with over 9 years of field experience in rapid response dispatch.',
      categoryIds: [mechanicCat.id, electricianCat.id],
      experienceYears: 9,
      hourlyRate: 75.0,
      rating: 4.9,
      reviewCount: 48,
      isVerified: VerificationStatus.VERIFIED,
      serviceRadiusKm: 30.0,
      latitude: 40.7128,
      longitude: -74.006,
      address: '742 Broadway, New York, NY 10003',
      isAvailable: true,
    },
  });

  // 6. Create Demo Professional 2 (Verified Plumber)
  const pro2User = await prisma.user.create({
    data: {
      email: 'david.plumber@fixora.com',
      passwordHash: defaultPassword,
      fullName: 'David Miller',
      phone: '+1 (555) 456-7890',
      role: Role.PROFESSIONAL,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  });

  await prisma.professionalProfile.create({
    data: {
      userId: pro2User.id,
      bio: 'Commercial and residential plumber specializing in emergency water leak containment and drain restoration.',
      categoryIds: [plumbingCat.id],
      experienceYears: 12,
      hourlyRate: 85.0,
      rating: 4.8,
      reviewCount: 62,
      isVerified: VerificationStatus.VERIFIED,
      serviceRadiusKm: 25.0,
      latitude: 40.73061,
      longitude: -73.935242,
      address: '150 Greenpoint Ave, Brooklyn, NY 11222',
      isAvailable: true,
    },
  });

  // 7. Create Demo Professional 3 (Pending Verification)
  const pro3User = await prisma.user.create({
    data: {
      email: 'alex.hvac@fixora.com',
      passwordHash: defaultPassword,
      fullName: 'Alex Rodriguez',
      phone: '+1 (555) 987-6543',
      role: Role.PROFESSIONAL,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    },
  });

  await prisma.professionalProfile.create({
    data: {
      userId: pro3User.id,
      bio: 'Certified HVAC technician applying for platform onboarding.',
      categoryIds: [hvacCat.id],
      experienceYears: 5,
      hourlyRate: 65.0,
      rating: 5.0,
      reviewCount: 0,
      isVerified: VerificationStatus.PENDING,
      serviceRadiusKm: 20.0,
      latitude: 40.7589,
      longitude: -73.9851,
      address: '350 5th Ave, New York, NY 10118',
      isAvailable: false,
    },
  });

  // 8. Create Active & Completed Bookings
  const activeBooking = await prisma.booking.create({
    data: {
      customerId: customer.id,
      professionalId: pro1Profile.id,
      serviceId: createdServices[2].id, // Short Circuit Emergency Fix
      status: BookingStatus.ON_THE_WAY,
      isEmergency: true,
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: '14:30',
      address: '120 E 34th St, Apt 4B, New York, NY 10016',
      latitude: 40.7465,
      longitude: -73.9797,
      notes: 'Main fuse tripped twice, burning smell near circuit box.',
      totalPrice: 90.0,
      paymentStatus: PaymentStatus.PAID,
      paymentMethod: 'MOCK_CARD_4242',
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: activeBooking.id,
      amount: 90.0,
      provider: 'MOCK',
      status: PaymentStatus.PAID,
      transactionId: 'TXN_' + Math.random().toString(36).substring(2, 10).toUpperCase(),
    },
  });

  // Completed Booking with Review
  const completedBooking = await prisma.booking.create({
    data: {
      customerId: customer.id,
      professionalId: pro1Profile.id,
      serviceId: createdServices[0].id, // Battery Jumpstart
      status: BookingStatus.COMPLETED,
      isEmergency: true,
      scheduledDate: '2026-09-20',
      scheduledTime: '10:00',
      address: '50 Wall St, New York, NY 10005',
      latitude: 40.7064,
      longitude: -74.0094,
      notes: 'Car was dead in underground garage.',
      totalPrice: 65.0,
      paymentStatus: PaymentStatus.PAID,
      paymentMethod: 'MOCK_CARD_4242',
    },
  });

  await prisma.review.create({
    data: {
      bookingId: completedBooking.id,
      customerId: customer.id,
      professionalId: pro1Profile.id,
      rating: 5,
      comment: 'Marcus arrived in under 15 minutes! Extremely polite and fixed my car battery instantly. Saved my work meeting!',
    },
  });

  console.log('✅ Seed completed successfully!');
  console.log('🔑 Demo Credentials:');
  console.log('   Admin:        admin@fixora.com / AdminPass123!');
  console.log('   Customer:     customer@fixora.com / Password123!');
  console.log('   Professional: pro@fixora.com / Password123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
