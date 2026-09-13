import { z } from 'zod'

export const createContactSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(2, t('validation.nameRequired')),
    email: z.string().email(t('validation.emailInvalid')),
    phone: z.string().min(8, t('validation.phoneInvalid')),
    subject: z.string().min(1, t('validation.subjectRequired')),
    message: z.string().min(10, t('validation.messageRequired')),
  })

export const createBookingSchema = (t: (key: string) => string) =>
  z.object({
    pickup: z.string().min(3, t('validation.pickupRequired')),
    dropoff: z.string().min(3, t('validation.dropoffRequired')),
    date: z.string().min(1, t('validation.dateRequired')),
    time: z.string().min(1, t('validation.timeRequired')),
    passengers: z.number().min(1, t('validation.passengersRequired')).max(8),
    specialRequests: z.string().optional(),
  })

export type ContactFormData = z.infer<ReturnType<typeof createContactSchema>>
export type BookingFormData = z.infer<ReturnType<typeof createBookingSchema>>
