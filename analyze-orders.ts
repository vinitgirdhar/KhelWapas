import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeOrdersAndRequests() {
  try {
    console.log('\n=== ORDERS & SELL REQUESTS ANALYSIS ===\n');

    // Get all orders
    const orders = await prisma.order.findMany({
      select: {
        id: true,
        userId: true,
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📦 ORDERS SUMMARY:\n`);
    console.log(`Total Orders: ${orders.length}`);
    
    if (orders.length > 0) {
      const paidOrders = orders.filter(o => o.paymentStatus === 'paid').length;
      const pendingOrders = orders.filter(o => o.paymentStatus === 'pending').length;
      const totalRevenue = orders
        .filter(o => o.paymentStatus === 'paid')
        .reduce((sum, o) => sum + Number(o.totalPrice), 0);

      console.log(`├─ Paid: ${paidOrders}`);
      console.log(`└─ Pending: ${pendingOrders}`);
      console.log(`\nTotal Revenue (Paid Orders): ₹${totalRevenue.toFixed(2)}`);

      console.log('\n📋 Recent Orders:');
      orders.slice(0, 5).forEach((order, idx) => {
        console.log(`\n${idx + 1}. Order ID: ${order.id}`);
        console.log(`   Customer: ${order.user.fullName} (${order.user.email})`);
        console.log(`   Amount: ₹${Number(order.totalPrice).toFixed(2)}`);
        console.log(`   Payment: ${order.paymentStatus}`);
        console.log(`   Fulfillment: ${order.fulfillmentStatus}`);
        console.log(`   Date: ${new Date(order.createdAt).toLocaleDateString()}`);
      });
    } else {
      console.log('No orders found in database.');
    }

    // Get all sell requests
    console.log('\n' + '='.repeat(80));
    console.log('\n🛒 SELL REQUESTS SUMMARY:\n');

    const sellRequests = await prisma.sellRequest.findMany({
      select: {
        id: true,
        userId: true,
        fullName: true,
        email: true,
        category: true,
        title: true,
        price: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            fullName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Total Sell Requests: ${sellRequests.length}`);
    
    if (sellRequests.length > 0) {
      const pending = sellRequests.filter(r => r.status === 'Pending').length;
      const approved = sellRequests.filter(r => r.status === 'Approved').length;
      const rejected = sellRequests.filter(r => r.status === 'Rejected').length;

      console.log(`├─ Pending: ${pending}`);
      console.log(`├─ Approved: ${approved}`);
      console.log(`└─ Rejected: ${rejected}`);

      // Group by category
      const byCategory = sellRequests.reduce((acc, req) => {
        acc[req.category] = (acc[req.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      console.log('\n📁 Sell Requests by Category:');
      Object.entries(byCategory).sort().forEach(([cat, count]) => {
        console.log(`   ${cat}: ${count}`);
      });

      console.log('\n📋 Recent Sell Requests:');
      sellRequests.slice(0, 5).forEach((req, idx) => {
        console.log(`\n${idx + 1}. ${req.title}`);
        console.log(`   Category: ${req.category}`);
        console.log(`   Seller: ${req.user.fullName} (${req.user.email})`);
        console.log(`   Price: ₹${Number(req.price).toFixed(2)}`);
        console.log(`   Status: ${req.status}`);
        console.log(`   Date: ${new Date(req.createdAt).toLocaleDateString()}`);
      });
    } else {
      console.log('No sell requests found in database.');
    }

    // Get reviews
    console.log('\n' + '='.repeat(80));
    console.log('\n⭐ REVIEWS SUMMARY:\n');

    const reviews = await prisma.review.findMany({
      select: {
        id: true,
        rating: true,
        comment: true,
        reviewerName: true,
        createdAt: true,
        product: {
          select: {
            name: true,
            category: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Total Reviews: ${reviews.length}`);
    
    if (reviews.length > 0) {
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      const ratingDistribution = reviews.reduce((acc, r) => {
        acc[r.rating] = (acc[r.rating] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      console.log(`Average Rating: ${avgRating.toFixed(2)} ⭐`);
      console.log('\nRating Distribution:');
      [5, 4, 3, 2, 1].forEach(rating => {
        const count = ratingDistribution[rating] || 0;
        const bars = '█'.repeat(count);
        console.log(`   ${rating}★: ${bars} (${count})`);
      });

      console.log('\n📋 Recent Reviews:');
      reviews.slice(0, 3).forEach((review, idx) => {
        console.log(`\n${idx + 1}. ${review.product.name} (${review.product.category})`);
        console.log(`   Rating: ${'⭐'.repeat(review.rating)}`);
        console.log(`   Reviewer: ${review.reviewerName}`);
        console.log(`   Comment: "${review.comment}"`);
        console.log(`   Date: ${new Date(review.createdAt).toLocaleDateString()}`);
      });
    } else {
      console.log('No reviews found in database.');
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n✅ Analysis Complete!\n');

  } catch (error) {
    console.error('Error analyzing orders and requests:', error);
  } finally {
    await prisma.$disconnect();
  }
}

analyzeOrdersAndRequests();
