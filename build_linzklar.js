import fs from 'fs';
import { to_kana, from_latin } from 'pekzep_syllable';

const variant_table = fs.readFileSync("VARIANTS.tsv", { encoding: 'utf-8' })
    .trimEnd()
    .split(/\r?\n/)
    .map(line => line.split("\t"))
    .slice(1);

const english_gloss_table = fs.readFileSync("english_gloss_of_linzklar.tsv", { encoding: 'utf-8' })
    .trimEnd()
    .split(/\r?\n/)
    .map(line => line.split("\t"));

const variant_map = new Map(variant_table.map(([linzklar, variants_官字, variants_風字]) => {
    return [linzklar, { variants_官字: [...variants_官字], variants_風字: [...variants_風字] }]
}));

const vulgar_table = fs.readFileSync("VULGAR.tsv", { encoding: 'utf-8' })
    .trimEnd()
    .split(/\r?\n/)
    .map(line => line.split("\t"));

const vulgar_map = new Map(vulgar_table.map(([linzklar, vulgar_latin, vulgar_pronunciation]) => {
    return [linzklar, { vulgar_latin, vulgar_pronunciation }]
}));

const pronunciation2_table = fs.readFileSync("PRONUNCIATIONS2.tsv", { encoding: 'utf-8' })
    .split(/\r?\n/)
    .map(line => line.split("\t"));

const idiomatic_multichar_pronunciation_table = fs.readFileSync("IDIOMATIC_MULTICHARS.tsv", { encoding: 'utf-8' })
    .trimEnd()
    .split(/\r?\n/)
    .map(line => line.split("\t"));

let LINZKLARS_IN_ROUNDED = "";

build("11_01", "EN", "目四片_清字");
build("31_01", "JA", "目四片_清字");

{
    const glyphs = fs.readFileSync("non_dummy_glyph_list.json", { encoding: 'utf-8' });
    const required_glyphs = new Set([...LINZKLARS_IN_ROUNDED]);
    const missing_glyphs = [...required_glyphs].filter(g => !glyphs.includes(g));
    if (missing_glyphs.length > 0) {
        console.log(`Required glyphs for linzklar_rounded: ${missing_glyphs.join(", ")}`);
        console.log("Please replace the dummy glyphs, add them to the font and regenerate the font.");
    } else {
        console.log("All required glyphs are present in the linzklar_rounded font.");
    }
}


function group_entries_tsv(ungrouped) {
    // First, group by the first column (linzklar)
    // But keep the order of the original array
    const grouped = ungrouped.reduce((acc, entry) => {
        const [linzklar_or_command, second_column, third_column] = entry;
        if (acc[acc.length - 1]?.linzklar !== linzklar_or_command) {
            acc.push({ linzklar: linzklar_or_command, definitions: [], sentences: [] });
        }
        if (!second_column && !third_column) {
            // ignore
            return acc;
        } else if (second_column.startsWith("[") || second_column === "") {
            acc[acc.length - 1].definitions.push({ POS: second_column, definition: third_column });
        } else {
            acc[acc.length - 1].sentences.push({ linzklar: second_column, translations: third_column.split("|") });
        }
        return acc;
    }, []);
    return grouped;
}

function build(_prefix, lang, index) {
    const main_index = `${_prefix}_${lang}_${index}`;
    const guide_words = JSON.parse(fs.readFileSync(`GUIDE_WORDS_${main_index}.json`, { encoding: 'utf-8' }));

    const entries_tsv = fs.readFileSync(`entries_${main_index}.tsv`, { encoding: 'utf8' })
        .trimEnd()
        .split(/\r?\n/)
        .map(line => line.split("\t"));

    const entries = group_entries_tsv(entries_tsv);

    Object.entries(guide_words).forEach(([_key, value]) => {
        LINZKLARS_IN_ROUNDED += value.left + value.right;
    });

    const resulting_file_content = `<link rel="stylesheet" href="section.css">

<style>
    @page:left { 
        background-image: url("爪見出し/${index}_left.png");
        background-size: 483.8px 687.9px;
        background-repeat: no-repeat;
        @top-left { font-family: "linzklar_rounded"; font-size: 12pt; } /* 左ページでは左の柱見出しのみ */
        @top-right { font-family: "linzklar_rounded"; font-size: 0pt; }
    }

    @page:right { 
        background-image: url("爪見出し/${index}_right.png");
        background-size: 483.8px 687.9px;
        background-repeat: no-repeat;
        @top-left { font-family: "linzklar_rounded"; font-size: 0pt; }
        @top-right { font-family: "linzklar_rounded"; font-size: 12pt; }  /* 右ページでは右の柱見出しのみ */
    }
    
    /* それぞれのページ指定では柱見出しを両側に指定しておき、上記ルールにより片方だけ潰す */
${Object.entries(guide_words).map(([key, value]) => `    @page:nth(${key}) {
        @top-left { content: "${value.left}"; }
        @top-right { content: "${value.right}"; }
    }
`).join('\n')}</style>

${entries.map((a) => gen_entry(a, lang)).join("\n\n")}`;

    if (resulting_file_content.includes("«")
        || resulting_file_content.includes("»")) {
        console.log("このギュメの使い方は想定していません。hsjoihs に連絡してパーサーを直してもらってください。")
    }


    fs.writeFileSync(`vivliostyle/${main_index}.html`, resulting_file_content, { encoding: 'utf8' });
}

function gen_pronunciation(linzklar, format = "kana") {
    if (linzklar.startsWith("«") && linzklar.endsWith("»")) {
        const idiomatic_multichar = linzklar.slice(1, -1);
        const entry = idiomatic_multichar_pronunciation_table.find(([c_, _]) => c_ === idiomatic_multichar);
        if (entry) {
            if (format === "kana")
                return entry[1];
            else
                throw new Error(`Unsupported format ${format} for a multichar idiom ${linzklar}.`);
        } else {
            console.log(`Missing pronunciation for ${c}. Provide it in the PRONUNCIATIONS.tsv file.`);
            return `<span style="color: red">発音を提供せよ:【${c}】</span>`;
        }
    }

    try {
        return [...linzklar].map(c => {
            // search from the pronunciation table
            const entry = pronunciation2_table.find(([c_, _]) => c_ === c);
            if (entry) {
                const latin_pronunciation = entry[1];
                const kana_pronunciation = entry[2];

                check_consistency({ context: c, latin: latin_pronunciation, kana: kana_pronunciation });
                if (!kana_pronunciation && linzklar.length > 1) {
                    console.log(`Empty pronunciation for ${c}, used in a multichar context ${linzklar}. Hiding the pronunciation.`);
                    throw new Error(`<span style="color: red">発音が定義されていない字【${c}】の熟語</span>`);
                }
                return format === "kana" ? kana_pronunciation : latin_pronunciation;
            } else {
                console.log(`Missing pronunciation for ${c}. Provide it in the PRONUNCIATIONS.tsv file.`);
                return `<span style="color: red">発音を提供せよ:【${c}】</span>`;
            }
        }).join(format === "kana" ? "" : " ");
    } catch (e) {
        return "";
    }
}

function check_consistency({ context, latin, kana }) {
    // If both are falsy, ignore
    if (!latin && !kana) {
        return;
    }
    const converted_kana = latin.split(" ").map(latin => {
        return to_kana(from_latin(latin))
    }
    ).join("");
    if (converted_kana !== kana) {
        console.log(`Pronunciation mismatch for ${context}: 
${converted_kana} [converted from ${latin}] does not match with
${kana}`);
    }
}

function gen_entry_of_single_char({ linzklar, lang, pronunciation_, definitions, sentences }) {
    const variants_官字 = variant_map.get(linzklar)?.variants_官字;
    const variants_風字 = variant_map.get(linzklar)?.variants_風字;

    const 官字_list = variants_官字 ? [linzklar, ...variants_官字] : [linzklar];
    const 風字_list = variants_風字 ? [linzklar, ...variants_風字] : [linzklar];

    const vulgar_pronunciation_kana = vulgar_map.get(linzklar)?.vulgar_pronunciation;
    const latin_pronunciation = vulgar_map.get(linzklar)?.vulgar_latin;

    check_consistency({ context: linzklar, latin: latin_pronunciation, kana: vulgar_pronunciation_kana });

    const entry_word_transcription = (() => {
        const chars_including_variants = [linzklar, ... new Set([... (variants_官字 ?? []), ...(variants_風字 ?? [])])];

        return `<span class="entry-word-transcription" lang="ja">${chars_including_variants.map(c => `【${c}】`).join("")
            }</span>`;
    })();


    return `<div class="group-char-entry-with-the-following">
<div class="char-entry" id="u${linzklar.codePointAt(0).toString(16).toLowerCase()}">
    <span class="char-entry-linzklar">${官字_list.map(官字 => `<img src="../SY_handwriting/官字/${官字}.png" style="height: 1em">`).join("")
        }${風字_list.map(風字 => `<img src="../SY_handwriting/風字/${風字}.png" style="height: 1em">`).join("")
        }</span> 
</div>

<div class="entry">
    <span class="entry-word-pronunciation" lang="${lang.toLowerCase()}">${pronunciation_}${vulgar_pronunciation_kana ? `　(俗に) ${vulgar_pronunciation_kana}` : ""
        }</span> ${entry_word_transcription}
    <div class="sub">
${gen_definitions(definitions)}
${sentences.map((a) => gen_sample_sentence(a, lang)).join("")}    </div>
</div>
</div> <!-- .group-char-entry-with-the-following -->`;
}

function gen_entry({ linzklar: linzklar_, definitions, sentences }, lang) {
    if (linzklar_.startsWith("#REDIRECT")) {
        const o = JSON.parse(linzklar_.slice("#REDIRECT".length));
        return `<div class="group-char-entry-with-the-following">
<div class="char-entry redirection-entry">
    <span class="char-entry-linzklar"><img src="../SY_handwriting/官字/${o.src}.png" style="height: 1em"><img src="../SY_handwriting/風字/${o.src}.png" style="height: 1em"></span> 
</div>

<div class="entry">
    <span class="redirect_to_char">⇒ p.${o.src === o.dest ? "" : `<span class="target-linzklar">${o.dest}</span>`}</span>
</div>
</div> <!-- .group-char-entry-with-the-following -->`;
    }

    const pronunciation_ = gen_pronunciation(linzklar_, lang.toUpperCase() === "JA" ? "kana" : "latin");
    const word_written_in_linzklar = linzklar_.replace(/«(.+?)»/g, "$1"); // remove the markers of idiomatic multichar

    sentences = sentences ?? [];
    definitions = definitions ?? [];
    if ([...word_written_in_linzklar].length === 1) {
        const linzklar = word_written_in_linzklar;
        return gen_entry_of_single_char({ linzklar, lang, pronunciation_, definitions, sentences })
    }

    LINZKLARS_IN_ROUNDED += word_written_in_linzklar;

    const english_gloss = word_written_in_linzklar.split("").map(c => {
        const [_, gloss] = english_gloss_table.find(([c_, _]) => c_ === c) || [null, null];
        return gloss.toUpperCase() || `${c} (gloss missing)`;
    }).join(":");

    return `<div class="entry">
    <span class="entry-word-linzklar">${word_written_in_linzklar}</span> <span class="entry-word-pronunciation" lang="${lang.toLowerCase()}">${pronunciation_}</span> <span class="entry-word-transcription" lang="${lang.toLowerCase()}">【${lang.toLowerCase() === "en" ? english_gloss : word_written_in_linzklar}】</span>
    <div class="sub">
${gen_definitions(definitions)}
${sentences.map((a) => gen_sample_sentence(a, lang)).join("")}    </div>
</div>`
}

function gen_definitions(definitions) {
    definitions.forEach(({ definition }) => {
        const test = /<span class="inline-linzklar">([^<]*)<\/span>/.exec(definition);
        test && (LINZKLARS_IN_ROUNDED += test[1]);
    });

    return definitions.map(({ POS, definition }) => {
        if (POS) {
            return `        <span class="sub-POS" lang="ja">${POS}</span> <span class="sub-definition" lang="ja">${definition}</span><br>`
        } else {
            return `        <span class="sub-definition" lang="ja">${definition}</span><br>`
        }
    }).join("\n")
}

function gen_sample_sentence({ linzklar, translations }, lang) {
    LINZKLARS_IN_ROUNDED += linzklar;
    const pronunciation_ = gen_pronunciation(linzklar, lang.toUpperCase() === "JA" ? "kana" : "latin");

    return `        <div class="sample-sentence">
            <span class="sample-sentence-linzklar">${linzklar}</span> <span class="sample-sentence-pronunciation" lang="${lang.toLowerCase()}">${pronunciation_}</span>
            <span class="sample-sentence-transcription" lang="${lang.toLowerCase()}">【${linzklar}】</span>
${translations.map(tr => `            <div class="sample-sentence-translation" lang="${lang.toLowerCase()}">${tr}</div>\n`).join('')

        }        </div>
`
}
