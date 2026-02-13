// @ts-check
/** @type {import('@vivliostyle/cli').VivliostyleConfigSchema} */
const vivliostyleConfig = {
  title: '目四片 言将机戦人等 網別清字言書', // populated into 'publication.json', default to 'title' of the first entry or 'name' in 'package.json'.
  author: '日本机戦連盟', // default to 'author' in 'package.json' or undefined
  // language: 'la',
  // readingProgression: 'rtl', // reading progression direction, 'ltr' or 'rtl'.
  size: 'JIS-B6',
  // theme: '', // .css or local dir or npm package. default to undefined
  image: 'ghcr.io/vivliostyle/cli:8.19.0',
  entry: [ // **required field**
    // 'introduction.md', // 'title' is automatically guessed from the file (frontmatter > first heading)
    // {
    //   path: 'epigraph.md',
    //   title: 'おわりに', // title can be overwritten (entry > file),
    //   theme: '@vivliostyle/theme-whatever' // theme can be set individually. default to root 'theme'
    // },
    '0_01_grand_title.html',
    '0_02_03_foreword.html',
    '0_06_07_pmcp_map.html',
    '0_04_great_grand_index.html',
    '10_03_EN_grand_title.html',
    '10_04_EN_authors.html',
    '10_05_EN_grand_index.html',
    '10_08_EN_linzklar_start.html',
    '10_10_EN_how_to_use_linzklar.html',
    '10_11_EN_linzklar_key_to_pronunciation.html',
    '11_01_EN_目四片_清字.html',
    '11_02_EN_grammar_linzklar_abridged.html',
    '14_01_EN_pmcp_start.html',
    '14_02_EN_how_to_use_pmcp.html',
    '15_05_EN_pmcp_key_to_pronunciation.html',
    '15_06_EN_目四片_島言.html',
    '16_06_EN_grammar_pmcp_abridged.html',

    '20_03_ZH_grand_title.html',
    '20_04_ZH_authors.html',
    '20_05_ZH_grand_index.html',
    '20_08_ZH_linzklar_start.html',
    '20_10_ZH_how_to_use_linzklar.html',
    '21_01_ZH_目四片_清字.html',
    '21_02_ZH_grammar_linzklar_abridged.html',
    '24_01_ZH_pmcp_start.html',
    '24_02_ZH_how_to_use_pmcp.html',
    '24_03_ZH_pmcp_50on.html',
    '25_06_ZH_目四片_島言.html',
    '26_06_ZH_grammar_pmcp_abridged.html',

    '30_03_JA_grand_title.html',
    '30_04_JA_authors.html',
    '30_05_JA_grand_index.html',
    '30_08_JA_linzklar_start.html',
    '30_10_JA_how_to_use_linzklar.html',
    '31_01_JA_目四片_清字.html',
    '31_02_JA_grammar_linzklar_abridged.html',
    '34_01_JA_pmcp_start.html',
    '34_02_JA_how_to_use_pmcp.html',
    '34_03_JA_pmcp_50on.html',
    '35_06_JA_目四片_島言.html',
    '36_06_JA_grammar_pmcp_abridged.html',
    '36_09_JA_colophon.html',

  ], // 'entry' can be 'string' or 'object' if there's only single markdown file
  // entryContext: './manuscripts', // default to '.' (relative to 'vivliostyle.config.js')
  output: [ "../目四片_言将机戦人等_網別_清字_島言_言書.pdf" ] // path to generate draft file(s). default to '{title}.pdf'
  //   './output.pdf', // the output format will be inferred from the name.
  //   {
  //     path: './book',
  //     format: 'webpub',
  //   },
  // ],
  // workspaceDir: '.vivliostyle', // directory which is saved intermediate files.
  // toc: {
  //   title: 'Table of Contents',
  //   htmlPath: 'index.html',
  //   sectionDepth: 3,
  // },
  // cover: './cover.png', // cover image. default to undefined.
  // vfm: { // options of VFM processor
  //   replace: [ // specify replace handlers to modify HTML outputs
  //     {
  //       // This handler replaces {current_time} to a current local time tag.
  //       test: /{current_time}/,
  //       match: (_, h) => {
  //         const currentTime = new Date().toLocaleString();
  //         return h('time', { datetime: currentTime }, currentTime);
  //       },
  //     },
  //   ],
  //   hardLineBreaks: true, // converts line breaks of VFM to <br> tags. default to 'false'.
  //   disableFormatHtml: true, // disables HTML formatting. default to 'false'.
  // },
};

module.exports = vivliostyleConfig;
