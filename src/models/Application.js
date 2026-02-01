import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    applicationNumber: {
      type: String,
      unique: true,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    personalInfo: {
      fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        minlength: 2,
        maxlength: 100,
      },
      dateOfBirth: {
        type: Date,
        required: [true, 'Date of birth is required'],
      },
      email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true,
      },
      phone: {
        type: String,
        required: [true, 'Phone is required'],
        trim: true,
      },
      panCard: {
        type: String,
        required: [true, 'PAN card is required'],
        uppercase: true,
        unique: true,
        trim: true,
        match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN card format'],
      },
      address: {
        street: {
          type: String,
          required: true,
          trim: true,
        },
        city: {
          type: String,
          required: true,
          trim: true,
        },
        state: {
          type: String,
          required: true,
          trim: true,
        },
        pincode: {
          type: String,
          required: true,
          trim: true,
          match: [/^[1-9][0-9]{5}$/, 'Invalid pincode'],
        },
      },
    },
    employmentInfo: {
      employmentType: {
        type: String,
        required: true,
        enum: ['salaried', 'self-employed', 'business'],
      },
      annualIncome: {
        type: Number,
        required: [true, 'Annual income is required'],
        min: 0,
      },
      companyName: {
        type: String,
        required: true,
        trim: true,
      },
      designation: {
        type: String,
        required: true,
        trim: true,
      },
    },
    creditInfo: {
      creditScore: {
        type: Number,
        min: 300,
        max: 900,
      },
      creditLimit: {
        type: Number,
        min: 0,
      },
      retrievedAt: {
        type: Date,
      },
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: ['pending', 'approved', 'rejected'],
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        remarks: String,
      },
    ],
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    processedAt: Date,
    dispatchedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
applicationSchema.index({ applicationNumber: 1 });
applicationSchema.index({ userId: 1 });
applicationSchema.index({ 'personalInfo.panCard': 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ submittedAt: -1 });
applicationSchema.index({ 'personalInfo.panCard': 1, submittedAt: -1 });

// Virtual for age calculation
applicationSchema.virtual('age').get(function () {
  if (!this.personalInfo.dateOfBirth) return null;
  
  const today = new Date();
  const birthDate = new Date(this.personalInfo.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Generate application number
applicationSchema.statics.generateApplicationNumber = async function () {
  const prefix = 'CC';
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Find the last application for today
  const datePrefix = `${prefix}${year}${month}${day}`;
  const lastApplication = await this.findOne({
    applicationNumber: new RegExp(`^${datePrefix}`),
  }).sort({ applicationNumber: -1 });
  
  let sequence = 1;
  if (lastApplication) {
    const lastSequence = parseInt(lastApplication.applicationNumber.slice(-5));
    sequence = lastSequence + 1;
  }
  
  const sequenceStr = String(sequence).padStart(5, '0');
  return `${datePrefix}${sequenceStr}`;
};

const Application = mongoose.model('Application', applicationSchema);

export default Application;
