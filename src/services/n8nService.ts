import { supabase } from './supabaseClient';
import { fetchHotelImages } from './hotelImageService';
import type { BookingData } from '../types';

const N8N_WEBHOOK_URL = 'https://noktos.app.n8n.cloud/webhook/9a240546-3ce3-4b39-9dd2-c006239f560b';

const generateSessionId = () => {
  return Array.from({ length: 32 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
};

const sessionId = generateSessionId();

const createEmptyBookingData = (): BookingData => ({
  confirmationCode: null,
  hotel: {
    name: null,
    location: null,
    image: null,
    additionalImages: []
  },
  dates: {
    checkIn: null,
    checkOut: null
  },
  room: {
    type: null,
    pricePerNight: null,
    totalPrice: null
  },
  guests: [],
  totalNights: null
});

let currentBookingData: BookingData = createEmptyBookingData();

const extractBookingConfirmation = (message: string) => {
  // Convert number to string if message is a number
  const messageStr = message?.toString() || '';
  
  const confirmationPattern = /¡Se ha creado la reserva para .* exitosamente!/;
  if (!confirmationPattern.test(messageStr)) return null;

  const extractValue = (pattern: RegExp, text: string) => {
    const match = text.match(pattern);
    return match ? match[1].trim() : null;
  };

  const namePattern = /Reserva a nombre de: (.*)/;
  const hotelPattern = /Hotel: (.*)/;
  const datesPattern = /Fechas de estancia: del (\d{2}-\d{2}-\d{4}) al (\d{2}-\d{2}-\d{4})/;
  const roomTypePattern = /Tipo de habitación: (.*)/;
  const totalNightsPattern = /Total de Noches: (\d+)/;
  const pricePerNightPattern = /Precio por Noche: \$?([\d,]+(?:\.\d{2})?)/;
  const totalPricePattern = /Precio total: \$?([\d,]+(?:\.\d{2})?)/;
  const guestsPattern = /Número de personas: (\d+)/;

  const name = extractValue(namePattern, messageStr);
  const hotel = extractValue(hotelPattern, messageStr);
  const datesMatch = messageStr.match(datesPattern);
  const roomType = extractValue(roomTypePattern, messageStr);
  const totalNights = extractValue(totalNightsPattern, messageStr);
  const pricePerNight = extractValue(pricePerNightPattern, messageStr);
  const totalPrice = extractValue(totalPricePattern, messageStr);
  const guests = extractValue(guestsPattern, messageStr);

  if (datesMatch) {
    const [_, checkIn, checkOut] = datesMatch;
    const formatDate = (dateStr: string) => {
      const [day, month, year] = dateStr.split('-');
      return `${year}-${month}-${day}`;
    };

    return {
      confirmationCode: `RES${Date.now().toString().slice(-6)}`,
      hotel: {
        name: hotel,
        location: null,
        image: null,
        additionalImages: []
      },
      dates: {
        checkIn: formatDate(checkIn),
        checkOut: formatDate(checkOut)
      },
      room: {
        type: roomType?.toLowerCase().includes('sencilla') ? 'single' : 'double',
        pricePerNight: parseFloat(pricePerNight?.replace(/,/g, '') || '0'),
        totalPrice: parseFloat(totalPrice?.replace(/,/g, '') || '0')
      },
      guests: name ? [name] : [],
      totalNights: parseInt(totalNights || '0', 10)
    };
  }

  return null;
};

const extractHotelName = (message: string): string | null => {
  // Convert number to string if message is a number
  const messageStr = message?.toString() || '';
  
  const match = messageStr.match(/Genial, comencemos con tu reserva para ([^.]+)\./);
  return match ? match[1].trim() : null;
};

const extractDates = (message: string): { checkIn: string | null, checkOut: string | null } | null => {
  // Convert number to string if message is a number
  const messageStr = message?.toString() || '';
  
  const datePattern = /Perfecto, tu estancia ha sido confirmada del (\d{2}-\d{2}-\d{4}) al (\d{2}-\d{2}-\d{4})/;
  const match = messageStr.match(datePattern);
  
  if (match) {
    const [_, checkIn, checkOut] = match;
    const formatDate = (dateStr: string) => {
      const [day, month, year] = dateStr.split('-');
      return `${year}-${month}-${day}`;
    };
    
    return {
      checkIn: formatDate(checkIn),
      checkOut: formatDate(checkOut)
    };
  }
  
  return null;
};

const calculateNights = (checkIn: string, checkOut: string): number => {
  const [checkInYear, checkInMonth, checkInDay] = checkIn.split('-').map(Number);
  const [checkOutYear, checkOutMonth, checkOutDay] = checkOut.split('-').map(Number);
  
  const startDate = new Date(checkInYear, checkInMonth - 1, checkInDay);
  const endDate = new Date(checkOutYear, checkOutMonth - 1, checkOutDay);
  
  const diffTime = endDate.getTime() - startDate.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

export const sendMessageToN8N = async (message: string | number, userId?: string) => {
  try {
    // Convert message to string if it's a number
    const messageStr = message?.toString() || '';
    
    let userData = null;
    let userPreferences = null;

    if (userId) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          userData = {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name,
            phone: user.user_metadata?.phone
          };

          const { data: preferences } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (preferences) {
            userPreferences = {
              preferred_hotel: preferences.preferred_hotel,
              frequent_changes: preferences.frequent_changes,
              avoid_locations: preferences.avoid_locations
            };
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }

    const bookingConfirmation = extractBookingConfirmation(messageStr);
    if (bookingConfirmation) {
      currentBookingData = bookingConfirmation;
      
      if (bookingConfirmation.hotel.name) {
        try {
          const hotelImages = await fetchHotelImages(bookingConfirmation.hotel.name);
          currentBookingData.hotel.additionalImages = hotelImages.map(img => img.imageUrl);
        } catch (error) {
          console.error('Error fetching hotel images:', error);
        }
      }
    } else {
      const dates = extractDates(messageStr);
      if (dates) {
        const totalNights = calculateNights(dates.checkIn!, dates.checkOut!);
        currentBookingData = {
          ...currentBookingData,
          dates,
          totalNights
        };
      }

      const hotelName = extractHotelName(messageStr);
      if (hotelName && hotelName !== currentBookingData.hotel.name) {
        currentBookingData = createEmptyBookingData();
        currentBookingData.hotel.name = hotelName;
        
        try {
          const hotelImages = await fetchHotelImages(hotelName);
          currentBookingData.hotel.additionalImages = hotelImages.map(img => img.imageUrl);
        } catch (error) {
          console.error('Error fetching hotel images:', error);
        }
      }
    }

    const payload = {
      message: messageStr,
      sessionId,
      timestamp: new Date().toISOString(),
      user: userData,
      preferences: userPreferences
    };

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    let responseData;
    try {
      responseData = await response.json();
    } catch (error) {
      console.error('Error parsing N8N response:', error);
      responseData = null;
    }

    if (!response.ok) {
      const errorMessage = responseData 
        ? `Error al enviar mensaje a n8n: ${response.status} - ${JSON.stringify(responseData)}`
        : `Error al enviar mensaje a n8n: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    if (!responseData || !Array.isArray(responseData) || responseData.length === 0) {
      return {
        output: messageStr,
        type: null,
        data: {
          bookingData: currentBookingData
        }
      };
    }

    const output = responseData[0]?.output ?? messageStr;
    
    const responseBookingConfirmation = extractBookingConfirmation(output);
    if (responseBookingConfirmation) {
      currentBookingData = responseBookingConfirmation;
      
      if (responseBookingConfirmation.hotel.name) {
        try {
          const hotelImages = await fetchHotelImages(responseBookingConfirmation.hotel.name);
          currentBookingData.hotel.additionalImages = hotelImages.map(img => img.imageUrl);
        } catch (error) {
          console.error('Error fetching hotel images:', error);
        }
      }
    } else {
      const outputDates = extractDates(output);
      if (outputDates) {
        const totalNights = calculateNights(outputDates.checkIn!, outputDates.checkOut!);
        currentBookingData = {
          ...currentBookingData,
          dates: outputDates,
          totalNights
        };
      }

      const responseHotelName = extractHotelName(output);
      if (responseHotelName && responseHotelName !== currentBookingData.hotel.name) {
        currentBookingData = createEmptyBookingData();
        currentBookingData.hotel.name = responseHotelName;
        
        try {
          const hotelImages = await fetchHotelImages(responseHotelName);
          currentBookingData.hotel.additionalImages = hotelImages.map(img => img.imageUrl);
        } catch (error) {
          console.error('Error fetching hotel images:', error);
        }
      }
    }

    return {
      output,
      type: responseData[0]?.type ?? null,
      data: {
        bookingData: currentBookingData
      }
    };
  } catch (error: any) {
    console.error('Error en n8nService:', error);
    throw error;
  }
};