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
    '0_04_authors.html',
    '0_05_grand_index.html',
    '0_08_09_linzklar_start.html',
    '0_10_how_to_use_linzklar.html',
    '1_01_目四片_清字.html',
    '1_02_grammar_linzklar_abridged.html',
    
    '4_01_pmcp_start.html',
    '4_02_how_to_use_pmcp.html',
    '4_03_pmcp_50on.html',
    '5_06_目四片_島言.html',
    '6_06_grammar_pmcp_abridged.html',
    
    '6_09_colophon.html',

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
