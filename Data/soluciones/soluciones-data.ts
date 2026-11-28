// Páginas de solución (/soluciones/[slug]): cada una apunta a una búsqueda concreta de clientes en RD.
// Solo describen servicios que TEKO ofrece hoy; sin precios ni cifras inventadas.
export type Solucion = {
  slug: string;
  nombre: string; // nombre corto para menús y enlaces
  title: string; // <title>
  description: string; // meta description
  h1: string;
  respuesta: string; // párrafo "respuesta directa", pensado para ser citado por buscadores e IA
  incluye: { titulo: string; texto: string }[];
  paraQuien: string[];
  faqs: { q: string; a: string }[];
};

export const soluciones: Solucion[] = [
  {
    slug: "desarrollo-de-software-a-medida-republica-dominicana",
    nombre: "Software a medida",
    title: "Desarrollo de software a medida en República Dominicana",
    description:
      "TEKO desarrolla software a medida en República Dominicana: sistemas internos, plataformas web, paneles de administración y APIs para empresas que quieren dejar las hojas de cálculo.",
    h1: "Desarrollo de software a medida en República Dominicana",
    respuesta:
      "TEKO es una empresa de desarrollo de software en República Dominicana que diseña y construye sistemas a medida: plataformas web, paneles de administración, portales de clientes, automatizaciones y APIs. Trabajamos con React, Next.js, Node y cloud, y acompañamos el proyecto desde la idea hasta el lanzamiento y el soporte.",
    incluye: [
      { titulo: "Plataformas y sistemas web", texto: "Aplicaciones web a medida para gestionar clientes, pedidos, inventario, citas o cualquier proceso de tu negocio." },
      { titulo: "Paneles de administración", texto: "Back-office con roles y permisos para que tu equipo controle la operación sin depender de terceros." },
      { titulo: "Portales de clientes", texto: "Áreas privadas donde tus clientes consultan estados, documentos, facturas y solicitudes." },
      { titulo: "APIs y backend", texto: "Servicios que conectan tu sistema con pagos, CRMs, ERPs y otras plataformas." },
      { titulo: "Despliegue y soporte", texto: "Publicación en la nube, monitoreo, respaldos y mantenimiento mensual." },
    ],
    paraQuien: [
      "Negocios que hoy operan con Excel, WhatsApp y papel y necesitan orden.",
      "Startups que necesitan lanzar su primer producto digital.",
      "Empresas que ya tienen un sistema pero no se adapta a su forma de trabajar.",
    ],
    faqs: [
      { q: "¿Qué es el desarrollo de software a medida?", a: "Es construir un sistema pensado para los procesos de tu negocio, en lugar de adaptar tu negocio a un programa genérico. Tú defines qué necesitas y el sistema hace exactamente eso." },
      { q: "¿Cuánto tarda un proyecto de software a medida?", a: "Depende del alcance. Un sistema sencillo puede estar listo en pocas semanas; uno con varios módulos y roles requiere más tiempo. Después de una reunión inicial te damos un plan por etapas y una estimación." },
      { q: "¿Trabajan con empresas fuera de Santo Domingo?", a: "Sí. Trabajamos de forma remota con clientes de toda República Dominicana, Estados Unidos y Latinoamérica." },
      { q: "¿Cómo solicito una cotización?", a: "Escríbenos desde la página de contacto, a info@teko.do o por WhatsApp al +1 849 594 0040. Agendamos una cita sin compromiso para entender tu proyecto." },
    ],
  },
  {
    slug: "desarrollo-de-aplicaciones-moviles-republica-dominicana",
    nombre: "Aplicaciones móviles",
    title: "Desarrollo de aplicaciones móviles en República Dominicana",
    description:
      "Creamos aplicaciones móviles para iOS y Android en República Dominicana: del prototipo en Figma al lanzamiento en las tiendas. Cotiza con TEKO sin compromiso.",
    h1: "Desarrollo de aplicaciones móviles en República Dominicana",
    respuesta:
      "TEKO diseña y desarrolla aplicaciones móviles para iOS y Android en República Dominicana. Empezamos con el diseño de la experiencia en Figma, construimos la app con su backend y la publicamos en las tiendas, con un solo equipo a cargo de todo el proceso.",
    incluye: [
      { titulo: "Diseño UX/UI", texto: "Wireframes, prototipos navegables y diseño final en Figma antes de escribir código." },
      { titulo: "App para iOS y Android", texto: "Una sola base de código cuando es posible, para llegar a ambas plataformas con menos costo y tiempo." },
      { titulo: "Backend y API", texto: "Servidor, base de datos y panel de administración para gestionar el contenido y los usuarios de la app." },
      { titulo: "Publicación en tiendas", texto: "Preparamos y publicamos la app en App Store y Google Play." },
      { titulo: "Mantenimiento", texto: "Actualizaciones, correcciones y soporte después del lanzamiento." },
    ],
    paraQuien: [
      "Negocios de delivery, servicios o ventas que quieren su propia app.",
      "Emprendedores con una idea que necesitan validar con un producto real.",
      "Empresas que quieren llevar su sistema actual a los celulares de clientes o empleados.",
    ],
    faqs: [
      { q: "¿Hacen apps para iPhone y Android?", a: "Sí, desarrollamos para ambas plataformas y acordamos contigo si conviene una app nativa o multiplataforma según el caso." },
      { q: "¿Qué necesito para empezar?", a: "Una idea clara del problema que resuelve la app. Nosotros ayudamos a definir las funciones esenciales de una primera versión." },
      { q: "¿La app incluye un panel para administrarla?", a: "Normalmente sí: un panel web para gestionar usuarios, pedidos y contenido sin tocar código." },
      { q: "¿Pueden hacer apps con pagos o mapas?", a: "Sí, integramos pasarelas de pago, mapas, notificaciones y otros servicios externos." },
    ],
  },
  {
    slug: "diseno-de-paginas-web-republica-dominicana",
    nombre: "Páginas web",
    title: "Diseño y desarrollo de páginas web en República Dominicana",
    description:
      "Páginas web profesionales y tiendas online en República Dominicana: diseño a medida, rápidas, optimizadas para Google y pensadas para convertir visitas en clientes.",
    h1: "Diseño y desarrollo de páginas web en República Dominicana",
    respuesta:
      "TEKO diseña y desarrolla páginas web y tiendas online en República Dominicana. Cada sitio se hace a medida con Next.js: es rápido, se ve bien en el celular, está optimizado para aparecer en Google y está pensado para que quien lo visita te escriba o te compre.",
    incluye: [
      { titulo: "Diseño orientado a conversión", texto: "Estructura y mensajes pensados para llevar al visitante a contactarte, cotizar o comprar." },
      { titulo: "Optimizado para móviles", texto: "Diseño responsive y carga veloz, porque la mayoría de tus clientes entra desde el celular." },
      { titulo: "SEO técnico desde el día uno", texto: "Metadatos, sitemap, datos estructurados y buenas prácticas para que Google entienda tu negocio." },
      { titulo: "Tiendas online", texto: "Catálogo, carrito y cobro en línea integrados con los medios de pago que usas." },
      { titulo: "Dominio, hosting y SSL", texto: "Configuramos dominio, DNS, certificado y respaldos para que te olvides de lo técnico." },
    ],
    paraQuien: [
      "Negocios que aún no tienen página web o tienen una que no genera contactos.",
      "Profesionales y marcas personales que quieren verse serios y ser encontrados.",
      "Comercios que quieren vender en línea.",
    ],
    faqs: [
      { q: "¿Cuánto cuesta una página web en República Dominicana?", a: "Depende de las secciones, funciones y si incluye tienda en línea. Cotizamos cada proyecto después de conocer lo que necesitas; escríbenos y te damos un estimado sin compromiso." },
      { q: "¿La página aparecerá en Google?", a: "La construimos con SEO técnico correcto, lo que facilita que Google la encuentre. Aparecer en las primeras posiciones además depende del contenido y del tiempo, y podemos acompañarte en eso." },
      { q: "¿Incluyen el dominio y el hosting?", a: "Podemos encargarnos de dominio, hosting y SSL, o trabajar con los que ya tengas." },
      { q: "¿Puedo editar el contenido yo mismo?", a: "Sí, podemos incluir un panel para que actualices textos, imágenes y productos sin pedir ayuda." },
    ],
  },
  {
    slug: "integraciones-apis-automatizacion-whatsapp",
    nombre: "Integraciones y automatización",
    title: "Integraciones, APIs y automatización con WhatsApp en RD",
    description:
      "Conectamos tus sistemas con pagos, CRMs, ERPs y WhatsApp: APIs, automatizaciones y chatbots para que tu negocio atienda y cobre sin trabajo manual.",
    h1: "Integraciones, APIs y automatización para tu negocio",
    respuesta:
      "TEKO conecta los sistemas de tu negocio entre sí y con servicios externos: pasarelas de pago, CRMs, ERPs, correo y WhatsApp. Construimos APIs, automatizaciones y chatbots de atención 24/7 para eliminar tareas repetitivas y reducir errores.",
    incluye: [
      { titulo: "Integración con plataformas", texto: "Conectamos tu sistema con servicios de pagos, CRMs, ERPs y otras herramientas que ya usas." },
      { titulo: "Chatbot de WhatsApp", texto: "Flujos de atención automatizados para responder preguntas frecuentes y tomar pedidos a cualquier hora." },
      { titulo: "Notificaciones automáticas", texto: "Recordatorios de citas, pagos y entregas por WhatsApp o correo." },
      { titulo: "Automatización de procesos", texto: "Flujos que mueven datos entre sistemas sin que nadie tenga que copiarlos a mano." },
      { titulo: "APIs a medida", texto: "Servicios propios para que tus apps y plataformas hablen entre sí de forma segura." },
    ],
    paraQuien: [
      "Negocios que reciben muchos mensajes repetitivos por WhatsApp.",
      "Empresas que copian datos de un sistema a otro manualmente.",
      "Equipos que quieren cobrar, notificar y dar seguimiento de forma automática.",
    ],
    faqs: [
      { q: "¿Qué puede hacer un chatbot de WhatsApp para mi negocio?", a: "Responder preguntas frecuentes, tomar pedidos o reservas, derivar a una persona cuando hace falta y atender fuera de horario." },
      { q: "¿Pueden conectar mi sistema actual con otras plataformas?", a: "En la mayoría de los casos sí, siempre que la plataforma ofrezca una API o forma de integración. Lo evaluamos contigo antes de comprometernos." },
      { q: "¿Qué pasa si algo falla en una automatización?", a: "Incluimos monitoreo y alertas para detectar y corregir fallos rápido, y ofrecemos soporte mensual." },
      { q: "¿Cómo empiezo?", a: "Cuéntanos qué tarea repites todos los días y la convertimos en un flujo automático. Escríbenos a info@teko.do o por WhatsApp al +1 849 594 0040." },
    ],
  },
];

export const getSolucion = (slug: string) => soluciones.find((s) => s.slug === slug);
