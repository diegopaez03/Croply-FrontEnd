const fs = require('fs');

let content = fs.readFileSync('src/pages/AdminFinca/DashboardAdminFincaPage.tsx', 'utf8');

// 1. Remove the Cuaderno de notas card from the right column
const rightColumnRegex = /\s*\{\/\* Cuaderno de notas \*\/}\s*<Card className="bg-card border-border shadow-sm">[\s\S]*?<\/Card>/;
content = content.replace(rightColumnRegex, '');

// 2. Replace the placeholder in the left column with the real card
const leftColumnRegex = /\s*\{\/\* Cuaderno de notas \(Placeholder visual\) \*\/}\s*<Card className="bg-card border-dashed border-border shadow-none">\s*<CardContent className="p-6 flex flex-col items-center justify-center text-muted-foreground min-h-\[100px\]">\s*<span className="font-mono text-sm">\/\/ TODO: Cuaderno de notas<\/span>\s*<\/CardContent>\s*<\/Card>/;

const newCard = `
          {/* Cuaderno de notas */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold text-foreground">Cuaderno de Notas de Campo</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-3">
              <Button onClick={() => setIsNotaModalOpen(true)}>Capturar nota</Button>
              <Button variant="outline" onClick={() => setIsVerNotasModalOpen(true)}>Ver notas</Button>
            </CardContent>
          </Card>`;

content = content.replace(leftColumnRegex, newCard);

fs.writeFileSync('src/pages/AdminFinca/DashboardAdminFincaPage.tsx', content);
