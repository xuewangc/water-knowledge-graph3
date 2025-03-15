/**
 * 统一解析各种时间格式并返回标准化的时间信息
 * @param {Object} node - 数据节点
 * @returns {Object} 包含开始年份、结束年份和朝代的标准化时间信息
 */
export function normalizeTimeInfo(node) {
    // 初始化结果对象
    const result = {
        startYear: null,
        endYear: null,
        dynasty: null
    };

    // 定义朝代映射表
    const dynastyMap = {
        '春秋': { start: -770, end: -476 },
        '战国': { start: -475, end: -221 },
        '秦': { start: -221, end: -207 },
        '秦朝': { start: -221, end: -207 },
        '汉': { start: -202, end: 220 },
        '西汉': { start: -202, end: 8 },
        '东汉': { start: 25, end: 220 },
        '三国': { start: 220, end: 280 },
        '西晋': { start: 265, end: 316 },
        '东晋': { start: 317, end: 420 },
        '南北朝': { start: 420, end: 589 },
        '隋': { start: 581, end: 618 },
        'Sui': { start: 581, end: 618 },
        '隋朝': { start: 581, end: 618 },
        '唐': { start: 618, end: 907 },
        '唐朝': { start: 618, end: 907 },
        '五代十国': { start: 907, end: 960 },
        '宋': { start: 960, end: 1279 },
        'Song': { start: 960, end: 1279 },
        '北宋': { start: 960, end: 1127 },
        '南宋': { start: 1127, end: 1279 },
        '元': { start: 1271, end: 1368 },
        '元朝': { start: 1271, end: 1368 },
        '明': { start: 1368, end: 1644 },
        '明朝': { start: 1368, end: 1644 },
        '明代': { start: 1368, end: 1644 },
        '清': { start: 1644, end: 1911 },
        '清朝': { start: 1644, end: 1911 },
        '清代': { start: 1644, end: 1911 },
        '清时期': { start: 1644, end: 1911 },
        '商': { start: -1600, end: -1046 },
        '商朝': { start: -1600, end: -1046 },
        '商王朝': { start: -1600, end: -1046 }
    };

    // 年号到年份的映射（包含年号的起止年份）
    const reignMap = {
        // 清朝年号
        '康熙': { start: 1662, end: 1722, dynasty: '清' },
        '雍正': { start: 1723, end: 1735, dynasty: '清' },
        '乾隆': { start: 1736, end: 1795, dynasty: '清' },
        '嘉庆': { start: 1796, end: 1820, dynasty: '清' },
        '道光': { start: 1821, end: 1850, dynasty: '清' },
        '咸丰': { start: 1851, end: 1861, dynasty: '清' },
        '同治': { start: 1862, end: 1874, dynasty: '清' },
        '光绪': { start: 1875, end: 1908, dynasty: '清' },
        '宣统': { start: 1909, end: 1911, dynasty: '清' },

        // 明朝年号
        '洪武': { start: 1368, end: 1398, dynasty: '明' },
        '建文': { start: 1399, end: 1402, dynasty: '明' },
        '永乐': { start: 1403, end: 1424, dynasty: '明' },
        '洪熙': { start: 1425, end: 1425, dynasty: '明' },
        '宣德': { start: 1426, end: 1435, dynasty: '明' },
        '正统': { start: 1436, end: 1449, dynasty: '明' },
        '景泰': { start: 1450, end: 1456, dynasty: '明' },
        '天顺': { start: 1457, end: 1464, dynasty: '明' },
        '成化': { start: 1465, end: 1487, dynasty: '明' },
        '弘治': { start: 1488, end: 1505, dynasty: '明' },
        '正德': { start: 1506, end: 1521, dynasty: '明' },
        '嘉靖': { start: 1522, end: 1566, dynasty: '明' },
        '隆庆': { start: 1567, end: 1572, dynasty: '明' },
        '万历': { start: 1573, end: 1620, dynasty: '明' },
        '泰昌': { start: 1620, end: 1620, dynasty: '明' },
        '天启': { start: 1621, end: 1627, dynasty: '明' },
        '崇祯': { start: 1628, end: 1644, dynasty: '明' },

        // 元朝年号
        '元统': { start: 1333, end: 1333, dynasty: '元' },
        '至元': { start: 1335, end: 1340, dynasty: '元' },
        '至正': { start: 1341, end: 1368, dynasty: '元' },

        // 宋朝年号
        '元丰': { start: 1078, end: 1085, dynasty: '北宋' },
        '绍圣': { start: 1094, end: 1097, dynasty: '北宋' },
        '元祐': { start: 1086, end: 1093, dynasty: '北宋' },
        '建炎': { start: 1127, end: 1130, dynasty: '南宋' },
        '绍兴': { start: 1131, end: 1162, dynasty: '南宋' },
        '隆兴': { start: 1163, end: 1164, dynasty: '南宋' },
        '乾道': { start: 1165, end: 1173, dynasty: '南宋' },
        '淳熙': { start: 1174, end: 1189, dynasty: '南宋' },
        '庆元': { start: 1195, end: 1200, dynasty: '南宋' }
    };

    // 处理正则表达式匹配
    const yearRangeRegex = /(\d+)\s*[-—－到至]\s*(\d+)/;
    const yearParenthesisRegex = /\((\d+)\s*[-—－]\s*(\d+)\)/;
    const singleYearRegex = /(\d+)\s*年/;
    const reignYearRegex = /([康熙|雍正|乾隆|嘉庆|道光|咸丰|同治|光绪|宣统|洪武|建文|永乐|洪熙|宣德|正统|景泰|天顺|成化|弘治|正德|嘉靖|隆庆|万历|泰昌|天启|崇祯|元统|至元|至正|元丰|绍圣|元祐|建炎|绍兴|隆兴|乾道|淳熙|庆元]+)([一二三四五六七八九十百零]+|[\d]+)年/;

    // 处理中文数字转阿拉伯数字
    const convertChineseToNumber = (chineseNum) => {
        const chineseNumerals = {
            '零': 0, '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9,
            '十': 10, '百': 100
        };

        if (/^\d+$/.test(chineseNum)) {
            return parseInt(chineseNum, 10);
        }

        let total = 0;
        let temp = 0;
        let prev = 0;

        for (let i = 0; i < chineseNum.length; i++) {
            const char = chineseNum[i];
            const currentNum = chineseNumerals[char];

            if (char === '十' && i === 0) {
                temp = 10;
            } else if (char === '十') {
                temp = prev * 10;
            } else if (char === '百') {
                temp = prev * 100;
            } else {
                temp = currentNum;
                prev = currentNum;
                continue;
            }

            total += temp;
            prev = 0;
        }

        if (prev > 0) {
            total += prev;
        }

        return total;
    };

    // 首先检查标签中的年号信息
    if (node.label) {
        const reignYearMatch = reignYearRegex.exec(node.label);
        if (reignYearMatch) {
            const reign = reignYearMatch[1];
            const yearInReign = convertChineseToNumber(reignYearMatch[2]);

            if (reignMap[reign]) {
                const reignStart = reignMap[reign].start;
                // 计算具体年份：年号开始年份 + 年号内年份 - 1
                const specificYear = reignStart + yearInReign - 1;
                result.startYear = specificYear;
                result.endYear = specificYear;
                result.dynasty = reignMap[reign].dynasty;
                return result;
            }
        }
    }

    // 处理year字段
    if (node.year) {
        // 检查年号格式
        const reignYearMatch = reignYearRegex.exec(node.year);
        if (reignYearMatch) {
            const reign = reignYearMatch[1];
            const yearInReign = convertChineseToNumber(reignYearMatch[2]);

            if (reignMap[reign]) {
                const reignStart = reignMap[reign].start;
                const specificYear = reignStart + yearInReign - 1;
                result.startYear = specificYear;
                result.endYear = specificYear;
                result.dynasty = reignMap[reign].dynasty;
                return result;
            }
        }

        // 尝试解析年份范围
        const rangeMatch = yearRangeRegex.exec(node.year);
        if (rangeMatch) {
            result.startYear = parseInt(rangeMatch[1]);
            result.endYear = parseInt(rangeMatch[2]);
            return result;
        }

        // 尝试解析单一年份
        if (!isNaN(parseInt(node.year))) {
            result.startYear = parseInt(node.year);
            result.endYear = result.startYear;
            return result;
        }

        // 如果year字段包含朝代信息
        for (const [dynasty, period] of Object.entries(dynastyMap)) {
            if (node.year.includes(dynasty)) {
                result.dynasty = dynasty;
                result.startYear = period.start;
                result.endYear = period.end;

                // 尝试从更详细的描述中提取具体年份
                const parenthesisMatch = yearParenthesisRegex.exec(node.year);
                if (parenthesisMatch) {
                    result.startYear = parseInt(parenthesisMatch[1]);
                    result.endYear = parseInt(parenthesisMatch[2]);
                }

                const singleYearMatch = singleYearRegex.exec(node.year);
                if (singleYearMatch) {
                    result.startYear = parseInt(singleYearMatch[1]);
                    result.endYear = result.startYear;
                }

                return result;
            }
        }
    }

    // 处理period字段
    if (node.period) {
        // 检查年号格式
        const reignYearMatch = reignYearRegex.exec(node.period);
        if (reignYearMatch) {
            const reign = reignYearMatch[1];
            const yearInReign = convertChineseToNumber(reignYearMatch[2]);

            if (reignMap[reign]) {
                const reignStart = reignMap[reign].start;
                const specificYear = reignStart + yearInReign - 1;
                result.startYear = specificYear;
                result.endYear = specificYear;
                result.dynasty = reignMap[reign].dynasty;
                return result;
            }
        }

        // 直接匹配朝代
        for (const [dynasty, period] of Object.entries(dynastyMap)) {
            if (node.period.includes(dynasty)) {
                result.dynasty = dynasty;
                result.startYear = period.start;
                result.endYear = period.end;

                // 尝试从更详细的描述中提取具体年份
                const parenthesisMatch = yearParenthesisRegex.exec(node.period);
                if (parenthesisMatch) {
                    result.startYear = parseInt(parenthesisMatch[1]);
                    result.endYear = parseInt(parenthesisMatch[2]);
                }

                return result;
            }
        }

        // 尝试解析年份范围
        const rangeMatch = yearRangeRegex.exec(node.period);
        if (rangeMatch) {
            result.startYear = parseInt(rangeMatch[1]);
            result.endYear = parseInt(rangeMatch[2]);
            return result;
        }
    }

    // 处理dynasty字段
    if (node.dynasty) {
        const dynastyKey = node.dynasty;
        if (dynastyMap[dynastyKey]) {
            result.dynasty = dynastyKey;
            result.startYear = dynastyMap[dynastyKey].start;
            result.endYear = dynastyMap[dynastyKey].end;
            return result;
        }
    }

    // 检查label字段中的其他时间信息
    if (node.label) {
        // 尝试从标签中提取朝代信息
        for (const [dynasty, period] of Object.entries(dynastyMap)) {
            if (node.label.includes(dynasty)) {
                result.dynasty = dynasty;
                result.startYear = period.start;
                result.endYear = period.end;

                // 如果找到朝代，尝试进一步查找年份
                const parenthesisMatch = yearParenthesisRegex.exec(node.label);
                if (parenthesisMatch) {
                    result.startYear = parseInt(parenthesisMatch[1]);
                    result.endYear = parseInt(parenthesisMatch[2]);
                }

                const singleYearMatch = singleYearRegex.exec(node.label);
                if (singleYearMatch) {
                    result.startYear = parseInt(singleYearMatch[1]);
                    result.endYear = result.startYear;
                }

                return result;
            }
        }

        // 尝试从标签中提取年份
        const singleYearMatch = singleYearRegex.exec(node.label);
        if (singleYearMatch) {
            result.startYear = parseInt(singleYearMatch[1]);
            result.endYear = result.startYear;
            return result;
        }

        const rangeMatch = yearRangeRegex.exec(node.label);
        if (rangeMatch) {
            result.startYear = parseInt(rangeMatch[1]);
            result.endYear = parseInt(rangeMatch[2]);
            return result;
        }
    }

    // 处理描述字段（如果存在）
    if (node.description) {
        // 尝试从描述中提取朝代信息
        for (const [dynasty, period] of Object.entries(dynastyMap)) {
            if (node.description.includes(dynasty)) {
                result.dynasty = dynasty;
                result.startYear = period.start;
                result.endYear = period.end;

                // 如果找到朝代，尝试进一步查找年份
                const parenthesisMatch = yearParenthesisRegex.exec(node.description);
                if (parenthesisMatch) {
                    result.startYear = parseInt(parenthesisMatch[1]);
                    result.endYear = parseInt(parenthesisMatch[2]);
                }

                const singleYearMatch = singleYearRegex.exec(node.description);
                if (singleYearMatch) {
                    result.startYear = parseInt(singleYearMatch[1]);
                    result.endYear = result.startYear;
                }

                return result;
            }
        }
    }

    return result;
}
