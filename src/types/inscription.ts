export type InscriptionStatus = 'pendiente' | 'aceptado' | 'rechazado';

export interface Inscription {
  id: string;

  // Datos personales
  nombreCompleto: string;
  edad?: string | number;
  pais: string;
  email?: string;

  // Redes y plataformas
  usuarioMinecraft: string;
  gamertagXbox?: string;
  usuarioDiscord?: string;
  idDiscord?: string;
  canalYoutube?: string;
  tiktok?: string;
  instagram?: string;

  // Formulario de inscripción
  experienciaMinecraft?: string;
  ayudaProyecto?: string;
  motivacion?: string;
  horasSemana?: string | number;
  aceptaReglas?: boolean | string;

  // Metadatos
  timestamp: any;     // Firebase Timestamp — guardado por la web
  estado: InscriptionStatus; // Gestionado por el panel
  updatedAt?: any;    // Escrito por el panel al cambiar estado
}

