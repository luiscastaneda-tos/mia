import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Search, MapPin, Hotel, Coffee, Users, ArrowLeft, Filter, CreditCard, ChevronDown, ChevronUp, Bed, Shield as Child } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Hotel {
  id_interno: number;
  ID: number;
  "TIPO DE NEGOCIACION": string;
  MARCA: string;
  ESTADO: string;
  "CIUDAD / ZONA": string;
  "TARIFA HAB SENCILLA Q": number;
  "TARIFA HAB DOBLE QQ": number;
  "MENORES DE EDAD": string;
  Desayuno: string;
  IMAGES: string;
}

interface HotelSearchPageProps {
  onBack: () => void;
}

export const HotelSearchPage: React.FC<HotelSearchPageProps> = ({ onBack }) => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([]);
  const [displayedHotels, setDisplayedHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('hoteles')
        .select('*')
        .order('MARCA', { ascending: true });

      if (error) throw error;

      setHotels(data || []);
      
      // Initially show only 3 random hotels
      const randomHotels = [...(data || [])]
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      
      setFilteredHotels(data || []);
      setDisplayedHotels(randomHotels);

      // Extract unique values for filters
      const uniqueStates = [...new Set(data?.map(hotel => hotel.ESTADO) || [])];
      const uniqueCities = [...new Set(data?.map(hotel => hotel["CIUDAD / ZONA"]) || [])];
      const uniqueBrands = [...new Set(data?.map(hotel => hotel.MARCA) || [])];

      setStates(uniqueStates.sort());
      setCities(uniqueCities.sort());
      setBrands(uniqueBrands.sort());

    } catch (error) {
      console.error('Error fetching hotels:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (hasSearched) {
      filterHotels();
    }
  }, [searchTerm, selectedState, selectedCity, selectedBrand, hasSearched]);

  const filterHotels = () => {
    let filtered = [...hotels];

    // Search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(hotel => 
        hotel.MARCA.toLowerCase().includes(searchLower) ||
        hotel["CIUDAD / ZONA"].toLowerCase().includes(searchLower) ||
        hotel.ESTADO.toLowerCase().includes(searchLower)
      );
    }

    // State filter
    if (selectedState) {
      filtered = filtered.filter(hotel => hotel.ESTADO === selectedState);
    }

    // City filter
    if (selectedCity) {
      filtered = filtered.filter(hotel => hotel["CIUDAD / ZONA"] === selectedCity);
    }

    // Brand filter
    if (selectedBrand) {
      filtered = filtered.filter(hotel => hotel.MARCA === selectedBrand);
    }

    setDisplayedHotels(filtered);
  };

  const handleSearch = () => {
    setHasSearched(true);
    filterHotels();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2
    }).format(price);
  };

  const handleReserveClick = (hotel: Hotel) => {
    // Store hotel data in session storage
    sessionStorage.setItem('selectedHotel', JSON.stringify(hotel));
    // Update the URL without reloading
    window.history.pushState({}, '', '/manual-reservation');
    // Update the current page state
    window.dispatchEvent(new Event('popstate'));
    // Force a page reload to ensure proper state update
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-white hover:text-white/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span>Volver</span>
          </button>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Buscar Hoteles
            </h1>

            {/* Search Bar */}
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Buscar por marca, ciudad o estado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
              <Search className="w-6 h-6 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
            </div>

            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Filter className="w-5 h-5" />
              <span>{showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}</span>
              {showFilters ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>

            {/* Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                {/* State Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Todos los estados</option>
                    {states.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>

                {/* City Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Todas las ciudades</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Brand Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marca
                  </label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Todas las marcas</option>
                    {brands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="mt-6 w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-4 rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Search className="w-5 h-5" />
              <span>Buscar Hoteles</span>
            </button>
          </div>
        </div>

        {/* Results Section */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        ) : displayedHotels.length > 0 ? (
          <>
            {!hasSearched && (
              <div className="text-white text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Hoteles Destacados</h2>
                <p>Explora algunos de nuestros hoteles más populares</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedHotels.map((hotel) => (
                <div
                  key={hotel.id_interno}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  {/* Hotel Image */}
                  <div className="relative h-48">
                    <img
                      src={hotel.IMAGES || "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"}
                      alt={hotel.MARCA}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <div className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium">
                        {hotel["TIPO DE NEGOCIACION"]}
                      </div>
                    </div>
                  </div>

                  {/* Hotel Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {hotel.MARCA}
                    </h3>
                    <div className="flex items-center text-gray-500 mb-4">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{hotel["CIUDAD / ZONA"]}, {hotel.ESTADO}</span>
                    </div>

                    {/* Amenities */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center text-gray-600">
                        <Coffee className="w-4 h-4 mr-2" />
                        <span>{hotel.Desayuno === 'SI' ? 'Incluye desayuno' : 'Sin desayuno'}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Child className="w-4 h-4 mr-2" />
                        <span>{hotel["MENORES DE EDAD"]}</span>
                      </div>
                    </div>

                    {/* Prices */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center text-gray-600">
                          <Bed className="w-4 h-4 mr-2" />
                          <span>Habitación Sencilla</span>
                        </div>
                        <span className="font-bold text-gray-900">
                          {formatPrice(hotel["TARIFA HAB SENCILLA Q"])}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center text-gray-600">
                          <Users className="w-4 h-4 mr-2" />
                          <span>Habitación Doble</span>
                        </div>
                        <span className="font-bold text-gray-900">
                          {formatPrice(hotel["TARIFA HAB DOBLE QQ"])}
                        </span>
                      </div>
                    </div>

                    {/* Book Button */}
                    <button
                      onClick={() => handleReserveClick(hotel)}
                      className="w-full mt-6 flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <CreditCard className="w-5 h-5" />
                      <span>Reservar Ahora</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-white/10 backdrop-blur-sm rounded-xl">
            <Hotel className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <p className="text-white/80 text-lg">
              No se encontraron hoteles con los filtros seleccionados
            </p>
          </div>
        )}
      </div>
    </div>
  );
};