import { describe, it, expect } from 'vitest';
import type { Context } from 'hono';
import { parse } from '@/presentation/requests/GetTripsQueryParser';
import { BadRequestError } from '@/presentation/errors';

function contextWithQuery(query: Record<string, string | undefined>): Context {
  return {
    req: {
      query: (key: string) => query[key],
    },
  } as unknown as Context;
}

describe('GetTripsQueryParser', () => {
  it('originとdestinationをカンマ分割してパースする', () => {
    const result = parse(
      contextWithQuery({ origin: '22030_2,24140_1', destination: '51240_' })
    );

    expect(result.originIds.map((id) => id.value)).toEqual(['22030_2', '24140_1']);
    expect(result.destinationIds.map((id) => id.value)).toEqual(['51240_']);
    expect(result.limit).toBe(5);
  });

  it('originまたはdestinationがないと400', () => {
    expect(() => parse(contextWithQuery({ origin: 'a' }))).toThrow(BadRequestError);
    expect(() => parse(contextWithQuery({ destination: 'b' }))).toThrow(BadRequestError);
  });

  it('フィルタ後に空になる入力（origin=, など）は500でなく400', () => {
    // 以前は空配列が素通りして originIds[0] がundefinedになり500で落ちていた
    expect(() => parse(contextWithQuery({ origin: ',', destination: 'b' }))).toThrow(
      BadRequestError
    );
    expect(() => parse(contextWithQuery({ origin: 'a', destination: ' , ' }))).toThrow(
      BadRequestError
    );
  });

  describe('limit', () => {
    it('1〜20にクランプする', () => {
      const base = { origin: 'a', destination: 'b' };
      expect(parse(contextWithQuery({ ...base, limit: '0' })).limit).toBe(1);
      expect(parse(contextWithQuery({ ...base, limit: '99' })).limit).toBe(20);
      expect(parse(contextWithQuery({ ...base, limit: '10' })).limit).toBe(10);
    });

    it('数値でない値はNaNを素通しせずデフォルト5に落とす（「運行なし」誤表示の回帰テスト）', () => {
      const base = { origin: 'a', destination: 'b' };
      expect(parse(contextWithQuery({ ...base, limit: 'abc' })).limit).toBe(5);
      expect(parse(contextWithQuery({ ...base, limit: '' })).limit).toBe(5);
    });
  });

  describe('個数上限', () => {
    it('origin/destinationは5件まで、超過は400', () => {
      const five = 'a,b,c,d,e';
      const six = 'a,b,c,d,e,f';
      expect(() =>
        parse(contextWithQuery({ origin: five, destination: 'x' }))
      ).not.toThrow();
      expect(() =>
        parse(contextWithQuery({ origin: six, destination: 'x' }))
      ).toThrow(BadRequestError);
      expect(() =>
        parse(contextWithQuery({ origin: 'x', destination: six }))
      ).toThrow(BadRequestError);
    });

    it('viaは3件まで、超過は400', () => {
      const base = { origin: 'a', destination: 'b' };
      expect(() =>
        parse(contextWithQuery({ ...base, via: 'v1,v2,v3' }))
      ).not.toThrow();
      expect(() =>
        parse(contextWithQuery({ ...base, via: 'v1,v2,v3,v4' }))
      ).toThrow(BadRequestError);
    });
  });
});
