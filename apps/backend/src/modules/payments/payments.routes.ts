import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/requireRole.js';
import { validateBody, validateQuery } from '../../middleware/validate.js';
import { getConfig } from '../../config/index.js';
import { UserRole, PaymentMethod, PaymentStatus } from '../../constants/enums';
import {
  initiatePaymentSchema,
  submitBankTransferProofSchema,
  verifyBankTransferSchema,
  refundPaymentSchema,
  listPaymentsQuerySchema,
} from './payments.validation.js';
import * as paymentService from './payments.service.js';

const router = Router();
const getConfigFn = getConfig;

function getWebUrl(): string {
  return getConfigFn().FRONTEND_WEB_URL || process.env.WEB_URL || 'http://localhost:3000';
}

// ==================== Public Routes (Webhooks/Callbacks) ====================

// bKash callback (redirect after payment)
router.get('/bkash/callback', async (req, res) => {
  try {
    const { paymentID, status } = req.query;
    const payment = await paymentService.handleCallback(PaymentMethod.BKASH, {
      paymentID,
      status,
    });

    const webUrl = getWebUrl();
    if (payment.status === PaymentStatus.PAID) {
      res.redirect(`${webUrl}/checkout/success?orderId=${payment.orderId}`);
    } else {
      res.redirect(`${webUrl}/checkout/failed?orderId=${payment.orderId}`);
    }
  } catch (error) {
    res.redirect(`${getWebUrl()}/checkout/error`);
  }
});

// Nagad callback
router.get('/nagad/callback', async (req, res) => {
  try {
    const payment = await paymentService.handleCallback(PaymentMethod.NAGAD, req.query);

    const webUrl = getWebUrl();
    if (payment.status === PaymentStatus.PAID) {
      res.redirect(`${webUrl}/checkout/success?orderId=${payment.orderId}`);
    } else {
      res.redirect(`${webUrl}/checkout/failed?orderId=${payment.orderId}`);
    }
  } catch (error) {
    res.redirect(`${getWebUrl()}/checkout/error`);
  }
});

// SSLCommerz IPN (Instant Payment Notification)
router.post('/sslcommerz/ipn', async (req, res) => {
  try {
    await paymentService.handleCallback(PaymentMethod.CARD, req.body);
    res.status(200).send('IPN Received');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('SSLCommerz IPN error:', error);
    res.status(500).send('IPN Error');
  }
});

// SSLCommerz success redirect (POST from gateway; GET for backwards compatibility)
function sslSuccessRedirect(orderId: string, payment: { status: string }) {
  const webUrl = getWebUrl();
  if (payment.status === PaymentStatus.PAID) {
    return `${webUrl}/checkout/success?orderId=${orderId}`;
  }
  return `${webUrl}/checkout/failed?orderId=${orderId}`;
}

router.post('/sslcommerz/success', async (req, res) => {
  try {
    const orderId = req.body?.value_b || req.body?.orderId;
    const payment = await paymentService.handleCallback(PaymentMethod.CARD, req.body);
    res.redirect(sslSuccessRedirect(orderId || payment.orderId?.toString(), payment));
  } catch (error) {
    res.redirect(`${getWebUrl()}/checkout/error`);
  }
});

router.get('/sslcommerz/success', async (req, res) => {
  try {
    const orderId = (req.query?.value_b || req.query?.orderId) as string | undefined;
    const payment = await paymentService.handleCallback(PaymentMethod.CARD, req.query);
    const oid = orderId || (payment.orderId && payment.orderId.toString());
    res.redirect(sslSuccessRedirect(oid || '', payment));
  } catch (error) {
    res.redirect(`${getWebUrl()}/checkout/error`);
  }
});

// SSLCommerz fail redirect
router.post('/sslcommerz/fail', (req, res) => {
  const orderId = req.body?.value_b || req.body?.orderId;
  res.redirect(`${getWebUrl()}/checkout/failed${orderId ? `?orderId=${orderId}` : ''}`);
});

router.get('/sslcommerz/fail', (req, res) => {
  const orderId = req.query?.value_b || req.query?.orderId;
  res.redirect(`${getWebUrl()}/checkout/failed${orderId ? `?orderId=${orderId}` : ''}`);
});

// SSLCommerz cancel redirect
router.post('/sslcommerz/cancel', (req, res) => {
  const orderId = req.body?.value_b || req.body?.orderId;
  res.redirect(`${getWebUrl()}/checkout/cancelled${orderId ? `?orderId=${orderId}` : ''}`);
});

router.get('/sslcommerz/cancel', (req, res) => {
  const orderId = req.query?.value_b || req.query?.orderId;
  res.redirect(`${getWebUrl()}/checkout/cancelled${orderId ? `?orderId=${orderId}` : ''}`);
});

// ==================== Public API Routes ====================

// GET /payments/methods — available payment methods (public)
router.get('/methods', async (_req, res, next) => {
  try {
    const methods = await paymentService.getEnabledPaymentMethods();
    res.json({ methods });
  } catch (e) {
    next(e);
  }
});

// ==================== Authenticated Routes ====================

// Apply auth middleware to remaining routes
router.use(authMiddleware(getConfigFn));

// POST /payments/initiate — initiate a payment
router.post('/initiate', validateBody(initiatePaymentSchema), async (req, res, next) => {
  try {
    const result = await paymentService.initiatePayment(
      req.body.orderId,
      req.body.method,
      req.user!.id,
      req.ip,
      req.get('user-agent')
    );
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});

// GET /payments/:paymentId/status — check payment status
router.get('/:paymentId/status', async (req, res, next) => {
  try {
    const isAdmin = req.user!.role === UserRole.ADMIN;
    const payment = await paymentService.getPayment(req.params.paymentId, req.user!.id, isAdmin);
    res.json({
      paymentId: payment._id.toString(),
      status: payment.status,
      method: payment.method,
      amount: payment.amount,
      currency: payment.currency,
      failureReason: payment.failureReason,
    });
  } catch (e) {
    next(e);
  }
});

// GET /payments/:paymentId — get payment details
router.get('/:paymentId', async (req, res, next) => {
  try {
    const isAdmin = req.user!.role === UserRole.ADMIN;
    const payment = await paymentService.getPayment(req.params.paymentId, req.user!.id, isAdmin);
    res.json(paymentService.formatPayment(payment));
  } catch (e) {
    next(e);
  }
});

// POST /payments/:paymentId/bank-transfer-proof — submit bank transfer proof
router.post(
  '/:paymentId/bank-transfer-proof',
  validateBody(submitBankTransferProofSchema),
  async (req, res, next) => {
    try {
      // Note: In production, you'd handle file upload separately
      // and pass the uploaded URL here
      const proofUrl = req.body.proofUrl || '';
      const payment = await paymentService.submitBankTransferProof(
        req.params.paymentId,
        req.user!.id,
        proofUrl,
        req.body.transactionReference,
        req.body.bankName
      );
      res.json(paymentService.formatPayment(payment));
    } catch (e) {
      next(e);
    }
  }
);

// ==================== Admin Routes ====================

// GET /payments — list all payments (admin only)
router.get(
  '/',
  requireRole(UserRole.ADMIN),
  validateQuery(listPaymentsQuerySchema),
  async (req, res, next) => {
    try {
      const result = await paymentService.listPayments({
        status: req.query.status as PaymentStatus | undefined,
        method: req.query.method as PaymentMethod | undefined,
        orderId: req.query.orderId as string | undefined,
        userId: req.query.userId as string | undefined,
        from: req.query.from as string | undefined,
        to: req.query.to as string | undefined,
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
      });
      res.json(result);
    } catch (e) {
      next(e);
    }
  }
);

// GET /payments/pending-bank-transfers — get pending bank transfers (admin)
router.get('/pending-bank-transfers', requireRole(UserRole.ADMIN), async (_req, res, next) => {
  try {
    const payments = await paymentService.getPendingBankTransfers();
    res.json({ payments });
  } catch (e) {
    next(e);
  }
});

// POST /payments/:paymentId/verify-bank-transfer — verify bank transfer (admin)
router.post(
  '/:paymentId/verify-bank-transfer',
  requireRole(UserRole.ADMIN),
  validateBody(verifyBankTransferSchema),
  async (req, res, next) => {
    try {
      const payment = await paymentService.verifyBankTransfer(
        req.params.paymentId,
        req.body.verified,
        req.user!.id,
        req.body.notes
      );
      res.json(paymentService.formatPayment(payment));
    } catch (e) {
      next(e);
    }
  }
);

// POST /payments/:paymentId/refund — process refund (admin)
router.post(
  '/:paymentId/refund',
  requireRole(UserRole.ADMIN),
  validateBody(refundPaymentSchema),
  async (req, res, next) => {
    try {
      const payment = await paymentService.processRefund(
        req.params.paymentId,
        req.body.amount,
        req.body.reason,
        req.user!.id
      );
      res.json(paymentService.formatPayment(payment));
    } catch (e) {
      next(e);
    }
  }
);

export const paymentsRoutes = router;
