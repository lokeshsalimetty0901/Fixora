import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  FileText,
  ShieldCheck,
  Star,
  CheckCircle2,
  AlertCircle,
  Loader2,
  DollarSign,
  ShieldAlert,
  ArrowRight,
  User,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiPost } from '../../services/apiClient';
import type { ProfessionalProfile, Service } from '../../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  professional: ProfessionalProfile | null;
  preselectedServiceId?: string;
  defaultEmergency?: boolean;
  customerLocation?: { lat: number; lng: number } | null;
  onBookingSuccess?: (booking: any) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  professional,
  preselectedServiceId,
  defaultEmergency = false,
  customerLocation,
  onBookingSuccess,
}) => {
  const { user, token, isAuthenticated, isCustomer } = useAuth();
  const navigate = useNavigate();

  // State
  const servicesList: Service[] = (professional as any)?.services || [];
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    preselectedServiceId || servicesList[0]?.id || ''
  );
  const [scheduledDate, setScheduledDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [scheduledTime, setScheduledTime] = useState<string>('10:00 AM');
  const [address, setAddress] = useState<string>(
    (user as any)?.address || (customerLocation ? 'Picked Map Location' : '')
  );
  const [notes, setNotes] = useState<string>('');
  const [isEmergency, setIsEmergency] = useState<boolean>(defaultEmergency);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [createdBooking, setCreatedBooking] = useState<any | null>(null);

  if (!isOpen || !professional) return null;

  // Selected Service
  const selectedService = servicesList.find((s) => s.id === selectedServiceId) || servicesList[0];

  // Pricing breakdown
  const basePrice = selectedService ? selectedService.price : professional.hourlyRate;
  const emergencyFee = isEmergency ? Math.round(basePrice * 0.25 * 100) / 100 : 0;
  const platformFee = 5.0; // standard insurance/dispatch fee
  const totalPrice = Math.round((basePrice + emergencyFee + platformFee) * 100) / 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isAuthenticated) {
      navigate('/login?redirect=/services');
      return;
    }

    if (!isCustomer && user?.role !== 'ADMIN') {
      setError('Only customer accounts can create bookings. Please sign in as a customer.');
      return;
    }

    if (!address.trim()) {
      setError('Please provide a valid service address.');
      return;
    }

    if (!selectedServiceId && !selectedService) {
      setError('Please select a service from the options below.');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        professionalId: professional.id,
        serviceId: selectedServiceId || selectedService?.id,
        scheduledDate,
        scheduledTime: isEmergency ? 'ASAP (Emergency)' : scheduledTime,
        address: address.trim(),
        latitude: customerLocation?.lat || professional.latitude,
        longitude: customerLocation?.lng || professional.longitude,
        notes: notes.trim() || undefined,
        isEmergency,
        paymentMethod: 'MOCK_CARD_4242',
      };

      const data = await apiPost('/api/bookings', payload, token);

      setCreatedBooking(data);
      if (onBookingSuccess) {
        onBookingSuccess(data);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setError(null);
    setCreatedBooking(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 glass-panel border border-slate-700/80 rounded-3xl bg-slate-900 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-teal-400 p-0.5 shadow">
              <img
                src={professional.user.avatarUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150'}
                alt={professional.user.fullName}
                className="w-full h-full object-cover rounded-[10px]"
              />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Book {professional.user.fullName}</span>
                <ShieldCheck className="w-4 h-4 text-teal-400" />
              </h3>
              <p className="text-xs text-slate-400">
                ★ {professional.rating} ({professional.reviewCount} reviews) • {professional.experienceYears} yrs experience
              </p>
            </div>
          </div>

          <button
            onClick={handleModalClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {createdBooking ? (
          /* Confirmation Success Screen */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h4 className="text-2xl font-extrabold text-white">Booking Confirmed!</h4>
              <p className="text-sm text-slate-300 max-w-md mx-auto">
                Your service request has been registered and dispatched to{' '}
                <strong className="text-white">{professional.user.fullName}</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-left space-y-2 max-w-md mx-auto text-xs text-slate-300">
              <div className="flex justify-between border-b border-slate-700 pb-2">
                <span className="text-slate-400">Booking ID:</span>
                <span className="font-mono text-teal-400 font-bold">{createdBooking.id.substring(0, 8)}...</span>
              </div>
              <div className="flex justify-between border-b border-slate-700 pb-2">
                <span className="text-slate-400">Scheduled:</span>
                <span className="text-white font-medium">
                  {createdBooking.scheduledDate} at {createdBooking.scheduledTime}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-700 pb-2">
                <span className="text-slate-400">Total Charged:</span>
                <span className="text-emerald-400 font-bold">${createdBooking.totalPrice}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-400">Service Address:</span>
                <span className="text-white font-medium truncate max-w-[200px]">{createdBooking.address}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/customer/dashboard')}
                className="btn-primary-glow w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-indigo-600 to-teal-500 flex items-center justify-center space-x-2"
              >
                <span>View in Customer Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleModalClose}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* Form Content */
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-3">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Authentication warning if user is not logged in */}
            {!isAuthenticated && (
              <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs flex items-center justify-between">
                <span>You need to be logged in to confirm this booking.</span>
                <button
                  type="button"
                  onClick={() => navigate('/login?redirect=/services')}
                  className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
                >
                  Log In
                </button>
              </div>
            )}

            {/* Service Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                Select Service Package
              </label>
              {servicesList.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
                  {servicesList.map((service) => {
                    const isSelected = (selectedServiceId || servicesList[0]?.id) === service.id;
                    return (
                      <div
                        key={service.id}
                        onClick={() => setSelectedServiceId(service.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-indigo-600/20 border-teal-400 ring-1 ring-teal-400/40'
                            : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <h5 className="text-xs font-bold text-white">{service.name}</h5>
                          <span className="text-xs font-bold text-teal-400">${service.price}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{service.description}</p>
                        <span className="text-[10px] text-slate-500 block mt-1.5">
                          ⏱ ~{service.estimatedDurationMinutes} mins
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700 text-xs text-slate-300 flex items-center justify-between">
                  <span>General Technician On-Site Inspection & Diagnostic</span>
                  <span className="font-bold text-teal-400">${professional.hourlyRate}/hr</span>
                </div>
              )}
            </div>

            {/* Date, Time & Emergency Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Scheduled Date</span>
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-teal-400" />
                  <span>Preferred Time Slot</span>
                </label>
                <select
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  disabled={isEmergency}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                >
                  <option value="09:00 AM">Morning: 09:00 AM - 11:00 AM</option>
                  <option value="11:30 AM">Midday: 11:30 AM - 01:30 PM</option>
                  <option value="02:00 PM">Afternoon: 02:00 PM - 04:00 PM</option>
                  <option value="04:30 PM">Late Afternoon: 04:30 PM - 06:30 PM</option>
                  <option value="07:00 PM">Evening: 07:00 PM - 09:00 PM</option>
                </select>
              </div>
            </div>

            {/* Emergency 24/7 Dispatch Toggle */}
            <div
              onClick={() => setIsEmergency(!isEmergency)}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                isEmergency
                  ? 'bg-rose-950/30 border-rose-500/50 ring-1 ring-rose-500/30'
                  : 'bg-slate-800/30 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isEmergency ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <span>24/7 Emergency Dispatch</span>
                    {isEmergency && <span className="text-[10px] text-rose-400 font-semibold">(Active)</span>}
                  </h5>
                  <p className="text-[11px] text-slate-400">
                    Immediately pings the professional for rapid arrival (+25% surcharge applies).
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isEmergency}
                onChange={() => {}}
                className="w-4 h-4 text-rose-500 rounded focus:ring-0 cursor-pointer"
              />
            </div>

            {/* Service Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Service Address</span>
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 124 Oak Street, Apt 3B, New York, NY"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            {/* Notes / Issue Details */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Special Instructions or Problem Description (Optional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Describe what needs repair, parking info, or gate codes..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            {/* Transparent Price Summary */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Base Service Package:</span>
                <span className="text-white font-medium">${basePrice.toFixed(2)}</span>
              </div>
              {isEmergency && (
                <div className="flex justify-between text-rose-400">
                  <span>Emergency Dispatch Surcharge (25%):</span>
                  <span>+${emergencyFee.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>Platform Guarantee & Dispatch Fee:</span>
                <span className="text-white font-medium">${platformFee.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm font-bold">
                <span className="text-white">Estimated Total:</span>
                <span className="text-teal-400 text-base">${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={handleModalClose}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl font-semibold text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary-glow px-7 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-teal-500 hover:from-indigo-500 hover:to-teal-400 flex items-center space-x-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Confirming Booking...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Book (${totalPrice.toFixed(2)})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
