import prisma from './src/utils/prisma.js';

async function run() {
  console.log("Testing local DB user update...");
  
  try {
    // Find a user (any user, e.g. Ada Lovelace)
    const user = await prisma.user.findFirst();
    if (!user) {
      console.log("No user found in DB");
      return;
    }
    
    console.log(`Found user: ${user.firstName} ${user.lastName} (ID: ${user.id})`);
    console.log(`Current avatarUrl: ${user.avatarUrl}`);
    
    // Update avatarUrl to a mock base64 string
    const mockBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    console.log("Updating avatarUrl...");
    
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl: mockBase64 }
    });
    
    console.log("Update successful!");
    console.log(`Updated avatarUrl (prefix): ${updatedUser.avatarUrl.slice(0, 50)}...`);
    
    // Reset to test if we can clean up
    console.log("Cleaning up...");
    await prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl: null }
    });
    console.log("Cleanup done!");
  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
