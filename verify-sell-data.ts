/**
 * Interactive Test: Sell Form Data Verification
 * 
 * This script provides a complete verification of sell form data flow
 * with visual confirmation and detailed reporting
 */

import { PrismaClient } from '@prisma/client';
import { existsSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function printHeader(text: string) {
  console.log(`\n${colors.bright}${colors.cyan}${'='.repeat(70)}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${text}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${'='.repeat(70)}${colors.reset}\n`);
}

function printSuccess(text: string) {
  console.log(`${colors.green}✅ ${text}${colors.reset}`);
}

function printError(text: string) {
  console.log(`${colors.red}❌ ${text}${colors.reset}`);
}

function printWarning(text: string) {
  console.log(`${colors.yellow}⚠️  ${text}${colors.reset}`);
}

function printInfo(text: string) {
  console.log(`${colors.blue}ℹ️  ${text}${colors.reset}`);
}

async function verifyAllSellRequests() {
  printHeader('SELL FORM VERIFICATION - ALL REQUESTS');

  try {
    // Get all sell requests
    const allRequests = await prisma.sellRequest.findMany({
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (allRequests.length === 0) {
      printWarning('No sell requests found in database');
      return;
    }

    printSuccess(`Found ${allRequests.length} sell request(s)\n`);

    // Analyze each request
    let totalPassed = 0;
    let totalFailed = 0;

    for (let i = 0; i < allRequests.length; i++) {
      const req = allRequests[i];
      console.log(`\n${colors.bright}Request #${i + 1}:${colors.reset} ${req.title}`);
      console.log(`${colors.cyan}${'─'.repeat(70)}${colors.reset}`);

      const issues: string[] = [];
      const successes: string[] = [];

      // Parse images
      let imageUrls: string[] = [];
      try {
        if (typeof req.imageUrls === 'string') {
          imageUrls = JSON.parse(req.imageUrls);
        } else if (Array.isArray(req.imageUrls)) {
          imageUrls = req.imageUrls as string[];
        }
      } catch (e) {
        issues.push('Failed to parse image URLs');
      }

      // Validate fields
      if (!req.fullName || req.fullName.length < 2) {
        issues.push('Full name is missing or too short');
      } else {
        successes.push('Full name valid');
      }

      if (!req.email || !req.email.includes('@')) {
        issues.push('Email is invalid');
      } else {
        successes.push('Email valid');
      }

      if (!req.title || req.title.length < 5) {
        issues.push('Title is missing or too short');
      } else {
        successes.push('Title valid');
      }

      if (!req.description || req.description.length < 20) {
        issues.push('Description is missing or too short');
      } else {
        successes.push('Description valid');
      }

      if (!req.price || Number(req.price) <= 0) {
        issues.push('Price is invalid');
      } else {
        successes.push(`Price valid (₹${Number(req.price).toLocaleString('en-IN')})`);
      }

      if (!req.category) {
        issues.push('Category is missing');
      } else {
        successes.push(`Category: ${req.category}`);
      }

      if (!req.contactMethod) {
        issues.push('Contact method is missing');
      } else {
        successes.push(`Contact method: ${req.contactMethod}`);
      }

      if ((req.contactMethod === 'Phone' || req.contactMethod === 'WhatsApp') && !req.contactDetail) {
        issues.push('Contact detail required for Phone/WhatsApp');
      }

      if (imageUrls.length < 5) {
        issues.push(`Insufficient images (${imageUrls.length}/5 required)`);
      } else if (imageUrls.length > 10) {
        issues.push(`Too many images (${imageUrls.length}/10 max)`);
      } else {
        successes.push(`Images: ${imageUrls.length} (valid count)`);
      }

      // Check if image files exist
      let existingImages = 0;
      let missingImages = 0;
      for (const url of imageUrls) {
        const filepath = join(process.cwd(), 'public', url);
        if (existsSync(filepath)) {
          existingImages++;
        } else {
          missingImages++;
        }
      }

      if (missingImages > 0) {
        printWarning(`${missingImages} image file(s) not found on disk`);
      }
      if (existingImages > 0) {
        successes.push(`${existingImages} image file(s) exist on disk`);
      }

      // Print successes
      successes.forEach(s => printSuccess(s));

      // Print issues
      issues.forEach(issue => printError(issue));

      // Determine if passed
      if (issues.length === 0) {
        printSuccess(`\n✨ Request PASSED all checks`);
        totalPassed++;
      } else {
        printError(`\n❌ Request FAILED ${issues.length} check(s)`);
        totalFailed++;
      }

      // Print request details
      console.log(`\n${colors.blue}Details:${colors.reset}`);
      console.log(`   ID: ${req.id}`);
      console.log(`   User: ${req.user.fullName} (${req.user.email})`);
      console.log(`   Status: ${req.status}`);
      console.log(`   Created: ${req.createdAt.toLocaleString('en-IN')}`);
    }

    // Print summary
    printHeader('VERIFICATION SUMMARY');
    console.log(`Total Requests: ${allRequests.length}`);
    printSuccess(`Passed: ${totalPassed}`);
    if (totalFailed > 0) {
      printError(`Failed: ${totalFailed}`);
    }

    const passRate = ((totalPassed / allRequests.length) * 100).toFixed(1);
    console.log(`\nPass Rate: ${passRate}%`);

    if (totalPassed === allRequests.length) {
      printSuccess('\n🎉 ALL REQUESTS PASSED! Data flow is working correctly.');
    } else {
      printWarning('\n⚠️  Some requests have issues. Please review above.');
    }

  } catch (error) {
    printError(`Error during verification: ${error}`);
  } finally {
    await prisma.$disconnect();
  }
}

async function checkAdminPanelReadiness() {
  printHeader('ADMIN PANEL READINESS CHECK');

  try {
    // Check if there are any pending requests
    const pendingCount = await prisma.sellRequest.count({
      where: { status: 'Pending' }
    });

    const approvedCount = await prisma.sellRequest.count({
      where: { status: 'Approved' }
    });

    const rejectedCount = await prisma.sellRequest.count({
      where: { status: 'Rejected' }
    });

    console.log('Status Distribution:');
    printInfo(`Pending: ${pendingCount}`);
    printInfo(`Approved: ${approvedCount}`);
    printInfo(`Rejected: ${rejectedCount}`);

    console.log('\nAdmin Panel URLs:');
    printInfo('List View: http://localhost:3000/admin/requests');
    printInfo('Login: http://localhost:3000/admin/login');

    if (pendingCount > 0) {
      printSuccess(`\n✅ ${pendingCount} request(s) ready for admin review`);
    } else {
      printWarning('\n⚠️  No pending requests for admin to review');
    }

  } catch (error) {
    printError(`Error checking admin panel: ${error}`);
  }
}

async function checkImageStorage() {
  printHeader('IMAGE STORAGE CHECK');

  try {
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'products');
    
    if (!existsSync(uploadDir)) {
      printError(`Upload directory does not exist: ${uploadDir}`);
      printInfo('Creating directory...');
      return;
    }

    printSuccess(`Upload directory exists: ${uploadDir}`);

    // Get all sell requests and check their images
    const requests = await prisma.sellRequest.findMany();
    let totalImages = 0;
    let existingImages = 0;
    let missingImages = 0;

    for (const req of requests) {
      let imageUrls: string[] = [];
      if (typeof req.imageUrls === 'string') {
        imageUrls = JSON.parse(req.imageUrls);
      } else if (Array.isArray(req.imageUrls)) {
        imageUrls = req.imageUrls as string[];
      }

      for (const url of imageUrls) {
        totalImages++;
        const filepath = join(process.cwd(), 'public', url);
        if (existsSync(filepath)) {
          existingImages++;
        } else {
          missingImages++;
        }
      }
    }

    console.log(`\nImage Files:`);
    printInfo(`Total referenced: ${totalImages}`);
    printSuccess(`Existing on disk: ${existingImages}`);
    
    if (missingImages > 0) {
      printError(`Missing from disk: ${missingImages}`);
      printWarning('Some images may not display in admin panel');
    } else if (totalImages > 0) {
      printSuccess('All images exist on disk ✨');
    }

  } catch (error) {
    printError(`Error checking image storage: ${error}`);
  }
}

// Main execution
async function main() {
  console.log(`\n${colors.bright}${colors.blue}╔═══════════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}║       SELL FORM TO ADMIN PANEL - VERIFICATION SYSTEM             ║${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}╚═══════════════════════════════════════════════════════════════════╝${colors.reset}`);

  await verifyAllSellRequests();
  await checkAdminPanelReadiness();
  await checkImageStorage();

  printHeader('VERIFICATION COMPLETE');
  printInfo('Review the results above to ensure all data is flowing correctly.');
  printInfo('For detailed instructions, see: SELL_FORM_VERIFICATION.md\n');
}

main();
