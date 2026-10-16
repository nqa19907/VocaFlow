import { z } from "zod";
export const profileSchema = z
  .object({
    display_name: z.string().trim().min(1, "Hãy nhập tên hiển thị.").max(80),
    timezone: z
      .string()
      .max(100)
      .refine((value) => {
        try {
          new Intl.DateTimeFormat("en", { timeZone: value });
          return true;
        } catch {
          return false;
        }
      }, "Múi giờ không hợp lệ."),
  })
  .strict();
