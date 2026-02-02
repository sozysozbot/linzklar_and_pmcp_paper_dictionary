import fs from 'fs';

/** 
Replace the sequence of entries

...
["ディヤㇲ","*","dijac","ディヤスィㇳ","DIJACIT","動詞","キャンセルする、無効とする",""],
["ディヤㇲ","*","dijac","ディヤㇲレティ","dijacleti","動詞","無効な",""],
...

with a single entry with multiple subentries. Remove the preceding asterisk in the distinguisher.

...
{
multiple: true, 
word: "ディヤㇲ", distinguisher: "", pmcp: "dijac",
subentries: [["ディヤスィㇳ", "DIJACIT", "動詞", "キャンセルする、無効とする", ""],
["ディヤㇲレティ", "dijacleti", "動詞", "無効な", ""]]
}
*/
function group_asterisk(entries_) {
    const entries_grouped = [];
    let current_grouping = null;
    for (const entry of entries_) {
        if (entry[1].startsWith("*")) {
            // This is a groupable row
            // Either start a new grouping or add to the current one
            if (!current_grouping) {
                // Start a new grouping
                current_grouping = {
                    multiple: true,
                    word: entry[0],
                    distinguisher: entry[1].slice(1), // Remove the asterisk
                    pmcp: entry[2],
                    subentries: [entry.slice(3)]
                };
            } else if (current_grouping.word === entry[0]
                && current_grouping.distinguisher === entry[1].slice(1) // Remove the asterisk
                && current_grouping.pmcp.toLowerCase() === entry[2].toLowerCase()) {
                // Add to the current grouping
                current_grouping.subentries.push(entry.slice(3));
            } else {
                // End the current grouping and start a new one
                entries_grouped.push(current_grouping);

                // Start a new grouping
                current_grouping = {
                    multiple: true,
                    word: entry[0],
                    distinguisher: entry[1].slice(1), // Remove the asterisk
                    pmcp: entry[2],
                    subentries: [entry.slice(3)]
                };
            }
        } else {
            // This is a non-groupable row
            if (current_grouping) {
                // End the current grouping
                entries_grouped.push(current_grouping);
                current_grouping = null;
            }
            // Add the non-groupable row to the result
            entries_grouped.push(entry);
        }
    }
    if (current_grouping) {
        // End the last grouping
        entries_grouped.push(current_grouping);
    }
    return entries_grouped;
}

function 墨付きカッコ書き換え(input_string) {
    const images = [... `(${input_string})`].map(get_linzklar_rounded).join("");
    return ` ${images}【${input_string}】`;
}

function 白抜きカッコ書き換え(input_string) {
    const images = [... `${input_string}`].map(get_linzklar_rounded).join("");
    return `${images}`;
}

function get_linzklar_rounded(char) {
    if (char.trim() === "") { return " "; }

    // warn if the image path does not exist
    const image_path = `linzklar_rounded_fixed_svgs/${char}.svg`;

    if (!fs.existsSync("vivliostyle/" + image_path)) {
        console.log(`Warning: ${image_path} does not exist`);
    }

    if (fs.readFileSync("vivliostyle/" + image_path, { encoding: 'utf-8' }).includes("M46.989 25.157 C 40.310 26.523,34.197 31.379,30.113 38.560 L 26.667 44.621 26.667 500.808")) {
        console.log(`Warning: ${image_path} is a dummy glyph`);
    }

    return `<img src="linzklar_rounded_fixed_svgs/${char}.svg" class="linzklar_rounded_glyph">`;
}

function simple_entry(word, distinguisher, pmcp, pos, definition) {
    if (!pos_list.includes(pos)) {
        console.log(`Warning: ${pos} is not in pmcp_pos_list.txt \n\t\t(Encountered in ${word}${distinguisher}, ${pmcp})`);
    }

    const definition_ = definition.replaceAll(/【([^【】]+)】/g, (_, p1) => 墨付きカッコ書き換え(p1)).replaceAll(/〖([^〖〗]+)〗/g, (_, p1) => 白抜きカッコ書き換え(p1));

    return `<div class="entry">
    <span class="entry-word-ja" lang="ja">${word}${distinguisher}</span> <span class="entry-word-pmcp">${pmcp}</span> <span
        class="entry-word-POS" lang="ja">[${pos}]</span><br>
    <div class="definition" lang="ja">${definition_}</div>
</div>`;
}

function entry_with_single_subentry(word, distinguisher, pmcp, subentry, definition, line_break_after_pos = true) {
    if (!pos_list.includes(subentry.pos)) {
        console.log(`Warning: ${subentry.pos} is not in pmcp_pos_list.txt \n\t\t(Encountered in ${word}${distinguisher}, ${pmcp} --> ${subentry.word}, ${subentry.pmcp})`);
    }

    const definition_ = definition.replaceAll(/【([^【】]+)】/g, (_, p1) => 墨付きカッコ書き換え(p1)).replaceAll(/〖([^〖〗]+)〗/g, (_, p1) => 白抜きカッコ書き換え(p1));
    return `<div class="entry">
    <span class="entry-word-ja" lang="ja">${word}${distinguisher}</span> <span class="entry-word-pmcp">${pmcp}</span><br>
    <div class="sub-entry">
        <span class="sub-entry-word-ja" lang="ja">${subentry.word}</span> <span class="sub-entry-word-pmcp">${subentry.pmcp}</span>
        <span class="sub-entry-word-POS" lang="ja">[${subentry.pos}]</span>${line_break_after_pos ? '<br>' : ' '}<span class="sub-entry-definition" lang="ja">${definition_}</span>
    </div>
</div>`;
}

function entry_with_multiple_subentries(word, distinguisher, pmcp, subentries) {
    return `<div class="entry">
    <span class="entry-word-ja" lang="ja">${word}${distinguisher}</span> <span class="entry-word-pmcp">${pmcp}</span><br>
    <div class="sub-entry">
${subentries.map(subentry => {
        if (!pos_list.includes(subentry.pos)) {
            console.log(`Warning: ${subentry.pos} is not in pmcp_pos_list.txt`);
            console.log(`\t\t(Encountered in ${word}${distinguisher}, ${pmcp} --> ${subentry.word}, ${subentry.pmcp})`);
        }

        const definition_ = subentry.definition.replaceAll(/【([^【】]+)】/g, (_, p1) => 墨付きカッコ書き換え(p1)).replaceAll(/〖([^〖〗]+)〗/g, (_, p1) => 白抜きカッコ書き換え(p1));

        if (subentry.word === "" && subentry.pmcp === "") {
            /* 直前の見出し語にぶら下がり、音写と PMCP の欄なしで掲載 */
            return `        <span class="sub-entry-word-POS" lang="ja">[${subentry.pos}]</span> <span class="sub-entry-definition" lang="ja">${definition_}</span><br>`;
        }

        return `        <span class="sub-entry-word-ja" lang="ja">${subentry.word}</span> <span class="sub-entry-word-pmcp">${subentry.pmcp}</span>
        <span class="sub-entry-word-POS" lang="ja">[${subentry.pos}]</span> <span class="sub-entry-definition" lang="ja">${definition_}</span><br>`;
    }
    ).join('\n')}
    </div>
</div>`;
}


// --------------------------------------------------
// | main ↓
// --------------------------------------------------

const pos_list = fs.readFileSync("pmcp_pos_list.txt", { encoding: 'utf-8' })
    .split(/\r?\n/);

function build(行, file_name_prefix) {
    const guide_words = JSON.parse(fs.readFileSync(`GUIDE_WORDS_${行}.json`, { encoding: 'utf-8' }));

    const entries_array =
        fs.readFileSync(`EDIT_ME_${行}.tsv`, { encoding: 'utf-8' })
            .split(/\r?\n/).slice(1)
            .map((row) => row.split('\t'))
        ;


    const grouped = group_asterisk(entries_array);
    fs.writeFileSync(`__debug/__grouped_${行}.jsonl`, grouped.map(JSON.stringify).join('\n'), { encoding: 'utf-8' });

    const entries = grouped
        .map((row) => {
            if (!row.multiple) {
                const [
                    entry_word_ja, distinguisher, entry_word_pmcp, sub_entry_word_ja, sub_entry_word_pmcp, entry_pos, entry_definition, line_break_after_pos] = row;
                if (sub_entry_word_ja === "" && sub_entry_word_pmcp === "") {
                    return simple_entry(entry_word_ja, distinguisher, entry_word_pmcp, entry_pos, entry_definition);
                } else {
                    return entry_with_single_subentry(entry_word_ja, distinguisher, entry_word_pmcp, { word: sub_entry_word_ja, pmcp: sub_entry_word_pmcp, pos: entry_pos }, entry_definition, line_break_after_pos !== "false");
                }
            } else {
                const { word, distinguisher, pmcp, subentries } = row;
                return entry_with_multiple_subentries(word, distinguisher, pmcp, subentries.map(subentry => {
                    const [subentry_word_ja, subentry_word_pmcp, subentry_pos, subentry_definition] = subentry;
                    return { word: subentry_word_ja, pmcp: subentry_word_pmcp, pos: subentry_pos, definition: subentry_definition };
                }));
            }
        });

    fs.writeFileSync(`vivliostyle/${file_name_prefix}_${行}.html`, `<link rel="stylesheet" href="common.css">

<style>
    @page:left { 
        background-image: url("爪見出し/${行}_left.png");
        background-size: 483.8px 687.9px;
        background-repeat: no-repeat;
        @top-left { font-family: "M+ 1p Heavy"; font-size: 14pt; } /* 左ページでは左の柱見出しのみ */
        @top-right { font-family: "M+ 1p Heavy"; font-size: 0pt; }
    }

    @page:right { 
        background-image: url("爪見出し/${行}_right.png");
        background-size: 483.8px 687.9px;
        background-repeat: no-repeat;
        @top-left { font-family: "M+ 1p Heavy"; font-size: 0pt; }
        @top-right { font-family: "M+ 1p Heavy"; font-size: 14pt; }  /* 右ページでは右の柱見出しのみ */
    }
    
    /* それぞれのページ指定では柱見出しを両側に指定しておき、上記ルールにより片方だけ潰す */
${Object.entries(guide_words).map(([key, value]) => `    @page:nth(${key}) {
        @top-left { content: "${value.left}"; }
        @top-right { content: "${value.right}"; }
    }
`).join('\n')}</style>

<header><img src="./${行}_見出し.svg" style="width: 100%"></header>


${entries.join('\n\n')}
`, { encoding: 'utf-8' });

}

build("ア", "5_01");
build("カ", "5_02");
build("サ", "5_03");
build("タ", "5_04");
build("ナ", "5_05");
build("ハ", "5_06");
build("マ", "5_07");
build("ヤ", "5_08");
build("ラ", "5_09");