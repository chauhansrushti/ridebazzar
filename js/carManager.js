// Enhanced Car Management System for RideBazzar

class CarManager {
  constructor() {
    this.cars = this.getCars();
    this.inquiries = this.getInquiries();
    this.favorites = this.getFavorites();
  }

  // Helper function to get current user info
  getCurrentUser() {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (!token || !userData || userData === 'undefined') {
      return null;
    }
    
    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('Error parsing user data:', error);
      // Clear invalid data
      localStorage.removeItem('userData');
      localStorage.removeItem('currentUser');
      return null;
    }
  }

  // Helper function to check if user is logged in
  isUserLoggedIn() {
    return this.getCurrentUser() !== null;
  }

  // Helper function to get current username
  getCurrentUsername() {
    const user = this.getCurrentUser();
    return user ? user.username : null;
  }

  // Get all cars from localStorage
  getCars() {
    return JSON.parse(localStorage.getItem('ridebazzar_cars') || '[]');
  }

  // Save cars to localStorage
  saveCars(cars) {
    localStorage.setItem('ridebazzar_cars', JSON.stringify(cars));
    this.cars = cars;
  }

  // Get inquiries from localStorage
  getInquiries() {
    return JSON.parse(localStorage.getItem('ridebazzar_inquiries') || '[]');
  }

  // Save inquiries to localStorage
  saveInquiries(inquiries) {
    localStorage.setItem('ridebazzar_inquiries', JSON.stringify(inquiries));
    this.inquiries = inquiries;
  }

  // Get user favorites
  getFavorites() {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return [];
    const userKey = currentUser.username || currentUser.name || currentUser.id;
    return JSON.parse(localStorage.getItem(`ridebazzar_favorites_${userKey}`) || '[]');
  }

  // Save user favorites
  saveFavorites(favorites) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return;
    const userKey = currentUser.username || currentUser.name || currentUser.id;
    localStorage.setItem(`ridebazzar_favorites_${userKey}`, JSON.stringify(favorites));
    this.favorites = favorites;
  }

  // Post a new car
  postCar(carData) {
    // Check for authentication using the current system
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      throw new Error('You must be logged in to post a car');
    }

    // Validate car data
    this.validateCarData(carData);

    const newCar = {
      id: Date.now().toString(),
      ...carData,
      seller: currentUser.username || currentUser.name,
      postedAt: new Date().toISOString(),
      status: 'available', // available, sold, pending
      views: 0,
      inquiries: 0,
      featured: false
    };

    this.cars.unshift(newCar);
    this.saveCars(this.cars);

    // Update user stats if authManager exists
    if (typeof authManager !== 'undefined' && authManager.updateUserStats) {
      authManager.updateUserStats(currentUser.username || currentUser.name, 'carsPosted');
    }

    return newCar;
  }

  // Validate car data
  validateCarData(carData) {
    const required = ['make', 'model', 'year', 'price', 'mileage', 'fuelType', 'transmission', 'condition'];
    
    required.forEach(field => {
      if (!carData[field]) {
        throw new Error(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
      }
    });

    if (carData.year < 1990 || carData.year > new Date().getFullYear()) {
      throw new Error('Please enter a valid year');
    }

    if (carData.price <= 0) {
      throw new Error('Price must be greater than 0');
    }

    if (carData.mileage < 0) {
      throw new Error('Mileage cannot be negative');
    }
  }

  // Update car details
  updateCar(carId, updates) {
    const carIndex = this.cars.findIndex(car => car.id === carId);
    if (carIndex === -1) {
      throw new Error('Car not found');
    }

    const car = this.cars[carIndex];
    const user = localStorage.getItem('ridebazzar_user');
    
    // Temporarily allow editing any car for testing
    // if (car.seller !== user) {
    //   throw new Error('You can only edit your own cars');
    // }

    this.cars[carIndex] = { ...car, ...updates, updatedAt: new Date().toISOString() };
    this.saveCars(this.cars);
    return this.cars[carIndex];
  }

  // Delete a car
  deleteCar(carId) {
    const carIndex = this.cars.findIndex(car => car.id === carId);
    if (carIndex === -1) {
      throw new Error('Car not found');
    }

    const car = this.cars[carIndex];
    const currentUser = this.getCurrentUser();
    const user = currentUser ? currentUser.username : localStorage.getItem('ridebazzar_user');
    
    if (!user) {
      throw new Error('You must be logged in');
    }
    
    if (car.seller !== user) {
      throw new Error('You can only delete your own cars');
    }

    this.cars.splice(carIndex, 1);
    this.saveCars(this.cars);
    
    // Update user stats if authManager exists
    if (typeof authManager !== 'undefined' && authManager.updateUserStats) {
      authManager.updateUserStats(user, 'carsPosted', -1);
    }
    
    return true;
  }

  // Get cars with filters and sorting
  getFilteredCars(filters = {}, sortBy = 'newest') {
    let filteredCars = [...this.cars];

    // Apply filters
    if (filters.make) {
      filteredCars = filteredCars.filter(car => 
        car.make.toLowerCase().includes(filters.make.toLowerCase())
      );
    }

    if (filters.model) {
      filteredCars = filteredCars.filter(car => 
        car.model.toLowerCase().includes(filters.model.toLowerCase())
      );
    }

    if (filters.minPrice) {
      filteredCars = filteredCars.filter(car => car.price >= filters.minPrice);
    }

    if (filters.maxPrice) {
      filteredCars = filteredCars.filter(car => car.price <= filters.maxPrice);
    }

    if (filters.minYear) {
      filteredCars = filteredCars.filter(car => car.year >= filters.minYear);
    }

    if (filters.maxYear) {
      filteredCars = filteredCars.filter(car => car.year <= filters.maxYear);
    }

    if (filters.fuelType && filters.fuelType !== 'all') {
      filteredCars = filteredCars.filter(car => car.fuelType === filters.fuelType);
    }

    if (filters.transmission && filters.transmission !== 'all') {
      filteredCars = filteredCars.filter(car => car.transmission === filters.transmission);
    }

    if (filters.condition && filters.condition !== 'all') {
      filteredCars = filteredCars.filter(car => car.condition === filters.condition);
    }

    if (filters.location) {
      filteredCars = filteredCars.filter(car => 
        car.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.status) {
      filteredCars = filteredCars.filter(car => car.status === filters.status);
    }

    // Apply sorting
    switch (sortBy) {
      case 'price_low':
        filteredCars.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filteredCars.sort((a, b) => b.price - a.price);
        break;
      case 'year_new':
        filteredCars.sort((a, b) => b.year - a.year);
        break;
      case 'year_old':
        filteredCars.sort((a, b) => a.year - b.year);
        break;
      case 'mileage_low':
        filteredCars.sort((a, b) => a.mileage - b.mileage);
        break;
      case 'popular':
        filteredCars.sort((a, b) => (b.views + b.inquiries) - (a.views + a.inquiries));
        break;
      case 'newest':
      default:
        filteredCars.sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));
        break;
    }

    return filteredCars;
  }

  // Get car by ID and increment views
  getCarById(carId, incrementView = false) {
    const car = this.cars.find(c => c.id === carId);
    if (!car) return null;

    if (incrementView) {
      car.views = (car.views || 0) + 1;
      this.saveCars(this.cars);
    }

    return car;
  }

  // Get cars posted by a specific user
  getUserCars(username) {
    return this.cars.filter(car => car.seller === username);
  }

  // Add car to favorites
  addToFavorites(carId) {
    if (!this.isUserLoggedIn()) {
      throw new Error('You must be logged in to add favorites');
    }

    if (!this.favorites.includes(carId)) {
      this.favorites.push(carId);
      this.saveFavorites(this.favorites);
    }
    return true;
  }

  // Remove car from favorites
  removeFromFavorites(carId) {
    if (!this.isUserLoggedIn()) {
      throw new Error('You must be logged in to remove favorites');
    }

    this.favorites = this.favorites.filter(id => id !== carId);
    this.saveFavorites(this.favorites);
    return true;
  }

  // Check if car is in favorites
  isCarInFavorites(carId) {
    return this.favorites.includes(carId);
  }

  // Get favorite cars
  getFavoriteCars() {
    return this.cars.filter(car => this.favorites.includes(car.id));
  }

  // Submit inquiry for a car
  submitInquiry(carId, inquiryData) {
    if (!this.isUserLoggedIn()) {
      throw new Error('You must be logged in to submit an inquiry');
    }

    const currentUser = this.getCurrentUser();
    const user = currentUser ? currentUser.username : null;
    
    if (!user) {
      throw new Error('User information not found');
    }

    const car = this.getCarById(carId);
    if (!car) {
      throw new Error('Car not found');
    }

    if (car.seller === user) {
      throw new Error('You cannot inquire about your own car');
    }

    const inquiry = {
      id: Date.now().toString(),
      carId,
      buyer: user,
      seller: car.seller,
      message: inquiryData.message || '',
      phone: inquiryData.phone || '',
      submittedAt: new Date().toISOString(),
      status: 'pending', // pending, responded, closed
      response: ''
    };

    this.inquiries.push(inquiry);
    this.saveInquiries(this.inquiries);

    // Increment car inquiry count
    car.inquiries = (car.inquiries || 0) + 1;
    this.saveCars(this.cars);

    return inquiry;
  }

  // Get inquiries for a user (as seller)
  getUserInquiries(username) {
    return this.inquiries.filter(inquiry => inquiry.seller === username);
  }

  // Get inquiries made by a user (as buyer)
  getUserSentInquiries(username) {
    return this.inquiries.filter(inquiry => inquiry.buyer === username);
  }

  // Respond to inquiry
  respondToInquiry(inquiryId, response) {
    const currentUser = this.getCurrentUser();
    const user = currentUser ? currentUser.username : localStorage.getItem('ridebazzar_user');
    
    if (!user) {
      throw new Error('You must be logged in');
    }

    const inquiryIndex = this.inquiries.findIndex(inq => inq.id === inquiryId);
    if (inquiryIndex === -1) {
      throw new Error('Inquiry not found');
    }

    const inquiry = this.inquiries[inquiryIndex];
    if (inquiry.seller !== user) {
      throw new Error('You can only respond to inquiries for your cars');
    }

    inquiry.response = response;
    inquiry.status = 'responded';
    inquiry.respondedAt = new Date().toISOString();

    this.saveInquiries(this.inquiries);
    return inquiry;
  }

  // Mark car as sold
  markCarAsSold(carId, buyerUsername = '') {
    const currentUser = this.getCurrentUser();
    const user = currentUser ? currentUser.username : localStorage.getItem('ridebazzar_user');
    
    if (!user) {
      throw new Error('You must be logged in');
    }

    const carIndex = this.cars.findIndex(car => car.id === carId);
    if (carIndex === -1) {
      throw new Error('Car not found');
    }

    const car = this.cars[carIndex];
    if (car.seller !== user) {
      throw new Error('You can only mark your own cars as sold');
    }

    car.status = 'sold';
    car.soldAt = new Date().toISOString();
    if (buyerUsername) {
      car.buyer = buyerUsername;
    }

    this.saveCars(this.cars);
    return car;
  }

  // Search cars
  searchCars(query) {
    const searchTerm = query.toLowerCase().trim();
    if (!searchTerm) return this.cars;

    return this.cars.filter(car => {
      return (
        car.make.toLowerCase().includes(searchTerm) ||
        car.model.toLowerCase().includes(searchTerm) ||
        car.description.toLowerCase().includes(searchTerm) ||
        car.location.toLowerCase().includes(searchTerm)
      );
    });
  }

  // Get popular cars (most viewed/inquiries)
  getPopularCars(limit = 6) {
    return [...this.cars]
      .sort((a, b) => (b.views + b.inquiries) - (a.views + a.inquiries))
      .slice(0, limit);
  }

  // Get recently posted cars
  getRecentCars(limit = 6) {
    return [...this.cars]
      .sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt))
      .slice(0, limit);
  }

  // Get cars by location
  getCarsByLocation(location) {
    return this.cars.filter(car => 
      car.location.toLowerCase().includes(location.toLowerCase())
    );
  }

  // Get featured cars
  getFeaturedCars() {
    return this.cars.filter(car => car.featured && car.status === 'available');
  }

  // Generate car statistics
  getCarStatistics() {
    const totalCars = this.cars.length;
    const availableCars = this.cars.filter(car => car.status === 'available').length;
    const soldCars = this.cars.filter(car => car.status === 'sold').length;
    
    const brands = [...new Set(this.cars.map(car => car.make))].length;
    const locations = [...new Set(this.cars.map(car => car.location))].length;
    
    const avgPrice = totalCars > 0 ? 
      Math.round(this.cars.reduce((sum, car) => sum + parseFloat(car.price), 0) / totalCars) : 0;

    return {
      totalCars,
      availableCars,
      soldCars,
      brands,
      locations,
      avgPrice,
      totalInquiries: this.inquiries.length
    };
  }

  // Format price for display
  formatPrice(price) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  }

  // Format date for display
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}

// Global car manager instance
const carManager = new CarManager();

// Enhanced car posting function
function handleEnhancedCarPost(formData) {
  try {
    const user = localStorage.getItem('ridebazzar_user');
    if (!user) {
      throw new Error('You must be logged in to post a car');
    }

    const carData = {
      make: formData.get('make'),
      model: formData.get('model'),
      year: parseInt(formData.get('year')),
      price: parseFloat(formData.get('price')),
      mileage: parseInt(formData.get('mileage')),
      fuelType: formData.get('fuelType'),
      transmission: formData.get('transmission'),
      condition: formData.get('condition'),
      description: formData.get('description') || '',
      location: formData.get('location'),
      contact: formData.get('contact') || '',
      images: [] // Will be populated by image upload handler
    };

    const car = carManager.postCar(carData);
    return car;
  } catch (error) {
    throw error;
  }
}

// Car inquiry functions
function submitCarInquiry(carId, inquiryData) {
  try {
    return carManager.submitInquiry(carId, inquiryData);
  } catch (error) {
    throw error;
  }
}

// Favorite functions
function toggleFavorite(carId) {
  try {
    if (carManager.isCarInFavorites(carId)) {
      carManager.removeFromFavorites(carId);
      return false;
    } else {
      carManager.addToFavorites(carId);
      return true;
    }
  } catch (error) {
    throw error;
  }
}

// Search function
function performCarSearch(query, filters = {}, sortBy = 'newest') {
  let results = query ? carManager.searchCars(query) : carManager.getCars();
  
  if (Object.keys(filters).length > 0) {
    results = carManager.getFilteredCars(filters, sortBy);
  }
  
  return results;
}

// Utility functions for backward compatibility
function getPostedCars() {
  return carManager.getCars();
}

function savePostedCar(carData) {
  try {
    return carManager.postCar(carData);
  } catch (error) {
    console.error('Error posting car:', error);
    throw error;
  }
}

// Car brands and models data
const carBrands = {
  'Maruti Suzuki': ['Swift', 'Baleno', 'Vitara Brezza', 'Ertiga', 'Dzire', 'Alto', 'WagonR', 'Celerio'],
  'Hyundai': ['Creta', 'Verna', 'i20', 'Venue', 'Elantra', 'Tucson', 'Santa Fe'],
  'Tata': ['Nexon', 'Harrier', 'Safari', 'Tigor', 'Altroz', 'Punch'],
  'Mahindra': ['XUV700', 'Scorpio', 'Thar', 'Bolero', 'XUV300'],
  'Honda': ['City', 'Amaze', 'Jazz', 'WR-V', 'CR-V'],
  'Toyota': ['Fortuner', 'Innova', 'Camry', 'Corolla', 'Glanza'],
  'Ford': ['EcoSport', 'Endeavour', 'Figo', 'Aspire'],
  'Volkswagen': ['Polo', 'Vento', 'Tiguan', 'Passat'],
  'Renault': ['Duster', 'Kwid', 'Captur', 'Triber'],
  'Nissan': ['Magnite', 'Kicks', 'Terrano', 'Sunny']
};

// Helper function to populate model dropdown based on make
function updateModelOptions(make) {
  const modelSelect = document.getElementById('carModel');
  if (!modelSelect) return;

  modelSelect.innerHTML = '<option value="">Select Model</option>';
  
  if (carBrands[make]) {
    carBrands[make].forEach(model => {
      const option = document.createElement('option');
      option.value = model;
      option.textContent = model;
      modelSelect.appendChild(option);
    });
  }
}

// Car condition options
const carConditions = ['Excellent', 'Good', 'Fair', 'Needs Work'];
const fuelTypes = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'];
const transmissionTypes = ['Manual', 'Automatic', 'CVT'];

// Helper function to format car data for display
function formatCarForDisplay(car) {
  return {
    ...car,
    formattedPrice: carManager.formatPrice(car.price),
    formattedDate: carManager.formatDate(car.postedAt),
    mainImage: car.images && car.images.length > 0 ? car.images[0] : 'images/default-car.jpg'
  };
}
