import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISiteSettings extends Document {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  maintenanceEndsAt?: Date;
  announcement: string;
  announcementActive: boolean;
  updatedAt: Date;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    maintenanceMode: { type: Boolean, default: false },
    maintenanceMessage: { type: String, default: '', trim: true },
    maintenanceEndsAt: { type: Date, required: false },
    announcement: { type: String, default: '', trim: true },
    announcementActive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Singleton: single document for the whole app
SiteSettingsSchema.statics.get = async function (): Promise<ISiteSettings> {
  let doc = await this.findOne();
  if (!doc) {
    doc = await this.create({
      maintenanceMode: false,
      maintenanceMessage: '',
      announcement: '',
      announcementActive: false,
    });
  }
  return doc;
};

interface SiteSettingsModel extends Model<ISiteSettings> {
  get(): Promise<ISiteSettings>;
}

const SiteSettings =
  (mongoose.models.SiteSettings as SiteSettingsModel) ||
  mongoose.model<ISiteSettings, SiteSettingsModel>('SiteSettings', SiteSettingsSchema);

export default SiteSettings;
