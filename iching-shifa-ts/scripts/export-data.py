#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
从 data.pkl 导出 TypeScript 数据文件（简体中文版）
"""

import os
import sys
import pickle
import json
import re
from pathlib import Path

# 繁简转换表（常用字）
T2S_MAP = str.maketrans({
    '乾': '乾', '坤': '坤', '離': '离', '兌': '兑', '艮': '艮', '巽': '巽', '坎': '坎', '震': '震',
    '卦': '卦', '爻': '爻', '辭': '辞', '彖': '彖', '變': '变', '動': '动', '靜': '静',
    '陰': '阴', '陽': '阳', '龍': '龙', '鳳': '凤', '飛': '飞', '見': '见', '無': '无',
    '氣': '气', '實': '实', '為': '为', '於': '于', '與': '与', '書': '书', '學': '学',
    '時': '时', '開': '开', '關': '关', '門': '门', '問': '问', '間': '间', '聞': '闻',
    '東': '东', '車': '车', '馬': '马', '長': '长', '張': '张', '來': '来', '個': '个',
    '這': '这', '還': '还', '進': '进', '過': '过', '達': '达', '運': '运', '遠': '远',
    '邊': '边', '連': '连', '選': '选', '適': '适', '對': '对', '導': '导', '將': '将',
    '專': '专', '層': '层', '廣': '广', '從': '从', '復': '复', '後': '后', '應': '应',
    '響': '响', '當': '当', '錄': '录', '歸': '归', '歲': '岁', '點': '点', '熱': '热',
    '無': '无', '狀': '状', '獨': '独', '獲': '获', '現': '现', '環': '环', '產': '产',
    '異': '异', '發': '发', '監': '监', '盡': '尽', '網': '网', '線': '线', '給': '给',
    '統': '统', '經': '经', '結': '结', '繼': '继', '續': '续', '維': '维', '總': '总',
    '義': '义', '習': '习', '處': '处', '號': '号', '親': '亲', '覺': '觉', '設': '设',
    '許': '许', '語': '语', '說': '说', '請': '请', '論': '论', '證': '证', '識': '识',
    '議': '议', '護': '护', '貝': '贝', '負': '负', '財': '财', '責': '责', '買': '买',
    '費': '费', '質': '质', '資': '资', '賢': '贤', '趙': '赵', '軍': '军', '載': '载',
    '輕': '轻', '輪': '轮', '輸': '输', '農': '农', '邊': '边', '鄉': '乡', '鄭': '郑',
    '錢': '钱', '錯': '错', '鋼': '钢', '鐵': '铁', '關': '关', '陳': '陈', '陸': '陆',
    '際': '际', '險': '险', '隨': '随', '難': '难', '電': '电', '霧': '雾', '靈': '灵',
    '頭': '头', '題': '题', '風': '风', '驗': '验', '體': '体', '麗': '丽', '黃': '黄',
    '齊': '齐', '齒': '齿', '濟': '济', '衛': '卫', '謙': '谦', '觀': '观', '損': '损',
    '節': '节', '萃': '萃', '臨': '临', '獸': '兽', '絕': '绝', '鎮': '镇', '歲': '岁',
    '華': '华', '國': '国', '園': '园', '圖': '图', '團': '团', '場': '场', '報': '报',
    '聲': '声', '壯': '壮', '夢': '梦', '頁': '页', '傳': '传', '億': '亿', '優': '优',
    '價': '价', '傷': '伤', '備': '备', '兒': '儿', '內': '内', '創': '创', '劃': '划',
    '動': '动', '務': '务', '區': '区', '協': '协', '縣': '县', '廳': '厅', '參': '参',
    '雙': '双', '縱': '纵', '橫': '横', '機': '机', '標': '标', '檔': '档', '權': '权',
    '歡': '欢', '決': '决', '準': '准', '減': '减', '測': '测', '滿': '满', '濃': '浓',
    '燈': '灯', '寶': '宝', '審': '审', '寫': '写', '實': '实', '緣': '缘', '纖': '纤',
    '織': '织', '納': '纳', '純': '纯', '練': '练', '編': '编', '詳': '详', '調': '调',
    '變': '变', '貢': '贡', '類': '类', '終': '终', '紅': '红', '約': '约', '紀': '纪',
    '錯': '错', '銀': '银', '針': '针', '銅': '铜', '鏡': '镜', '閃': '闪', '閉': '闭',
    '階': '阶', '雜': '杂', '雲': '云', '順': '顺', '須': '须', '館': '馆', '駐': '驻',
    '駛': '驶', '騎': '骑', '驚': '惊', '驗': '验', '驢': '驴', '魚': '鱼', '鮮': '鲜',
    '鳥': '鸟', '鳴': '鸣', '麥': '麦', '麵': '面', '鼓': '鼓', '鼠': '鼠', '齡': '龄',
    '勾': '勾', '騰': '腾', '訣': '诀', '滿': '满', '穀': '谷', '殺': '杀', '遊': '游',
    '僅': '仅', '傳': '传', '億': '亿', '係': '系', '則': '则', '劍': '剑', '勢': '势',
    '厲': '厉', '壽': '寿', '夠': '够', '奪': '夺', '婦': '妇', '嬰': '婴', '寧': '宁',
    '屬': '属', '幣': '币', '幹': '干', '廟': '庙', '廢': '废', '彈': '弹', '從': '从',
    '徑': '径', '態': '态', '憂': '忧', '慮': '虑', '戲': '戏', '據': '据', '擊': '击',
    '擔': '担', '擾': '扰', '攝': '摄', '曆': '历', '會': '会', '構': '构', '樓': '楼',
    '樣': '样', '橋': '桥', '歡': '欢', '殘': '残', '殺': '杀', '毀': '毁', '氳': '氲',
    '決': '决', '沖': '冲', '況': '况', '減': '减', '滅': '灭', '災': '灾', '無': '无',
    '煙': '烟', '態': '态', '獄': '狱', '獲': '获', '瑪': '玛', '環': '环', '璽': '玺',
    '疊': '叠', '癥': '症', '盜': '盗', '盤': '盘', '禪': '禅', '禮': '礼', '穌': '稣',
    '稅': '税', '競': '竞', '築': '筑', '簡': '简', '範': '范', '籌': '筹', '糧': '粮',
    '絲': '丝', '緒': '绪', '緣': '缘', '聯': '联', '聰': '聪', '職': '职', '臘': '腊',
    '臺': '台', '與': '与', '舊': '旧', '舉': '举', '蓋': '盖', '薦': '荐', '處': '处',
    '虛': '虚', '蝦': '虾', '補': '补', '裝': '装', '規': '规', '視': '视', '覽': '览',
    '討': '讨', '訓': '训', '記': '记', '訪': '访', '評': '评', '註': '注', '詞': '词',
    '詩': '诗', '誇': '夸', '認': '认', '誤': '误', '課': '课', '談': '谈', '調': '调',
    '謝': '谢', '證': '证', '譯': '译', '護': '护', '讀': '读', '變': '变', '讓': '让',
    '貓': '猫', '貨': '货', '販': '贩', '貴': '贵', '賣': '卖', '賽': '赛', '贊': '赞',
    '躍': '跃', '軌': '轨', '軟': '软', '較': '较', '輛': '辆', '輝': '辉', '輯': '辑',
    '辦': '办', '辯': '辩', '遷': '迁', '遼': '辽', '郵': '邮', '鏈': '链', '閱': '阅',
    '閣': '阁', '閥': '阀', '陽': '阳', '隊': '队', '隱': '隐', '雕': '雕', '雞': '鸡',
    '離': '离', '難': '难', '雜': '杂', '雲': '云', '電': '电', '霧': '雾', '露': '露',
    '靈': '灵', '頓': '顿', '頻': '频', '題': '题', '額': '额', '顧': '顾', '飄': '飘',
    '飲': '饮', '餃': '饺', '餐': '餐', '館': '馆', '駕': '驾', '騙': '骗', '體': '体',
    '鬆': '松', '魔': '魔', '鱉': '鳖', '鳳': '凤', '鴻': '鸿', '鷹': '鹰', '麵': '面',
    '黨': '党', '龜': '龟', '訟': '讼', '睽': '睽', '噬': '噬', '嗑': '嗑', '頤': '颐',
    '蠱': '蛊', '賁': '贲', '孫': '孙', '獵': '猎', '貞': '贞', '憾': '憾', '涕': '涕',
    '禦': '御', '戎': '戎', '蒞': '莅', '輔': '辅', '咥': '咥', '噬': '噬', '嗑': '嗑',
})

def t2s(text):
    """繁体转简体"""
    if not isinstance(text, str):
        return text
    return text.translate(T2S_MAP)

# 添加源码路径
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "src"))

DATA_PKL_PATH = Path(__file__).parent.parent.parent / "src" / "ichingshifa" / "data.pkl"
OUTPUT_DIR = Path(__file__).parent.parent / "src" / "data"

def load_pkl():
    """加载 data.pkl"""
    with open(DATA_PKL_PATH, "rb") as f:
        return pickle.load(f)

def convert_value(value):
    """递归转换值中的繁体为简体"""
    if isinstance(value, str):
        return t2s(value)
    elif isinstance(value, dict):
        return {t2s(k) if isinstance(k, str) else k: convert_value(v) for k, v in value.items()}
    elif isinstance(value, list):
        return [convert_value(v) for v in value]
    elif isinstance(value, tuple):
        return tuple(convert_value(v) for v in value)
    return value

def to_ts_const(name: str, value, export: bool = True) -> str:
    """将 Python 值转换为 TypeScript 常量（简体中文）"""
    prefix = "export " if export else ""
    converted = convert_value(value)
    json_str = json.dumps(converted, ensure_ascii=False, indent=2)
    return f"{prefix}const {name} = {json_str} as const;\n"

def export_jiazi(data: dict) -> str:
    """导出 jiazi.ts - 60甲子、天干地支"""
    tian_gan = data.get("干", [])
    di_zhi = data.get("支", [])
    wu_xing = data.get("五行", [])

    # 生成60甲子
    jiazi_60 = [tian_gan[i % 10] + di_zhi[i % 12] for i in range(60)]

    # 六甲旬空表
    xunkong = {
        '甲子': '戌亥', '甲戌': '申酉', '甲申': '午未',
        '甲午': '辰巳', '甲辰': '寅卯', '甲寅': '子丑',
    }

    # 甲子积分码（从 ichingshifa.py 中提取）
    jiazi_code = {
        '甲子':112,'乙丑':190,'丙寅':34,'丁卯':56,'戊辰':75,'己巳':91,
        '庚午':107,'辛未':217,'壬申':249,'癸酉':190,'甲戌':248,'乙亥':303,
        '丙子':35,'丁丑':61,'戊寅':107,'己卯':116,'庚辰':94,'辛巳':136,
        '壬午':112,'癸未':293,'甲申':228,'乙酉':177,'丙戌':135,'丁亥':122,
        '戊子':62,'己丑':49,'庚寅':129,'辛卯':120,'壬辰':202,'癸巳':91,
        '甲午':119,'乙未':177,'丙申':131,'丁酉':86,'戊戌':225,'己亥':169,
        '庚子':83,'辛丑':105,'壬寅':158,'癸卯':249,'甲辰':109,'乙巳':98,
        '丙午':57,'丁未':187,'戊申':222,'己酉':95,'庚戌':266,'辛亥':135,
        '壬子':105,'癸丑':183,'甲寅':137,'乙卯':228,'丙辰':98,'丁巳':83,
        '戊午':70,'己未':171,'庚申':99,'辛酉':101,'壬戌':249,'癸亥':296
    }

    content = '''// 60甲子、天干地支数据
// 自动生成，请勿手动修改

'''
    content += to_ts_const("TIAN_GAN", tian_gan)
    content += "\n"
    content += to_ts_const("DI_ZHI", di_zhi)
    content += "\n"
    content += to_ts_const("WU_XING", wu_xing)
    content += "\n"
    content += to_ts_const("JIAZI_60", jiazi_60)
    content += "\n"
    content += to_ts_const("LIUJIA_XUNKONG", xunkong)
    content += "\n"
    content += to_ts_const("JIAZI_CODE", jiazi_code)

    return content

def export_gua64(data: dict) -> str:
    """导出 gua64.ts - 64卦查找表"""
    bagua_number = data.get("八卦數值", {})
    gua64_list = data.get("六十四卦", [])
    yao_to_gua = data.get("數字排六十四卦", {})
    trigram_to_bagua = data.get("數字排八卦", {})
    bagua_xiang = data.get("八卦卦象", {})

    # 转换 trigram_to_bagua（tuple key -> string key）
    trigram_map = {}
    for key_tuple, value in trigram_to_bagua.items():
        key_str = "".join(str(x) for x in key_tuple)
        trigram_map[key_str] = value

    # 转换 yao_to_gua（展平 4096 种组合）
    yao_map = {}
    for key_tuple, value in yao_to_gua.items():
        for variant in key_tuple:
            key_str = "".join(str(x) for x in variant) if isinstance(variant, (list, tuple)) else str(variant)
            yao_map[key_str] = value

    # 反转 bagua_number {1:'777'} -> {'777': 1}
    bagua_code_to_num = {v: k for k, v in bagua_number.items()}

    content = '''// 64卦查找表
// 自动生成，请勿手动修改

'''
    content += to_ts_const("TRIGRAM_TO_BAGUA", trigram_map)
    content += "\n"
    content += to_ts_const("BAGUA_NUMBER_MAP", bagua_number)
    content += "\n"
    content += to_ts_const("BAGUA_CODE_TO_NUM", bagua_code_to_num)
    content += "\n"
    content += to_ts_const("BAGUA_XIANG", bagua_xiang)
    content += "\n"
    content += to_ts_const("GUA64_ORDER", gua64_list)
    content += "\n"
    content += f"// 6爻字符串 -> 卦名 ({len(yao_map)} 条)\n"
    content += to_ts_const("YAO_STRING_TO_GUA", yao_map)

    return content

def export_najia(data: dict) -> str:
    """导出 najia.ts - 纳甲数据"""
    lower = data.get("下卦數", [])
    upper = data.get("上卦數", [])
    bagua_list = data.get("八卦", [])  # ['乾','坎','坤','離','震','艮','巽','兌']

    # 转换为字典格式
    najia_lower = {}
    najia_upper = {}

    for i, gua_name in enumerate(bagua_list):
        if i < len(lower):
            najia_lower[gua_name] = lower[i]
        if i < len(upper):
            najia_upper[gua_name] = upper[i]

    content = '''// 纳甲数据（上下卦天干地支五行）
// 格式: [天干索引, 地支索引, 五行索引]
// 自动生成，请勿手动修改

'''
    content += to_ts_const("BAGUA_LIST", bagua_list)
    content += "\n"
    content += to_ts_const("NAJIA_LOWER", najia_lower)
    content += "\n"
    content += to_ts_const("NAJIA_UPPER", najia_upper)

    return content

def export_palace(data: dict) -> str:
    """导出 palace.ts - 八宫归属、世应"""
    bagong = data.get("八宮卦", {})
    bagong_wuxing = data.get("八宮卦五行", {})
    bagong_pure = data.get("八宮卦純卦", {})
    shiying = data.get("世應排法", [])
    shenYao = data.get("世身", {})

    # 转换 tuple keys
    gua_palace = {}
    gua_palace_level = {}
    for key_tuple, level in bagong.items():
        for gua_name in key_tuple:
            gua_palace_level[gua_name] = level

    # 确定每卦所属宫
    gua64_list = data.get("六十四卦", [])
    palace_names = ['乾', '震', '坎', '艮', '坤', '巽', '離', '兌']
    for i, gua_name in enumerate(gua64_list):
        palace_idx = i // 8
        if palace_idx < len(palace_names):
            gua_palace[gua_name] = palace_names[palace_idx]

    # 八宫五行
    palace_wuxing = {}
    for key_tuple, wuxing in bagong_wuxing.items():
        for gua_name in key_tuple:
            if gua_name in palace_names:
                palace_wuxing[gua_name] = wuxing
                break

    # 八宫纯卦代码
    palace_pure_code = {}
    for key_tuple, code in bagong_pure.items():
        for gua_name in key_tuple:
            if gua_name in palace_names:
                palace_pure_code[gua_name] = code
                break

    # 世应排法
    shiying_pattern = {
        '本宮': shiying[0] if len(shiying) > 0 else '',
        '一世': shiying[1] if len(shiying) > 1 else '',
        '二世': shiying[2] if len(shiying) > 2 else '',
        '三世': shiying[3] if len(shiying) > 3 else '',
        '四世': shiying[4] if len(shiying) > 4 else '',
        '五世': shiying[5] if len(shiying) > 5 else '',
        '遊魂': shiying[6] if len(shiying) > 6 else '',
        '歸魂': shiying[7] if len(shiying) > 7 else '',
    }

    # 身爻转换
    shen_yao_map = {}
    for key_tuple, idx in shenYao.items():
        for zhi in key_tuple:
            shen_yao_map[zhi] = idx

    content = '''// 八宫归属、世应排法、身爻
// 自动生成，请勿手动修改

'''
    content += to_ts_const("GUA_PALACE", gua_palace)
    content += "\n"
    content += to_ts_const("GUA_PALACE_LEVEL", gua_palace_level)
    content += "\n"
    content += to_ts_const("PALACE_WUXING", palace_wuxing)
    content += "\n"
    content += to_ts_const("PALACE_PURE_CODE", palace_pure_code)
    content += "\n"
    content += to_ts_const("SHIYING_PATTERN", shiying_pattern)
    content += "\n"
    content += to_ts_const("SHEN_YAO", shen_yao_map)

    return content

def export_descriptions(data: dict) -> str:
    """导出 descriptions.ts - 卦辞、爻辞、彖辞"""
    desc = data.get("易經卦爻詳解", {})

    content = '''// 卦辞、爻辞、彖辞
// 格式: { 卦名: { 0: 卦辞, 1-6: 爻辞, 7: 彖辞 } }
// 自动生成，请勿手动修改

'''
    content += to_ts_const("GUA_DESCRIPTIONS", desc)

    return content

def export_liuqin(data: dict) -> str:
    """导出 liuqin.ts - 六亲五行对应"""
    liuqin = data.get("六親", [])
    liuqin_wuxing = data.get("六親五行", {})

    # 转换 tuple keys
    liuqin_map = {}
    for key_tuple, qin in liuqin_wuxing.items():
        key_str = "".join(key_tuple)
        liuqin_map[key_str] = qin

    content = '''// 六亲五行对应关系
// key: 爻五行+宫五行（2字符），value: 六亲
// 自动生成，请勿手动修改

'''
    content += to_ts_const("LIU_QIN", liuqin)
    content += "\n"
    content += to_ts_const("LIUQIN_WUXING", liuqin_map)

    return content

def export_liushou(data: dict) -> str:
    """导出 liushou.ts - 六兽"""
    liushou = data.get("六獸", [])

    # 提取六兽名称（可能是 [idx, name] 格式）
    if liushou and isinstance(liushou[0], (list, tuple)):
        liushou = [item[1] for item in liushou]

    content = '''// 六兽
// 自动生成，请勿手动修改

'''
    content += to_ts_const("LIU_SHOU", liushou)

    # 六兽起始规则（从 ichingshifa.py 提取）
    liushou_start = {
        '甲': '青龍', '乙': '青龍',
        '丙': '朱雀', '丁': '朱雀',
        '戊': '勾陳',
        '己': '螣蛇',
        '庚': '白虎', '辛': '白虎',
        '壬': '玄武', '癸': '玄武',
    }
    content += "\n"
    content += to_ts_const("LIUSHOU_START", liushou_start)

    return content

def export_xingxiu(data: dict) -> str:
    """导出 xingxiu.ts - 二十八宿、月建、积算"""
    xingxiu = data.get("二十八宿", [])
    yuejian = data.get("月建", [])
    jisuan = data.get("積算", [])
    wuxing_stars = data.get("五星", [])
    gua64_list = data.get("六十四卦", [])

    # 转换月建和积算为字典
    yuejian_map = {}
    jisuan_map = {}
    for i, gua_name in enumerate(gua64_list):
        if i < len(yuejian):
            yuejian_map[gua_name] = yuejian[i]
        if i < len(jisuan):
            jisuan_map[gua_name] = jisuan[i]

    content = '''// 二十八宿、月建、积算
// 自动生成，请勿手动修改

'''
    content += to_ts_const("XINGXIU_28", xingxiu)
    content += "\n"
    content += to_ts_const("WU_XING_STARS", wuxing_stars)
    content += "\n"
    content += to_ts_const("GUA_YUEJIAN", yuejian_map)
    content += "\n"
    content += to_ts_const("GUA_JISUAN", jisuan_map)

    return content

def export_solar_terms() -> str:
    """导出 solarTerms.ts - 节气预计算表（简化版，从节气名称列表开始）"""
    jieqi_names = [
        '春分', '清明', '穀雨', '立夏', '小滿', '芒種',
        '夏至', '小暑', '大暑', '立秋', '處暑', '白露',
        '秋分', '寒露', '霜降', '立冬', '小雪', '大雪',
        '冬至', '小寒', '大寒', '立春', '雨水', '驚蟄'
    ]

    # 旺衰对应
    wangzhuai = ['旺', '相', '胎', '沒', '死', '囚', '休', '廢']
    wangzhuai_gua = ['震', '巽', '離', '坤', '兌', '乾', '坎', '艮']

    # 节气分组
    jieqi_groups = {
        '春分': ['春分', '清明', '穀雨'],
        '立夏': ['立夏', '小滿', '芒種'],
        '夏至': ['夏至', '小暑', '大暑'],
        '立秋': ['立秋', '處暑', '白露'],
        '秋分': ['秋分', '寒露', '霜降'],
        '立冬': ['立冬', '小雪', '大雪'],
        '冬至': ['冬至', '小寒', '大寒'],
        '立春': ['立春', '雨水', '驚蟄'],
    }

    content = '''// 节气数据
// 自动生成，请勿手动修改

'''
    content += to_ts_const("JIEQI_NAMES", jieqi_names)
    content += "\n"
    content += to_ts_const("WANGZHUAI", wangzhuai)
    content += "\n"
    content += to_ts_const("WANGZHUAI_GUA", wangzhuai_gua)
    content += "\n"
    content += to_ts_const("JIEQI_GROUPS", jieqi_groups)

    return content

def main():
    """主函数"""
    print(f"加载 {DATA_PKL_PATH}...")
    data = load_pkl()

    print(f"数据键: {list(data.keys())}")

    # 确保输出目录存在
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # 导出各个文件
    exports = [
        ("jiazi.ts", export_jiazi),
        ("gua64.ts", export_gua64),
        ("najia.ts", export_najia),
        ("palace.ts", export_palace),
        ("descriptions.ts", export_descriptions),
        ("liuqin.ts", export_liuqin),
        ("liushou.ts", export_liushou),
        ("xingxiu.ts", export_xingxiu),
        ("solarTerms.ts", lambda d: export_solar_terms()),
    ]

    for filename, export_fn in exports:
        print(f"导出 {filename}...")
        content = export_fn(data)
        output_path = OUTPUT_DIR / filename
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"  -> {output_path}")

    print("\n完成！")

if __name__ == "__main__":
    main()
