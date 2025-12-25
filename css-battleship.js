#!/usr/bin/env node

// CSS Battleship - Because sometimes you need to nuke specificity from orbit
// Usage: node css-battleship.js [selector]

const fs = require('fs');
const path = require('path');

// The CSS specificity calculator that doesn't care about your feelings
function calculateSpecificity(selector) {
    // Regex patterns that judge your CSS life choices
    const idPattern = /#/g;
    const classPattern = /\.[\w-]+/g;
    const elementPattern = /(^|[\s>+~])([\w-]+)(?![\w-])/g;
    
    // Count with the cold, hard logic of a machine
    const ids = (selector.match(idPattern) || []).length;
    const classes = (selector.match(classPattern) || []).length;
    const elements = (selector.match(elementPattern) || []).length;
    
    return { ids, classes, elements, total: ids * 100 + classes * 10 + elements };
}

// Find all CSS files like a detective who's seen too much
function findCSSFiles(dir) {
    const files = [];
    
    function walk(currentPath) {
        const items = fs.readdirSync(currentPath);
        
        for (const item of items) {
            const fullPath = path.join(currentPath, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                walk(fullPath);
            } else if (item.endsWith('.css')) {
                files.push(fullPath);
            }
        }
    }
    
    walk(dir);
    return files;
}

// The main event - where specificity wars are exposed
function battleSpecificity(targetSelector) {
    console.log(`\n🚀 Firing CSS Battleship at: ${targetSelector}`);
    console.log('='.repeat(50));
    
    const targetSpec = calculateSpecificity(targetSelector);
    console.log(`\n🎯 Target specificity: ${targetSpec.ids}-${targetSpec.classes}-${targetSpec.elements} (score: ${targetSpec.total})`);
    
    const cssFiles = findCSSFiles('.');
    
    if (cssFiles.length === 0) {
        console.log('\n😱 No CSS files found. Are you even trying?');
        return;
    }
    
    console.log(`\n🔍 Scanning ${cssFiles.length} CSS file(s):`);
    
    let found = false;
    
    for (const file of cssFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            // Look for selectors like a hawk with glasses
            if (line.includes('{') && !line.includes('@')) {
                const selector = line.split('{')[0].trim();
                const spec = calculateSpecificity(selector);
                
                // Only show rules that might be winning the specificity war
                if (spec.total >= targetSpec.total && selector.includes(targetSelector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))) {
                    console.log(`\n💥 CONFLICT DETECTED in ${path.basename(file)}:${i + 1}`);
                    console.log(`   Selector: ${selector}`);
                    console.log(`   Specificity: ${spec.ids}-${spec.classes}-${spec.elements} (score: ${spec.total})`);
                    console.log(`   Line: ${line.trim()}`);
                    found = true;
                }
            }
        }
    }
    
    if (!found) {
        console.log('\n🎉 No specificity conflicts found! (Or your CSS is just broken in other ways)');
    }
    
    console.log('\n💡 Pro tip: Add more !important (just kidding, please don\'t)');
}

// Let the battle begin!
const targetSelector = process.argv[2];
if (!targetSelector) {
    console.log('\n⚠️  Usage: node css-battleship.js [css-selector]');
    console.log('   Example: node css-battleship.js ".btn.active"');
    process.exit(1);
}

battleSpecificity(targetSelector);
