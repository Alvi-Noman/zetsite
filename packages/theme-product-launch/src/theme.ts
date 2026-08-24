import type { Theme } from '@zetsite/theme-kit';
import { createSectionRegistry } from '@zetsite/theme-kit';
import { Header, headerSchema } from './sections/Header.js';
import { Hero, heroSchema } from './sections/Hero.js';
import { RatingBadge, ratingBadgeSchema } from './sections/RatingBadge.js';
import { FeaturedCollection, featuredCollectionSchema } from './sections/FeaturedCollection.js';
import { RichText, richTextSchema } from './sections/RichText.js';
import { Footer, footerSchema } from './sections/Footer.js';
import { HeroSlideshow, heroSlideshowSchema } from './sections/HeroSlideshow.js';
import { HeroVideo, heroVideoSchema } from './sections/HeroVideo.js';
import { CollectionList, collectionListSchema } from './sections/CollectionList.js';
import { MultiColumn, multiColumnSchema } from './sections/MultiColumn.js';
import { Testimonials, testimonialsSchema } from './sections/Testimonials.js';
import { Faq, faqSchema } from './sections/Faq.js';
import { AnnouncementBar, announcementBarSchema } from './sections/AnnouncementBar.js';
import { Newsletter, newsletterSchema } from './sections/Newsletter.js';
import { CountdownBanner, countdownBannerSchema } from './sections/CountdownBanner.js';
import { LogoBar, logoBarSchema } from './sections/LogoBar.js';
import { VideoBlock, videoBlockSchema } from './sections/VideoBlock.js';
import { Gallery, gallerySchema } from './sections/Gallery.js';
import { BeforeAfter, beforeAfterSchema } from './sections/BeforeAfter.js';
import { ComparisonTable, comparisonTableSchema } from './sections/ComparisonTable.js';
import { CustomHtml, customHtmlSchema } from './sections/CustomHtml.js';
import { SocialProofBar, socialProofBarSchema } from './sections/SocialProofBar.js';
import { ContactForm, contactFormSchema } from './sections/ContactForm.js';
import { TrustBadges, trustBadgesSchema } from './sections/TrustBadges.js';
import { ProductSpecs, productSpecsSchema } from './sections/ProductSpecs.js';
import { StickyBuyBar, stickyBuyBarSchema } from './sections/StickyBuyBar.js';
import { OrderForm, orderFormSchema } from './sections/OrderForm.js';
import { ProblemSolution, problemSolutionSchema } from './sections/ProblemSolution.js';
import { HowItWorks, howItWorksSchema } from './sections/HowItWorks.js';
import { FinalCta, finalCtaSchema } from './sections/FinalCta.js';
import { ShopHero, shopHeroSchema } from './sections/ShopHero.js';
import { HeroSplit, heroSplitSchema } from './sections/HeroSplit.js';
import { HeroMinimal, heroMinimalSchema } from './sections/HeroMinimal.js';
import { HeroFullBleed, heroFullBleedSchema } from './sections/HeroFullBleed.js';
import { HeroFramed, heroFramedSchema } from './sections/HeroFramed.js';
import { ProofLogos, proofLogosSchema } from './sections/ProofLogos.js';
import { ProofStat, proofStatSchema } from './sections/ProofStat.js';
import { ProofAvatars, proofAvatarsSchema } from './sections/ProofAvatars.js';
import { ProofVerified, proofVerifiedSchema } from './sections/ProofVerified.js';
import { ProblemSolutionTable, problemSolutionTableSchema } from './sections/ProblemSolutionTable.js';
import { ProblemSolutionNarrative, problemSolutionNarrativeSchema } from './sections/ProblemSolutionNarrative.js';
import { ProblemSolutionIcons, problemSolutionIconsSchema } from './sections/ProblemSolutionIcons.js';
import { ProblemSolutionQuote, problemSolutionQuoteSchema } from './sections/ProblemSolutionQuote.js';
import { ProblemSolutionImage, problemSolutionImageSchema } from './sections/ProblemSolutionImage.js';
import { FeaturesRows, featuresRowsSchema } from './sections/FeaturesRows.js';
import { FeaturesNumbered, featuresNumberedSchema } from './sections/FeaturesNumbered.js';
import { FeaturesTabs, featuresTabsSchema } from './sections/FeaturesTabs.js';
import { FeaturesChecklist, featuresChecklistSchema } from './sections/FeaturesChecklist.js';
import { FeaturesStats, featuresStatsSchema } from './sections/FeaturesStats.js';
import { HowItWorksTimeline, howItWorksTimelineSchema } from './sections/HowItWorksTimeline.js';
import { HowItWorksTabs, howItWorksTabsSchema } from './sections/HowItWorksTabs.js';
import { HowItWorksCards, howItWorksCardsSchema } from './sections/HowItWorksCards.js';
import { HowItWorksAccordion, howItWorksAccordionSchema } from './sections/HowItWorksAccordion.js';
import { HowItWorksSplit, howItWorksSplitSchema } from './sections/HowItWorksSplit.js';
import { TestimonialsGrid, testimonialsGridSchema } from './sections/TestimonialsGrid.js';
import { TestimonialsFeatured, testimonialsFeaturedSchema } from './sections/TestimonialsFeatured.js';
import { TestimonialsVideo, testimonialsVideoSchema } from './sections/TestimonialsVideo.js';
import { TestimonialsResults, testimonialsResultsSchema } from './sections/TestimonialsResults.js';
import { TestimonialsRatings, testimonialsRatingsSchema } from './sections/TestimonialsRatings.js';
import { GalleryMasonry, galleryMasonrySchema } from './sections/GalleryMasonry.js';
import { GalleryCarousel, galleryCarouselSchema } from './sections/GalleryCarousel.js';
import { GalleryStory, galleryStorySchema } from './sections/GalleryStory.js';
import { GalleryThumbs, galleryThumbsSchema } from './sections/GalleryThumbs.js';
import { FaqGrid, faqGridSchema } from './sections/FaqGrid.js';
import { FaqNumbered, faqNumberedSchema } from './sections/FaqNumbered.js';
import { FaqTabs, faqTabsSchema } from './sections/FaqTabs.js';
import { FaqChat, faqChatSchema } from './sections/FaqChat.js';
import { FaqSidebar, faqSidebarSchema } from './sections/FaqSidebar.js';
import { CtaImage, ctaImageSchema } from './sections/CtaImage.js';
import { CtaGuarantee, ctaGuaranteeSchema } from './sections/CtaGuarantee.js';
import { CtaMinimal, ctaMinimalSchema } from './sections/CtaMinimal.js';
import { CtaUrgency, ctaUrgencySchema } from './sections/CtaUrgency.js';
import { CtaDual, ctaDualSchema } from './sections/CtaDual.js';
import { OrderFormSteps, orderFormStepsSchema } from './sections/OrderFormSteps.js';
import { OrderFormMinimal, orderFormMinimalSchema } from './sections/OrderFormMinimal.js';
import { OrderFormSticky, orderFormStickySchema } from './sections/OrderFormSticky.js';
import { OrderFormExpress, orderFormExpressSchema } from './sections/OrderFormExpress.js';
import { OrderFormCard, orderFormCardSchema } from './sections/OrderFormCard.js';
import { FooterColumns, footerColumnsSchema } from './sections/FooterColumns.js';
import { FooterNewsletter, footerNewsletterSchema } from './sections/FooterNewsletter.js';
import { FooterSocial, footerSocialSchema } from './sections/FooterSocial.js';
import { FooterMinimal, footerMinimalSchema } from './sections/FooterMinimal.js';
import { FooterStatement, footerStatementSchema } from './sections/FooterStatement.js';
import { ProductTemplate } from './templates/ProductTemplate.js';
import { CollectionTemplate } from './templates/CollectionTemplate.js';
import { starterTemplates } from './starterTemplates.js';
import { sectionFamilies } from './sectionFamilies.js';
import { Logo, logoSchema } from './blocks/Logo.js';
import { Menu, menuSchema } from './blocks/Menu.js';
import { Copyright, copyrightSchema } from './blocks/Copyright.js';
import { PolicyLinks, policyLinksSchema } from './blocks/PolicyLinks.js';
import { SocialLinks, socialLinksSchema } from './blocks/SocialLinks.js';
import { Heading, headingSchema } from './blocks/Heading.js';
import { Text, textSchema } from './blocks/Text.js';
import { Button, buttonSchema } from './blocks/Button.js';
import { Image, imageSchema } from './blocks/Image.js';
import { Slide, slideSchema } from './blocks/Slide.js';
import { Column, columnSchema } from './blocks/Column.js';
import { Testimonial, testimonialSchema } from './blocks/Testimonial.js';
import { FaqItem, faqItemSchema } from './blocks/FaqItem.js';
import { Announcement, announcementSchema } from './blocks/Announcement.js';
import { LogoImage, logoImageSchema } from './blocks/LogoImage.js';
import { GalleryImage, galleryImageSchema } from './blocks/GalleryImage.js';
import { Plan, planSchema } from './blocks/Plan.js';
import { ProofMessage, proofMessageSchema } from './blocks/ProofMessage.js';
import { FormField, formFieldSchema } from './blocks/FormField.js';
import { Divider, dividerSchema } from './blocks/Divider.js';
import { Spacer, spacerSchema } from './blocks/Spacer.js';
import { Video, videoSchema } from './blocks/Video.js';
import { CollectionTitle, collectionTitleSchema } from './blocks/CollectionTitle.js';
import { TrustBadge, trustBadgeSchema } from './blocks/TrustBadge.js';
import { SpecRow, specRowSchema } from './blocks/SpecRow.js';
import { Step, stepSchema } from './blocks/Step.js';

export const productLaunchTheme: Theme = {
  id: 'product-launch',
  name: 'Product Launch',
  sections: createSectionRegistry([
    { schema: headerSchema, Component: Header },
    { schema: heroSchema, Component: Hero },
    { schema: ratingBadgeSchema, Component: RatingBadge },
    { schema: heroSlideshowSchema, Component: HeroSlideshow },
    { schema: heroVideoSchema, Component: HeroVideo },
    { schema: featuredCollectionSchema, Component: FeaturedCollection },
    { schema: collectionListSchema, Component: CollectionList },
    { schema: multiColumnSchema, Component: MultiColumn },
    { schema: richTextSchema, Component: RichText },
    { schema: testimonialsSchema, Component: Testimonials },
    { schema: faqSchema, Component: Faq },
    { schema: announcementBarSchema, Component: AnnouncementBar },
    { schema: newsletterSchema, Component: Newsletter },
    { schema: countdownBannerSchema, Component: CountdownBanner },
    { schema: logoBarSchema, Component: LogoBar },
    { schema: videoBlockSchema, Component: VideoBlock },
    { schema: gallerySchema, Component: Gallery },
    { schema: beforeAfterSchema, Component: BeforeAfter },
    { schema: comparisonTableSchema, Component: ComparisonTable },
    { schema: customHtmlSchema, Component: CustomHtml },
    { schema: socialProofBarSchema, Component: SocialProofBar },
    { schema: contactFormSchema, Component: ContactForm },
    { schema: trustBadgesSchema, Component: TrustBadges },
    { schema: productSpecsSchema, Component: ProductSpecs },
    { schema: stickyBuyBarSchema, Component: StickyBuyBar },
    { schema: orderFormSchema, Component: OrderForm },
    { schema: problemSolutionSchema, Component: ProblemSolution },
    { schema: howItWorksSchema, Component: HowItWorks },
    { schema: finalCtaSchema, Component: FinalCta },
    { schema: shopHeroSchema, Component: ShopHero },
    { schema: footerSchema, Component: Footer },
    { schema: heroSplitSchema, Component: HeroSplit },
    { schema: heroMinimalSchema, Component: HeroMinimal },
    { schema: heroFramedSchema, Component: HeroFramed },
    { schema: heroFullBleedSchema, Component: HeroFullBleed },
    { schema: proofLogosSchema, Component: ProofLogos },
    { schema: proofStatSchema, Component: ProofStat },
    { schema: proofAvatarsSchema, Component: ProofAvatars },
    { schema: proofVerifiedSchema, Component: ProofVerified },
    { schema: problemSolutionTableSchema, Component: ProblemSolutionTable },
    { schema: problemSolutionNarrativeSchema, Component: ProblemSolutionNarrative },
    { schema: problemSolutionIconsSchema, Component: ProblemSolutionIcons },
    { schema: problemSolutionQuoteSchema, Component: ProblemSolutionQuote },
    { schema: problemSolutionImageSchema, Component: ProblemSolutionImage },
    { schema: featuresRowsSchema, Component: FeaturesRows },
    { schema: featuresNumberedSchema, Component: FeaturesNumbered },
    { schema: featuresTabsSchema, Component: FeaturesTabs },
    { schema: featuresChecklistSchema, Component: FeaturesChecklist },
    { schema: featuresStatsSchema, Component: FeaturesStats },
    { schema: howItWorksTimelineSchema, Component: HowItWorksTimeline },
    { schema: howItWorksTabsSchema, Component: HowItWorksTabs },
    { schema: howItWorksCardsSchema, Component: HowItWorksCards },
    { schema: howItWorksAccordionSchema, Component: HowItWorksAccordion },
    { schema: howItWorksSplitSchema, Component: HowItWorksSplit },
    { schema: testimonialsGridSchema, Component: TestimonialsGrid },
    { schema: testimonialsFeaturedSchema, Component: TestimonialsFeatured },
    { schema: testimonialsVideoSchema, Component: TestimonialsVideo },
    { schema: testimonialsResultsSchema, Component: TestimonialsResults },
    { schema: testimonialsRatingsSchema, Component: TestimonialsRatings },
    { schema: galleryMasonrySchema, Component: GalleryMasonry },
    { schema: galleryCarouselSchema, Component: GalleryCarousel },
    { schema: galleryStorySchema, Component: GalleryStory },
    { schema: galleryThumbsSchema, Component: GalleryThumbs },
    { schema: faqGridSchema, Component: FaqGrid },
    { schema: faqNumberedSchema, Component: FaqNumbered },
    { schema: faqTabsSchema, Component: FaqTabs },
    { schema: faqChatSchema, Component: FaqChat },
    { schema: faqSidebarSchema, Component: FaqSidebar },
    { schema: ctaImageSchema, Component: CtaImage },
    { schema: ctaGuaranteeSchema, Component: CtaGuarantee },
    { schema: ctaMinimalSchema, Component: CtaMinimal },
    { schema: ctaUrgencySchema, Component: CtaUrgency },
    { schema: ctaDualSchema, Component: CtaDual },
    { schema: orderFormStepsSchema, Component: OrderFormSteps },
    { schema: orderFormMinimalSchema, Component: OrderFormMinimal },
    { schema: orderFormStickySchema, Component: OrderFormSticky },
    { schema: orderFormExpressSchema, Component: OrderFormExpress },
    { schema: orderFormCardSchema, Component: OrderFormCard },
    { schema: footerColumnsSchema, Component: FooterColumns },
    { schema: footerNewsletterSchema, Component: FooterNewsletter },
    { schema: footerSocialSchema, Component: FooterSocial },
    { schema: footerMinimalSchema, Component: FooterMinimal },
    { schema: footerStatementSchema, Component: FooterStatement },
  ]),
  blocks: createSectionRegistry([
    { schema: logoSchema, Component: Logo },
    { schema: menuSchema, Component: Menu },
    { schema: copyrightSchema, Component: Copyright },
    { schema: policyLinksSchema, Component: PolicyLinks },
    { schema: socialLinksSchema, Component: SocialLinks },
    { schema: headingSchema, Component: Heading },
    { schema: textSchema, Component: Text },
    { schema: buttonSchema, Component: Button },
    { schema: imageSchema, Component: Image },
    { schema: slideSchema, Component: Slide },
    { schema: columnSchema, Component: Column },
    { schema: testimonialSchema, Component: Testimonial },
    { schema: faqItemSchema, Component: FaqItem },
    { schema: announcementSchema, Component: Announcement },
    { schema: logoImageSchema, Component: LogoImage },
    { schema: galleryImageSchema, Component: GalleryImage },
    { schema: planSchema, Component: Plan },
    { schema: proofMessageSchema, Component: ProofMessage },
    { schema: formFieldSchema, Component: FormField },
    { schema: dividerSchema, Component: Divider },
    { schema: spacerSchema, Component: Spacer },
    { schema: videoSchema, Component: Video },
    { schema: collectionTitleSchema, Component: CollectionTitle },
    { schema: trustBadgeSchema, Component: TrustBadge },
    { schema: specRowSchema, Component: SpecRow },
    { schema: stepSchema, Component: Step },
  ]),
  globalSettingsSchema: [
    { key: 'colors.primary', type: 'color', label: 'Primary color', default: '#1C1917' },
    { key: 'colors.background', type: 'color', label: 'Background', default: '#ffffff' },
    { key: 'colors.text', type: 'color', label: 'Text', default: '#111111' },
    { key: 'colors.accent', type: 'color', label: 'Accent', default: '#B08D57' },
  ],
  defaultGlobalSettings: {
    colors: { primary: '#1C1917', background: '#ffffff', text: '#111111', accent: '#B08D57' },
    fonts: { heading: 'Inter', body: 'Inter' },
  },
  sectionFamilies,
  templates: {
    Product: ProductTemplate,
    Collection: CollectionTemplate,
  },
};

export { starterTemplates };
