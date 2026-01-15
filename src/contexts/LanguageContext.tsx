import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'pt' | 'it';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const translations: Record<Language, Record<string, string>> = {
  pt: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.reservations': 'Reservas',
    'nav.guests': 'Hóspedes',
    'nav.import': 'Importar',
    'nav.documents': 'Documentos',
    'nav.settings': 'Configurações',
    'nav.logout': 'Sair',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.subtitle': 'Visão geral da Villa Araçá',
    'dashboard.todayCheckins': 'Check-ins Hoje',
    'dashboard.todayCheckouts': 'Check-outs Hoje',
    'dashboard.occupancyRate': 'Taxa de Ocupação',
    'dashboard.monthlyRevenue': 'Receita do Mês',
    'dashboard.recentReservations': 'Reservas Recentes',
    'dashboard.viewAll': 'Ver todas',
    
    // Reservations
    'reservations.title': 'Reservas',
    'reservations.subtitle': 'Gerencie todas as reservas da pousada',
    'reservations.search': 'Buscar por hóspede ou código...',
    'reservations.all': 'Todas',
    'reservations.request': 'Solicitação',
    'reservations.confirmed': 'Confirmada',
    'reservations.inProgress': 'Em Andamento',
    'reservations.finished': 'Finalizada',
    'reservations.canceled': 'Cancelada',
    'reservations.newReservation': 'Nova Reserva',
    'reservations.noResults': 'Nenhuma reserva encontrada',
    'reservations.guests': 'hóspedes',
    
    // Guests
    'guests.title': 'Hóspedes',
    'guests.subtitle': 'Cadastro de hóspedes da Villa Araçá',
    'guests.search': 'Buscar hóspede...',
    'guests.newGuest': 'Novo Hóspede',
    'guests.reservations': 'reservas',
    'guests.totalSpent': 'Total gasto',
    'guests.noResults': 'Nenhum hóspede encontrado',
    
    // Import
    'import.title': 'Importar Reservas',
    'import.subtitle': 'Importe PDFs ou e-mails do Booking.com',
    'import.dropzone': 'Arraste arquivos PDF aqui ou clique para selecionar',
    'import.formats': 'Formatos aceitos: PDF, EML',
    'import.history': 'Histórico de Importações',
    'import.noHistory': 'Nenhuma importação realizada ainda',
    
    // Documents
    'documents.title': 'Documentos',
    'documents.subtitle': 'Gerenciamento de documentos e lançamentos',
    'documents.search': 'Buscar documento...',
    'documents.newDocument': 'Novo Documento',
    'documents.filter': 'Filtrar por tipo',
    'documents.all': 'Todos',
    'documents.paymentProof': 'Comprovante de Pagamento',
    'documents.restaurantConsumption': 'Consumo Restaurante',
    'documents.minibarConsumption': 'Consumo Frigobar',
    'documents.signedContract': 'Contrato Assinado',
    'documents.others': 'Outros',
    'documents.noResults': 'Nenhum documento encontrado',
    'documents.reservation': 'Reserva',
    'documents.download': 'Baixar',
    'documents.delete': 'Excluir',
    
    // Status
    'status.request': 'Solicitação',
    'status.confirmed': 'Confirmada',
    'status.inProgress': 'Em Andamento',
    'status.finished': 'Finalizada',
    'status.canceled': 'Cancelada',
    'status.pending': 'Pendente',
    'status.paid50': 'Pago 50%',
    'status.paidFull': 'Pago Integral',
    'status.refunded': 'Reembolsado',
    
    // Common
    'common.search': 'Buscar...',
    'common.loading': 'Carregando...',
    'common.save': 'Salvar',
    'common.cancel': 'Cancelar',
    'common.edit': 'Editar',
    'common.delete': 'Excluir',
    'common.view': 'Visualizar',
    'common.language': 'Idioma',
  },
  it: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.reservations': 'Prenotazioni',
    'nav.guests': 'Ospiti',
    'nav.import': 'Importa',
    'nav.documents': 'Documenti',
    'nav.settings': 'Impostazioni',
    'nav.logout': 'Esci',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.subtitle': 'Panoramica di Villa Araçá',
    'dashboard.todayCheckins': 'Check-in Oggi',
    'dashboard.todayCheckouts': 'Check-out Oggi',
    'dashboard.occupancyRate': 'Tasso di Occupazione',
    'dashboard.monthlyRevenue': 'Ricavi del Mese',
    'dashboard.recentReservations': 'Prenotazioni Recenti',
    'dashboard.viewAll': 'Vedi tutte',
    
    // Reservations
    'reservations.title': 'Prenotazioni',
    'reservations.subtitle': 'Gestisci tutte le prenotazioni della pousada',
    'reservations.search': 'Cerca per ospite o codice...',
    'reservations.all': 'Tutte',
    'reservations.request': 'Richiesta',
    'reservations.confirmed': 'Confermata',
    'reservations.inProgress': 'In Corso',
    'reservations.finished': 'Completata',
    'reservations.canceled': 'Cancellata',
    'reservations.newReservation': 'Nuova Prenotazione',
    'reservations.noResults': 'Nessuna prenotazione trovata',
    'reservations.guests': 'ospiti',
    
    // Guests
    'guests.title': 'Ospiti',
    'guests.subtitle': 'Registro degli ospiti di Villa Araçá',
    'guests.search': 'Cerca ospite...',
    'guests.newGuest': 'Nuovo Ospite',
    'guests.reservations': 'prenotazioni',
    'guests.totalSpent': 'Totale speso',
    'guests.noResults': 'Nessun ospite trovato',
    
    // Import
    'import.title': 'Importa Prenotazioni',
    'import.subtitle': 'Importa PDF o email da Booking.com',
    'import.dropzone': 'Trascina i file PDF qui o clicca per selezionare',
    'import.formats': 'Formati accettati: PDF, EML',
    'import.history': 'Cronologia Importazioni',
    'import.noHistory': 'Nessuna importazione effettuata',
    
    // Documents
    'documents.title': 'Documenti',
    'documents.subtitle': 'Gestione documenti e registrazioni',
    'documents.search': 'Cerca documento...',
    'documents.newDocument': 'Nuovo Documento',
    'documents.filter': 'Filtra per tipo',
    'documents.all': 'Tutti',
    'documents.paymentProof': 'Ricevuta di Pagamento',
    'documents.restaurantConsumption': 'Consumo Ristorante',
    'documents.minibarConsumption': 'Consumo Minibar',
    'documents.signedContract': 'Contratto Firmato',
    'documents.others': 'Altri',
    'documents.noResults': 'Nessun documento trovato',
    'documents.reservation': 'Prenotazione',
    'documents.download': 'Scarica',
    'documents.delete': 'Elimina',
    
    // Status
    'status.request': 'Richiesta',
    'status.confirmed': 'Confermata',
    'status.inProgress': 'In Corso',
    'status.finished': 'Completata',
    'status.canceled': 'Cancellata',
    'status.pending': 'In Attesa',
    'status.paid50': 'Pagato 50%',
    'status.paidFull': 'Pagato Intero',
    'status.refunded': 'Rimborsato',
    
    // Common
    'common.search': 'Cerca...',
    'common.loading': 'Caricamento...',
    'common.save': 'Salva',
    'common.cancel': 'Annulla',
    'common.edit': 'Modifica',
    'common.delete': 'Elimina',
    'common.view': 'Visualizza',
    'common.language': 'Lingua',
  },
};

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('villa-araca-language');
    return (saved as Language) || 'pt';
  });

  useEffect(() => {
    localStorage.setItem('villa-araca-language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
