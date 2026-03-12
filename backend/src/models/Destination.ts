import mongoose, { Schema, Document } from 'mongoose';

export interface IAttraction {
  name: string;
  description: string;
  image?: string;
  ticketPrice?: number;
  openingHours?: string;
}

export interface IDestination extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  nameEn?: string;
  region: string;
  country: string;
  type: string[];
  description: string;
  images: string[];
  attractions: IAttraction[];
  bestTimeToVisit: string;
  averageBudget: {
    min: number;
    max: number;
    currency: string;
  };
  climate?: string;
  transportation?: string;
  tips: string[];
  popularity: number;
  createdAt: Date;
  updatedAt: Date;
}

const AttractionSchema = new Schema<IAttraction>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: String,
    ticketPrice: { type: Number, min: 0 },
    openingHours: String,
  },
  { _id: false }
);

const DestinationSchema = new Schema<IDestination>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    nameEn: {
      type: String,
      trim: true,
    },
    region: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    type: [
      {
        type: String,
        enum: [
          '海滨',
          '文化',
          '冒险',
          '美食',
          '购物',
          '自然',
          '历史',
          '现代',
        ],
      },
    ],
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    images: [{ type: String }],
    attractions: [AttractionSchema],
    bestTimeToVisit: {
      type: String,
      required: true,
    },
    averageBudget: {
      min: { type: Number, required: true, min: 0 },
      max: { type: Number, required: true, min: 0 },
      currency: { type: String, default: 'CNY' },
    },
    climate: String,
    transportation: String,
    tips: [String],
    popularity: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

// 索引
DestinationSchema.index({ name: 1 });
DestinationSchema.index({ region: 1, country: 1 });
DestinationSchema.index({ popularity: -1 });
DestinationSchema.index({ name: 'text', description: 'text' });

// 验证：确保max >= min
DestinationSchema.pre('save', function (next) {
  if (this.averageBudget.max < this.averageBudget.min) {
    next(new Error('最大预算不能小于最小预算'));
  }
  next();
});

export const Destination = mongoose.model<IDestination>(
  'Destination',
  DestinationSchema
);
