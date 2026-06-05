import { z } from "zod";

const sourceFileSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1)
});

const imageSchema = z.object({
  src: z.string().min(1),
  alt: z.string().min(1),
  caption: z.string().optional()
});

const baseCaseSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  order: z.number().int().positive(),
  title: z.string().min(1),
  focus: z.string().min(1),
  sourcePdf: sourceFileSchema,
  originalPages: z.array(imageSchema).min(1),
  tags: z.array(z.string().min(1)).min(1),
  reviewStatus: z.enum(["draft", "reviewing", "checked"])
});

const nonImagingCaseSchema = baseCaseSchema.extend({
  group: z.literal("non-imaging")
});

const imagingCaseSchema = baseCaseSchema.extend({
  group: z.literal("imaging"),
  keyAnswer: z.string().min(1),
  imaging: z.array(imageSchema).min(1),
  sources: z.array(sourceFileSchema).min(1)
});

export const caseMetaSchema = z.discriminatedUnion("group", [
  nonImagingCaseSchema,
  imagingCaseSchema
]);

export const casesMetaSchema = z
  .array(caseMetaSchema)
  .length(20)
  .superRefine((items, context) => {
    const slugs = new Set<string>();
    const orders = new Set<number>();

    for (const item of items) {
      if (slugs.has(item.slug)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate slug: ${item.slug}`
        });
      }
      slugs.add(item.slug);

      if (orders.has(item.order)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate order: ${item.order}`
        });
      }
      orders.add(item.order);
    }

    const imagingCount = items.filter((item) => item.group === "imaging").length;
    if (imagingCount !== 5) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Expected 5 imaging cases, got ${imagingCount}`
      });
    }
  });
