import mongoose, { Schema, Document } from 'mongoose';

export type CollectionType = 'itinerary' | 'conversation';

export interface ICollection extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  itemId: mongoose.Types.ObjectId;
  itemType: CollectionType;
  createdAt: Date;
}

const CollectionSchema = new Schema<ICollection>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    itemId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    itemType: {
      type: String,
      enum: ['itinerary', 'conversation'],
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// 索引
CollectionSchema.index({ userId: 1, createdAt: -1 });
CollectionSchema.index({ userId: 1, itemId: 1 }, { unique: true });
CollectionSchema.index({ itemId: 1, itemType: 1 });

export const Collection = mongoose.model<ICollection>(
  'Collection',
  CollectionSchema
);
