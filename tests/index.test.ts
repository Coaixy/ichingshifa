import { describe, test, expect } from 'bun:test';
import {
  dayan,
  lueshifa,
  manualQiGua,
  decodePan,
  getGuaName,
  getZhiGua,
  getHuGua,
  countMovingYao,
  getNaYin,
} from '../src/index';
import { buildShenShaMap } from '../src/core/shensha';

describe('起卦', () => {
  test('大衍筮法返回6位爻字符串', () => {
    const yao = dayan();
    expect(yao).toHaveLength(6);
    expect(yao).toMatch(/^[6789]{6}$/);
  });

  test('手动输入校验', () => {
    expect(manualQiGua('777777')).toBe('777777');
    expect(manualQiGua('678987')).toBe('678987');
    expect(() => manualQiGua('12345')).toThrow();
    expect(() => manualQiGua('777777a')).toThrow();
  });
});

describe('略筮法', () => {
  test('返回6位爻字符串', () => {
    const yao = lueshifa();
    expect(yao).toHaveLength(6);
    expect(yao).toMatch(/^[6789]{6}$/);
  });

  test('恰好包含一个动爻', () => {
    const yao = lueshifa();
    expect(countMovingYao(yao)).toBe(1);
  });

  test('多次调用结果不全相同', () => {
    const results = new Set(Array.from({ length: 20 }, () => lueshifa()));
    expect(results.size).toBeGreaterThan(1);
  });
});

describe('卦名查找', () => {
  test('64卦基本查找', () => {
    expect(getGuaName('777777')).toBe('乾');
    expect(getGuaName('888888')).toBe('坤');
    expect(getGuaName('787878')).toBe('既济');
    expect(getGuaName('878787')).toBe('未济');
  });

  test('含动爻的卦名查找', () => {
    expect(getGuaName('777779')).toBe('乾');
    expect(getGuaName('688888')).toBe('坤');
  });
});

describe('变卦计算', () => {
  test('之卦（老阳变少阴，老阴变少阳）', () => {
    expect(getZhiGua('777779')).toBe('777778');
    expect(getZhiGua('688888')).toBe('788888');
    expect(getZhiGua('696969')).toBe('787878');
  });

  test('互卦（取2-4爻为下，3-5爻为上）', () => {
    expect(getHuGua('777777')).toBe('777777');
    expect(getHuGua('888888')).toBe('888888');
  });
});

describe('动爻统计', () => {
  test('统计动爻数量', () => {
    expect(countMovingYao('777777')).toBe(0);
    expect(countMovingYao('777779')).toBe(1);
    expect(countMovingYao('696969')).toBe(6);
    expect(countMovingYao('978879')).toBe(2);
  });
});

describe('纳音', () => {
  test('60甲子纳音查询', () => {
    expect(getNaYin('甲子')).toBe('海中金');
    expect(getNaYin('己卯')).toBe('城头土');
    expect(getNaYin('癸亥')).toBe('大海水');
  });
});

describe('完整排盘', () => {
  const result = decodePan('787878', {
    year: 2024,
    month: 4,
    day: 15,
    hour: 14,
  });

  test('基本信息', () => {
    expect(result.benGua.guaName).toBe('既济');
    expect(result.zhiGua.guaName).toBe('既济');
    expect(result.huGua.guaName).toBe('未济');
    expect(result.dongYaoCount).toBe(0);
  });

  test('四柱干支', () => {
    expect(result.ganZhiYear.gz).toBe('甲辰');
    expect(result.ganZhiDay.gz).toBe('己酉');
  });

  test('六爻数据完整', () => {
    expect(result.benGua.yaoList).toHaveLength(6);
    result.benGua.yaoList.forEach((yao, i) => {
      expect(yao.position).toBe(i + 1);
      expect(yao.naJia).toHaveLength(2);
      expect(yao.naYin).toBeTruthy();
      expect(['金', '木', '水', '火', '土']).toContain(yao.wuXing);
      expect(['父母', '兄弟', '官鬼', '妻财', '子孙']).toContain(yao.liuQin);
      expect(['青龙', '朱雀', '勾陈', '腾蛇', '白虎', '玄武']).toContain(yao.liuShou);
    });
    expect(result.benGua.yaoList.every(yao => Boolean(yao.suiXian))).toBe(true);
    expect(result.zhiGua.yaoList.every(yao => Boolean(yao.suiXian))).toBe(true);
    expect(result.huGua.yaoList.every(yao => !('suiXian' in yao))).toBe(true);
  });

  test('本卦和之卦六爻带纳音，互卦不带纳音', () => {
    expect(result.benGua.yaoList[0].naJia).toBe('己卯');
    expect('tianGan' in result.benGua.yaoList[0]).toBe(false);
    expect('diZhi' in result.benGua.yaoList[0]).toBe(false);
    expect(result.benGua.yaoList[0].naYin).toBe('城头土');
    expect(result.zhiGua.yaoList.every(yao => Boolean(yao.naYin))).toBe(true);
    expect(result.huGua.yaoList.every(yao => !('naYin' in yao))).toBe(true);
  });

  test('卦辞存在', () => {
    expect(result.benGua.guaCi).toBeTruthy();
    expect(result.benGua.yaoCi).toHaveLength(6);
    expect(result.benGua.tuanCi).toBeTruthy();
  });

  test('岁限按本卦世应起限并接续到变卦', () => {
    expect(result.benGua.yaoList[2].suiXian).toEqual({
      startAge: 10,
      endAge: 14,
    });
    expect(result.benGua.yaoList[5].suiXian).toEqual({
      startAge: 25,
      endAge: 29,
    });
    expect(result.zhiGua.yaoList[2].suiXian).toEqual({
      startAge: 40,
      endAge: 44,
    });
    expect(result.zhiGua.yaoList[3].suiXian).toEqual({
      startAge: 65,
      endAge: 69,
    });
  });

  test('伏神和旁伏神分别完整排入六爻', () => {
    const fuShen = result.benGua.fuShen || [];
    const pangFuShen = result.benGua.pangFuShen || [];

    expect(fuShen).toHaveLength(6);
    fuShen.forEach((item, index) => {
      expect(item.hostPosition).toBe(index + 1);
      expect(item.fuNaYin).toBeTruthy();
    });
    expect(fuShen[0].fuNaJia).toBe('戊寅');
    expect(fuShen[0].fuNaYin).toBe('城头土');

    expect(pangFuShen).toHaveLength(6);
    pangFuShen.forEach((item, index) => {
      expect(item.hostPosition).toBe(index + 1);
      expect(item.fuNaYin).toBeTruthy();
    });
    expect(pangFuShen[0].fuNaJia).toBe('己卯');
    expect(pangFuShen[0].fuNaYin).toBe('城头土');
    expect(pangFuShen[0].fuLiuQin).toBe('父母');

    expect(result.zhiGua.fuShen).toBeUndefined();
    expect(result.huGua.fuShen).toBeUndefined();
    expect(result.zhiGua.pangFuShen).toBeUndefined();
    expect(result.huGua.pangFuShen).toBeUndefined();
  });
});

describe('神煞', () => {
  test('按规则生成独立 map', () => {
    const shenSha = buildShenShaMap('甲', '申', '寅');

    expect(Object.keys(shenSha)).toEqual([
      '驿马',
      '桃花',
      '华盖',
      '天医',
      '天喜',
      '天马',
      '天乙贵人',
      '禄神',
      '文昌',
    ]);
    expect(shenSha.驿马).toEqual(['寅']);
    expect(shenSha.天医).toEqual(['丑']);
    expect(shenSha.天喜).toEqual(['戌']);
    expect(shenSha.天马).toEqual(['午']);
    expect(shenSha.天乙贵人).toEqual(['丑', '未']);
    expect(shenSha.禄神).toEqual(['寅']);
    expect(shenSha.文昌).toEqual(['巳']);
  });
});

describe('岁限', () => {
  test('逆排时进入变卦后仍沿用本卦世干方向', () => {
    const result = decodePan('666666', {
      year: 2024,
      month: 4,
      day: 15,
      hour: 14,
    });

    expect(result.benGua.yaoList.map(yao => yao.suiXian)).toEqual([
      { startAge: 29, endAge: 33 },
      { startAge: 24, endAge: 28 },
      { startAge: 19, endAge: 23 },
      { startAge: 14, endAge: 18 },
      { startAge: 9, endAge: 13 },
      { startAge: 4, endAge: 8 },
    ]);
    expect(result.zhiGua.yaoList.map(yao => yao.suiXian)).toEqual([
      { startAge: 59, endAge: 63 },
      { startAge: 54, endAge: 58 },
      { startAge: 49, endAge: 53 },
      { startAge: 44, endAge: 48 },
      { startAge: 39, endAge: 43 },
      { startAge: 34, endAge: 38 },
    ]);
  });
});

describe('JSON输出样例', () => {
  test('完整JSON结构', () => {
    const result = decodePan('787978', {
      year: 2024,
      month: 4,
      day: 15,
      hour: 14,
      minute: 30,
    });

    console.log('\n=== 完整排盘 JSON 输出 ===\n');
    console.log(JSON.stringify(result, null, 2));

    expect(result).toHaveProperty('queryTime');
    expect(result).toHaveProperty('ganZhiYear');
    expect(result).toHaveProperty('benGua');
    expect(result).toHaveProperty('zhiGua');
    expect(result).toHaveProperty('huGua');
    expect(result).toHaveProperty('shenSha');
    expect(result.benGua.yaoList[0]).toHaveProperty('suiXian');
    expect(result.zhiGua.yaoList[0]).toHaveProperty('suiXian');
    expect(Object.keys(result.shenSha)).toHaveLength(9);
    expect(result).toHaveProperty('explanation');
  });
});
