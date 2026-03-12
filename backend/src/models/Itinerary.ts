import mongoose, { Schema, Document } from 'mongoose';

export interface IActivity {
  time: string;
  name: string;
  description: string;
  location: string;
  cost: number;
  duration: string;
}

export interface IMeal {
  type: 'breakfast' | 'lunch' | 'dinner';
  restaurant: string;
  cuisine: string;
  estimatedCost: number;
}

export interface IDayPlan {
  day: number;
  activities: IActivity[];
  meals: IMeal[];
  accommodation?: string;
  dailyBudget: number;
}

export interface IItinerary extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  destination: string;
  days: number;
  budget: number;
  preferences: string[];
  content: IDayPlan[];
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    time: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    cost: { type: Number, required: true, min: 0 },
    duration: { type: String, required: true },
  },
  { _id: false }
);

const MealSchema = new Schema<IMeal>(
  {
    type: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner'],
      required: true,
    },
    restaurant: { type: String, required: true },
    cuisine: { type: String, required: true },
    estimatedCost: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const DayPlanSchema = new Schema<IDayPlan>(
  {
    day: { type: Number, required: true, min: 1 },
    activities: [ActivitySchema],
    meals: [MealSchema],
    accommodation: String,
    dailyBudget: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const ItinerarySchema = new Schema<IItinerary>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
    },
    days: {
      type: Number,
      required: true,
      min: 1,
      max: 30,
    },
    budget: {
      type: Number,
      required: true,
      min: 0,
    },
    preferences: [String],
    content: [DayPlanSchema],
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// 索引
ItinerarySchema.index({ userId: 1, createdAt: -1 });
ItinerarySchema.index({ destination: 1 });
ItinerarySchema.index({ destination: 'text' });

// 虚拟字段：计算总预算
ItinerarySchema.virtual('totalBudget').get(function () {
  return this.content.reduce((sum, day) => sum + day.dailyBudget, 0);
});

export const Itinerary = mongoose.model<IItinerary>(
  'Itinerary',
  ItinerarySchema
);
