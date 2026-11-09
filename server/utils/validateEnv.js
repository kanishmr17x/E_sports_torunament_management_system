/**
 * Environment Validation Utility
 * Validates required environment variables on application startup
 * Prevents app from starting with missing critical configuration
 */

const validateEnvironment = () => {
  const requiredVars = [
    'PORT',
    'NODE_ENV',
    'MONGO_URI',
    'JWT_SECRET',
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('❌ CRITICAL: Missing required environment variables:');
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('\n⚠️  Please create a .env file with all required variables.');
    console.error('📝 Reference: .env.example\n');
    process.exit(1);
  }

  // Validate specific values
  if (!['development', 'production', 'test'].includes(process.env.NODE_ENV)) {
    console.error('❌ NODE_ENV must be one of: development, production, test');
    process.exit(1);
  }

  if (isNaN(parseInt(process.env.PORT))) {
    console.error('❌ PORT must be a valid number');
    process.exit(1);
  }

  if (process.env.JWT_SECRET.length < 32) {
    console.warn('⚠️  WARNING: JWT_SECRET should be at least 32 characters long for security');
  }

  console.log('✅ Environment variables validated successfully');
};

module.exports = { validateEnvironment };
