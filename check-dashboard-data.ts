/**
 * Check Admin Dashboard Seed Data
 */

import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';

config();

const prisma = new PrismaClient();

async function checkDashboardData() {
  console.log('🔍 Checking Admin Dashboard Data...\n');

  try {
    // 1. Check all table counts
    console.log('📊 Database Table Counts:');
    console.log('━'.repeat(50));
    
    const userCount = await prisma.user.count();
    const productCount = await prisma.product.count();
    const orderCount = await prisma.order.count();
    const sellRequestCount = await prisma.sellRequest.count();
    
    console.log(`Users: ${userCount}`);
    console.log(`Products: ${productCount}`);
    console.log(`Orders: ${orderCount}`);
    console.log(`Sell Requests: ${sellRequestCount}\n`);

    // 2. Check for new users (recent users)
    console.log('👥 Recent Users (Last 30 Days):');
    console.log('━'.repeat(50));
    
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newUsers = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        fullName: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
    
    console.log(`Found ${newUsers.length} users created in last 30 days`);
    newUsers.forEach((user, i) => {
      console.log(`${i + 1}. ${user.fullName} (${user.email}) - ${user.role}`);
      console.log(`   Created: ${user.createdAt.toLocaleString()}`);
    });
    console.log();

    // 3. Check orders
    console.log('📦 Recent Orders:');
    console.log('━'.repeat(50));
    
    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 10,
      select: {
        id: true,
        totalPrice: true,
        paymentStatus: true,
        fulfillmentStatus: true,
        createdAt: true,
        user: {
          select: {
            fullName: true,
            email: true
          }
        }
      }
    });
    
    console.log(`Total orders in database: ${orderCount}`);
    console.log(`Showing ${orders.length} most recent:\n`);
    
    orders.forEach((order, i) => {
      console.log(`${i + 1}. Order #${order.id.substring(0, 8)}`);
      console.log(`   Customer: ${order.user.fullName}`);
      console.log(`   Amount: ₹${order.totalPrice}`);
      console.log(`   Status: ${order.fulfillmentStatus}`);
      console.log(`   Created: ${order.createdAt.toLocaleString()}`);
    });
    console.log();

    // 4. Check sell requests
    console.log('🛒 Recent Sell Requests:');
    console.log('━'.repeat(50));
    
    const sellRequests = await prisma.sellRequest.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 10,
      select: {
        id: true,
        title: true,
        price: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            fullName: true
          }
        }
      }
    });
    
    console.log(`Total sell requests in database: ${sellRequestCount}`);
    console.log(`Showing ${sellRequests.length} most recent:\n`);
    
    sellRequests.forEach((req, i) => {
      console.log(`${i + 1}. ${req.title}`);
      console.log(`   Seller: ${req.user.fullName}`);
      console.log(`   Price: ₹${req.price}`);
      console.log(`   Status: ${req.status}`);
      console.log(`   Created: ${req.createdAt.toLocaleString()}`);
    });
    console.log();

    // 5. Calculate revenue
    console.log('💰 Revenue Analysis:');
    console.log('━'.repeat(50));
    
    const allOrders = await prisma.order.findMany({
      select: {
        totalPrice: true,
        paymentStatus: true,
        createdAt: true
      }
    });
    
    const totalRevenue = allOrders
      .filter(o => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + Number(o.totalPrice), 0);
    
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const lastMonth = new Date(thisMonth);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const thisMonthRevenue = allOrders
      .filter(o => o.paymentStatus === 'paid' && o.createdAt >= thisMonth)
      .reduce((sum, o) => sum + Number(o.totalPrice), 0);
    
    const lastMonthRevenue = allOrders
      .filter(o => o.paymentStatus === 'paid' && o.createdAt >= lastMonth && o.createdAt < thisMonth)
      .reduce((sum, o) => sum + Number(o.totalPrice), 0);
    
    console.log(`Total Revenue (All Time): ₹${totalRevenue}`);
    console.log(`This Month Revenue: ₹${thisMonthRevenue}`);
    console.log(`Last Month Revenue: ₹${lastMonthRevenue}`);
    
    const percentChange = lastMonthRevenue > 0 
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
      : '0.0';
    
    console.log(`Month-over-Month Change: ${percentChange}%`);
    console.log();

    // 6. Dashboard Summary
    console.log('📊 Admin Dashboard Summary:');
    console.log('━'.repeat(50));
    console.log(`Total Revenue: ₹${totalRevenue}`);
    console.log(`New Users (30 days): +${newUsers.length}`);
    console.log(`Total Orders: ${orderCount}`);
    console.log(`Products Listed: ${productCount}`);
    console.log();

    // 7. Check if seed data exists
    console.log('✅ Verification:');
    console.log('━'.repeat(50));
    
    if (userCount === 0) {
      console.log('❌ No users found - seed data missing!');
    } else {
      console.log(`✅ Users exist: ${userCount} total`);
    }
    
    if (orderCount === 0) {
      console.log('⚠️  No orders found - dashboard will show ₹0 revenue');
    } else {
      console.log(`✅ Orders exist: ${orderCount} total`);
    }
    
    if (sellRequestCount === 0) {
      console.log('⚠️  No sell requests found');
    } else {
      console.log(`✅ Sell requests exist: ${sellRequestCount} total`);
    }
    
    if (productCount === 0) {
      console.log('⚠️  No products found');
    } else {
      console.log(`✅ Products exist: ${productCount} total`);
    }

  } catch (error) {
    console.error('❌ Error checking dashboard data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkDashboardData()
  .then(() => {
    console.log('\n✅ Check complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Check failed:', error);
    process.exit(1);
  });
