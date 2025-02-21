import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { 
  ArrowLeft, 
  Hotel, 
  Calendar, 
  Users, 
  User, 
  Coffee,
  CreditCard as PaymentIcon,
  BanknoteIcon,
  ArrowRight
} from 'lucide-react';
import { CallToBackend } from '../components/CallToBackend';

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

interface ReservationData {
  checkIn: string;
  checkOut: string;
  roomType: 'single' | 'double';
  guests: number;
  mainGuest: string;
  additionalGuests: string[];
  totalNights: number;
  pricePerNight: number;
  totalPrice: number;
}

interface ManualReservationPageProps {
  onBack: () => void;
}

const DOMAIN = "http://localhost:5173";

const getPaymentData = (hotel: Hotel, reservationData: ReservationData) => {
  const payment_metadata = {
    hotel_name: hotel.MARCA,
    check_in: reservationData.checkIn,
    check_out: reservationData.checkOut,
    room_type: reservationData.roomType,
    guests: reservationData.guests
  };

  const currentUrl = window.location.href;

  return {
    line_items: [
      {
        price_data: {
          currency: "mxn",
          product_data: {
            name: hotel.MARCA,
            description: `Reservación en ${hotel.MARCA} - ${
              reservationData.roomType === 'single' ? 'Habitación Sencilla' : 'Habitación Doble'
            }`,
            images: [
              hotel.IMAGES || "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
            ],
          },
          unit_amount: Math.round(reservationData.totalPrice * 100),
        },
        quantity: 1,
      }
    ],
    mode: "payment",
    success_url: `${DOMAIN}?success=true&session={CHECKOUT_SESSION_ID}&metadata=${JSON.stringify(payment_metadata)}`,
    cancel_url: currentUrl,
  };
};

export const ManualReservationPage: React.FC<ManualReservationPageProps> = ({ onBack }) => {
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [reservationData, setReservationData] = useState<ReservationData>({
    checkIn: '',
    checkOut: '',
    roomType: 'single',
    guests: 1,
    mainGuest: '',
    additionalGuests: [],
    totalNights: 0,
    pricePerNight: 0,
    totalPrice: 0
  });

  useEffect(() => {
    const storedHotel = sessionStorage.getItem('selectedHotel');
    if (storedHotel) {
      const parsedHotel = JSON.parse(storedHotel);
      setHotel(parsedHotel);

      // Get current user's name
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user?.user_metadata?.full_name) {
          setReservationData(prev => ({
            ...prev,
            mainGuest: user.user_metadata.full_name
          }));
        }
      });
    }
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2
    }).format(price);
  };

  const calculateTotalPrice = (
    checkIn: string,
    checkOut: string,
    roomType: 'single' | 'double'
  ) => {
    if (!checkIn || !checkOut || !hotel) return { nights: 0, pricePerNight: 0, total: 0 };

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    const pricePerNight = roomType === 'single' 
      ? hotel["TARIFA HAB SENCILLA Q"]
      : hotel["TARIFA HAB DOBLE QQ"];

    return {
      nights,
      pricePerNight,
      total: nights * pricePerNight
    };
  };

  const handleDateChange = (field: 'checkIn' | 'checkOut', value: string) => {
    setReservationData(prev => {
      const newData = { ...prev, [field]: value };
      const { nights, pricePerNight, total } = calculateTotalPrice(
        newData.checkIn,
        newData.checkOut,
        newData.roomType
      );
      return {
        ...newData,
        totalNights: nights,
        pricePerNight,
        totalPrice: total
      };
    });
  };

  if (!hotel) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No se encontró información del hotel
          </h2>
          <button
            onClick={onBack}
            className="inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver
          </button>
        </div>

        {/* Hotel Header */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="relative h-64">
            <img
              src={hotel.IMAGES || "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"}
              alt={hotel.MARCA}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h1 className="text-3xl font-bold mb-2">{hotel.MARCA}</h1>
              <p className="text-white/90">{hotel["CIUDAD / ZONA"]}, {hotel.ESTADO}</p>
            </div>
          </div>
        </div>

        {/* Hotel Details and Pricing */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Hotel Information */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900">Información del Hotel</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Hotel className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">Tipo de Negociación</p>
                      <p className="text-gray-600">{hotel["TIPO DE NEGOCIACION"]}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Users className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">Menores de Edad</p>
                      <p className="text-gray-600">{hotel["MENORES DE EDAD"]}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Coffee className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">Desayuno</p>
                      <p className="text-gray-600">{hotel.Desayuno === 'SI' ? 'Incluido' : 'No incluido'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Room Pricing */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900">Tarifas por Noche</h3>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center space-x-2">
                        <User className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-gray-900">Habitación Sencilla</span>
                      </div>
                      <span className="text-lg font-bold text-blue-600">
                        {formatPrice(hotel["TARIFA HAB SENCILLA Q"])}
                      </span>
                    </div>
                    <p className="text-sm text-blue-600">Capacidad máxima: 2 personas</p>
                  </div>

                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center space-x-2">
                        <Users className="w-5 h-5 text-indigo-600" />
                        <span className="font-medium text-gray-900">Habitación Doble</span>
                      </div>
                      <span className="text-lg font-bold text-indigo-600">
                        {formatPrice(hotel["TARIFA HAB DOBLE QQ"])}
                      </span>
                    </div>
                    <p className="text-sm text-indigo-600">Capacidad máxima: 4 personas</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reservation Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
            <Calendar className="w-6 h-6 text-blue-600 mr-2" />
            Detalles de la Reservación
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Dates Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Fechas de Estancia</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Llegada
                  </label>
                  <div className="relative">
                    <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="date"
                      value={reservationData.checkIn}
                      onChange={(e) => handleDateChange('checkIn', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Salida
                  </label>
                  <div className="relative">
                    <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="date"
                      value={reservationData.checkOut}
                      onChange={(e) => handleDateChange('checkOut', e.target.value)}
                      min={reservationData.checkIn || new Date().toISOString().split('T')[0]}
                      className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Room and Guests Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Habitación y Huéspedes</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Habitación
                  </label>
                  <div className="relative">
                    <Hotel className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <select
                      value={reservationData.roomType}
                      onChange={(e) => {
                        const newRoomType = e.target.value as 'single' | 'double';
                        setReservationData(prev => {
                          const { nights, pricePerNight, total } = calculateTotalPrice(
                            prev.checkIn,
                            prev.checkOut,
                            newRoomType
                          );
                          return {
                            ...prev,
                            roomType: newRoomType,
                            guests: 1,
                            totalNights: nights,
                            pricePerNight,
                            totalPrice: total
                          };
                        });
                      }}
                      className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    >
                      <option value="single">Habitación Sencilla (máx. 2 personas)</option>
                      <option value="double">Habitación Doble (máx. 4 personas)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Personas
                  </label>
                  <div className="relative">
                    <Users className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="number"
                      min="1"
                      max={reservationData.roomType === 'single' ? 2 : 4}
                      value={reservationData.guests}
                      onChange={(e) => setReservationData(prev => ({
                        ...prev,
                        guests: parseInt(e.target.value)
                      }))}
                      className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Capacidad máxima: {reservationData.roomType === 'single' ? '2' : '4'} personas
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Guest Information */}
          <div className="mt-8 space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Información de Huéspedes</h3>
            
            {/* Main Guest */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Huésped Principal
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  value={reservationData.mainGuest}
                  onChange={(e) => setReservationData(prev => ({
                    ...prev,
                    mainGuest: e.target.value
                  }))}
                  placeholder="Nombre del huésped principal"
                  className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>

            {/* Additional Guests */}
            {reservationData.guests > 1 && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Huéspedes Adicionales
                </label>
                {Array.from({ length: reservationData.guests - 1 }).map((_, index) => (
                  <div key={index} className="relative">
                    <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      value={reservationData.additionalGuests[index] || ''}
                      onChange={(e) => {
                        const newGuests = [...reservationData.additionalGuests];
                        newGuests[index] = e.target.value;
                        setReservationData(prev => ({
                          ...prev,
                          additionalGuests: newGuests
                        }));
                      }}
                      placeholder={`Nombre del huésped ${index + 2}`}
                      className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reservation Summary */}
          {reservationData.totalNights > 0 && (
            <div className="mt-8 bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Resumen de la Reservación</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-gray-600">
                  <span>Total de Noches:</span>
                  <span>{reservationData.totalNights}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Precio por Noche:</span>
                  <span>{formatPrice(reservationData.pricePerNight)}</span>
                </div>
                <div className="flex justify-between text-gray-900 font-bold text-lg pt-3 border-t border-gray-200">
                  <span>Precio Total:</span>
                  <span>{formatPrice(reservationData.totalPrice)}</span>
                </div>
              </div>

              {/* Payment Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <CallToBackend
                  paymentData={getPaymentData(hotel, reservationData)}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PaymentIcon className="w-5 h-5" />
                  <span>Pagar con Stripe</span>
                  <ArrowRight className="w-5 h-5" />
                </CallToBackend>

                <button className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <BanknoteIcon className="w-5 h-5" />
                  <span>Pagar por Transferencia</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};