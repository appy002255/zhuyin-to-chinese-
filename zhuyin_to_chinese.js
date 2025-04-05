// 注音到中文字的映射表
let zhuyinToChineseMap = {};
let loadedZhuyinCombinations = new Set(); // 記錄已載入的注音組合

// 從 BPMFBase.txt 載入特定注音組合的字
async function loadZhuyinCombination(zhuyin) {
    if (loadedZhuyinCombinations.has(zhuyin)) {
        return;
    }

    try {
        const response = await fetch('http://localhost:8000/BPMFBase.txt');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        const lines = text.split('\n');
        
        for (const line of lines) {
            if (!line.trim()) continue;  // 跳過空行
            const parts = line.trim().split(' ');
            if (parts.length < 2) continue;  // 跳過格式不正確的行
            
            const [character, zhuyinStr] = parts;
            if (zhuyinStr.startsWith(zhuyin)) {
                if (!zhuyinToChineseMap[zhuyinStr]) {
                    zhuyinToChineseMap[zhuyinStr] = [];
                }
                zhuyinToChineseMap[zhuyinStr].push(character);
            }
        }
        
        loadedZhuyinCombinations.add(zhuyin);
    } catch (error) {
        console.error('載入注音組合失敗:', error);
        // 在錯誤發生時也將組合加入已載入集合，避免重複嘗試載入
        loadedZhuyinCombinations.add(zhuyin);
    }
}

// 轉換注音為中文
async function convertZhuyinToChinese(zhuyin) {
    // 將注音字串分割成單個字的注音
    const zhuyinChars = zhuyin.match(/[ㄅ-ㄦ]+[ˉˊˇˋ˙]?/g) || [];
    
    // 確保每個注音組合都已載入
    for (const char of zhuyinChars) {
        await loadZhuyinCombination(char);
    }
    
    // 轉換每個注音為中文字
    return zhuyinChars.map(char => {
        const chinese = zhuyinToChineseMap[char];
        if (!chinese || chinese.length === 0) {
            console.log('未找到對應的中文字:', char);
            return char;
        }
        return chinese[0]; // 返回第一個匹配的中文字
    }).join('');
}

// 檢查注音是否有對應的中文字
async function hasChineseChar(zhuyin) {
    await loadZhuyinCombination(zhuyin);
    return zhuyinToChineseMap.hasOwnProperty(zhuyin);
}

// 獲取所有可能的中文字
async function getAllPossibleChineseChars(zhuyin) {
    await loadZhuyinCombination(zhuyin);
    const results = [];
    for (const [key, value] of Object.entries(zhuyinToChineseMap)) {
        if (key.startsWith(zhuyin)) {
            results.push({ zhuyin: key, chinese: value });
        }
    }
    return results;
}

// 導出函數供其他檔案使用
window.zhuyinToChinese = {
    convert: convertZhuyinToChinese,
    hasChinese: hasChineseChar,
    getAllPossibleChars: getAllPossibleChineseChars,
    loadCombination: loadZhuyinCombination
}; 