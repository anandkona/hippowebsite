if (process.env.NODE_ENV === 'development') {
  const original = performance.measure.bind(performance);
  performance.measure = ((...args: Parameters<typeof original>) => {
    try {
      return original(...args);
    } catch (e) {
      if (e instanceof Error && e.message.includes('negative time stamp')) {
        return undefined as unknown as PerformanceMeasure;
      }
      throw e;
    }
  }) as typeof performance.measure;
}
