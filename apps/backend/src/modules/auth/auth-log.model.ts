import mongoose from 'mongoose';

export const AuthLogEvent = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  REFRESH: 'refresh',
  LOGIN_FAILED: 'login_failed',
  REFRESH_FAILED: 'refresh_failed',
  REGISTER: 'register',
} as const;

export const AuthLogMethod = {
  PASSWORD: 'password',
  GOOGLE: 'google',
  FACEBOOK: 'facebook',
} as const;

const authLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    event: { type: String, enum: Object.values(AuthLogEvent), required: true },
    method: { type: String, enum: Object.values(AuthLogMethod) },
    ip: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    success: { type: Boolean, required: true },
    reason: { type: String },
  },
  { timestamps: true }
);

authLogSchema.index({ userId: 1 });
authLogSchema.index({ createdAt: -1 });
authLogSchema.index({ userId: 1, createdAt: -1 });

export const AuthLogModel = mongoose.model('AuthLog', authLogSchema);
