export type Quote = {
  customer: {
    name: string;
  };
  project: {
    title: string;
    description: string;
  };
  price: {
    amount: number;
    vatIncluded: boolean;
  };
};