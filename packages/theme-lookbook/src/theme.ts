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
import { ShopHero, shopHeroSchema } from './sections/ShopHero.js';
import { VariantSwatches, variantSwatchesSchema } from './sections/VariantSwatches.js';
import { HeroSplit, heroSplitSchema } from './sections/HeroSplit.js';
import { HeroMinimal, heroMinimalSchema } from './sections/HeroMinimal.js';
import { HeroFullBleed, heroFullBleedSchema } from './sections/HeroFullBleed.js';
import { HeroFramed, heroFramedSchema } from './sections/HeroFramed.js';
import { GalleryMasonry, galleryMasonrySchema } from './sections/GalleryMasonry.js';
import { GalleryCarousel, galleryCarouselSchema } from './sections/GalleryCarousel.js';
import { GalleryStory, galleryStorySchema } from './sections/GalleryStory.js';
import { GalleryThumbs, galleryThumbsSchema } from './sections/GalleryThumbs.js';
import { SpecsIconCards, specsIconCardsSchema } from './sections/SpecsIconCards.js';
import { SpecsGrid, specsGridSchema } from './sections/SpecsGrid.js';
import { SpecsAccordion, specsAccordionSchema } from './sections/SpecsAccordion.js';
import { SpecsMinimal, specsMinimalSchema } from './sections/SpecsMinimal.js';
import { SpecsCardGrid, specsCardGridSchema } from './sections/SpecsCardGrid.js';
import { RichTextQuote, richTextQuoteSchema } from './sections/RichTextQuote.js';
import { RichTextDropCap, richTextDropCapSchema } from './sections/RichTextDropCap.js';
import { RichTextCentered, richTextCenteredSchema } from './sections/RichTextCentered.js';
import { RichTextMagazine, richTextMagazineSchema } from './sections/RichTextMagazine.js';
import { RichTextImageBg, richTextImageBgSchema } from './sections/RichTextImageBg.js';
import { SwatchesSquare, swatchesSquareSchema } from './sections/SwatchesSquare.js';
import { SwatchesLarge, swatchesLargeSchema } from './sections/SwatchesLarge.js';
import { SwatchesPills, swatchesPillsSchema } from './sections/SwatchesPills.js';
import { SwatchesCards, swatchesCardsSchema } from './sections/SwatchesCards.js';
import { SwatchesList, swatchesListSchema } from './sections/SwatchesList.js';
import { TestimonialsGrid, testimonialsGridSchema } from './sections/TestimonialsGrid.js';
import { TestimonialsFeatured, testimonialsFeaturedSchema } from './sections/TestimonialsFeatured.js';
import { TestimonialsVideo, testimonialsVideoSchema } from './sections/TestimonialsVideo.js';
import { TestimonialsResults, testimonialsResultsSchema } from './sections/TestimonialsResults.js';
import { TestimonialsRatings, testimonialsRatingsSchema } from './sections/TestimonialsRatings.js';
import { TrustBadgesStack, trustBadgesStackSchema } from './sections/TrustBadgesStack.js';
import { TrustBadgesMinimal, trustBadgesMinimalSchema } from './sections/TrustBadgesMinimal.js';
import { TrustBadgesCircles, trustBadgesCirclesSchema } from './sections/TrustBadgesCircles.js';
import { TrustBadgesCards, trustBadgesCardsSchema } from './sections/TrustBadgesCards.js';
import { TrustBadgesStrip, trustBadgesStripSchema } from './sections/TrustBadgesStrip.js';
import { FeaturedCollectionCarousel, featuredCollectionCarouselSchema } from './sections/FeaturedCollectionCarousel.js';
import { FeaturedCollectionList, featuredCollectionListSchema } from './sections/FeaturedCollectionList.js';
import { FeaturedCollectionMasonry, featuredCollectionMasonrySchema } from './sections/FeaturedCollectionMasonry.js';
import { FeaturedCollectionTwoUp, featuredCollectionTwoUpSchema } from './sections/FeaturedCollectionTwoUp.js';
import { FeaturedCollectionMinimal, featuredCollectionMinimalSchema } from './sections/FeaturedCollectionMinimal.js';
import { OrderFormSteps, orderFormStepsSchema } from './sections/OrderFormSteps.js';
import { OrderFormMinimal, orderFormMinimalSchema } from './sections/OrderFormMinimal.js';
import { OrderFormSticky, orderFormStickySchema } from './sections/OrderFormSticky.js';
import { OrderFormExpress, orderFormExpressSchema } from './sections/OrderFormExpress.js';
import { OrderFormCard, orderFormCardSchema } from './sections/OrderFormCard.js';
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
import { Swatch, swatchSchema } from './blocks/Swatch.js';

export const lookbookTheme: Theme = {
  id: 'lookbook',
  name: 'Lookbook',
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
    { schema: shopHeroSchema, Component: ShopHero },
    { schema: variantSwatchesSchema, Component: VariantSwatches },
    { schema: footerSchema, Component: Footer },
    { schema: heroSplitSchema, Component: HeroSplit },
    { schema: heroMinimalSchema, Component: HeroMinimal },
    { schema: heroFullBleedSchema, Component: HeroFullBleed },
    { schema: heroFramedSchema, Component: HeroFramed },
    { schema: galleryMasonrySchema, Component: GalleryMasonry },
    { schema: galleryCarouselSchema, Component: GalleryCarousel },
    { schema: galleryStorySchema, Component: GalleryStory },
    { schema: galleryThumbsSchema, Component: GalleryThumbs },
    { schema: specsIconCardsSchema, Component: SpecsIconCards },
    { schema: specsGridSchema, Component: SpecsGrid },
    { schema: specsAccordionSchema, Component: SpecsAccordion },
    { schema: specsMinimalSchema, Component: SpecsMinimal },
    { schema: specsCardGridSchema, Component: SpecsCardGrid },
    { schema: richTextQuoteSchema, Component: RichTextQuote },
    { schema: richTextDropCapSchema, Component: RichTextDropCap },
    { schema: richTextCenteredSchema, Component: RichTextCentered },
    { schema: richTextMagazineSchema, Component: RichTextMagazine },
    { schema: richTextImageBgSchema, Component: RichTextImageBg },
    { schema: swatchesSquareSchema, Component: SwatchesSquare },
    { schema: swatchesLargeSchema, Component: SwatchesLarge },
    { schema: swatchesPillsSchema, Component: SwatchesPills },
    { schema: swatchesCardsSchema, Component: SwatchesCards },
    { schema: swatchesListSchema, Component: SwatchesList },
    { schema: testimonialsGridSchema, Component: TestimonialsGrid },
    { schema: testimonialsFeaturedSchema, Component: TestimonialsFeatured },
    { schema: testimonialsVideoSchema, Component: TestimonialsVideo },
    { schema: testimonialsResultsSchema, Component: TestimonialsResults },
    { schema: testimonialsRatingsSchema, Component: TestimonialsRatings },
    { schema: trustBadgesStackSchema, Component: TrustBadgesStack },
    { schema: trustBadgesMinimalSchema, Component: TrustBadgesMinimal },
    { schema: trustBadgesCirclesSchema, Component: TrustBadgesCircles },
    { schema: trustBadgesCardsSchema, Component: TrustBadgesCards },
    { schema: trustBadgesStripSchema, Component: TrustBadgesStrip },
    { schema: featuredCollectionCarouselSchema, Component: FeaturedCollectionCarousel },
    { schema: featuredCollectionListSchema, Component: FeaturedCollectionList },
    { schema: featuredCollectionMasonrySchema, Component: FeaturedCollectionMasonry },
    { schema: featuredCollectionTwoUpSchema, Component: FeaturedCollectionTwoUp },
    { schema: featuredCollectionMinimalSchema, Component: FeaturedCollectionMinimal },
    { schema: orderFormStepsSchema, Component: OrderFormSteps },
    { schema: orderFormMinimalSchema, Component: OrderFormMinimal },
    { schema: orderFormStickySchema, Component: OrderFormSticky },
    { schema: orderFormExpressSchema, Component: OrderFormExpress },
    { schema: orderFormCardSchema, Component: OrderFormCard },
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
    { schema: swatchSchema, Component: Swatch },
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
