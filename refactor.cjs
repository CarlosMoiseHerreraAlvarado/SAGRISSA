const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

// Mapeo manual de archivos
const fileMoves = {
  // --- CORE ---
  'src/layouts/AppLayout.tsx': 'src/core/layout/AppLayout.tsx',
  'src/components/layout/MobilePage.tsx': 'src/core/layout/MobilePage.tsx',
  'src/components/layout/PageHeader.tsx': 'src/core/layout/PageHeader.tsx',
  'src/components/layout/SectionTitle.tsx': 'src/core/layout/SectionTitle.tsx',
  'src/components/layout/index.ts': 'src/core/layout/index.ts',
  
  'src/components/ui/ActionCard.tsx': 'src/core/ui/ActionCard.tsx',
  'src/components/ui/AgingCard.tsx': 'src/core/ui/AgingCard.tsx',
  'src/components/ui/Button.tsx': 'src/core/ui/Button.tsx',
  'src/components/ui/Card.tsx': 'src/core/ui/Card.tsx',
  'src/components/ui/EmptyState.tsx': 'src/core/ui/EmptyState.tsx',
  'src/components/ui/ListCard.tsx': 'src/core/ui/ListCard.tsx',
  'src/components/ui/OfflineBanner.tsx': 'src/core/ui/OfflineBanner.tsx',
  'src/components/ui/SearchInput.tsx': 'src/core/ui/SearchInput.tsx',
  'src/components/ui/Skeleton.tsx': 'src/core/ui/Skeleton.tsx',
  'src/components/ui/StatCard.tsx': 'src/core/ui/StatCard.tsx',
  'src/components/ui/StatusBadge.tsx': 'src/core/ui/StatusBadge.tsx',
  'src/components/ui/Tabs.tsx': 'src/core/ui/Tabs.tsx',
  'src/components/ui/index.ts': 'src/core/ui/index.ts',
  
  'src/context/AuthContext.tsx': 'src/core/context/AuthContext.tsx',
  'src/hooks/useAuth.ts': 'src/core/hooks/useAuth.ts',
  'src/services/api.config.ts': 'src/core/api/api.config.ts',

  // --- FEATURES ---
  // Auth
  'src/components/auth/ProtectedRoute.tsx': 'src/features/auth/components/ProtectedRoute.tsx',
  'src/pages/LoginPage.tsx': 'src/features/auth/pages/LoginPage.tsx',
  'src/pages/OnboardingPage.tsx': 'src/features/auth/pages/OnboardingPage.tsx',
  
  // Dashboard
  'src/pages/cliente/HomeCliente.tsx': 'src/features/dashboards/pages/HomeCliente.tsx',
  'src/pages/vendedor/DashboardVendedor.tsx': 'src/features/dashboards/pages/DashboardVendedor.tsx',

  // Facturacion
  'src/pages/cliente/AccountCliente.tsx': 'src/features/facturacion/pages/AccountCliente.tsx',
  'src/pages/cliente/FacturasCliente.tsx': 'src/features/facturacion/pages/FacturasCliente.tsx',
  'src/pages/cliente/FacturaDetailCliente.tsx': 'src/features/facturacion/pages/FacturaDetailCliente.tsx',
  
  // Pedidos
  'src/pages/cliente/PedidosCliente.tsx': 'src/features/pedidos/pages/PedidosCliente.tsx',
  'src/pages/vendedor/NuevoPedidoPage.tsx': 'src/features/pedidos/pages/NuevoPedidoPage.tsx',
  'src/services/order.service.ts': 'src/features/pedidos/services/order.service.ts',

  // Catalogo
  'src/pages/vendedor/CatalogoPage.tsx': 'src/features/catalogo/pages/CatalogoPage.tsx',
  'src/services/catalog.service.ts': 'src/features/catalogo/services/catalog.service.ts',

  // Config (Global)
  'src/pages/SettingsPage.tsx': 'src/features/config/pages/SettingsPage.tsx',
  'src/pages/cliente/SettingsCliente.tsx': 'src/features/config/pages/SettingsCliente.tsx',

  // Services extras
  'src/services/customer.service.ts': 'src/features/facturacion/services/customer.service.ts', // Podría ir en otro lugar, pero lo dejaré en facturacion por ahora

  // Index exports (borrar o ignorar)
  // 'src/pages/cliente/index.ts': null, // Lo borraremos manualmente o lo ignoramos
};

function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// 1. Crear directorios y mover archivos
const reverseMap = {};
console.log("==> MOVIENDO ARCHIVOS...");
for (const [oldPath, newPath] of Object.entries(fileMoves)) {
  const absOld = path.join(__dirname, oldPath);
  const absNew = path.join(__dirname, newPath);
  
  if (fs.existsSync(absOld)) {
    ensureDir(absNew);
    fs.copyFileSync(absOld, absNew);
    reverseMap[absOld] = absNew;
  }
}

// Agregar App.tsx y main.tsx al mapeo inverso (aunque no se mueven)
reverseMap[path.join(__dirname, 'src/App.tsx')] = path.join(__dirname, 'src/App.tsx');
reverseMap[path.join(__dirname, 'src/main.tsx')] = path.join(__dirname, 'src/main.tsx');
reverseMap[path.join(__dirname, 'src/types/index.ts')] = path.join(__dirname, 'src/types/index.ts');


// 2. Refactorizar los imports
console.log("==> REFACTORIZANDO IMPORTS...");
function getAllTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllTsFiles(filePath, fileList);
    } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

// Solo procesaremos los archivos NUEVOS (y los que no se movieron como App.tsx)
const allFiles = Object.values(reverseMap);

for (const filePath of allFiles) {
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Buscar todos los imports
  const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
  let match;
  
  const replacements = [];

  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    
    // Solo nos importan los imports relativos
    if (importPath.startsWith('.')) {
      // oldPath = el path absoluto del archivo antes del movimiento
      const oldCurrentFilePath = Object.keys(reverseMap).find(key => reverseMap[key] === filePath);
      if (!oldCurrentFilePath) continue;
      
      const oldCurrentDir = path.dirname(oldCurrentFilePath);
      let targetFileAbsOld = path.resolve(oldCurrentDir, importPath);
      
      // Intentar adivinar extensión (.tsx, .ts, /index.ts)
      let resolvedAbsOld = targetFileAbsOld;
      if (fs.existsSync(targetFileAbsOld + '.tsx')) resolvedAbsOld += '.tsx';
      else if (fs.existsSync(targetFileAbsOld + '.ts')) resolvedAbsOld += '.ts';
      else if (fs.existsSync(path.join(targetFileAbsOld, 'index.ts'))) resolvedAbsOld = path.join(targetFileAbsOld, 'index.ts');
      else if (fs.existsSync(path.join(targetFileAbsOld, 'index.tsx'))) resolvedAbsOld = path.join(targetFileAbsOld, 'index.tsx');

      const targetFileAbsNew = reverseMap[resolvedAbsOld];
      
      if (targetFileAbsNew) {
        // Encontramos adónde se movió. Ahora calculamos la nueva ruta relativa
        const currentFileAbsNew = filePath;
        const newCurrentDir = path.dirname(currentFileAbsNew);
        
        let newRelPath = path.relative(newCurrentDir, targetFileAbsNew);
        newRelPath = newRelPath.replace(/\\/g, '/'); // fix windows
        
        // Quitar extensiones
        newRelPath = newRelPath.replace(/\.tsx?$/, '');
        if (newRelPath.endsWith('/index')) {
          newRelPath = newRelPath.replace(/\/index$/, '');
        }
        
        if (!newRelPath.startsWith('.')) {
          newRelPath = './' + newRelPath;
        }

        if (newRelPath !== importPath) {
          replacements.push({
            start: match.index,
            oldStr: importPath,
            newStr: newRelPath
          });
        }
      }
    }
  }

  // Aplicar reemplazos
  if (replacements.length > 0) {
    let offset = 0;
    for (const r of replacements) {
      const idx = content.indexOf(r.oldStr, r.start + offset);
      if (idx !== -1) {
        content = content.substring(0, idx) + r.newStr + content.substring(idx + r.oldStr.length);
        offset += (r.newStr.length - r.oldStr.length);
        changed = true;
      }
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Updated imports in", filePath);
  }
}

console.log("==> LIMPIANDO CARPETAS VIEJAS...");
const dirsToRemove = [
  'src/components/auth',
  'src/components/layout',
  'src/components/ui',
  'src/components',
  'src/context',
  'src/hooks',
  'src/layouts',
  'src/pages/cliente',
  'src/pages/vendedor',
  'src/pages',
  'src/services'
];

for(const d of dirsToRemove) {
    const absD = path.join(__dirname, d);
    if(fs.existsSync(absD)) {
        try {
            fs.rmSync(absD, { recursive: true, force: true });
            console.log("Deleted old dir:", d);
        } catch(e) {}
    }
}

console.log("==> TERMINADO!");
