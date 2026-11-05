import { describe, it, expect } from 'vitest';
import type { Context } from 'hono';
import { parse } from '@/presentation/requests/BatchTripsBodyParser';
import { BadRequestError } from '@/presentation/errors';

function contextWithBody(body: unknown): Context {
  return {
    req: {
      json: async () => body,
    },
  } as unknown as Context;
}

describe('BatchTripsBodyParser', () => {
  it('正常なクエリ配列をパースする', async () => {
    const result = await parse(
      contextWithBody([
        { origin: '22030_2', destination: '51240_,10_', limit: 3 },
        { origin: '24140_1', destination: '51240_' },
      ])
    );

    expect(result).toHaveLength(2);
    expect(result[0].originId.value).toBe('22030_2');
    expect(result[0].destinationIds.map((id) => id.value)).toEqual(['51240_', '10_']);
    expect(result[0].limit).toBe(3);
    expect(result[1].limit).toBe(5);
  });

  it('空配列・非配列・不正JSONは400', async () => {
    await expect(parse(contextWithBody([]))).rejects.toThrow(BadRequestError);
    await expect(parse(contextWithBody({}))).rejects.toThrow(BadRequestError);
    await expect(
      parse({
        req: {
          json: async () => {
            throw new Error('bad json');
          },
        },
      } as unknown as Context)
    ).rejects.toThrow(BadRequestError);
  });

  it('クエリ数は10件まで、超過は400', async () => {
    const query = { origin: 'a', destination: 'b' };
    await expect(parse(contextWithBody(Array(10).fill(query)))).resolves.toHaveLength(10);
    await expect(parse(contextWithBody(Array(11).fill(query)))).rejects.toThrow(
      BadRequestError
    );
  });

  it('カンマ入りのoriginは黙って空を返さず400で知らせる', async () => {
    // GETと違いbatchのoriginは単一IDのみ。以前は「a,b」をそのまま1つのIDとして
    // D1照合して常に空配列になり、「運行なし」に見えていた
    await expect(
      parse(contextWithBody([{ origin: '204_11,204_12', destination: 'x' }]))
    ).rejects.toThrow(BadRequestError);
  });

  describe('limit', () => {
    it('数値以外・NaNはデフォルト5に落とす（「運行なし」誤表示の回帰テスト）', async () => {
      const cases: unknown[] = ['abc', Number.NaN, null, {}];
      for (const limit of cases) {
        const result = await parse(
          contextWithBody([{ origin: 'a', destination: 'b', limit }])
        );
        expect(result[0].limit).toBe(5);
      }
    });

    it('1〜20にクランプし、小数は切り捨てる', async () => {
      const parseLimit = async (limit: unknown) =>
        (await parse(contextWithBody([{ origin: 'a', destination: 'b', limit }])))[0].limit;
      expect(await parseLimit(0)).toBe(1);
      expect(await parseLimit(99)).toBe(20);
      expect(await parseLimit(7.9)).toBe(7);
    });
  });

  it('origin/destination/viaの型不正は400', async () => {
    await expect(
      parse(contextWithBody([{ origin: 42, destination: 'b' }]))
    ).rejects.toThrow(BadRequestError);
    await expect(
      parse(contextWithBody([{ origin: '', destination: 'b' }]))
    ).rejects.toThrow(BadRequestError);
    await expect(
      parse(contextWithBody([{ origin: 'a', destination: 123 }]))
    ).rejects.toThrow(BadRequestError);
    await expect(
      parse(contextWithBody([{ origin: 'a', destination: 'b', via: 9 }]))
    ).rejects.toThrow(BadRequestError);
  });

  it('フィルタ後に空になるdestination（","など）は400', async () => {
    await expect(
      parse(contextWithBody([{ origin: 'a', destination: ',' }]))
    ).rejects.toThrow(BadRequestError);
  });

  it('destinationは5件・viaは3件まで、超過は400', async () => {
    await expect(
      parse(contextWithBody([{ origin: 'a', destination: 'd1,d2,d3,d4,d5,d6' }]))
    ).rejects.toThrow(BadRequestError);
    await expect(
      parse(contextWithBody([{ origin: 'a', destination: 'b', via: 'v1,v2,v3,v4' }]))
    ).rejects.toThrow(BadRequestError);
  });
});
