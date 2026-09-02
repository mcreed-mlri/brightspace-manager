import {
  TOPIC_FAMILIES,
  TOPIC_KINDS,
  UPDATED_FLAGS,
  type CalloutVariant,
  type ContentBlock,
  type CourseDraft,
  type PublishSettings,
  type TopicMedia,
} from "@/types/studio";

type ValidationResult = { ok: true; draft: CourseDraft } | { ok: false; message: string };

type CheckResult = { ok: true } | { ok: false; message: string };

const CALLOUT_VARIANTS = ["info", "warn", "tip"] satisfies CalloutVariant[];
const MEDIA_PLACEMENTS = ["scenario", "rule"] satisfies TopicMedia["placement"][];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isOneOf<T extends readonly string[]>(value: unknown, allowed: T): value is T[number] {
  return typeof value === "string" && (allowed as readonly string[]).includes(value);
}

function invalid(path: string): { ok: false; message: string } {
  return { ok: false, message: `Invalid course draft payload: ${path}.` };
}

function validateTryIt(value: unknown, path: string): CheckResult {
  if (!isRecord(value)) return invalid(path);
  if (!isString(value.question)) return invalid(`${path}.question must be a string`);
  if (!isString(value.answer)) return invalid(`${path}.answer must be a string`);
  if (!Array.isArray(value.options)) return invalid(`${path}.options must be an array`);
  for (const [index, option] of value.options.entries()) {
    if (!isRecord(option)) return invalid(`${path}.options[${index}] must be an object`);
    if (!isString(option.text)) return invalid(`${path}.options[${index}].text must be a string`);
    if (typeof option.correct !== "boolean") {
      return invalid(`${path}.options[${index}].correct must be a boolean`);
    }
  }
  return { ok: true };
}

function validateMedia(value: unknown, path: string): CheckResult {
  if (!Array.isArray(value)) return invalid(`${path} must be an array`);
  for (const [index, item] of value.entries()) {
    const itemPath = `${path}[${index}]`;
    if (!isRecord(item)) return invalid(`${itemPath} must be an object`);
    if (!isString(item.filename)) return invalid(`${itemPath}.filename must be a string`);
    if (!isString(item.alt)) return invalid(`${itemPath}.alt must be a string`);
    if (!isString(item.caption)) return invalid(`${itemPath}.caption must be a string`);
    if (!isOneOf(item.placement, MEDIA_PLACEMENTS)) {
      return invalid(`${itemPath}.placement must be scenario or rule`);
    }
  }
  return { ok: true };
}

function validateWhatChanged(value: unknown, path: string): CheckResult {
  if (value === null) return { ok: true };
  if (!isRecord(value)) return invalid(`${path} must be null or an object`);
  for (const key of ["pill", "meta", "heading", "body"] as const) {
    if (!isString(value[key])) return invalid(`${path}.${key} must be a string`);
  }
  return { ok: true };
}

function validateBlocks(value: unknown, path: string): CheckResult {
  if (!Array.isArray(value)) return invalid(`${path} must be an array`);
  for (const [index, block] of value.entries()) {
    const blockPath = `${path}[${index}]`;
    if (!isRecord(block) || !isString(block.type)) return invalid(`${blockPath} must be a block`);
    switch (block.type as ContentBlock["type"]) {
      case "accordion":
        if (!Array.isArray(block.items)) return invalid(`${blockPath}.items must be an array`);
        for (const [itemIndex, item] of block.items.entries()) {
          if (!isRecord(item)) return invalid(`${blockPath}.items[${itemIndex}] must be an object`);
          if (!isString(item.title) || !isString(item.body)) {
            return invalid(`${blockPath}.items[${itemIndex}] must include title and body strings`);
          }
        }
        break;
      case "reveal":
        if (!Array.isArray(block.items)) return invalid(`${blockPath}.items must be an array`);
        for (const [itemIndex, item] of block.items.entries()) {
          if (!isRecord(item)) return invalid(`${blockPath}.items[${itemIndex}] must be an object`);
          if (!isString(item.prompt) || !isString(item.body)) {
            return invalid(`${blockPath}.items[${itemIndex}] must include prompt and body strings`);
          }
        }
        break;
      case "callout":
        if (!isOneOf(block.variant, CALLOUT_VARIANTS)) {
          return invalid(`${blockPath}.variant must be info, warn, or tip`);
        }
        if (!isString(block.title) || !isString(block.body)) {
          return invalid(`${blockPath} must include title and body strings`);
        }
        break;
      case "timeline":
        if (!Array.isArray(block.steps)) return invalid(`${blockPath}.steps must be an array`);
        for (const [stepIndex, step] of block.steps.entries()) {
          if (!isRecord(step)) return invalid(`${blockPath}.steps[${stepIndex}] must be an object`);
          if (!isString(step.label) || !isString(step.body)) {
            return invalid(`${blockPath}.steps[${stepIndex}] must include label and body strings`);
          }
        }
        break;
      case "quote":
        if (!isString(block.text) || !isString(block.attribution)) {
          return invalid(`${blockPath} must include text and attribution strings`);
        }
        break;
      default:
        return invalid(`${blockPath}.type is not supported`);
    }
  }
  return { ok: true };
}

function validatePublish(value: unknown, path: string): CheckResult {
  if (value === undefined) return { ok: true };
  if (!isRecord(value)) return invalid(`${path} must be an object`);
  const publish = value as PublishSettings;
  if (!(publish.orgUnitId === null || isFiniteNumber(publish.orgUnitId))) {
    return invalid(`${path}.orgUnitId must be a number or null`);
  }
  for (const key of ["orgUnitCode", "baseHost", "folderPath"] as const) {
    if (!isString(publish[key])) return invalid(`${path}.${key} must be a string`);
  }
  return { ok: true };
}

export function validateCourseDraft(value: unknown): ValidationResult {
  if (!isRecord(value)) return invalid("draft must be an object");

  for (const key of [
    "id",
    "createdAt",
    "updatedAt",
    "courseId",
    "courseTitle",
    "courseSubtitle",
    "courseBlurb",
    "courseArea",
    "homeLinkUrl",
  ] as const) {
    if (!isString(value[key])) return invalid(`${key} must be a string`);
  }
  if (!isOneOf(value.topic, TOPIC_FAMILIES)) return invalid("topic is not supported");
  if (!isOneOf(value.chromeMode, ["bar", "rail"] as const)) {
    return invalid("chromeMode must be bar or rail");
  }

  const publishResult = validatePublish(value.publish, "publish");
  if (!publishResult.ok) return publishResult;

  if (!Array.isArray(value.modules)) return invalid("modules must be an array");
  for (const [moduleIndex, module] of value.modules.entries()) {
    const modulePath = `modules[${moduleIndex}]`;
    if (!isRecord(module)) return invalid(`${modulePath} must be an object`);
    for (const key of ["id", "title", "description"] as const) {
      if (!isString(module[key])) return invalid(`${modulePath}.${key} must be a string`);
    }
    if (!Array.isArray(module.topics)) return invalid(`${modulePath}.topics must be an array`);
    for (const [topicIndex, topic] of module.topics.entries()) {
      const topicPath = `${modulePath}.topics[${topicIndex}]`;
      if (!isRecord(topic)) return invalid(`${topicPath} must be an object`);
      for (const key of [
        "slug",
        "title",
        "description",
        "updated",
        "standfirst",
        "scenario",
        "rule",
        "ruleBoxLabel",
      ] as const) {
        if (!isString(topic[key])) return invalid(`${topicPath}.${key} must be a string`);
      }
      if (!isOneOf(topic.kind, TOPIC_KINDS)) return invalid(`${topicPath}.kind is not supported`);
      if (!isFiniteNumber(topic.minutes)) return invalid(`${topicPath}.minutes must be a number`);
      if (!isOneOf(topic.updated, UPDATED_FLAGS)) {
        return invalid(`${topicPath}.updated is not supported`);
      }
      if (!isStringArray(topic.ruleBoxItems)) {
        return invalid(`${topicPath}.ruleBoxItems must be a string array`);
      }
      const mediaResult = validateMedia(topic.media, `${topicPath}.media`);
      if (!mediaResult.ok) return mediaResult;
      const changedResult = validateWhatChanged(topic.whatChanged, `${topicPath}.whatChanged`);
      if (!changedResult.ok) return changedResult;
      const tryItResult = validateTryIt(topic.tryIt, `${topicPath}.tryIt`);
      if (!tryItResult.ok) return tryItResult;
      if (!isStringArray(topic.remember)) {
        return invalid(`${topicPath}.remember must be a string array`);
      }
      const blocksResult = validateBlocks(topic.blocks, `${topicPath}.blocks`);
      if (!blocksResult.ok) return blocksResult;
    }
  }

  return { ok: true, draft: value as CourseDraft };
}
