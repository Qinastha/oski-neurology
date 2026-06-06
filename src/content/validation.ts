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

const requiredTaskSchema = z.object({
  id: z.string().min(1),
  prompt: z.string().min(1),
  coverage: z.enum(["covered", "partial", "missing", "not_applicable"]),
  note: z.string().min(1).optional()
});

const stationAnswerPointSchema = z.object({
  text: z.string().min(1),
  evidence: z.enum(["visible_on_image", "from_case", "caution"]).optional()
});

const stationAnswerBlockSchema = z.object({
  type: z.enum([
    "task_summary",
    "actor_communication",
    "history_questions",
    "exam_steps",
    "imaging_review",
    "diagnosis",
    "management",
    "must_say",
    "pitfalls"
  ]),
  title: z.string().min(1),
  body: z.string().min(1).optional(),
  points: z.array(stationAnswerPointSchema).min(1)
});

const stationBlueprintSchema = z.object({
  slug: z.string().min(1),
  stationType: z.enum([
    "actor_dialogue",
    "verbal_analysis",
    "procedure",
    "imaging_review",
    "mixed"
  ]),
  reviewVerdict: z.enum(["needs_revision", "medically_checked", "checked_with_caveats"]),
  requiredTasks: z.array(requiredTaskSchema).min(1),
  answerBlocks: z.array(stationAnswerBlockSchema).min(1),
  sources: z.array(sourceFileSchema).min(1)
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
  reviewStatus: z.enum(["draft", "reviewing", "checked"]),
  blueprint: stationBlueprintSchema.optional()
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

      if (item.blueprint && item.blueprint.slug !== item.slug) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Blueprint slug mismatch for ${item.slug}: ${item.blueprint.slug}`
        });
      }

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
