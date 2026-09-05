import { z } from "zod";

const phoneRegex = /^(\+?216)?\s?[2459]\d{7}$/;

const baseFields = {
  full_name: z.string().trim().min(2, "الاسم قصير").max(100, "الاسم طويل برشة"),
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, "رقم الهاتف موش صحيح (8 أرقام)"),
};

export const financialSchema = z.object({
  ...baseFields,
  amount: z
    .number({ invalid_type_error: "أدخل مبلغ" })
    .min(1, "المبلغ لازم يكون أكثر من 0")
    .max(100000, "مبلغ كبير برشة"),
  payment_method: z.enum(["cash", "transfer", "check"], {
    errorMap: () => ({ message: "اختار طريقة الدفع" }),
  }),
});

const estimatedValue = z
  .number({ invalid_type_error: "أدخل القيمة التقريبية" })
  .min(1, "القيمة لازم تكون أكثر من 0")
  .max(100000, "قيمة كبيرة برشة");

export const headquartersSchema = z.object({
  ...baseFields,
  amount: estimatedValue,
});

export const homePickupSchema = z.object({
  ...baseFields,
  amount: estimatedValue,
  gps_location: z
    .string()
    .trim()
    .url("لازم يكون رابط Google Maps صحيح")
    .max(500, "الرابط طويل برشة"),
});


export type FinancialForm = z.infer<typeof financialSchema>;
export type HeadquartersForm = z.infer<typeof headquartersSchema>;
export type HomePickupForm = z.infer<typeof homePickupSchema>;
