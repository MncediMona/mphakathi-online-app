
// Simple script to show your Repl URL
console.log('=== REPL URL INFORMATION ===');
console.log('REPLIT_DEV_DOMAIN:', process.env.REPLIT_DEV_DOMAIN);
console.log('REPL_SLUG:', process.env.REPL_SLUG);
console.log('REPL_OWNER:', process.env.REPL_OWNER);

if (process.env.REPLIT_DEV_DOMAIN) {
  console.log('Your Repl URL is: https://' + process.env.REPLIT_DEV_DOMAIN);
} else {
  console.log('Repl URL not available in this environment');
}
