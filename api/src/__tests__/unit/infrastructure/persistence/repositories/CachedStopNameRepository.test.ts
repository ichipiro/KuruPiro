import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  CachedStopNameRepository,
  clearStopNameMemoryCache,
} from '@/infrastructure/persistence/repositories/CachedStopNameRepository';
import { StopId } from '@/domain/value-objects/identifiers';
import type { IStopRepository } from '@/domain/repositories';

describe('CachedStopNameRepository', () => {
  let inner: IStopRepository;
  let repo: CachedStopNameRepository;

  beforeEach(() => {
    // モジュールレベルのメモリキャッシュはテストをまたいで残るため毎回クリア
    clearStopNameMemoryCache();

    inner = {
      findById: vi.fn(),
      findNameById: vi.fn().mockResolvedValue('大学前'),
      findNamesByIds: vi.fn().mockResolvedValue(
        new Map([
          ['stop_a', '停留所A'],
          ['stop_b', '停留所B'],
        ])
      ),
      findAll: vi.fn().mockResolvedValue([]),
    } as unknown as IStopRepository;

    repo = new CachedStopNameRepository(inner);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('findNamesByIds', () => {
    it('2回目の呼び出しではinnerに問い合わせない（メモリヒット）', async () => {
      const ids = [StopId.fromString('stop_a'), StopId.fromString('stop_b')];

      const first = await repo.findNamesByIds(ids);
      const second = await repo.findNamesByIds(ids);

      expect(inner.findNamesByIds).toHaveBeenCalledOnce();
      expect(second).toEqual(first);
      expect(second.get('stop_a')).toBe('停留所A');
      expect(second.get('stop_b')).toBe('停留所B');
    });

    it('一部だけキャッシュ済みの場合、未キャッシュ分のみinnerへ問い合わせる', async () => {
      await repo.findNamesByIds([StopId.fromString('stop_a')]);

      vi.mocked(inner.findNamesByIds).mockResolvedValue(
        new Map([['stop_c', '停留所C']])
      );

      const result = await repo.findNamesByIds([
        StopId.fromString('stop_a'),
        StopId.fromString('stop_c'),
      ]);

      expect(inner.findNamesByIds).toHaveBeenCalledTimes(2);
      const secondCallIds = vi.mocked(inner.findNamesByIds).mock.calls[1][0];
      expect(secondCallIds.map((id) => id.value)).toEqual(['stop_c']);
      expect(result.get('stop_a')).toBe('停留所A');
      expect(result.get('stop_c')).toBe('停留所C');
    });

    it('重複IDは1回に集約してinnerへ渡す', async () => {
      await repo.findNamesByIds([
        StopId.fromString('stop_a'),
        StopId.fromString('stop_a'),
      ]);

      const callIds = vi.mocked(inner.findNamesByIds).mock.calls[0][0];
      expect(callIds.map((id) => id.value)).toEqual(['stop_a']);
    });

    it('全件キャッシュ済みならinnerへ一切問い合わせない', async () => {
      await repo.findNamesByIds([StopId.fromString('stop_a')]);
      vi.mocked(inner.findNamesByIds).mockClear();

      const result = await repo.findNamesByIds([StopId.fromString('stop_a')]);

      expect(inner.findNamesByIds).not.toHaveBeenCalled();
      expect(result.get('stop_a')).toBe('停留所A');
    });

    it('TTL(1時間)を過ぎたエントリはinnerへ再問い合わせする', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-11-05T10:00:00+09:00'));

      await repo.findNamesByIds([StopId.fromString('stop_a')]);

      vi.setSystemTime(new Date('2026-11-05T11:00:01+09:00'));
      await repo.findNamesByIds([StopId.fromString('stop_a')]);

      expect(inner.findNamesByIds).toHaveBeenCalledTimes(2);
    });

    it('innerが返さなかったID（未知の停留所）はキャッシュせず結果にも含めない', async () => {
      vi.mocked(inner.findNamesByIds).mockResolvedValue(new Map());

      const result = await repo.findNamesByIds([StopId.fromString('unknown')]);
      expect(result.size).toBe(0);

      // 見つからなかったIDは次回も問い合わせる（取り込み完了後に引けるようになる）
      await repo.findNamesByIds([StopId.fromString('unknown')]);
      expect(inner.findNamesByIds).toHaveBeenCalledTimes(2);
    });

    it('innerの失敗時はキャッシュ済みの名前だけを返す（部分結果）', async () => {
      await repo.findNamesByIds([StopId.fromString('stop_a')]);
      vi.mocked(inner.findNamesByIds).mockRejectedValue(new Error('D1_ERROR'));

      const result = await repo.findNamesByIds([
        StopId.fromString('stop_a'),
        StopId.fromString('stop_new'),
      ]);

      // D1が落ちていても、キャッシュ済みのstop_aまで全滅させない
      expect(result.get('stop_a')).toBe('停留所A');
      expect(result.has('stop_new')).toBe(false);
    });

    it('全てミスでinnerが失敗した場合は空Mapを返す（throwしない）', async () => {
      vi.mocked(inner.findNamesByIds).mockRejectedValue(new Error('D1_ERROR'));

      const result = await repo.findNamesByIds([StopId.fromString('stop_x')]);
      expect(result.size).toBe(0);
    });
  });

  describe('findNameById', () => {
    it('2回目の呼び出しではメモリから返す', async () => {
      const id = StopId.fromString('stop_u');

      const first = await repo.findNameById(id);
      const second = await repo.findNameById(id);

      expect(first).toBe('大学前');
      expect(second).toBe('大学前');
      expect(inner.findNameById).toHaveBeenCalledOnce();
    });

    it('findNamesByIdsで入ったキャッシュをfindNameByIdでも使う', async () => {
      await repo.findNamesByIds([StopId.fromString('stop_a')]);

      const name = await repo.findNameById(StopId.fromString('stop_a'));

      expect(name).toBe('停留所A');
      expect(inner.findNameById).not.toHaveBeenCalled();
    });

    it('空文字（見つからない）はキャッシュしない', async () => {
      vi.mocked(inner.findNameById).mockResolvedValue('');

      await repo.findNameById(StopId.fromString('missing'));
      await repo.findNameById(StopId.fromString('missing'));

      expect(inner.findNameById).toHaveBeenCalledTimes(2);
    });
  });

  describe('パススルー', () => {
    it('findById/findAllはキャッシュせずinnerへ委譲する', async () => {
      await repo.findById(StopId.fromString('stop_a'));
      await repo.findById(StopId.fromString('stop_a'));
      await repo.findAll();

      expect(inner.findById).toHaveBeenCalledTimes(2);
      expect(inner.findAll).toHaveBeenCalledOnce();
    });
  });
});
