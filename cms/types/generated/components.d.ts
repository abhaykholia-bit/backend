import type { Schema, Struct } from '@strapi/strapi';

export interface LandingItems extends Struct.ComponentSchema {
  collectionName: 'components_landing_items';
  info: {
    displayName: 'items';
  };
  attributes: {
    color: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    image: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    link: Schema.Attribute.String;
    name: Schema.Attribute.String;
  };
}

export interface LandingRitualBenefit extends Struct.ComponentSchema {
  collectionName: 'components_landing_ritual_benefits';
  info: {
    displayName: 'Ritual Benefit';
  };
  attributes: {
    icon: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    text: Schema.Attribute.String;
  };
}

export interface LandingRitualCard extends Struct.ComponentSchema {
  collectionName: 'components_landing_ritual_cards';
  info: {
    displayName: 'Ritual Card';
  };
  attributes: {
    badge: Schema.Attribute.String;
    benefits: Schema.Attribute.Component<'landing.ritual-benefit', true>;
    benefitsTitle: Schema.Attribute.String;
    color: Schema.Attribute.String;
    date: Schema.Attribute.Date;
    image: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    imageAlt: Schema.Attribute.String;
    name: Schema.Attribute.String;
  };
}

export interface LandingWellnessCard extends Struct.ComponentSchema {
  collectionName: 'components_landing_wellness_cards';
  info: {
    displayName: 'Wellness Card';
  };
  attributes: {
    color: Schema.Attribute.Enumeration<['purple, peach, green, yellow']>;
    description: Schema.Attribute.Text;
    image: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    name: Schema.Attribute.String;
    videoUrl: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'landing.items': LandingItems;
      'landing.ritual-benefit': LandingRitualBenefit;
      'landing.ritual-card': LandingRitualCard;
      'landing.wellness-card': LandingWellnessCard;
    }
  }
}
