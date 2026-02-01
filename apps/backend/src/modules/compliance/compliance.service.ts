import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { TaxRecordModel } from './models/tax-record.model.js';
import {
  BusinessAuthenticityModel,
  getBusinessAuthenticity,
} from './models/business-authenticity.model.js';
import { CertificateModel } from './models/certificate.model.js';
import { LegalDocumentModel } from './models/legal-document.model.js';
import { ComplianceActivityModel, logComplianceActivity } from './models/compliance-activity.model.js';

// ============================================
// TAX RECORDS
// ============================================

export async function listTaxRecords(req: Request, res: Response, next: NextFunction) {
  try {
    const { fiscalYear, taxType, paymentStatus, filingStatus, page, limit, sort } = req.query;

    const filter: Record<string, unknown> = {};
    if (fiscalYear) filter.fiscalYear = fiscalYear;
    if (taxType) filter.taxType = taxType;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (filingStatus) filter.filingStatus = filingStatus;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [records, total] = await Promise.all([
      TaxRecordModel.find(filter)
        .sort(String(sort) || '-createdAt')
        .skip(skip)
        .limit(limitNum)
        .populate('createdBy', 'name email')
        .lean(),
      TaxRecordModel.countDocuments(filter),
    ]);

    res.json({
      data: records,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (e) {
    next(e);
  }
}

export async function createTaxRecord(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!._id;
    const record = await TaxRecordModel.create({
      ...req.body,
      createdBy: userId,
    });

    await logComplianceActivity({
      activityType: 'tax_record_created',
      description: `Created tax record for ${req.body.fiscalYear} - ${req.body.taxType}`,
      entityType: 'tax_record',
      entityId: record._id as mongoose.Types.ObjectId,
      entityName: `${req.body.fiscalYear} ${req.body.taxType}`,
      newValue: req.body,
      performedBy: userId,
    });

    res.status(201).json(record);
  } catch (e) {
    next(e);
  }
}

export async function getTaxRecord(req: Request, res: Response, next: NextFunction) {
  try {
    const record = await TaxRecordModel.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('filedBy', 'name email');

    if (!record) {
      return res.status(404).json({ error: 'Tax record not found' });
    }

    res.json(record);
  } catch (e) {
    next(e);
  }
}

export async function updateTaxRecord(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!._id;
    const record = await TaxRecordModel.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ error: 'Tax record not found' });
    }

    const previousValue = record.toObject();
    Object.assign(record, req.body, { lastModifiedBy: userId });
    await record.save();

    await logComplianceActivity({
      activityType: 'tax_record_updated',
      description: `Updated tax record for ${record.fiscalYear} - ${record.taxType}`,
      entityType: 'tax_record',
      entityId: record._id as mongoose.Types.ObjectId,
      entityName: `${record.fiscalYear} ${record.taxType}`,
      previousValue,
      newValue: req.body,
      performedBy: userId,
    });

    res.json(record);
  } catch (e) {
    next(e);
  }
}

export async function deleteTaxRecord(req: Request, res: Response, next: NextFunction) {
  try {
    const record = await TaxRecordModel.findByIdAndDelete(req.params.id);

    if (!record) {
      return res.status(404).json({ error: 'Tax record not found' });
    }

    res.json({ message: 'Tax record deleted successfully' });
  } catch (e) {
    next(e);
  }
}

export async function addTaxPayment(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!._id;
    const record = await TaxRecordModel.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ error: 'Tax record not found' });
    }

    record.payments.push(req.body);
    record.lastModifiedBy = userId;
    await record.save();

    await logComplianceActivity({
      activityType: 'tax_payment_made',
      description: `Payment of ${req.body.amount} recorded for ${record.fiscalYear} - ${record.taxType}`,
      entityType: 'tax_record',
      entityId: record._id as mongoose.Types.ObjectId,
      entityName: `${record.fiscalYear} ${record.taxType}`,
      newValue: req.body,
      performedBy: userId,
    });

    res.json(record);
  } catch (e) {
    next(e);
  }
}

export async function removeTaxPayment(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!._id;
    const record = await TaxRecordModel.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ error: 'Tax record not found' });
    }

    const paymentIndex = record.payments.findIndex(
      (p) => p._id?.toString() === req.params.paymentId
    );

    if (paymentIndex === -1) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    record.payments.splice(paymentIndex, 1);
    record.lastModifiedBy = userId;
    await record.save();

    res.json(record);
  } catch (e) {
    next(e);
  }
}

export async function fileTaxRecord(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!._id;
    const record = await TaxRecordModel.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ error: 'Tax record not found' });
    }

    record.filingStatus = 'submitted';
    record.filingDate = req.body.filingDate ? new Date(req.body.filingDate) : new Date();
    record.acknowledgmentNumber = req.body.acknowledgmentNumber;
    record.filedBy = userId;
    record.lastModifiedBy = userId;
    await record.save();

    await logComplianceActivity({
      activityType: 'tax_filed',
      description: `Tax filed for ${record.fiscalYear} - ${record.taxType}`,
      entityType: 'tax_record',
      entityId: record._id as mongoose.Types.ObjectId,
      entityName: `${record.fiscalYear} ${record.taxType}`,
      newValue: { acknowledgmentNumber: req.body.acknowledgmentNumber },
      performedBy: userId,
    });

    res.json(record);
  } catch (e) {
    next(e);
  }
}

export async function getTaxSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const currentYear = new Date().getFullYear();
    const fiscalYear = `${currentYear - 1}-${currentYear}`;

    const [totalTax, totalPaid, pending, overdue] = await Promise.all([
      TaxRecordModel.aggregate([
        { $match: { fiscalYear } },
        { $group: { _id: null, total: { $sum: '$taxAmount' } } },
      ]),
      TaxRecordModel.aggregate([
        { $match: { fiscalYear } },
        { $group: { _id: null, total: { $sum: '$totalPaid' } } },
      ]),
      TaxRecordModel.countDocuments({ fiscalYear, paymentStatus: 'pending' }),
      TaxRecordModel.countDocuments({ fiscalYear, paymentStatus: 'overdue' }),
    ]);

    res.json({
      fiscalYear,
      totalTax: totalTax[0]?.total || 0,
      totalPaid: totalPaid[0]?.total || 0,
      balance: (totalTax[0]?.total || 0) - (totalPaid[0]?.total || 0),
      pendingCount: pending,
      overdueCount: overdue,
    });
  } catch (e) {
    next(e);
  }
}

// ============================================
// BUSINESS AUTHENTICITY
// ============================================

export async function getAuthenticity(req: Request, res: Response, next: NextFunction) {
  try {
    const record = await getBusinessAuthenticity();
    res.json(record || {});
  } catch (e) {
    next(e);
  }
}

export async function createAuthenticity(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!._id;
    const existing = await getBusinessAuthenticity();

    if (existing) {
      return res.status(400).json({ error: 'Business authenticity record already exists' });
    }

    const record = await BusinessAuthenticityModel.create({
      ...req.body,
      createdBy: userId,
    });

    await logComplianceActivity({
      activityType: 'authenticity_updated',
      description: 'Business authenticity record created',
      entityType: 'authenticity',
      entityId: record._id as mongoose.Types.ObjectId,
      entityName: req.body.legalName,
      newValue: req.body,
      performedBy: userId,
    });

    res.status(201).json(record);
  } catch (e) {
    next(e);
  }
}

export async function updateAuthenticity(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!._id;
    let record = await getBusinessAuthenticity();

    if (!record) {
      record = await BusinessAuthenticityModel.create({
        ...req.body,
        createdBy: userId,
      });
    } else {
      const previousValue = record.toObject();
      Object.assign(record, req.body, { lastModifiedBy: userId });
      await record.save();

      await logComplianceActivity({
        activityType: 'authenticity_updated',
        description: 'Business authenticity record updated',
        entityType: 'authenticity',
        entityId: record._id as mongoose.Types.ObjectId,
        entityName: record.legalName,
        previousValue,
        newValue: req.body,
        performedBy: userId,
      });
    }

    res.json(record);
  } catch (e) {
    next(e);
  }
}

export async function addDirector(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!._id;
    const record = await getBusinessAuthenticity();

    if (!record) {
      return res.status(404).json({ error: 'Business authenticity record not found' });
    }

    record.directors.push(req.body);
    record.lastModifiedBy = userId;
    await record.save();

    await logComplianceActivity({
      activityType: 'director_added',
      description: `Director ${req.body.name} added`,
      entityType: 'authenticity',
      entityId: record._id as mongoose.Types.ObjectId,
      entityName: req.body.name,
      newValue: req.body,
      performedBy: userId,
    });

    res.json(record);
  } catch (e) {
    next(e);
  }
}

export async function updateDirector(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!._id;
    const record = await getBusinessAuthenticity();

    if (!record) {
      return res.status(404).json({ error: 'Business authenticity record not found' });
    }

    const director = record.directors.id(req.params.directorId);
    if (!director) {
      return res.status(404).json({ error: 'Director not found' });
    }

    Object.assign(director, req.body);
    record.lastModifiedBy = userId;
    await record.save();

    res.json(record);
  } catch (e) {
    next(e);
  }
}

export async function removeDirector(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!._id;
    const record = await getBusinessAuthenticity();

    if (!record) {
      return res.status(404).json({ error: 'Business authenticity record not found' });
    }

    const director = record.directors.id(req.params.directorId);
    if (!director) {
      return res.status(404).json({ error: 'Director not found' });
    }

    const directorName = director.name;
    director.deleteOne();
    record.lastModifiedBy = userId;
    await record.save();

    await logComplianceActivity({
      activityType: 'director_removed',
      description: `Director ${directorName} removed`,
      entityType: 'authenticity',
      entityId: record._id as mongoose.Types.ObjectId,
      entityName: directorName,
      performedBy: userId,
    });

    res.json(record);
  } catch (e) {
    next(e);
  }
}

export async function addTaxIdentifier(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!._id;
    const record = await getBusinessAuthenticity();

    if (!record) {
      return res.status(404).json({ error: 'Business authenticity record not found' });
    }

    record.taxIdentifiers.push(req.body);
    record.lastModifiedBy = userId;
    await record.save();

    res.json(record);
  } catch (e) {
    next(e);
  }
}

export async function updateTaxIdentifier(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!._id;
    const record = await getBusinessAuthenticity();

    if (!record) {
      return res.status(404).json({ error: 'Business authenticity record not found' });
    }

    const identifier = record.taxIdentifiers.id(req.params.identifierId);
    if (!identifier) {
      return res.status(404).json({ error: 'Tax identifier not found' });
    }

    Object.assign(identifier, req.body);
    record.lastModifiedBy = userId;
    await record.save();

    res.json(record);
  } catch (e) {
    next(e);
  }
}

export async function removeTaxIdentifier(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!._id;
    const record = await getBusinessAuthenticity();

    if (!record) {
      return res.status(404).json({ error: 'Business authenticity record not found' });
    }

    const identifier = record.taxIdentifiers.id(req.params.identifierId);
    if (!identifier) {
      return res.status(404).json({ error: 'Tax identifier not found' });
    }

    identifier.deleteOne();
    record.lastModifiedBy = userId;
    await record.save();

    res.json(record);
  } catch (e) {
    next(e);
  }
}

// ============================================
// CERTIFICATES
// ============================================

export async function listCertificates(req: Request, res: Response, next: NextFunction) {
  try {
    const { type, status, expiringSoon, page, limit, sort } = req.query;

    const filter: Record<string, unknown> = {};
    if (type) filter.certificateType = type;
    if (status) filter.status = status;
    if (expiringSoon === 'true') {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      filter.expiryDate = { $lte: thirtyDaysFromNow, $gte: new Date() };
    }

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [certificates, total] = await Promise.all([
      CertificateModel.find(filter)
        .sort(String(sort) || '-createdAt')
        .skip(skip)
        .limit(limitNum)
        .populate('createdBy', 'name email')
        .lean(),
      CertificateModel.countDocuments(filter),
    ]);

    res.json({
      data: certificates,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (e) {
    next(e);
  }
}

export async function createCertificate(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!._id;
    const certificate = await CertificateModel.create({
      ...req.body,
      createdBy: userId,
    });

    await logComplianceActivity({
      activityType: 'certificate_added',
      description: `Certificate ${req.body.name} added`,
      entityType: 'certificate',
      entityId: certificate._id as mongoose.Types.ObjectId,
      entityName: req.body.name,
      newValue: req.body,
      performedBy: userId,
    });

    res.status(201).json(certificate);
  } catch (e) {
    next(e);
  }
}

export async function getCertificate(req: Request, res: Response, next: NextFunction) {
  try {
    const certificate = await CertificateModel.findById(req.params.id).populate(
      'createdBy',
      'name email'
    );

    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    res.json(certificate);
  } catch (e) {
    next(e);
  }
}

export async function updateCertificate(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!._id;
    const certificate = await CertificateModel.findById(req.params.id);

    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    Object.assign(certificate, req.body, { lastModifiedBy: userId });
    await certificate.save();

    res.json(certificate);
  } catch (e) {
    next(e);
  }
}

export async function deleteCertificate(req: Request, res: Response, next: NextFunction) {
  try {
    const certificate = await CertificateModel.findByIdAndDelete(req.params.id);

    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    res.json({ message: 'Certificate deleted successfully' });
  } catch (e) {
    next(e);
  }
}

export async function renewCertificate(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!._id;
    const certificate = await CertificateModel.findById(req.params.id);

    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    // Add to renewal history
    certificate.renewalHistory.push({
      renewalDate: new Date(),
      previousExpiryDate: certificate.expiryDate,
      newExpiryDate: new Date(req.body.newExpiryDate),
      fee: req.body.fee,
      certificateFile: req.body.certificateFile,
      processedBy: userId,
      notes: req.body.notes,
    });

    // Update certificate
    certificate.expiryDate = new Date(req.body.newExpiryDate);
    certificate.certificateFile = req.body.certificateFile;
    certificate.status = 'active';
    certificate.lastModifiedBy = userId;
    await certificate.save();

    await logComplianceActivity({
      activityType: 'certificate_renewed',
      description: `Certificate ${certificate.name} renewed until ${req.body.newExpiryDate}`,
      entityType: 'certificate',
      entityId: certificate._id as mongoose.Types.ObjectId,
      entityName: certificate.name,
      newValue: req.body,
      performedBy: userId,
    });

    res.json(certificate);
  } catch (e) {
    next(e);
  }
}

// ============================================
// LEGAL DOCUMENTS
// ============================================

export async function listDocuments(req: Request, res: Response, next: NextFunction) {
  try {
    const { category, status, accessLevel, search, page, limit, sort } = req.query;

    const filter: Record<string, unknown> = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (accessLevel) filter.accessLevel = accessLevel;
    if (search) {
      filter.$text = { $search: String(search) };
    }

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [documents, total] = await Promise.all([
      LegalDocumentModel.find(filter)
        .sort(String(sort) || '-createdAt')
        .skip(skip)
        .limit(limitNum)
        .populate('createdBy', 'name email')
        .lean(),
      LegalDocumentModel.countDocuments(filter),
    ]);

    res.json({
      data: documents,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (e) {
    next(e);
  }
}

export async function createDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!._id;

    // Add initial version
    const documentData = {
      ...req.body,
      createdBy: userId,
      versions: [
        {
          versionNumber: 1,
          file: req.body.currentFile,
          uploadedBy: userId,
          changeDescription: 'Initial version',
        },
      ],
    };

    const document = await LegalDocumentModel.create(documentData);

    await logComplianceActivity({
      activityType: 'document_uploaded',
      description: `Document ${req.body.title} uploaded`,
      entityType: 'document',
      entityId: document._id as mongoose.Types.ObjectId,
      entityName: req.body.title,
      newValue: req.body,
      performedBy: userId,
    });

    res.status(201).json(document);
  } catch (e) {
    next(e);
  }
}

export async function getDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const document = await LegalDocumentModel.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('versions.uploadedBy', 'name email')
      .populate('relatedDocuments', 'title category status');

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json(document);
  } catch (e) {
    next(e);
  }
}

export async function updateDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!._id;
    const document = await LegalDocumentModel.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    Object.assign(document, req.body, { lastModifiedBy: userId });
    await document.save();

    await logComplianceActivity({
      activityType: 'document_updated',
      description: `Document ${document.title} updated`,
      entityType: 'document',
      entityId: document._id as mongoose.Types.ObjectId,
      entityName: document.title,
      newValue: req.body,
      performedBy: userId,
    });

    res.json(document);
  } catch (e) {
    next(e);
  }
}

export async function deleteDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const document = await LegalDocumentModel.findByIdAndDelete(req.params.id);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({ message: 'Document deleted successfully' });
  } catch (e) {
    next(e);
  }
}

export async function addDocumentVersion(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!._id;
    const document = await LegalDocumentModel.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const newVersion = document.currentVersion + 1;

    document.versions.push({
      versionNumber: newVersion,
      file: req.body.file,
      uploadedBy: userId,
      changeDescription: req.body.changeDescription,
    });

    document.currentVersion = newVersion;
    document.currentFile = req.body.file;
    document.lastModifiedBy = userId;
    await document.save();

    res.json(document);
  } catch (e) {
    next(e);
  }
}

export async function getDocumentVersions(req: Request, res: Response, next: NextFunction) {
  try {
    const document = await LegalDocumentModel.findById(req.params.id)
      .select('versions title currentVersion')
      .populate('versions.uploadedBy', 'name email');

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({
      title: document.title,
      currentVersion: document.currentVersion,
      versions: document.versions,
    });
  } catch (e) {
    next(e);
  }
}

// ============================================
// DASHBOARD & REPORTS
// ============================================

export async function getDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    // Get counts and summaries in parallel
    const [
      taxSummary,
      expiringCertificates,
      pendingTaxPayments,
      overdueTaxPayments,
      activeCertificates,
      totalDocuments,
      recentActivity,
    ] = await Promise.all([
      // Tax summary for current fiscal year
      TaxRecordModel.aggregate([
        { $group: { _id: null, total: { $sum: '$taxAmount' }, paid: { $sum: '$totalPaid' } } },
      ]),

      // Expiring certificates (within 30 days)
      CertificateModel.find({
        expiryDate: { $lte: thirtyDaysFromNow, $gte: now },
        status: 'active',
      })
        .select('name certificateType expiryDate')
        .sort('expiryDate')
        .limit(5)
        .lean(),

      // Pending tax payments
      TaxRecordModel.countDocuments({ paymentStatus: 'pending' }),

      // Overdue tax payments
      TaxRecordModel.countDocuments({ paymentStatus: 'overdue' }),

      // Active certificates count
      CertificateModel.countDocuments({ status: 'active' }),

      // Total documents
      LegalDocumentModel.countDocuments(),

      // Recent activity
      ComplianceActivityModel.find()
        .sort('-createdAt')
        .limit(10)
        .populate('performedBy', 'name')
        .lean(),
    ]);

    // Calculate compliance score
    const totalItems = activeCertificates + pendingTaxPayments + overdueTaxPayments;
    const compliantItems = activeCertificates;
    const complianceScore = totalItems > 0 ? Math.round((compliantItems / totalItems) * 100) : 100;

    res.json({
      complianceScore,
      taxSummary: {
        total: taxSummary[0]?.total || 0,
        paid: taxSummary[0]?.paid || 0,
        balance: (taxSummary[0]?.total || 0) - (taxSummary[0]?.paid || 0),
      },
      expiringSoon: expiringCertificates,
      pendingActions: {
        pendingTaxPayments,
        overdueTaxPayments,
        expiringCertificates: expiringCertificates.length,
      },
      counts: {
        activeCertificates,
        totalDocuments,
      },
      recentActivity,
    });
  } catch (e) {
    next(e);
  }
}

export async function getExpiringItems(req: Request, res: Response, next: NextFunction) {
  try {
    const days = Number(req.query.days) || 30;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const [certificates, documents] = await Promise.all([
      CertificateModel.find({
        expiryDate: { $lte: futureDate, $gte: new Date() },
        status: 'active',
      })
        .select('name certificateType expiryDate')
        .sort('expiryDate')
        .lean(),

      LegalDocumentModel.find({
        expiryDate: { $lte: futureDate, $gte: new Date() },
        status: 'active',
      })
        .select('title category expiryDate')
        .sort('expiryDate')
        .lean(),
    ]);

    res.json({
      certificates,
      documents,
    });
  } catch (e) {
    next(e);
  }
}

export async function getActivityLog(req: Request, res: Response, next: NextFunction) {
  try {
    const { entityType, activityType, startDate, endDate, page, limit } = req.query;

    const filter: Record<string, unknown> = {};
    if (entityType) filter.entityType = entityType;
    if (activityType) filter.activityType = activityType;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) (filter.createdAt as Record<string, Date>).$gte = new Date(String(startDate));
      if (endDate) (filter.createdAt as Record<string, Date>).$lte = new Date(String(endDate));
    }

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 50;
    const skip = (pageNum - 1) * limitNum;

    const [activities, total] = await Promise.all([
      ComplianceActivityModel.find(filter)
        .sort('-createdAt')
        .skip(skip)
        .limit(limitNum)
        .populate('performedBy', 'name email')
        .lean(),
      ComplianceActivityModel.countDocuments(filter),
    ]);

    res.json({
      data: activities,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (e) {
    next(e);
  }
}
