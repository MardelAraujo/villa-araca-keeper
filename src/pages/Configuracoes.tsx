import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme, defaultTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/use-toast';
import { Palette, RotateCcw, Check } from 'lucide-react';

const presetThemes = [
  {
    name: 'Villa Araçá (Padrão)',
    nameIt: 'Villa Araçá (Predefinito)',
    sidebarBackground: '152 30% 25%',
    sidebarForeground: '40 30% 95%',
    accentColor: '353 44% 81%',
  },
  {
    name: 'Oceano',
    nameIt: 'Oceano',
    sidebarBackground: '210 50% 25%',
    sidebarForeground: '210 20% 95%',
    accentColor: '200 80% 60%',
  },
  {
    name: 'Floresta',
    nameIt: 'Foresta',
    sidebarBackground: '140 40% 20%',
    sidebarForeground: '80 30% 95%',
    accentColor: '80 60% 50%',
  },
  {
    name: 'Pôr do Sol',
    nameIt: 'Tramonto',
    sidebarBackground: '20 30% 25%',
    sidebarForeground: '40 30% 95%',
    accentColor: '30 90% 60%',
  },
  {
    name: 'Lavanda',
    nameIt: 'Lavanda',
    sidebarBackground: '270 30% 25%',
    sidebarForeground: '270 20% 95%',
    accentColor: '280 60% 70%',
  },
  {
    name: 'Escuro',
    nameIt: 'Scuro',
    sidebarBackground: '0 0% 10%',
    sidebarForeground: '0 0% 95%',
    accentColor: '45 90% 55%',
  },
  {
    name: 'Neon Escuro',
    nameIt: 'Neon Scuro',
    sidebarBackground: '0 0% 5%',
    sidebarForeground: '0 0% 98%',
    accentColor: '142 100% 50%',
  },
  {
    name: 'Verde & Areia',
    nameIt: 'Verde & Sabbia',
    sidebarBackground: '152 35% 22%',
    sidebarForeground: '38 35% 92%',
    accentColor: '38 45% 72%',
  },
];

const Configuracoes = () => {
  const { language } = useLanguage();
  const { themeColors, setThemeColors, resetToDefaults } = useTheme();
  const { toast } = useToast();
  
  const [localColors, setLocalColors] = useState(themeColors);

  const labels = {
    pt: {
      title: 'Configurações',
      subtitle: 'Personalize o sistema da Villa Araçá',
      themeTab: 'Tema',
      generalTab: 'Geral',
      themeTitle: 'Personalização de Cores',
      themeDesc: 'Personalize as cores da interface do sistema',
      sidebarBg: 'Cor de Fundo da Sidebar',
      sidebarText: 'Cor do Texto da Sidebar',
      accentColor: 'Cor de Destaque',
      presetThemes: 'Temas Predefinidos',
      customColors: 'Cores Personalizadas',
      hslFormat: 'Formato HSL (ex: 152 30% 25%)',
      apply: 'Aplicar Tema',
      reset: 'Restaurar Padrão',
      applied: 'Tema aplicado!',
      appliedDesc: 'As cores foram atualizadas com sucesso.',
    },
    it: {
      title: 'Impostazioni',
      subtitle: 'Personalizza il sistema di Villa Araçá',
      themeTab: 'Tema',
      generalTab: 'Generale',
      themeTitle: 'Personalizzazione Colori',
      themeDesc: "Personalizza i colori dell'interfaccia del sistema",
      sidebarBg: 'Colore Sfondo Sidebar',
      sidebarText: 'Colore Testo Sidebar',
      accentColor: 'Colore Accento',
      presetThemes: 'Temi Predefiniti',
      customColors: 'Colori Personalizzati',
      hslFormat: 'Formato HSL (es: 152 30% 25%)',
      apply: 'Applica Tema',
      reset: 'Ripristina Predefinito',
      applied: 'Tema applicato!',
      appliedDesc: 'I colori sono stati aggiornati con successo.',
    },
  };

  const l = labels[language];

  const handleApplyTheme = () => {
    setThemeColors(localColors);
    toast({
      title: l.applied,
      description: l.appliedDesc,
    });
  };

  const handlePresetSelect = (preset: typeof presetThemes[0]) => {
    const newColors = {
      sidebarBackground: preset.sidebarBackground,
      sidebarForeground: preset.sidebarForeground,
      accentColor: preset.accentColor,
    };
    setLocalColors(newColors);
    setThemeColors(newColors);
    toast({
      title: l.applied,
      description: l.appliedDesc,
    });
  };

  const handleReset = () => {
    setLocalColors(defaultTheme);
    resetToDefaults();
    toast({
      title: l.applied,
      description: l.appliedDesc,
    });
  };

  const isCurrentPreset = (preset: typeof presetThemes[0]) => {
    return (
      themeColors.sidebarBackground === preset.sidebarBackground &&
      themeColors.sidebarForeground === preset.sidebarForeground &&
      themeColors.accentColor === preset.accentColor
    );
  };

  return (
    <MainLayout title={l.title} subtitle={l.subtitle}>
      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="theme">
          <TabsList className="mb-6">
            <TabsTrigger value="theme" className="gap-2">
              <Palette size={16} />
              {l.themeTab}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="theme" className="space-y-6">
            {/* Preset Themes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{l.presetThemes}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {presetThemes.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => handlePresetSelect(preset)}
                      className="relative p-3 rounded-lg border-2 transition-all hover:scale-105"
                      style={{
                        borderColor: isCurrentPreset(preset) ? `hsl(${preset.accentColor})` : 'hsl(var(--border))',
                      }}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex gap-1">
                          <div
                            className="w-6 h-6 rounded-full border"
                            style={{ backgroundColor: `hsl(${preset.sidebarBackground})` }}
                          />
                          <div
                            className="w-6 h-6 rounded-full border"
                            style={{ backgroundColor: `hsl(${preset.accentColor})` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-center">
                          {language === 'pt' ? preset.name : preset.nameIt}
                        </span>
                        {isCurrentPreset(preset) && (
                          <Check size={14} className="absolute top-1 right-1 text-primary" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Custom Colors */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{l.customColors}</CardTitle>
                <CardDescription>{l.hslFormat}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Sidebar Background */}
                  <div className="space-y-2">
                    <Label>{l.sidebarBg}</Label>
                    <div className="flex gap-2">
                      <div
                        className="w-10 h-10 rounded-md border shrink-0"
                        style={{ backgroundColor: `hsl(${localColors.sidebarBackground})` }}
                      />
                      <Input
                        value={localColors.sidebarBackground}
                        onChange={(e) =>
                          setLocalColors({ ...localColors, sidebarBackground: e.target.value })
                        }
                        placeholder="152 30% 25%"
                      />
                    </div>
                  </div>

                  {/* Sidebar Text */}
                  <div className="space-y-2">
                    <Label>{l.sidebarText}</Label>
                    <div className="flex gap-2">
                      <div
                        className="w-10 h-10 rounded-md border shrink-0"
                        style={{ backgroundColor: `hsl(${localColors.sidebarForeground})` }}
                      />
                      <Input
                        value={localColors.sidebarForeground}
                        onChange={(e) =>
                          setLocalColors({ ...localColors, sidebarForeground: e.target.value })
                        }
                        placeholder="40 30% 95%"
                      />
                    </div>
                  </div>

                  {/* Accent Color */}
                  <div className="space-y-2">
                    <Label>{l.accentColor}</Label>
                    <div className="flex gap-2">
                      <div
                        className="w-10 h-10 rounded-md border shrink-0"
                        style={{ backgroundColor: `hsl(${localColors.accentColor})` }}
                      />
                      <Input
                        value={localColors.accentColor}
                        onChange={(e) =>
                          setLocalColors({ ...localColors, accentColor: e.target.value })
                        }
                        placeholder="353 44% 81%"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button onClick={handleApplyTheme}>
                    <Check size={16} className="mr-2" />
                    {l.apply}
                  </Button>
                  <Button variant="outline" onClick={handleReset}>
                    <RotateCcw size={16} className="mr-2" />
                    {l.reset}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Live Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 items-start">
                  {/* Mini Sidebar Preview */}
                  <div
                    className="w-48 h-40 rounded-lg p-4 flex flex-col gap-2"
                    style={{ backgroundColor: `hsl(${localColors.sidebarBackground})` }}
                  >
                    <div
                      className="text-sm font-semibold"
                      style={{ color: `hsl(${localColors.sidebarForeground})` }}
                    >
                      Villa Araçá
                    </div>
                    <div className="space-y-1 flex-1">
                      <div
                        className="text-xs px-2 py-1 rounded"
                        style={{
                          backgroundColor: `hsl(${localColors.accentColor})`,
                          color: `hsl(${localColors.sidebarBackground})`,
                        }}
                      >
                        Dashboard
                      </div>
                      <div
                        className="text-xs px-2 py-1"
                        style={{ color: `hsl(${localColors.sidebarForeground})` }}
                      >
                        Reservas
                      </div>
                      <div
                        className="text-xs px-2 py-1"
                        style={{ color: `hsl(${localColors.sidebarForeground})` }}
                      >
                        Hóspedes
                      </div>
                    </div>
                  </div>

                  {/* Accent Elements Preview */}
                  <div className="space-y-3">
                    <button
                      className="px-4 py-2 rounded-md text-sm font-medium"
                      style={{
                        backgroundColor: `hsl(${localColors.accentColor})`,
                        color: `hsl(${localColors.sidebarBackground})`,
                      }}
                    >
                      {language === 'pt' ? 'Botão Primário' : 'Pulsante Primario'}
                    </button>
                    <div
                      className="w-32 h-2 rounded-full"
                      style={{ backgroundColor: `hsl(${localColors.accentColor})` }}
                    />
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: `hsl(${localColors.accentColor})` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Configuracoes;
