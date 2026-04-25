/** Cash on Delivery settings. */
export interface CODSettings {
  enabled: boolean;
  instructions?: string;
  minimumOrder: number;
  maximumOrder?: number;
  availableAreas?: string[];
}
