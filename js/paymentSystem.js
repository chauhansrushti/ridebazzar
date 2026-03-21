// Payment System for RideBazzar

class PaymentManager {
  constructor() {
    this.transactions = this.getTransactions();
    this.bookings = this.getBookings();
    
    // Automatically remove all cancelled bookings on initialization
    this.cleanupCancelledBookings();
  }

  // Get all transactions from localStorage
  getTransactions() {
    return JSON.parse(localStorage.getItem('ridebazzar_transactions') || '[]');
  }

  // Save transactions to localStorage
  saveTransactions(transactions) {
    localStorage.setItem('ridebazzar_transactions', JSON.stringify(transactions));
    this.transactions = transactions;
  }

  // Get all bookings from localStorage
  getBookings() {
    return JSON.parse(localStorage.getItem('ridebazzar_bookings') || '[]');
  }

  // Save bookings to localStorage
  saveBookings(bookings) {
    localStorage.setItem('ridebazzar_bookings', JSON.stringify(bookings));
    this.bookings = bookings;
  }

  // Remove all cancelled bookings
  removeAllCancelledBookings() {
    const activeBookings = this.bookings.filter(booking => booking.status !== 'cancelled');
    this.saveBookings(activeBookings);
    return { 
      message: `Removed ${this.bookings.length - activeBookings.length} cancelled bookings`,
      removedCount: this.bookings.length - activeBookings.length
    };
  }

  // Clean up cancelled bookings automatically
  cleanupCancelledBookings() {
    return this.removeAllCancelledBookings();
  }

  // Create a booking for a car
  createBooking(carId, bookingData) {
    console.log('createBooking called with carId:', carId);
    console.log('createBooking called with bookingData:', bookingData);
    
    // Check for user authentication with fallback
    const authToken = localStorage.getItem('authToken');
    const ridebazzarUser = localStorage.getItem('ridebazzar_user');
    const userData = localStorage.getItem('userData');
    
    let user;
    if (ridebazzarUser) {
      user = ridebazzarUser;
    } else if (userData) {
      try {
        const userObj = JSON.parse(userData);
        user = userObj.username;
      } catch (e) {
        user = null;
      }
    }
    
    console.log('Current user:', user);
    
    if (!user) {
      throw new Error('You must be logged in to book a car');
    }

    const car = carManager.getCarById(carId);
    console.log('Found car:', car);
    
    if (!car) {
      throw new Error('Car not found');
    }

    console.log('Car seller:', car.seller, 'Current user:', user);
    
    // Allow booking own car for testing purposes
    // if (car.seller === user) {
    //   throw new Error('You cannot book your own car');
    // }

    if (car.status !== 'available') {
      throw new Error('Car is not available for booking');
    }

    const booking = {
      id: Date.now().toString(),
      carId,
      buyer: user,
      seller: car.seller,
      carDetails: {
        make: car.make,
        model: car.model,
        year: car.year,
        price: car.price
      },
      bookingAmount: bookingData.bookingAmount || Math.min(car.price * 0.1, 50000), // 10% or max 50k
      totalAmount: car.price,
      paymentMethod: bookingData.paymentMethod,
      buyerInfo: bookingData.buyerInfo || {},
      status: 'pending', // pending, confirmed, cancelled, completed
      createdAt: new Date().toISOString(),
      inspectionDate: bookingData.inspectionDate || null,
      notes: bookingData.notes || ''
    };

    this.bookings.push(booking);
    this.saveBookings(this.bookings);

    // Don't update car status yet - wait for payment confirmation
    // carManager.updateCar(carId, { status: 'pending' });

    return booking;
  }

  // Process payment for booking
  processPayment(bookingId, paymentData) {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    // Check for user authentication with fallback
    const ridebazzarUser = localStorage.getItem('ridebazzar_user');
    const userData = localStorage.getItem('userData');
    
    let user;
    if (ridebazzarUser) {
      user = ridebazzarUser;
    } else if (userData) {
      try {
        const userObj = JSON.parse(userData);
        user = userObj.username;
      } catch (e) {
        user = null;
      }
    }
    
    if (!user) {
      throw new Error('You must be logged in to process payment');
    }
    
    if (booking.buyer !== user) {
      throw new Error('You can only pay for your own bookings');
    }

    // Simulate payment processing
    const transaction = this.simulatePaymentGateway(paymentData, booking);

    // Update booking status
    booking.status = 'confirmed';
    booking.paymentDetails = {
      transactionId: transaction.id,
      paidAt: new Date().toISOString(),
      method: paymentData.method,
      amount: transaction.amount
    };

    // Add EMI details if provided
    if (paymentData.emiMonths) {
      booking.emiMonths = paymentData.emiMonths;
      booking.interestRate = paymentData.interestRate || 12;
      booking.firstEmiDate = paymentData.firstEmiDate;
    }

    this.saveBookings(this.bookings);

    // Update car status to sold
    carManager.updateCar(booking.carId, { status: 'sold' });

    return { booking, transaction };
  }

  // Simulate payment gateway
  simulatePaymentGateway(paymentData, booking) {
    // Validate payment data
    this.validatePaymentData(paymentData);

    // Simulate processing delay
    const isSuccess = Math.random() > 0.1; // 90% success rate for simulation

    if (!isSuccess) {
      throw new Error('Payment failed. Please try again.');
    }

    const transaction = {
      id: 'TXN' + Date.now(),
      bookingId: booking.id,
      amount: paymentData.amount,
      method: paymentData.method,
      status: 'success',
      gatewayResponse: {
        code: '00',
        message: 'Transaction Successful'
      },
      createdAt: new Date().toISOString(),
      buyer: booking.buyer,
      seller: booking.seller
    };

    this.transactions.push(transaction);
    this.saveTransactions(this.transactions);

    return transaction;
  }

  // Validate payment data
  validatePaymentData(paymentData) {
    const { method, amount, cardNumber, expiryDate, cvv, cardName, upiId } = paymentData;

    if (!method) {
      throw new Error('Payment method is required');
    }

    if (!amount || amount <= 0) {
      throw new Error('Invalid payment amount');
    }

    if (method === 'card') {
      if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
        throw new Error('Invalid card number');
      }

      if (!expiryDate || !this.isValidExpiryDate(expiryDate)) {
        throw new Error('Invalid expiry date');
      }

      if (!cvv || cvv.length !== 3) {
        throw new Error('Invalid CVV');
      }

      if (!cardName || cardName.trim().length < 2) {
        throw new Error('Cardholder name is required');
      }
    } else if (method === 'upi') {
      if (!upiId || !this.isValidUpiId(upiId)) {
        throw new Error('Invalid UPI ID');
      }
    }
  }

  // Validate expiry date
  isValidExpiryDate(expiryDate) {
    const [month, year] = expiryDate.split('/');
    if (!month || !year) return false;

    const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
    const now = new Date();
    
    return expiry > now;
  }

  // Validate UPI ID
  isValidUpiId(upiId) {
    const upiRegex = /^[a-zA-Z0-9.\-_]+@[a-zA-Z0-9.\-_]+$/;
    return upiRegex.test(upiId);
  }

  // Complete a purchase (after inspection and final payment)
  completePurchase(bookingId, finalPaymentData) {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    const remainingAmount = booking.totalAmount - booking.bookingAmount;
    
    if (finalPaymentData.amount !== remainingAmount) {
      throw new Error('Payment amount does not match remaining balance');
    }

    // Process final payment
    const transaction = this.simulatePaymentGateway(finalPaymentData, booking);

    // Update booking
    booking.status = 'completed';
    booking.finalPayment = {
      transactionId: transaction.id,
      paidAt: new Date().toISOString(),
      amount: remainingAmount
    };
    booking.completedAt = new Date().toISOString();

    // Mark car as sold
    carManager.markCarAsSold(booking.carId, booking.buyer);

    this.saveBookings(this.bookings);

    return { booking, transaction };
  }

  // Cancel booking
  cancelBooking(bookingId, reason = '') {
    const bookingIndex = this.bookings.findIndex(b => b.id === bookingId);
    if (bookingIndex === -1) {
      throw new Error('Booking not found');
    }

    const booking = this.bookings[bookingIndex];
    
    // Remove all validation checks - allow anyone to remove any booking
    // const user = localStorage.getItem('ridebazzar_user');
    // if (booking.buyer !== user) {
    //   throw new Error('You can only cancel your own bookings');
    // }

    // if (booking.status === 'completed') {
    //   throw new Error('Cannot cancel completed booking');
    // }

    // Make car available again
    try {
      carManager.updateCar(booking.carId, { status: 'available' });
    } catch (e) {
      // Ignore car update errors
    }

    // Create refund transaction (for demo) if payment was made
    if (booking.paymentDetails) {
      const refundTransaction = {
        id: 'REF' + Date.now(),
        bookingId: booking.id,
        amount: booking.bookingAmount,
        method: 'refund',
        status: 'success',
        createdAt: new Date().toISOString(),
        buyer: booking.buyer,
        type: 'refund'
      };

      this.transactions.push(refundTransaction);
      this.saveTransactions(this.transactions);
    }

    // Remove booking completely from the array
    this.bookings.splice(bookingIndex, 1);
    this.saveBookings(this.bookings);

    return { message: 'Booking removed successfully' };
  }

  // Get user's transactions
  getUserTransactions(username) {
    return this.transactions.filter(txn => 
      txn.buyer === username || txn.seller === username
    );
  }

  // Get user's bookings
  getUserBookings(username, type = 'all') {
    // Always get fresh data from localStorage
    const freshBookings = this.getBookings();
    
    if (type === 'buyer') {
      return freshBookings.filter(booking => booking.buyer === username);
    } else if (type === 'seller') {
      return freshBookings.filter(booking => booking.seller === username);
    }
    return freshBookings.filter(booking => 
      booking.buyer === username || booking.seller === username
    );
  }

  // Calculate platform statistics
  getPaymentStatistics() {
    const totalTransactions = this.transactions.length;
    const successfulTransactions = this.transactions.filter(txn => txn.status === 'success').length;
    const totalAmount = this.transactions
      .filter(txn => txn.status === 'success' && txn.type !== 'refund')
      .reduce((sum, txn) => sum + txn.amount, 0);

    const totalBookings = this.bookings.length;
    const completedBookings = this.bookings.filter(booking => booking.status === 'completed').length;

    return {
      totalTransactions,
      successfulTransactions,
      totalAmount,
      totalBookings,
      completedBookings,
      conversionRate: totalBookings > 0 ? (completedBookings / totalBookings * 100).toFixed(1) : 0
    };
  }
}

// Global payment manager instance
const paymentManager = new PaymentManager();

// Payment form handlers
function processBookingPayment(bookingId, formData) {
  try {
    const paymentData = {
      method: formData.get('paymentMethod'),
      amount: parseFloat(formData.get('amount')),
      cardNumber: formData.get('cardNumber'),
      expiryDate: formData.get('expiryDate'),
      cvv: formData.get('cvv'),
      cardName: formData.get('cardName'),
      upiId: formData.get('upiId')
    };

    return paymentManager.processPayment(bookingId, paymentData);
  } catch (error) {
    throw error;
  }
}

function createCarBooking(carId, bookingFormData) {
  try {
    const bookingData = {
      bookingAmount: parseFloat(bookingFormData.get('bookingAmount')),
      paymentMethod: bookingFormData.get('paymentMethod'),
      inspectionDate: bookingFormData.get('inspectionDate'),
      notes: bookingFormData.get('notes'),
      buyerInfo: {
        fullName: bookingFormData.get('buyerName'),
        phone: bookingFormData.get('buyerPhone'),
        email: bookingFormData.get('buyerEmail'),
        address: bookingFormData.get('buyerAddress')
      }
    };

    return paymentManager.createBooking(carId, bookingData);
  } catch (error) {
    throw error;
  }
}

// Utility functions
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

function generateBookingReference() {
  return 'RB' + Date.now().toString().slice(-8);
}

// Payment gateway options (for demo)
const paymentGateways = {
  card: {
    name: 'Credit/Debit Card',
    fee: 2.5, // percentage
    supported: ['Visa', 'MasterCard', 'RuPay']
  },
  upi: {
    name: 'UPI',
    fee: 0,
    supported: ['PhonePe', 'GPay', 'Paytm', 'BHIM']
  },
  netbanking: {
    name: 'Net Banking',
    fee: 1.5,
    supported: ['SBI', 'HDFC', 'ICICI', 'Axis']
  },
  wallet: {
    name: 'Digital Wallet',
    fee: 1.0,
    supported: ['Paytm', 'MobiKwik', 'Amazon Pay']
  }
};

// EMI calculator
function calculateEMI(principal, rate, tenure) {
  const monthlyRate = rate / 100 / 12;
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
              (Math.pow(1 + monthlyRate, tenure) - 1);
  
  return {
    emi: Math.round(emi),
    totalAmount: Math.round(emi * tenure),
    totalInterest: Math.round((emi * tenure) - principal)
  };
}

// Loan eligibility checker (simplified)
function checkLoanEligibility(income, carPrice, existingLoan = 0) {
  const maxLoanAmount = income * 60; // 5 years of income
  const availableAmount = maxLoanAmount - existingLoan;
  const maxCarPrice = availableAmount / 0.8; // Assuming 80% loan
  
  return {
    eligible: carPrice <= maxCarPrice,
    maxLoanAmount: Math.min(carPrice * 0.8, availableAmount),
    recommendedDownPayment: Math.max(carPrice * 0.2, carPrice - availableAmount)
  };
}

// Global function to remove all cancelled bookings
function removeAllCancelledBookings() {
  if (typeof paymentManager !== 'undefined') {
    return paymentManager.removeAllCancelledBookings();
  }
  return { message: 'Payment manager not initialized', removedCount: 0 };
}
