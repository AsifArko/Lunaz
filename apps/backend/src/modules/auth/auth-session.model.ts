import mongoose from 'mongoose';

const authSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    refreshTokenHash: { type: String, required: true },
    userAgent: { type: String, default: '' },
    ip: { type: String, default: '' },
    deviceLabel: { type: String, default: '' },
    lastUsedAt: { type: Date, default: Date.now },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

authSessionSchema.index({ refreshTokenHash: 1 });
authSessionSchema.index({ userId: 1, revokedAt: 1 });

export const AuthSessionModel = mongoose.model('AuthSession', authSessionSchema);
