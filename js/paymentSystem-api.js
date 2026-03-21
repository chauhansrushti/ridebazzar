// Bridge between frontend PaymentSystem and backend API
// This file adapts the existing frontend to work with the new backend

class PaymentSystem {
    constructor() {
        const baseUrl = typeof CONFIG !== 'undefined' ? CONFIG.API_BASE_URL : 'http://localhost:5000';
        this.bookingApiUrl = `${baseUrl}/api/bookings`;
        this.paymentApiUrl = `${baseUrl}/api/payments`;
        this.authManager = new AuthManager();
    }

    // Get auth headers for API calls
    getAuthHeaders() {
        const token = localStorage.getItem('authToken');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    // Create booking
    async createBooking(bookingData) {
        try {
            const response = await fetch(this.bookingApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeaders()
                },
                body: JSON.stringify(bookingData)
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error creating booking:', error);
            return { success: false, message: 'Network error during booking' };
        }
    }

    // Process payment
    async processPayment(paymentData) {
        try {
            const response = await fetch(`${this.paymentApiUrl}/process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeaders()
                },
                body: JSON.stringify(paymentData)
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error processing payment:', error);
            return { success: false, message: 'Network error during payment' };
        }
    }

    // Get user's bookings
    async getUserBookings() {
        try {
            const response = await fetch(`${this.bookingApiUrl}/my-bookings`, {
                headers: this.getAuthHeaders()
            });

            const result = await response.json();
            return result.success ? (result.bookings || result.data || []) : [];
        } catch (error) {
            console.error('Error fetching bookings:', error);
            return [];
        }
    }

    // Get user's sales (bookings for their cars)
    async getUserSales() {
        try {
            const response = await fetch(`${this.bookingApiUrl}/my-sales`, {
                headers: this.getAuthHeaders()
            });

            const result = await response.json();
            return result.success ? (result.sales || result.data || []) : [];
        } catch (error) {
            console.error('Error fetching sales:', error);
            return [];
        }
    }

    // Cancel booking
    async cancelBooking(bookingId, reason = '') {
        try {
            const response = await fetch(`${this.bookingApiUrl}/${bookingId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeaders()
                },
                body: JSON.stringify({ cancellationReason: reason })
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error cancelling booking:', error);
            return { success: false, message: 'Network error during cancellation' };
        }
    }

    // Get transaction history
    async getTransactionHistory() {
        try {
            const response = await fetch(`${this.paymentApiUrl}/history`, {
                headers: this.getAuthHeaders()
            });

            const result = await response.json();
            console.log('Transaction history response:', result);
            
            if (result.success && result.data && result.data.transactions) {
                return result.data.transactions;
            }
            
            return [];
        } catch (error) {
            console.error('Error fetching transaction history:', error);
            return [];
        }
    }

    // Get payment status
    async getPaymentStatus(transactionId) {
        try {
            const response = await fetch(`${this.paymentApiUrl}/status/${transactionId}`, {
                headers: this.getAuthHeaders()
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error fetching payment status:', error);
            return { success: false, message: 'Network error' };
        }
    }

    // Get booking by ID
    async getBookingById(bookingId) {
        try {
            const response = await fetch(`${this.bookingApiUrl}/${bookingId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeaders()
                }
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error fetching booking:', error);
            return { success: false, message: 'Network error fetching booking' };
        }
    }

    // Legacy methods for backward compatibility
    getBookings() {
        // Synchronous method for backward compatibility
        return this.getUserBookings();
    }

    saveBookings(bookings) {
        // This is now handled by the backend API
        console.log('saveBookings called - now handled by backend');
    }

    addBooking(bookingData) {
        // Wrapper for createBooking
        return this.createBooking(bookingData);
    }

    removeBooking(bookingId) {
        // Wrapper for cancelBooking
        return this.cancelBooking(bookingId);
    }

    updateBookingStatus(bookingId, status) {
        // Update booking status (would need API endpoint)
        console.log('Update booking status:', bookingId, status);
    }

    getTransactions() {
        // Wrapper for getTransactionHistory
        return this.getTransactionHistory();
    }

    saveTransactions(transactions) {
        // This is now handled by the backend API
        console.log('saveTransactions called - now handled by backend');
    }

    addTransaction(transactionData) {
        // Wrapper for processPayment
        return this.processPayment(transactionData);
    }

    validatePaymentDetails(paymentDetails) {
        // Basic validation for payment details
        if (!paymentDetails.method) {
            return { isValid: false, message: 'Please select a payment method' };
        }

        if (paymentDetails.method === 'card') {
            if (!paymentDetails.cardNumber || !paymentDetails.expiryDate || !paymentDetails.cvv) {
                return { isValid: false, message: 'Please fill all card details' };
            }
        }

        if (paymentDetails.method === 'upi') {
            if (!paymentDetails.upiId) {
                return { isValid: false, message: 'Please enter UPI ID' };
            }
        }

        return { isValid: true };
    }

    generateTransactionId() {
        // Not needed for backend, but keep for compatibility
        return 'TXN_' + Date.now().toString();
    }

    calculateBookingAmount(carPrice, percentage = 10) {
        // Calculate booking amount (10% of car price by default)
        return Math.round(carPrice * (percentage / 100));
    }

    formatCurrency(amount) {
        // Format currency in Indian Rupees
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    }

    getPaymentMethods() {
        // Get available payment methods
        return [
            { id: 'card', name: 'Credit/Debit Card', icon: 'credit-card' },
            { id: 'upi', name: 'UPI', icon: 'mobile' },
            { id: 'netbanking', name: 'Net Banking', icon: 'bank' },
            { id: 'wallet', name: 'Digital Wallet', icon: 'wallet' }
        ];
    }

    getBookingsByStatus(status) {
        // Get bookings by status
        return this.getUserBookings().then(bookings => 
            bookings.filter(booking => booking.status === status)
        );
    }

    getBookingStats() {
        // Get booking statistics
        return this.getUserBookings().then(bookings => {
            return {
                total: bookings.length,
                pending: bookings.filter(b => b.status === 'pending').length,
                confirmed: bookings.filter(b => b.status === 'confirmed').length,
                cancelled: bookings.filter(b => b.status === 'cancelled').length,
                completed: bookings.filter(b => b.status === 'completed').length
            };
        });
    }

    processRefund(transactionId, reason) {
        // Process refund (would need API endpoint)
        console.log('Process refund:', transactionId, reason);
    }

    sendPaymentNotification(bookingId, status) {
        // Send payment notification (would need API endpoint)
        console.log('Send payment notification:', bookingId, status);
    }
}

// Create global instance for backward compatibility
if (typeof window !== 'undefined') {
    window.paymentSystem = new PaymentSystem();
}
