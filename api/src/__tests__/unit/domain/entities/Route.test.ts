import { describe, it, expect } from 'vitest';
import { Route } from '@/domain/entities/Route';

describe('Route', () => {
  describe('create', () => {
    it('正常な値でRouteを生成できる', () => {
      const route = Route.create('ROUTE_01', '1系統', '三島駅');

      expect(route.routeId).toBe('ROUTE_01');
      expect(route.shortName).toBe('1系統');
      expect(route.destinationStop).toBe('三島駅');
    });

    it('destinationStopが未指定の場合はundefinedになる', () => {
      const route = Route.create('ROUTE_01', '1系統');

      expect(route.routeId).toBe('ROUTE_01');
      expect(route.shortName).toBe('1系統');
      expect(route.destinationStop).toBeUndefined();
    });

    it('routeIdが空文字列の場合はエラーをスローする', () => {
      expect(() => Route.create('', '1系統')).toThrow('Route ID cannot be empty');
    });

    it('routeIdが空白のみの場合はエラーをスローする', () => {
      expect(() => Route.create('   ', '1系統')).toThrow('Route ID cannot be empty');
    });

    it('shortNameが空文字列の場合はエラーをスローする', () => {
      expect(() => Route.create('ROUTE_01', '')).toThrow('Route short name cannot be empty');
    });

    it('shortNameが空白のみの場合はエラーをスローする', () => {
      expect(() => Route.create('ROUTE_01', '   ')).toThrow('Route short name cannot be empty');
    });

    it('routeIdとshortNameの前後の空白はトリムされる', () => {
      const route = Route.create('  ROUTE_01  ', '  1系統  ', '  三島駅  ');

      expect(route.routeId).toBe('ROUTE_01');
      expect(route.shortName).toBe('1系統');
      expect(route.destinationStop).toBe('三島駅');
    });

    it('destinationStopが空文字列の場合はundefinedになる', () => {
      const route = Route.create('ROUTE_01', '1系統', '');

      expect(route.destinationStop).toBeUndefined();
    });

    it('destinationStopが空白のみの場合はundefinedになる', () => {
      const route = Route.create('ROUTE_01', '1系統', '   ');

      expect(route.destinationStop).toBeUndefined();
    });
  });

  describe('equals', () => {
    it('同じrouteIdの路線はequalsでtrueを返す', () => {
      const route1 = Route.create('ROUTE_01', '1系統', '三島駅');
      const route2 = Route.create('ROUTE_01', '1系統（急行）', '沼津駅');

      expect(route1.equals(route2)).toBe(true);
    });

    it('異なるrouteIdの路線はequalsでfalseを返す', () => {
      const route1 = Route.create('ROUTE_01', '1系統');
      const route2 = Route.create('ROUTE_02', '1系統');

      expect(route1.equals(route2)).toBe(false);
    });
  });

  describe('getDisplayName', () => {
    it('destinationStopがある場合は「shortName（destination行き）」を返す', () => {
      const route = Route.create('ROUTE_01', '1系統', '三島駅');

      expect(route.getDisplayName()).toBe('1系統（三島駅行き）');
    });

    it('destinationStopがない場合はshortNameのみを返す', () => {
      const route = Route.create('ROUTE_01', '1系統');

      expect(route.getDisplayName()).toBe('1系統');
    });
  });
});
