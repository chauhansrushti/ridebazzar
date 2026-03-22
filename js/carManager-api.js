// Bridge between frontend CarManager and backend API
// This file adapts the existing frontend to work with the new backend

class CarManager {
    constructor() {
        this.apiUrl = typeof CONFIG !== 'undefined' ? CONFIG.CARS_API : 'http://localhost:5000/api/cars';
        this.authManager = new AuthManager();
    }

    // Get auth headers for API calls
    getAuthHeaders() {
        const token = localStorage.getItem('authToken');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    // Get all cars from backend API
    async getAllCars(filters = {}) {
        try {
            const queryParams = new URLSearchParams(filters);
            const response = await fetch(`${this.apiUrl}?${queryParams}`);
            const result = await response.json();
            
            if (result.success) {
                return result.data.cars;
            }
            return [];
        } catch (error) {
            console.error('Error fetching cars:', error);
            return [];
        }
    }

    // Get single car by ID
    async getCarById(carId) {
        try {
            const response = await fetch(`${this.apiUrl}/${carId}`);
            const result = await response.json();
            
            if (result.success) {
                return result.data;
            }
            return null;
        } catch (error) {
            console.error('Error fetching car:', error);
            return null;
        }
    }

    // Create new car listing
    async createCar(carData) {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeaders()
                },
                body: JSON.stringify(carData)
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error creating car:', error);
            return { success: false, message: 'Network error' };
        }
    }

    // Update car listing
    async updateCar(carId, carData) {
        try {
            const response = await fetch(`${this.apiUrl}/${carId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeaders()
                },
                body: JSON.stringify(carData)
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error updating car:', error);
            return { success: false, message: 'Network error' };
        }
    }

    // Delete car listing
    async deleteCar(carId) {
        try {
            const response = await fetch(`${this.apiUrl}/${carId}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error deleting car:', error);
            return { success: false, message: 'Network error' };
        }
    }

    // Get user's cars
    async getUserCars() {
        try {
            const response = await fetch(`${this.apiUrl}/user/my-cars`, {
                headers: this.getAuthHeaders()
            });

            const result = await response.json();
            return result.success ? result.data : [];
        } catch (error) {
            console.error('Error fetching user cars:', error);
            return [];
        }
    }

    // Alias for getUserCars
    async getMyCars() {
        return this.getUserCars();
    }

    // Legacy methods for backward compatibility
    getCars() {
        // Synchronous method for backward compatibility
        // Note: This will return a Promise, so existing code may need adjustment
        return this.getAllCars();
    }

    saveCars(cars) {
        // This is now handled by the backend API
        console.log('saveCars called - now handled by backend');
    }

    addCar(carData) {
        // Wrapper for createCar
        return this.createCar(carData);
    }

    editCar(carId, carData) {
        // Wrapper for updateCar
        return this.updateCar(carId, carData);
    }

    async markCarAsSold(carId) {
        try {
            const token = localStorage.getItem('authToken');
            const apiUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://ridebazzar.up.railway.app';
            const response = await fetch(`${apiUrl}/api/cars/${carId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'sold' })
            });
            
            if (!response.ok) {
                throw new Error('Failed to mark car as sold');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error marking car as sold:', error);
            throw error;
        }
    }

    removeCar(carId) {
        // Wrapper for deleteCar
        return this.deleteCar(carId);
    }

    // Post a new car (alias for createCar for backward compatibility)
    async postCar(carData) {
        return this.createCar(carData);
    }

    searchCars(query) {
        // Search cars by query
        const filters = {};
        if (query) {
            // You can implement search logic here
            filters.search = query;
        }
        return this.getAllCars(filters);
    }

    filterCars(filters) {
        // Filter cars by criteria
        return this.getAllCars(filters);
    }

    getCarsByUser(username) {
        // Get cars by specific user
        return this.getUserCars();
    }

    validateCar(carData) {
        // Basic validation
        if (!carData.make || !carData.model || !carData.year || !carData.price) {
            return { isValid: false, message: 'Please fill all required fields' };
        }
        
        if (carData.year < 1950 || carData.year > new Date().getFullYear() + 1) {
            return { isValid: false, message: 'Please enter a valid year' };
        }
        
        if (carData.price <= 0) {
            return { isValid: false, message: 'Please enter a valid price' };
        }
        
        return { isValid: true };
    }

    generateCarId() {
        // Not needed for backend, but keep for compatibility
        return Date.now().toString();
    }

    getCarStats() {
        // This would need to be implemented as an API call
        return {
            totalCars: 0,
            availableCars: 0,
            soldCars: 0
        };
    }

    getFeaturedCars() {
        // Get featured cars (could be implemented as API endpoint)
        return this.getAllCars({ featured: true });
    }

    getRecentCars(limit = 5) {
        // Get recent cars
        return this.getAllCars({ limit, sortBy: 'created_at', sortOrder: 'DESC' });
    }

    getPopularCars() {
        // Get popular cars (by views)
        return this.getAllCars({ sortBy: 'views_count', sortOrder: 'DESC' });
    }

    incrementCarViews(carId) {
        // This is handled automatically by the backend when fetching car details
        return this.getCarById(carId);
    }

    getCarsByLocation(location) {
        // Get cars by location
        return this.getAllCars({ location });
    }

    getCarsByPriceRange(minPrice, maxPrice) {
        // Get cars by price range
        return this.getAllCars({ priceFrom: minPrice, priceTo: maxPrice });
    }

    getCarsByMake(make) {
        // Get cars by make
        return this.getAllCars({ make });
    }

    getCarsByFuelType(fuelType) {
        // Get cars by fuel type
        return this.getAllCars({ fuelType });
    }

    // Favorites management (using localStorage for now)
    getFavoriteCars() {
        const favorites = JSON.parse(localStorage.getItem('favoriteCars') || '[]');
        return favorites;
    }

    addToFavorites(carId) {
        const favorites = this.getFavoriteCars();
        if (!favorites.includes(carId)) {
            favorites.push(carId);
            localStorage.setItem('favoriteCars', JSON.stringify(favorites));
        }
    }

    removeFromFavorites(carId) {
        let favorites = this.getFavoriteCars();
        favorites = favorites.filter(id => id !== carId);
        localStorage.setItem('favoriteCars', JSON.stringify(favorites));
    }

    isCarInFavorites(carId) {
        return this.getFavoriteCars().includes(carId);
    }

    toggleFavorite(carId) {
        if (this.isCarInFavorites(carId)) {
            this.removeFromFavorites(carId);
            return false;
        } else {
            this.addToFavorites(carId);
            return true;
        }
    }

    // Submit inquiry for a car
    async submitInquiry(carId, inquiryData) {
        try {
            // Check authentication
            const token = localStorage.getItem('authToken');
            const userData = localStorage.getItem('userData');
            
            if (!token || !userData) {
                throw new Error('You must be logged in to submit an inquiry');
            }

            // Validate car exists
            const car = await this.getCarById(carId);
            if (!car) {
                throw new Error('Car not found');
            }

            // Get current user
            let currentUser;
            try {
                const user = JSON.parse(userData);
                currentUser = user.username;
            } catch (e) {
                throw new Error('User information not found');
            }

            // Check if user is the seller
            if (car.seller_username === currentUser || car.seller === currentUser) {
                throw new Error('You cannot inquire about your own car');
            }

            // Submit inquiry to backend
            const apiUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://ridebazzar.up.railway.app';
            const response = await fetch(`${apiUrl}/api/inquiries/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    carId: carId,
                    message: inquiryData.message || '',
                    phone: inquiryData.phone || ''
                })
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                const errorMsg = result.message || result.error || 'Failed to submit inquiry';
                const fullError = `${errorMsg}${result.error ? '\n(Backend Error: ' + result.error + ')' : ''}`;
                console.error('Inquiry submission failed:', { status: response.status, result });
                throw new Error(fullError);
            }

            console.log('Inquiry submitted successfully:', result.data);
            return result.data;
        } catch (error) {
            console.error('Error submitting inquiry:', error);
            console.error('Error details:', error.message);
            throw error;
        }
    }

    // Inquiries management (placeholder - would need backend API)
    getUserInquiries(username) {
        // Placeholder - return empty array for now
        // This should be implemented as a backend API endpoint
        return [];
    }

    // Format date helper
    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }

    // Format currency helper
    formatCurrency(amount) {
        if (!amount) return '₹0';
        // Convert to integer to remove decimals, then format with Indian locale
        const numericAmount = parseInt(amount) || 0;
        return '₹' + numericAmount.toLocaleString('en-IN');
    }

    // Format price (alias for formatCurrency for backward compatibility)
    formatPrice(amount) {
        return this.formatCurrency(amount);
    }

    // Get received inquiries (for sellers)
    async getReceivedInquiries() {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                console.error('Not authenticated');
                return [];
            }

            const apiUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : 'https://ridebazzar.up.railway.app';
            const response = await fetch(`${apiUrl}/api/inquiries/received`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch received inquiries');
            }

            const data = await response.json();
            console.log('Received inquiries from API:', data);
            return data.data || [];
        } catch (error) {
            console.error('Error fetching received inquiries:', error);
            return [];
        }
    }

    // Get sent inquiries (for buyers)
    async getSentInquiries() {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                console.error('Not authenticated');
                return [];
            }

            const response = await fetch('http://localhost:5000/api/inquiries/sent', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch sent inquiries');
            }

            const data = await response.json();
            console.log('Sent inquiries from API:', data);
            return data.data || [];
        } catch (error) {
            console.error('Error fetching sent inquiries:', error);
            return [];
        }
    }

    // Update inquiry status
    async updateInquiryStatus(inquiryId, status, response) {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                console.error('Not authenticated');
                return { success: false, error: 'Not authenticated' };
            }

            const res = await fetch(`http://localhost:5000/api/inquiries/${inquiryId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status, response })
            });

            if (!res.ok) {
                throw new Error('Failed to update inquiry status');
            }

            const data = await res.json();
            return { success: true, data };
        } catch (error) {
            console.error('Error updating inquiry status:', error);
            return { success: false, error: error.message };
        }
    }

    // Cancel inquiry (delete)
    async cancelInquiry(inquiryId) {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                console.error('Not authenticated');
                return { success: false, error: 'Not authenticated' };
            }

            console.log('Canceling inquiry:', inquiryId);

            const res = await fetch(`http://localhost:5000/api/inquiries/${inquiryId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await res.json();
            console.log('Cancel response:', { status: res.status, data });

            if (!res.ok) {
                throw new Error(data.error || data.message || 'Failed to cancel inquiry');
            }

            return { success: true, data };
        } catch (error) {
            console.error('Error canceling inquiry:', error);
            return { success: false, error: error.message };
        }
    }
}

// Create global instance for backward compatibility
if (typeof window !== 'undefined') {
    window.carManager = new CarManager();
}
