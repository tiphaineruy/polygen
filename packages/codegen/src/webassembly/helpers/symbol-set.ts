export type AnySymbol<TKey> = { type: TKey; name: string };

export class SymbolSet<
  T extends AnySymbol<TKey>,
  TKey = T['type'],
> extends Set<T> {
  public readonly byName: Map<string, T> = new Map();
  public readonly byType: Map<TKey, Set<T>> = new Map();

  public add(value: T): this {
    if (!super.has(value)) {
      super.add(value);
      this.byName.set(value.name, value);
      this.appendToTypeCache(value.type, value);
    }
    return this;
  }

  public delete(value: T): boolean {
    const result = super.delete(value);
    this.byName.delete(value.name);
    this.removeFromTypeCache(value.type, value);
    return result;
  }

  public clear() {
    super.clear();
    this.byName.clear();
    this.byType.clear();
  }

  public getByName<TResult extends T = T>(name: string): TResult | undefined {
    return this.byName.get(name) as TResult;
  }

  public getByType<TResult extends T>(type: TKey): Set<TResult> {
    return (this.byType.get(type) as Set<TResult>) ?? new Set();
  }

  private appendToTypeCache(key: TKey, value: T) {
    let targetSet = this.byType.get(key);
    if (!targetSet) {
      targetSet = new Set<T>();
      this.byType.set(key, targetSet);
    }

    targetSet.add(value);
  }

  private removeFromTypeCache(key: TKey, value: T) {
    let targetSet = this.byType.get(key);
    if (!targetSet) {
      return;
    }

    targetSet.delete(value);
  }
}
