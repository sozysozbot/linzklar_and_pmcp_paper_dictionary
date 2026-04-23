const fs = require('fs');
const fetch_ = require("node-fetch");

// Fetch the latest non_dummy_glyph_list.json 
fetch("https://yasusho.github.io/linmarn_font_project/rounded/fixed/!non_dummy_glyph_list.json")
    .then(res => res.json())
    .then(json => {
        fs.writeFileSync("non_dummy_glyph_list.json", JSON.stringify(json, null, 2), { encoding: 'utf-8' });
        console.log("non_dummy_glyph_list.json updated successfully.");
    })
    .catch(err => {
        console.error("Error fetching non_dummy_glyph_list.json:", err);
    });