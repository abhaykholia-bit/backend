BEGIN;

-- CreateTable
CREATE TABLE "LandingWellnessLounge" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "actionLabel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LandingWellnessLounge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LandingWellnessLoungeItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "color" TEXT NOT NULL,
    "imageUrl" TEXT,
    "videoUrl" TEXT,
    "sectionId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LandingWellnessLoungeItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LandingHolisticSolutions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "actionLabel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LandingHolisticSolutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LandingHolisticSolutionsItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "color" TEXT NOT NULL,
    "imageUrl" TEXT,
    "sectionId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LandingHolisticSolutionsItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LandingKnowledgeHub" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "actionLabel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LandingKnowledgeHub_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LandingKnowledgeHubItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" TEXT,
    "color" TEXT NOT NULL,
    "icon" TEXT,
    "iconImage" TEXT,
    "iconUrl" TEXT,
    "priceAmount" INTEGER,
    "currency" TEXT,
    "durationDays" INTEGER,
    "sectionId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LandingKnowledgeHubItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LandingFaithkart" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "actionLabel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LandingFaithkart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LandingFaithkartItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "icon" TEXT,
    "iconImage" TEXT,
    "iconWidth" INTEGER,
    "iconHeight" INTEGER,
    "iconUrl" TEXT,
    "sectionId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LandingFaithkartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LandingWellnessInsights" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "actionLabel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LandingWellnessInsights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LandingWellnessInsightsItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "color" TEXT NOT NULL,
    "action" TEXT,
    "imageUrl" TEXT,
    "sectionId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LandingWellnessInsightsItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LandingUpcomingRituals" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LandingUpcomingRituals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LandingUpcomingRitualsItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "badge" TEXT NOT NULL,
    "benefitsTitle" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "imageUrl" TEXT,
    "imageAlt" TEXT,
    "benefits" JSONB NOT NULL,
    "sectionId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LandingUpcomingRitualsItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LandingMeetYourMaster" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "values" TEXT[],
    "imageUrl" TEXT,
    "imageAlt" TEXT,
    "actionLabel" TEXT,
    "actionUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LandingMeetYourMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LandingCorporateWellness" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "imageAlt" TEXT,
    "actionLabel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LandingCorporateWellness_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LandingSuccessStories" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LandingSuccessStories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LandingSuccessStoriesItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "photo" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "icon" TEXT,
    "category" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "imageUrl" TEXT,
    "iconUrl" TEXT,
    "sectionId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LandingSuccessStoriesItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LandingVideoTestimonials" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LandingVideoTestimonials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LandingVideoTestimonialsItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "imageUrl" TEXT,
    "videoUrl" TEXT,
    "sectionId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LandingVideoTestimonialsItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LandingWellnessLoungeItem_sectionId_sortOrder_idx" ON "LandingWellnessLoungeItem"("sectionId", "sortOrder");

-- CreateIndex
CREATE INDEX "LandingHolisticSolutionsItem_sectionId_sortOrder_idx" ON "LandingHolisticSolutionsItem"("sectionId", "sortOrder");

-- CreateIndex
CREATE INDEX "LandingKnowledgeHubItem_sectionId_sortOrder_idx" ON "LandingKnowledgeHubItem"("sectionId", "sortOrder");

-- CreateIndex
CREATE INDEX "LandingFaithkartItem_sectionId_sortOrder_idx" ON "LandingFaithkartItem"("sectionId", "sortOrder");

-- CreateIndex
CREATE INDEX "LandingWellnessInsightsItem_sectionId_sortOrder_idx" ON "LandingWellnessInsightsItem"("sectionId", "sortOrder");

-- CreateIndex
CREATE INDEX "LandingUpcomingRitualsItem_sectionId_sortOrder_idx" ON "LandingUpcomingRitualsItem"("sectionId", "sortOrder");

-- CreateIndex
CREATE INDEX "LandingSuccessStoriesItem_sectionId_sortOrder_idx" ON "LandingSuccessStoriesItem"("sectionId", "sortOrder");

-- CreateIndex
CREATE INDEX "LandingVideoTestimonialsItem_sectionId_sortOrder_idx" ON "LandingVideoTestimonialsItem"("sectionId", "sortOrder");

-- AddForeignKey
ALTER TABLE "LandingWellnessLoungeItem" ADD CONSTRAINT "LandingWellnessLoungeItem_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "LandingWellnessLounge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LandingHolisticSolutionsItem" ADD CONSTRAINT "LandingHolisticSolutionsItem_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "LandingHolisticSolutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LandingKnowledgeHubItem" ADD CONSTRAINT "LandingKnowledgeHubItem_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "LandingKnowledgeHub"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LandingFaithkartItem" ADD CONSTRAINT "LandingFaithkartItem_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "LandingFaithkart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LandingWellnessInsightsItem" ADD CONSTRAINT "LandingWellnessInsightsItem_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "LandingWellnessInsights"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LandingUpcomingRitualsItem" ADD CONSTRAINT "LandingUpcomingRitualsItem_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "LandingUpcomingRituals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LandingSuccessStoriesItem" ADD CONSTRAINT "LandingSuccessStoriesItem_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "LandingSuccessStories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LandingVideoTestimonialsItem" ADD CONSTRAINT "LandingVideoTestimonialsItem_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "LandingVideoTestimonials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;
