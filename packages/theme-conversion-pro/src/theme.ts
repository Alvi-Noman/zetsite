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
import { ProductTemplate } from './templates/ProductTemplate.js';
import { CollectionTemplate } from './templates/CollectionTemplate.js';
import { starterTemplates } from './starterTemplates.js';
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

export const conversionProTheme: Theme = {
  id: 'conversion-pro',
  name: 'Conversion Pro',
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
    { schema: footerSchema, Component: Footer },
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
  ]),
  globalSettingsSchema: [
    { key: 'colors.primary', type: 'color', label: 'Primary color', default: '#0F766E' },
    { key: 'colors.background', type: 'color', label: 'Background', default: '#ffffff' },
    { key: 'colors.text', type: 'color', label: 'Text', default: '#111111' },
    { key: 'colors.accent', type: 'color', label: 'Accent', default: '#D97706' },
  ],
  defaultGlobalSettings: {
    colors: { primary: '#0F766E', background: '#ffffff', text: '#111111', accent: '#D97706' },
    fonts: { heading: 'Inter', body: 'Inter' },
  },
  templates: {
    Product: ProductTemplate,
    Collection: CollectionTemplate,
  },
};

export { starterTemplates };
