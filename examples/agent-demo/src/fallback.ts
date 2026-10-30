// A language model that moves to the next model in a list when the current one is out of quota.
// Free-tier quotas are per model, so a short list keeps a demo running all day. Each call carries
// the full conversation, so switching between steps loses nothing.

type Model = {
  specificationVersion: string;
  provider: string;
  modelId: string;
  supportedUrls: unknown;
  doGenerate(options: unknown): PromiseLike<unknown>;
  doStream(options: unknown): PromiseLike<unknown>;
};

const isQuotaError = (e: unknown) => {
  const err = e as { statusCode?: number; message?: string; responseBody?: string };
  return err?.statusCode === 429 || /RESOURCE_EXHAUSTED|quota/i.test(`${err?.message ?? ""} ${err?.responseBody ?? ""}`);
};

export function withQuotaFallback<M>(models: M[], onSwitch?: (from: string, to: string) => void): M {
  const list = models as unknown as Model[];
  if (list.length === 0) throw new Error("No models given");
  let current = 0;
  const call = async (method: "doGenerate" | "doStream", options: unknown) => {
    for (;;) {
      try {
        return await list[current]![method](options);
      } catch (e) {
        if (!isQuotaError(e) || current >= list.length - 1) throw e;
        onSwitch?.(list[current]!.modelId, list[current + 1]!.modelId);
        current++;
      }
    }
  };
  const model: Model = {
    specificationVersion: list[0]!.specificationVersion,
    provider: list[0]!.provider,
    get modelId() {
      return list[current]!.modelId;
    },
    get supportedUrls() {
      return list[current]!.supportedUrls;
    },
    doGenerate: (options) => call("doGenerate", options),
    doStream: (options) => call("doStream", options),
  };
  return model as unknown as M;
}
