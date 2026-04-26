
const KANA_TABLE_ = (is_soft) => ({
    'p': { 'a': 'パ', 'i': 'ピ', 'u': 'プ', 'e': 'ペ', 'o': 'ポ', '': 'ㇷ゚' },
    'b': { 'a': 'バ', 'i': 'ビ', 'u': 'ブ', 'e': 'ベ', 'o': 'ボ', '': null },
    'm': { 'a': 'マ', 'i': 'ミ', 'u': 'ム', 'e': 'メ', 'o': 'モ', '': 'ン' }, // make it lenient, to allow "xadosamma" and "atalam"
    'k': { 'a': 'カ', 'i': 'キ', 'u': 'ク', 'e': 'ケ', 'o': 'コ', '': 'ㇰ' },
    'l': { 'a': 'ラ', 'i': 'リ', 'u': 'ル', 'e': 'レ', 'o': 'ロ', '': 'ㇽ' },
    'n': { 'a': 'ナ', 'i': 'ニ', 'u': 'ヌ', 'e': 'ネ', 'o': 'ノ', '': 'ン' },
    'c': { 'a': 'サ', 'i': 'スィ', 'u': 'ス', 'e': 'セ', 'o': 'ソ', '': 'ㇲ' },
    'x': { 'a': 'シャ', 'i': 'シ', 'u': 'シュ', 'e': 'シェ', 'o': 'ショ', '': null },
    'dx': { 'a': 'ジャ', 'i': 'ジ', 'u': 'ジュ', 'e': 'ジェ', 'o': 'ジョ', '': null },
    'z': { 'a': 'ツァ', 'i': is_soft ? 'チ' : 'ツィ', 'u': 'ツ', 'e': is_soft ? 'チェ' : 'ツェ', 'o': 'ツォ', '': null }, 
    't': { 'a': 'タ', 'i': 'ティ', 'u': 'トゥ', 'e': 'テ', 'o': 'ト', '': 'ㇳ' },
    'd': { 'a': 'ダ', 'i': 'ディ', 'u': 'ドゥ', 'e': 'デ', 'o': 'ド', '': null },
    'j': { 'a': 'ヤ', 'i': 'イィ', 'u': 'ユ', 'e': 'イェ', 'o': 'ヨ', '': null },
    'w': { 'a': 'ワ', 'i': 'ウィ', 'u': 'ウゥ', 'e': 'ウェ', 'o': 'ウォ', '': null },
    '': { 'a': 'ア', 'i': 'イ', 'u': 'ウ', 'e': 'エ', 'o': 'オ', '': '' },
    'h': { 'a': 'ハ', 'i': 'ヒ', 'u': 'フ', 'e': 'ヘ', 'o': 'ホ', '': null },
    'g': { 'a': 'ガ', 'i': 'ギ', 'u': 'グ', 'e': 'ゲ', 'o': 'ゴ', '': null },
    's': { 'a': 'ザ', 'i': 'ズィ', 'u': 'ズ', 'e': 'ゼ', 'o': 'ゾ', '': null },
});

const KANA_TABLE = KANA_TABLE_(false);

function is_valid_onset(onset) {
    return [..."pbmklncxztdjwhgs", "", "dx"].includes(onset);
}
function is_vowel(v) {
    return ["a", "i", "u", "e", "o"].includes(v);
}
function is_vowel_or_empty(v) {
    return ["a", "i", "u", "e", "o", ""].includes(v);
}
export function to_kana(str) {
    const whole_word = str;
    if (whole_word.endsWith("lt")) {
        return to_kana(whole_word.slice(0, -2) + "leti");
    }
    const MONOSYLLABLE = /^(dx|[pbmklncxztdjwhgs]?)([aeiou])([ptkclnm](?![aeiou])|)/;
    let ans = "";
    while (str != "") {
        const [syll, onset, vowel, coda] = str.match(MONOSYLLABLE) ?? (() => { throw new Error(`In word "${whole_word}"\nCannot read off a syllable from the beginning of the substring "${str}"`); })();
        if (!is_valid_onset(onset)) {
            throw new Error(`In word "${whole_word}"\nInvalid onset "${onset}" in syllable "${syll}"`);
        }
        if (!is_vowel(vowel)) {
            throw new Error(`In word "${whole_word}"\nInvalid vowel "${vowel}" in syllable "${syll}"`);
        }
        if (!is_valid_onset(coda)) {
            throw new Error(`In word "${whole_word}"\nInvalid coda "${coda}" in syllable "${syll}"`);
        }
        ans += KANA_TABLE[onset][vowel] + (KANA_TABLE[coda][""] ?? (() => {
            throw new Error(`In word "${whole_word}"\nInvalid coda "${coda}" in syllable "${syll}"`);
        })());
        str = str.slice(syll.length);
    }
    return ans;
}
export function kana_words(form) {
    function toLowerCaseIgnoringRomanC(str) {
    return str.toLowerCase().replaceAll("\u217d", "\u216d");
}
    const normalized = toLowerCaseIgnoringRomanC(form);
    const spacing = '·';
    return normalized
        .split(/[^ABCDEGHIJKLMNOPSTUWXZ]/i)
        .map(to_kana).join(spacing)
        .replaceAll(/··+/g, "　").replaceAll(/^·|·$/g, "");
}
