const fs = require('fs');
const path = require('path');

const p = path.resolve('node_modules/.pnpm');
const dirs = fs.readdirSync(p).filter(d => d.startsWith('nativewind@'));
if (dirs.length > 0) {
  const file = path.join(p, dirs[0], 'node_modules/nativewind/dist/metro/tailwind/index.js');
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace the error throws with just returning the V3 implementations
  content = content.replace(
    'throw new Error("NativeWind only supports Tailwind CSS v3");', 
    'return (0, v3_1.tailwindCliV3)(debug);'
  );
  content = content.replace(
    'throw new Error("NativeWind only supports Tailwind CSS v3");', 
    'return (0, v3_1.tailwindConfigV3)(path);'
  );
  
  fs.writeFileSync(file, content);
  console.log('Successfully patched NativeWind to bypass v3 check in monorepo!');
} else {
  console.error('NativeWind not found in .pnpm store');
}
