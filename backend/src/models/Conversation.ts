import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface IConversation extends Document {
  _id: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  messages: IMessage[];
  title?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const ConversationSchema = new Schema<IConversation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    messages: [MessageSchema],
    title: {
      type: String,
      maxlength: 100,
    },
  },
  {
    timestamps: true,
  }
);

// 索引
ConversationSchema.index({ userId: 1, createdAt: -1 });
ConversationSchema.index({ 'messages.content': 'text', title: 'text' });

export const Conversation = mongoose.model<IConversation>(
  'Conversation',
  ConversationSchema
);
