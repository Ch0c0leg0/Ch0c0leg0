/* Typage permissif pour le client supabase-js.
   Les mappers (lib/supabase/mappers.ts) valident à l'exécution et
   produisent les types applicatifs stricts de ./types. */

/* eslint-disable @typescript-eslint/no-explicit-any */

type AnyTable = {
  Row: any;
  Insert: any;
  Update: any;
  Relationships: any[];
};

export type Database = {
  public: {
    Tables: {
      categories: AnyTable;
      products: AnyTable;
      product_images: AnyTable;
      profiles: AnyTable;
      promo_codes: AnyTable;
      orders: AnyTable;
      order_items: AnyTable;
      reviews: AnyTable;
      review_votes: AnyTable;
      wishlist: AnyTable;
      newsletter_subscribers: AnyTable;
      contact_messages: AnyTable;
      cart_reminders: AnyTable;
      shipping_rates: AnyTable;
      posts: AnyTable;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
