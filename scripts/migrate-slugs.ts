import { NestFactory } from '@nestjs/core';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { AppModule } from '../src/app.module';
import { Article } from '../src/article/entities/article.entity';
import { Tusker } from '../src/tusker/tusker.schema';
import { SlugUtil } from '../src/utils/slug.util';

/**
 * Migration script to add slugs to existing articles and tuskers
 * This script is safe to run multiple times as it checks for existing slugs
 */
async function runMigration() {
  console.log('🚀 Starting slug migration...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const articleModel = app.get<Model<Article>>(getModelToken(Article.name));
  const tuskerModel = app.get<Model<Tusker>>(getModelToken(Tusker.name));

  try {
    // Migrate Articles
    console.log('📄 Migrating articles...');
    await migrateArticles(articleModel);

    // Migrate Tuskers
    console.log('🐘 Migrating tuskers...');
    await migrateTuskers(tuskerModel);

    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

async function migrateArticles(articleModel: Model<Article>) {
  // Find all articles without slugs
  const articlesWithoutSlugs = await articleModel.find({
    $or: [
      { slug: { $exists: false } },
      { slug: null },
      { slug: '' }
    ]
  }).exec();

  if (articlesWithoutSlugs.length === 0) {
    console.log('  ℹ️  No articles need slug migration');
    return;
  }

  console.log(`  📊 Found ${articlesWithoutSlugs.length} articles without slugs`);

  // Get all existing slugs to avoid duplicates
  const existingArticles = await articleModel.find({ 
    slug: { $exists: true, $nin: [null, ''] }
  }).select('slug').exec();
  const existingSlugs = existingArticles.map(article => article.slug);

  let updatedCount = 0;
  let errorCount = 0;

  for (const article of articlesWithoutSlugs) {
    try {
      // Generate base slug from title
      const baseSlug = SlugUtil.generateSlug(article.title);
      
      if (!baseSlug) {
        console.warn(`  ⚠️  Could not generate slug for article "${article.title}" (ID: ${article._id})`);
        errorCount++;
        continue;
      }

      // Generate unique slug
      const uniqueSlug = SlugUtil.generateUniqueSlug(baseSlug, existingSlugs);
      
      // Update the article
      await articleModel.findByIdAndUpdate(article._id, { slug: uniqueSlug });
      
      // Add to existing slugs to prevent duplicates in this batch
      existingSlugs.push(uniqueSlug);
      updatedCount++;

      console.log(`  ✓ Updated article "${article.title}" with slug: "${uniqueSlug}"`);
    } catch (error) {
      console.error(`  ❌ Failed to update article "${article.title}" (ID: ${article._id}):`, error.message);
      errorCount++;
    }
  }

  console.log(`  📈 Articles migration summary:`);
  console.log(`    • Successfully updated: ${updatedCount}`);
  console.log(`    • Errors: ${errorCount}`);
}

async function migrateTuskers(tuskerModel: Model<Tusker>) {
  // Find all tuskers without slugs
  const tuskersWithoutSlugs = await tuskerModel.find({
    $or: [
      { slug: { $exists: false } },
      { slug: null },
      { slug: '' }
    ]
  }).exec();

  if (tuskersWithoutSlugs.length === 0) {
    console.log('  ℹ️  No tuskers need slug migration');
    return;
  }

  console.log(`  📊 Found ${tuskersWithoutSlugs.length} tuskers without slugs`);

  // Get all existing slugs to avoid duplicates
  const existingTuskers = await tuskerModel.find({ 
    slug: { $exists: true, $nin: [null, ''] }
  }).select('slug').exec();
  const existingSlugs = existingTuskers.map(tusker => tusker.slug);

  let updatedCount = 0;
  let errorCount = 0;

  for (const tusker of tuskersWithoutSlugs) {
    try {
      // Generate base slug from name
      const baseSlug = SlugUtil.generateSlug(tusker.name);
      
      if (!baseSlug) {
        console.warn(`  ⚠️  Could not generate slug for tusker "${tusker.name}" (ID: ${tusker._id})`);
        errorCount++;
        continue;
      }

      // Generate unique slug
      const uniqueSlug = SlugUtil.generateUniqueSlug(baseSlug, existingSlugs);
      
      // Update the tusker
      await tuskerModel.findByIdAndUpdate(tusker._id, { slug: uniqueSlug });
      
      // Add to existing slugs to prevent duplicates in this batch
      existingSlugs.push(uniqueSlug);
      updatedCount++;

      console.log(`  ✓ Updated tusker "${tusker.name}" with slug: "${uniqueSlug}"`);
    } catch (error) {
      console.error(`  ❌ Failed to update tusker "${tusker.name}" (ID: ${tusker._id}):`, error.message);
      errorCount++;
    }
  }

  console.log(`  📈 Tuskers migration summary:`);
  console.log(`    • Successfully updated: ${updatedCount}`);
  console.log(`    • Errors: ${errorCount}`);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Migration interrupted');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the migration
runMigration();
