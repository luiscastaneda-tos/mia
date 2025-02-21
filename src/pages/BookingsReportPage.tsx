import React, { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";
import {
  ArrowLeft,
  Calendar,
  Hotel,
  CreditCard,
  Clock,
  CheckCircle,
  AlertTriangle,
  Search,
  Download,
  ArrowDownToLine,
  MessageSquare,
  Trash2,
  X,
  Filter,
  ArrowRight,
  DollarSign,
  MapPin,
  Receipt,
} from "lucide-react";
import html2pdf from "html2pdf.js";
import type { Invoice, BillingOption } from "../types";
import { InvoiceHistory } from "../components/InvoiceHistory";
import { BillingOptions } from "../components/BillingOptions";
import { fetchInvoices } from "../services/billingService";
import { CallToBackend } from "../components/CallToBackend";

const DOMAIN = "http://localhost:5173";
const payment_metadata = {};
const getPaymentData = (booking) => {
  const payment_metadata = {
    booking_id: booking.id,
    confirmation_code: booking.confirmation_code
  };

  const currentUrl = window.location.href;

  return {
    line_items: [
      {
        price_data: {
          currency: "mxn",
          product_data: {
            name: booking.hotel_name,
            description: `Reservación en ${booking.hotel_name} - ${booking.room_type === 'single' ? 'Habitación Sencilla' : 'Habitación Doble'}`,
            images: [
              booking.image_url || "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
            ],
          },
          unit_amount: Math.round(booking.total_price * 100),
        },
        quantity: 1,
      }
    ],
    mode: "payment",
    success_url: `${DOMAIN}?success=true&session={CHECKOUT_SESSION_ID}&metadata=${JSON.stringify(payment_metadata)}`,
    cancel_url: currentUrl,
  };
};

interface Booking {
  id: string;
  confirmation_code: string;
  hotel_name: string;
  check_in: string;
  check_out: string;
  room_type: string;
  total_price: number;
  status: string;
  created_at: string;
  image_url?: string;
}

interface BookingsReportPageProps {
  onBack: () => void;
}

export const BookingsReportPage: React.FC<BookingsReportPageProps> = ({
  onBack,
}) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showBillingOptions, setShowBillingOptions] = useState(false);
  const [selectedBookingForBilling, setSelectedBookingForBilling] =
    useState<Booking | null>(null);

  useEffect(() => {
    fetchBookings();
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setIsLoadingInvoices(true);
      const invoicesData = await fetchInvoices();
      setInvoices(invoicesData);
    } catch (error) {
      console.error("Error loading invoices:", error);
    } finally {
      setIsLoadingInvoices(false);
    }
  };

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("No user found");
      }

      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBooking = async () => {
    if (!selectedBooking) return;

    try {
      const { error } = await supabase
        .from("bookings")
        .delete()
        .eq("id", selectedBooking.id);

      if (error) throw error;

      setBookings((prev) => prev.filter((b) => b.id !== selectedBooking.id));
      setShowDeleteModal(false);
      setSelectedBooking(null);
    } catch (error: any) {
      console.error("Error deleting booking:", error);
      setDeleteError(error.message);
    }
  };

  const handleBillingOptionSelect = (option: BillingOption) => {
    console.log("Selected billing option:", option);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const renderBookingCard = (booking: Booking) => (
    <div
      key={booking.id}
      className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Image Section */}
        <div className="md:col-span-1">
          <div className="h-full relative">
            <img
              src={booking.image_url || "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"}
              alt={booking.hotel_name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <div className={`px-3 py-1 rounded-full border ${getStatusColor(booking.status)} flex items-center space-x-1`}>
                {getStatusIcon(booking.status)}
                <span className="text-sm font-medium capitalize">
                  {booking.status === "completed"
                    ? "Completada"
                    : booking.status === "pending"
                    ? "Pendiente"
                    : "Cancelada"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="md:col-span-2 p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {booking.hotel_name}
              </h3>
              <p className="text-gray-500 text-sm">
                Código: {booking.confirmation_code}
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedBooking(booking);
                setShowDeleteModal(true);
              }}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-6">
            {/* Hotel Details */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-gray-700">
                <Hotel className="w-5 h-5" />
                <h4 className="font-medium">Detalles del Hotel</h4>
              </div>
              <div className="space-y-2">
                <p className="text-gray-900">
                  <span className="text-gray-500">Tipo de Habitación:</span>{" "}
                  {booking.room_type === "single" ? "Sencilla" : "Doble"}
                </p>
              </div>
            </div>

            {/* Dates */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-gray-700">
                <Calendar className="w-5 h-5" />
                <h4 className="font-medium">Fechas de Estancia</h4>
              </div>
              <div className="space-y-2">
                <p className="text-gray-900">
                  <span className="text-gray-500">Check-in:</span>{" "}
                  {formatDate(booking.check_in)}
                </p>
                <p className="text-gray-900">
                  <span className="text-gray-500">Check-out:</span>{" "}
                  {formatDate(booking.check_out)}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${booking.total_price.toLocaleString("es-MX")} MXN
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setSelectedBookingForBilling(booking);
                    setShowBillingOptions(true);
                  }}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors px-4 py-2 rounded-lg hover:bg-blue-50"
                >
                  <Receipt className="w-4 h-4" />
                  <span>Facturar</span>
                </button>
                {booking.status === "pending" && (
                  <CallToBackend
                    paymentData={getPaymentData(booking)}
                    className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Pagar</span>
                    <ArrowRight className="w-4 h-4" />
                  </CallToBackend>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.hotel_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.confirmation_code
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const downloadReport = () => {
    const element = document.getElementById("bookings-report");
    if (!element) return;

    const opt = {
      margin: 1,
      filename: "reporte-reservas.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="min-h-screen bg-[#4c93f8] pt-16 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-white hover:text-white/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver</span>
          </button>
          <button
            onClick={downloadReport}
            className="flex items-center space-x-2 bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
          >
            <Download className="w-5 h-5" />
            <span>Descargar Reporte</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Historial de Facturas - Izquierda */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Facturas</h2>
              <Receipt className="w-6 h-6 text-white/60" />
            </div>
            <InvoiceHistory invoices={invoices} isLoading={isLoadingInvoices} />
          </div>

          {/* Contenido Principal - Derecha */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filtros y Búsqueda */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Buscar por nombre de hotel o código de reserva..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/10 text-white placeholder-white/60 border border-white/20 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-white/20"
                />
                <Search className="w-5 h-5 text-white/60 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
              <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-4 py-2">
                <Filter className="w-5 h-5 text-white/60" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent text-white border-none focus:outline-none"
                >
                  <option value="all" className="text-gray-900">
                    Todos los estados
                  </option>
                  <option value="completed" className="text-gray-900">
                    Completadas
                  </option>
                  <option value="pending" className="text-gray-900">
                    Pendientes
                  </option>
                  <option value="cancelled" className="text-gray-900">
                    Canceladas
                  </option>
                </select>
              </div>
            </div>

            {/* Lista de Reservas */}
            <div id="bookings-report" className="space-y-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => renderBookingCard(booking))
              ) : (
                <div className="text-center py-12 bg-white/10 backdrop-blur-sm rounded-lg">
                  <MessageSquare className="w-12 h-12 text-white/40 mx-auto mb-4" />
                  <p className="text-white/80">
                    No se encontraron reservaciones
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Confirmar Eliminación
            </h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar esta reservación? Esta acción
              no se puede deshacer.
            </p>
            {deleteError && (
              <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
                {deleteError}
              </div>
            )}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedBooking(null);
                  setDeleteError(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteBooking}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Opciones de Facturación */}
      {showBillingOptions && selectedBookingForBilling && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Opciones de Facturación
              </h3>
              <button
                onClick={() => {
                  setShowBillingOptions(false);
                  setSelectedBookingForBilling(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6 bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Receipt className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-900">
                    Facturando reservación:{" "}
                    <span className="font-medium">
                      {selectedBookingForBilling.confirmation_code}
                    </span>
                  </p>
                  <p className="text-sm text-blue-700">
                    {selectedBookingForBilling.hotel_name}
                  </p>
                </div>
              </div>
            </div>

            <BillingOptions onSelectOption={handleBillingOptionSelect} />
          </div>
        </div>
      )}
    </div>
  );
};