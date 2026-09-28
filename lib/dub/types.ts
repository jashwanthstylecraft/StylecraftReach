export interface DubLink {
  id: string;
  shortLink: string;
  url: string;
  domain: string;
  key: string;
  clicks: number;
  createdAt: string;
}

export interface DubAnalytics {
  clicks: number;
  leads: number;
  sales: number;
  saleAmount: number; // cents
  timeseries: {
    start: string;
    clicks: number;
    leads: number;
    sales: number;
    saleAmount: number;
  }[];
  countries: { country: string; clicks: number }[];
  devices: { device: string; clicks: number }[];
  referers: { referer: string; clicks: number }[];
}

export interface CreateLinkInput {
  url: string;
  key: string;
  tags: string[];
  externalId: string;
  comments?: string;
}

export interface TrackSaleInput {
  externalId: string;
  amount: number; // cents
  currency: string;
  paymentProcessor: string;
  invoiceId: string;
}
