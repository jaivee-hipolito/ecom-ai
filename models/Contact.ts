import mongoose, { Schema, Model } from 'mongoose';

export interface IContact {
  name: string;
  email: string;
  subject: string;
  message: string;
  status?: 'new' | 'read' | 'replied' | 'archived';
  createdAt?: Date;
  updatedAt?: Date;
}

const ContactSchema = new Schema<IContact>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [200, 'Subject cannot be more than 200 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [5000, 'Message cannot be more than 5000 characters'],
    },
    status: {
      type: String,
      enum: ['new', 'read', 'replied', 'archived'],
      default: 'new',
    },
  },
  {
    timestamps: true,
  }
);

// Register Contact model
let Contact: Model<IContact>;
if (mongoose.models.Contact) {
  Contact = mongoose.models.Contact as Model<IContact>;
} else {
  Contact = mongoose.model<IContact>('Contact', ContactSchema);
}

export default Contact;
